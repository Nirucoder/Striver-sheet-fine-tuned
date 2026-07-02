import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchProgress, saveProgress, fetchLegacySync, AuthError } from "../services/cloudSync.js";
import { readSnapshot, writeSnapshot } from "../services/localCache.js";
import { SyncManager } from "../services/syncManager.js";

const POLL_INTERVAL_MS = 5000;

/**
 * useCloudSync — offline-first startup reconciliation + background sync.
 *
 * Startup flow (fixes the "stale local data flashes then cloud overwrites" bug):
 *   1. Wait until the user is authenticated.
 *   2. Read the local snapshot AND the cloud record in parallel.
 *   3. Newest `updatedAt` wins; apply it before marking `bootstrapped`.
 *   4. The UI stays behind a splash until `bootstrapped` is true.
 *
 * After bootstrap, local changes are written to the device instantly and pushed
 * to the cloud through the SyncManager (debounced, retried, offline-queued).
 * There is no manual "save"/"update" button — everything is automatic.
 *
 * @param {object}   params
 * @param {Function} params.getPayload     - returns the current progress object
 * @param {Function} params.applyPayload   - applies a progress object to app state
 * @param {Array}    params.deps           - state slices that make up the payload
 * @param {string}   [params.legacySyncCode] - old sync code for one-time migration
 */
