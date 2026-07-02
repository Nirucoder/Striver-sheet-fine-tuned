/**
 * authService — the single client-side entry point for authentication.
 *
 * The browser never decodes or stores the Google token anymore. Sign-in posts
 * the Google credential to the server, which sets an HttpOnly session cookie.
 * All auth state is derived from the server via `me()`.
 */

async function parseError(res) {
  try {
    const body = await res.json();
    return body.hint || body.error || body.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

/**
 * Exchange a Google Identity Services credential for a durable app session.
 * Returns the authenticated user.
 */
export async function signInWithGoogle(credential) {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const { user } = await res.json();
  return user;
}

/**
 * Resolve the current user from the session cookie. Returns null when not
 * signed in (never throws for the 401 case).
 */
export async function fetchCurrentUser() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    const { user } = await res.json();
    return user ?? null;
  } catch {
    return null;
  }
}

export async function signOut() {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  } catch {
    /* even if the network call fails, the client clears local state */
  }
}

const LEGACY_SESSION_KEY = "studyos_user";

/**
 * One-time backward-compatibility migration.
 *
 * Older builds stored the Google ID token in localStorage["studyos_user"].
 * When a returning user has no cookie session yet, we try to exchange that
 * legacy token for a durable HttpOnly session — silently, without a new sign-in.
 *
 * IMPORTANT: this only migrates the *identity/session*. It never touches the
 * "studyos_*" progress keys or "studyos_last_synced", so all local progress and
 * sync state are preserved. If the legacy token has expired, we leave everything
 * in place and simply return null so the user is asked to sign in again — their
 * progress remains intact and re-syncs after login.
 */
export async function migrateLegacySession() {
  let legacy = null;
  try {
    const raw = localStorage.getItem(LEGACY_SESSION_KEY);
    if (!raw) return null;
    legacy = JSON.parse(raw);
  } catch {
    return null;
  }

  const token = legacy?.token;
  if (!token) return null;

  try {
    const user = await signInWithGoogle(token);
    // Migration succeeded — the durable cookie is set. Drop only the stale
    // identity blob; progress keys are intentionally left untouched.
    try {
      localStorage.removeItem(LEGACY_SESSION_KEY);
    } catch {}
    return user;
  } catch {
    // Token likely expired. Keep the legacy blob and all progress; the user will
    // re-authenticate and nothing is lost.
    return null;
  }
}
