/**
 * cloudSyncService — talks to the cookie-authenticated progress API.
 *
 * There is no userId or token argument anymore: the server derives the user
 * from the HttpOnly session cookie, so the client only ever sends the payload.
 * Mutations include the double-submit CSRF token read from the readable cookie.
 */

const CSRF_COOKIE = "studyos_csrf";
const CSRF_HEADER = "X-CSRF-Token";

function readCsrfToken() {
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CSRF_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(CSRF_COOKIE.length + 1)) : "";
}

async function parseError(res) {
  try {
    const body = await res.json();
    return body.hint || body.error || body.message || `Server error ${res.status}`;
  } catch {
    return `Server error ${res.status}`;
  }
}

export class AuthError extends Error {}

/**
 * Load the signed-in user's progress record. Returns { data, updatedAt } or
 * null when there is nothing stored yet (404). `updatedAfter` lets callers
 * cheaply poll for changes newer than what they already have.
 */
export async function fetchProgress(updatedAfter) {
  const query = updatedAfter ? `?updatedAfter=${encodeURIComponent(updatedAfter)}` : "";
  const res = await fetch(`/api/progress${query}`, { credentials: "same-origin" });
  if (res.status === 404) return null;
  if (res.status === 401) throw new AuthError("Session expired");
  if (!res.ok) throw new Error(await parseError(res));
  const json = await res.json();
  return { data: json.data ?? null, updatedAt: json.updatedAt ?? null };
}

/**
 * Upsert the signed-in user's progress. Returns { updatedAt } from the server.
 */
export async function saveProgress(data) {
  const res = await fetch("/api/progress", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      [CSRF_HEADER]: readCsrfToken(),
    },
    body: JSON.stringify({ data }),
  });
  if (res.status === 401) throw new AuthError("Session expired");
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * One-time migration read of the legacy sync-code blob.
 */
export async function fetchLegacySync(code) {
  try {
    const res = await fetch(`/api/sync/${encodeURIComponent(code)}`, {
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
