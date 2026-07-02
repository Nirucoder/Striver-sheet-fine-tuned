/**
 * localCacheService — the device-local copy of the full progress snapshot.
 *
 * This is the offline-first source of truth: writes happen here instantly so
 * the UI never blocks on the network, and on startup it is reconciled against
 * the cloud copy by comparing `updatedAt` (newest wins). The individual
 * per-feature localStorage keys used by the UI still exist; this snapshot is
 * the single unit the sync layer reasons about.
 */

const SNAPSHOT_KEY = "studyos_progress_snapshot";

/**
 * @returns {{ data: object, updatedAt: number } | null}
 */
export function readSnapshot() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.data) return null;
    return { data: parsed.data, updatedAt: Number(parsed.updatedAt) || 0 };
  } catch {
    return null;
  }
}

/**
 * Persist the snapshot locally. Returns the stored updatedAt so callers can
 * keep their in-memory clock in sync.
 */
export function writeSnapshot(data, updatedAt = Date.now()) {
  const ts = Number(updatedAt) || Date.now();
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ data, updatedAt: ts }));
  } catch {
    /* storage full / unavailable — non-fatal, cloud remains the backup */
  }
  return ts;
}

export function clearSnapshot() {
  try {
    localStorage.removeItem(SNAPSHOT_KEY);
  } catch {}
}
