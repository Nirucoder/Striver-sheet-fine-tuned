import { AuthError } from "./cloudSync.js";

/**
 * SyncManager — coordinates uploading progress to the cloud.
 *
 * Responsibilities:
 *  - Debounce rapid changes into a single upload.
 *  - Coalesce: only the latest payload is ever sent.
 *  - Mutex: never run two uploads at once; changes made mid-flight are re-sent.
 *  - Retry with exponential backoff on transient failures.
 *  - Offline queue: hold the pending payload while offline and flush on reconnect.
 *
 * It is intentionally framework-agnostic; the React hook wires callbacks in.
 */
export class SyncManager {
  constructor({ upload, onStatus, onSaved, onAuthError, debounceMs = 700, maxRetries = 4 }) {
    this.upload = upload;
    this.onStatus = onStatus || (() => {});
    this.onSaved = onSaved || (() => {});
    this.onAuthError = onAuthError || (() => {});
    this.debounceMs = debounceMs;
    this.maxRetries = maxRetries;

    this.debounceTimer = null;
    this.retryTimer = null;
    this.pending = null; // latest payload waiting to be sent
    this.inFlight = false;
    this.attempt = 0;
    this.destroyed = false;

    this._onOnline = () => this._flush();
    if (typeof window !== "undefined") {
      window.addEventListener("online", this._onOnline);
    }
  }

  /** Queue the latest payload for upload (debounced). */
  schedule(payload) {
    if (this.destroyed) return;
    this.pending = payload;
    this.onStatus("saving");
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this._flush(), this.debounceMs);
  }

  /** Force an immediate flush of any pending payload (e.g. on tab hide). */
  flushNow() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this._flush();
  }

  hasPending() {
    return this.pending !== null || this.inFlight;
  }

  async _flush() {
    if (this.destroyed) return;
    if (this.inFlight) return; // mutex — a running upload will re-check pending on finish
    if (this.pending === null) return;

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      this.onStatus("offline");
      return; // will retry on 'online' event
    }

    const payload = this.pending;
    this.pending = null;
    this.inFlight = true;
    this.onStatus("saving");

    try {
      const result = await this.upload(payload);
      this.attempt = 0;
      this.inFlight = false;
      this.onSaved(result);
      // If new changes arrived while uploading, send them next.
      if (this.pending !== null) {
        this._flush();
      } else {
        this.onStatus("saved");
      }
    } catch (err) {
      this.inFlight = false;
      // Re-hold this payload if a newer one didn't already replace it.
      if (this.pending === null) this.pending = payload;

      if (err instanceof AuthError) {
        this.onStatus("error");
        this.onAuthError();
        return;
      }

      if (this.attempt < this.maxRetries) {
        this.attempt += 1;
        const delay = Math.min(1000 * 2 ** (this.attempt - 1), 15000);
        this.onStatus("retrying");
        if (this.retryTimer) clearTimeout(this.retryTimer);
        this.retryTimer = setTimeout(() => this._flush(), delay);
      } else {
        // Give up active retries; the payload stays queued for the next
        // change or reconnect so nothing is lost.
        this.attempt = 0;
        this.onStatus("error");
      }
    }
  }

  destroy() {
    this.destroyed = true;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this._onOnline);
    }
  }
}