export function useCloudSync({ getPayload, applyPayload, deps, legacySyncCode }) {
  const { user, signOut } = useAuth();
  const userId = user?.sub || null;

  const [bootstrapped, setBootstrapped] = useState(false);
  const [status, setStatus] = useState("idle"); // idle|saving|saved|error|offline|retrying
  const [lastSynced, setLastSynced] = useState("");

  // Latest callbacks without retriggering effects.
  const getPayloadRef = useRef(getPayload);
  getPayloadRef.current = getPayload;
  const applyPayloadRef = useRef(applyPayload);
  applyPayloadRef.current = applyPayload;

  const cloudUpdatedAt = useRef(0);
  const applyingCloud = useRef(false);
  const lastSerialized = useRef("");
  const managerRef = useRef(null);

  // Wrap applyPayload so a cloud-driven state change never re-triggers an upload.
  const applyCloud = useCallback((data, updatedAtMs) => {
    applyingCloud.current = true;
    applyPayloadRef.current(data);
    const ts = writeSnapshot(data, updatedAtMs || Date.now());
    cloudUpdatedAt.current = ts;
    lastSerialized.current = JSON.stringify(data);
  }, []);

  const handleAuthError = useCallback(() => {
    // Session genuinely gone — send the user back to sign-in.
    signOut();
  }, [signOut]);

  // ── Create / tear down the SyncManager per signed-in user ──────────────────
  useEffect(() => {
    if (!userId) return;
    const manager = new SyncManager({
      upload: (payload) => saveProgress(payload),
      onStatus: setStatus,
      onSaved: (result) => {
        const ts = Date.parse(result?.updatedAt || "") || Date.now();
        cloudUpdatedAt.current = ts;
        setLastSynced(result?.updatedAt || new Date().toISOString());
      },
      onAuthError: handleAuthError,
    });
    managerRef.current = manager;
    return () => {
      manager.destroy();
      managerRef.current = null;
    };
  }, [userId, handleAuthError]);

  // ── Startup reconciliation: newest of {local snapshot, cloud} wins ─────────
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setBootstrapped(false);

    (async () => {
      const snapshot = readSnapshot();
      const localTs = snapshot?.updatedAt || 0;

      let cloud = null;
      try {
        cloud = await fetchProgress();
      } catch (err) {
        if (err instanceof AuthError) {
          handleAuthError();
          return;
        }
        // Offline or server error: fall back to local data and let polling recover.
        if (!cancelled) {
          if (snapshot?.data) applyCloud(snapshot.data, localTs);
          setBootstrapped(true);
        }
        return;
      }
      if (cancelled) return;

      const cloudTs = Date.parse(cloud?.updatedAt || "") || 0;

      try {
        if (cloud?.data && cloudTs >= localTs) {
          // Cloud is authoritative.
          applyCloud(cloud.data, cloudTs);
          setLastSynced(cloud.updatedAt || new Date().toISOString());
        } else if (snapshot?.data && localTs > cloudTs) {
          // Local is newer (e.g. edited on another tab / while offline): adopt it
          // and push it up so the cloud catches up.
          applyPayloadRef.current(snapshot.data);
          lastSerialized.current = JSON.stringify(snapshot.data);
          const saved = await saveProgress(snapshot.data);
          cloudUpdatedAt.current = Date.parse(saved?.updatedAt || "") || Date.now();
          setLastSynced(saved?.updatedAt || new Date().toISOString());
        } else {
          // Nothing in the cloud yet. Try a one-time legacy sync-code migration,
          // otherwise seed the cloud from whatever is currently in the app.
          let seeded = false;
          if (!cloud?.data && legacySyncCode) {
            const legacy = await fetchLegacySync(legacySyncCode);
            if (legacy && !cancelled) {
              applyCloud(legacy, Date.now());
              const saved = await saveProgress(legacy);
              cloudUpdatedAt.current = Date.parse(saved?.updatedAt || "") || Date.now();
              setLastSynced(saved?.updatedAt || new Date().toISOString());
              try { localStorage.removeItem("studyos_sync_code"); } catch {}
              seeded = true;
            }
          }
          if (!seeded && !cancelled) {
            const payload = getPayloadRef.current();
            lastSerialized.current = JSON.stringify(payload);
            writeSnapshot(payload, Date.now());
            const saved = await saveProgress(payload);
            cloudUpdatedAt.current = Date.parse(saved?.updatedAt || "") || Date.now();
            setLastSynced(saved?.updatedAt || new Date().toISOString());
          }
        }
      } catch (err) {
        if (err instanceof AuthError) {
          handleAuthError();
          return;
        }
        console.error("[v0] cloud bootstrap save failed:", err);
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Local change -> instant local save + debounced cloud upload ────────────
  useEffect(() => {
    if (!bootstrapped || !userId) return;

    // A change triggered by applyCloud must not echo back as an upload.
    if (applyingCloud.current) {
      applyingCloud.current = false;
      return;
    }

    const payload = getPayloadRef.current();
    const serialized = JSON.stringify(payload);
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;

    // Instant, offline-safe local write.
    writeSnapshot(payload, Date.now());
    // Debounced, retried, offline-queued cloud upload.
    managerRef.current?.schedule(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapped, userId, ...deps]);

  // ── Flush pending changes when the tab is hidden or closed ─────────────────
  useEffect(() => {
    if (!userId) return;
    const onHide = () => {
      if (document.visibilityState === "hidden") managerRef.current?.flushNow();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [userId]);

  // ── Poll for changes made on other devices ─────────────────────────────────
  useEffect(() => {
    if (!bootstrapped || !userId) return;

    async function refreshFromCloud() {
      if (document.visibilityState === "hidden") return;
      if (managerRef.current?.hasPending()) return; // don't clobber unsaved local edits
      try {
        const updatedAfter = cloudUpdatedAt.current
          ? new Date(cloudUpdatedAt.current).toISOString()
          : undefined;
        const record = await fetchProgress(updatedAfter);
        const remoteTs = Date.parse(record?.updatedAt || "") || 0;
        if (record?.data && remoteTs > cloudUpdatedAt.current) {
          applyCloud(record.data, remoteTs);
          setLastSynced(record.updatedAt);
          setStatus("saved");
        }
      } catch (err) {
        if (err instanceof AuthError) handleAuthError();
        // other errors: stay quiet, next tick retries
      }
    }

    const interval = setInterval(refreshFromCloud, POLL_INTERVAL_MS);
    const onFocus = () => refreshFromCloud();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapped, userId]);

  return { bootstrapped, status, lastSynced };
}
