import { getPool } from "./auth.js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export function getCalendarClientId() {
  return process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || null;
}

export function getCalendarClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || null;
}

export function getRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || null;
}

export function setCorsHeaders(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-csrf-token");
}

export async function refreshAccessToken(refreshToken) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: getCalendarClientId(),
      client_secret: getCalendarClientSecret(),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) {
    const err = new Error(data.error || "token_refresh_failed");
    err.code = data.error;
    throw err;
  }
  return data.access_token;
}

export async function getRefreshToken(userId) {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT refresh_token FROM calendar_connections WHERE user_id = $1",
    [userId]
  );
  return rows[0]?.refresh_token || null;
}

export async function deleteConnection(userId) {
  const pool = getPool();
  await pool.query("DELETE FROM calendar_connections WHERE user_id = $1", [userId]);
}

export async function withCalendar(userId, fn) {
  const refreshToken = await getRefreshToken(userId);
  if (!refreshToken) {
    const err = new Error("not_connected");
    err.code = "not_connected";
    throw err;
  }
  try {
    const accessToken = await refreshAccessToken(refreshToken);
    return await fn(accessToken);
  } catch (e) {
    if (e.code === "invalid_grant" || e.code === "token_revoked") {
      await deleteConnection(userId);
      const err = new Error("calendar_revoked");
      err.code = "calendar_revoked";
      throw err;
    }
    throw e;
  }
}
