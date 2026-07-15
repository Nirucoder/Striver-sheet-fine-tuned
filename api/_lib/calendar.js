import { getPool } from "./auth.js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const TOKEN_BUFFER_MS  = 5 * 60 * 1000; // refresh 5 min before expiry

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

// Fetch a new access token from Google using the stored refresh token.
// Returns { access_token, expires_at } where expires_at is a JS Date.
async function fetchFreshAccessToken(refreshToken) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id:     getCalendarClientId(),
      client_secret: getCalendarClientSecret(),
      refresh_token: refreshToken,
      grant_type:    "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) {
    const err = new Error(data.error || "token_refresh_failed");
    err.code  = data.error;
    throw err;
  }
  // Google returns expires_in in seconds (usually 3600 = 1 hour)
  const expiresIn = Number(data.expires_in) || 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  return { access_token: data.access_token, expires_at: expiresAt };
}

// Refresh the access token and persist it in the DB so subsequent calls
// within the same hour reuse it without hitting Google's token endpoint.
async function refreshAndStore(userId, refreshToken, pool) {
  const { access_token, expires_at } = await fetchFreshAccessToken(refreshToken);
  try {
    await pool.query(
      `UPDATE calendar_connections
          SET access_token = $1, token_expires_at = $2, updated_at = NOW()
        WHERE user_id = $3`,
      [access_token, expires_at, userId]
    );
  } catch {
    // Column may not exist yet (migration pending) — ignore DB write failure,
    // we still have a valid token in memory for this request.
  }
  return access_token;
}

export async function deleteConnection(userId) {
  const pool = getPool();
  await pool.query("DELETE FROM calendar_connections WHERE user_id = $1", [userId]);
}

// ─── Main entry point for calendar API calls ────────────────────────────────
// Resolves a valid access token (cached or freshly refreshed) then calls fn(token).
// Retries once with a fresh token if Google rejects the cached one (HTTP 401/403).
export async function withCalendar(userId, fn) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT refresh_token, access_token, token_expires_at
       FROM calendar_connections WHERE user_id = $1`,
    [userId]
  );

  const row = rows[0];
  if (!row?.refresh_token) {
    const err = new Error("not_connected");
    err.code = "not_connected";
    throw err;
  }

  const { refresh_token, access_token, token_expires_at } = row;

  // Decide whether the cached access token is still usable
  const expiresAt   = token_expires_at ? new Date(token_expires_at) : null;
  const stillValid  = access_token && expiresAt &&
                      expiresAt.getTime() - TOKEN_BUFFER_MS > Date.now();

  let activeToken = stillValid ? access_token : null;

  // Refresh if needed
  if (!activeToken) {
    try {
      activeToken = await refreshAndStore(userId, refresh_token, pool);
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

  // Call the Google Calendar API
  try {
    return await fn(activeToken);
  } catch (e) {
    // If Google rejected the token (stale cache / clock skew), try a fresh one once
    const isAuthError = e.message?.includes("401") || e.message?.includes("403");
    if (isAuthError) {
      try {
        const freshToken = await refreshAndStore(userId, refresh_token, pool);
        return await fn(freshToken);
      } catch (e2) {
        if (e2.code === "invalid_grant" || e2.code === "token_revoked") {
          await deleteConnection(userId);
          const err = new Error("calendar_revoked");
          err.code = "calendar_revoked";
          throw err;
        }
        throw e2;
      }
    }
    throw e;
  }
}
