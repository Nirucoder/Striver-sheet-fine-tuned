export const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

export function isTokenExpired(token, bufferMs = 60000) {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return Number(payload.exp) * 1000 <= Date.now() + bufferMs;
}

export function isSessionValid(session) {
  return !!(session?.sub && session?.token && !isTokenExpired(session.token));
}

export function buildSession(credential) {
  const user = decodeJwt(credential);
  return {
    name: user.name,
    email: user.email,
    picture: user.picture,
    sub: user.sub,
    token: credential,
  };
}

export function getStoredSession() {
  try {
    const u = localStorage.getItem("studyos_user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function getAuthHeaders() {
  const user = getStoredSession();
  if (user?.token && !isTokenExpired(user.token)) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
}

export function syncAuthError(status) {
  if (status === 401) return "Session expired — please sign in again";
  if (status === 403) return "Access denied — wrong account";
  return `Server error ${status}`;
}
