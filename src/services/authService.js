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
