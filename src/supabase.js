import { getAuthHeaders, syncAuthError } from "./authUtils.js";

export const supabase = null;

async function parseError(res) {
  try {
    const body = await res.json();
    return body.hint || body.error || body.message || syncAuthError(res.status);
  } catch {
    return syncAuthError(res.status);
  }
}

function buildHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  const auth = token ? { Authorization: `Bearer ${token}` } : getAuthHeaders();
  return { ...headers, ...auth };
}

export async function loadUserProgress(userId, token) {
  if (!userId) return null;
  try {
    const res = await fetch(`/api/progress/${encodeURIComponent(userId)}`, {
      headers: buildHeaders(token),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await parseError(res));
    const json = await res.json();
    return json.data ?? null;
  } catch (e) {
    console.error("Load error:", e);
    throw e;
  }
}

export async function saveUserProgress(userId, payload, token) {
  if (!userId) return;
  try {
    const res = await fetch(`/api/progress/${encodeURIComponent(userId)}`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify({ data: payload }),
    });
    if (!res.ok) throw new Error(await parseError(res));
  } catch (e) {
    console.error("Save error:", e);
    throw e;
  }
}

export async function checkCloudAuth(token) {
  try {
    const res = await fetch("/api/auth/check", { headers: buildHeaders(token) });
    if (!res.ok) return { ok: false, hint: "Auth check failed" };
    return res.json();
  } catch {
    return { ok: false, hint: "Could not reach auth check endpoint" };
  }
}
