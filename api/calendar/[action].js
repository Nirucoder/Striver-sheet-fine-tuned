import crypto from "crypto";
import { getPool } from "../_lib/auth.js";
import {
  getSessionUser,
  csrfMatches,
  parseCookies,
  isSecureRequest,
  CSRF_COOKIE,
  CSRF_HEADER,
} from "../_lib/session.js";
import {
  getCalendarClientId,
  getCalendarClientSecret,
  getRedirectUri,
  setCorsHeaders,
  withCalendar,
  deleteConnection,
} from "../_lib/calendar.js";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

// ─── Route handlers ────────────────────────────────────────────────────────

async function handleConnect(req, res, user) {
  const clientId = getCalendarClientId();
  const clientSecret = getCalendarClientSecret();
  const redirectUri = getRedirectUri();

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(503).json({
      error: "Calendar not configured",
      hint: "GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI must be set on the server.",
    });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const secure = isSecureRequest(req);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);

  res.setHeader(
    "Set-Cookie",
    `cal_state=${state}; HttpOnly; Path=/; Max-Age=300${secure ? "; Secure" : ""}; SameSite=Lax`
  );

  return res.json({ url: url.toString() });
}

async function handleCallback(req, res) {
  const { code, state, error } = req.query;
  const appBase = process.env.APP_URL || "";

  if (error) {
    return res.redirect(`${appBase}/?calendar_error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return res.redirect(`${appBase}/?calendar_error=no_code`);
  }

  const cookies = parseCookies(req);
  if (state && cookies.cal_state && cookies.cal_state !== state) {
    return res.redirect(`${appBase}/?calendar_error=state_mismatch`);
  }

  const user = await getSessionUser(req);
  if (!user) {
    return res.redirect(`${appBase}/?calendar_error=not_authenticated`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: getCalendarClientId(),
        client_secret: getCalendarClientSecret(),
        redirect_uri: getRedirectUri(),
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (tokens.error || !tokens.access_token) {
      console.error("[calendar/callback] token exchange error:", tokens);
      return res.redirect(
        `${appBase}/?calendar_error=${encodeURIComponent(tokens.error || "token_exchange_failed")}`
      );
    }

    if (!tokens.refresh_token) {
      return res.redirect(`${appBase}/?calendar_error=no_refresh_token`);
    }

    let googleEmail = null;
    try {
      const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const info = await infoRes.json();
      googleEmail = info.email || null;
    } catch {}

    const pool = getPool();
    await pool.query(
      `INSERT INTO calendar_connections (user_id, refresh_token, scope, google_email, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET refresh_token = EXCLUDED.refresh_token,
           scope         = EXCLUDED.scope,
           google_email  = EXCLUDED.google_email,
           updated_at    = NOW()`,
      [user.sub, tokens.refresh_token, tokens.scope || null, googleEmail]
    );

    const secure = isSecureRequest(req);
    res.setHeader(
      "Set-Cookie",
      `cal_state=; HttpOnly; Path=/; Max-Age=0${secure ? "; Secure" : ""}; SameSite=Lax`
    );
    return res.redirect(`${appBase}/?calendar=connected`);
  } catch (e) {
    console.error("[calendar/callback] error:", e);
    return res.redirect(`${appBase}/?calendar_error=server_error`);
  }
}

async function handleStatus(req, res, user) {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT google_email, scope, updated_at FROM calendar_connections WHERE user_id = $1",
    [user.sub]
  );
  return res.json({
    connected: rows.length > 0,
    email: rows[0]?.google_email || null,
    updatedAt: rows[0]?.updated_at || null,
  });
}

async function handleEvents(req, res, user) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const data = await withCalendar(user.sub, async (accessToken) => {
    const { timeMin, timeMax } = req.query;
    const params = new URLSearchParams({
      timeMin: timeMin || new Date(Date.now() - 30 * 86400000).toISOString(),
      timeMax: timeMax || new Date(Date.now() + 60 * 86400000).toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "500",
    });
    const gcalRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!gcalRes.ok) throw new Error(`GCal ${gcalRes.status}`);
    return gcalRes.json();
  });
  return res.json(data);
}

async function handleCreateEvent(req, res, user, cookies) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!csrfMatches(cookies[CSRF_COOKIE], req.headers[CSRF_HEADER])) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  const { summary, description, start, end } = req.body || {};
  if (!summary || !start || !end) {
    return res.status(400).json({ error: "summary, start, and end are required" });
  }
  const data = await withCalendar(user.sub, async (accessToken) => {
    const gcalRes = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ summary, description: description || "", start, end }),
      }
    );
    if (!gcalRes.ok) throw new Error(`GCal ${gcalRes.status}`);
    return gcalRes.json();
  });
  return res.json(data);
}

async function handleDeleteEvent(req, res, user, cookies) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });
  if (!csrfMatches(cookies[CSRF_COOKIE], req.headers[CSRF_HEADER])) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  const { eventId } = req.query;
  if (!eventId) return res.status(400).json({ error: "eventId is required" });
  await withCalendar(user.sub, async (accessToken) => {
    const gcalRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!gcalRes.ok && gcalRes.status !== 204 && gcalRes.status !== 404) {
      throw new Error(`GCal ${gcalRes.status}`);
    }
  });
  return res.status(204).end();
}

async function handleDisconnect(req, res, user, cookies) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!csrfMatches(cookies[CSRF_COOKIE], req.headers[CSRF_HEADER])) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT refresh_token FROM calendar_connections WHERE user_id = $1",
    [user.sub]
  );
  if (rows[0]?.refresh_token) {
    fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(rows[0].refresh_token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }).catch(() => {});
  }
  await deleteConnection(user.sub);
  return res.json({ success: true });
}

// ─── Main dispatcher ───────────────────────────────────────────────────────

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const action = req.query.action;

  // callback doesn't require auth header — Google redirects here
  if (action === "callback") {
    return handleCallback(req, res);
  }

  // all other actions require a valid session
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const cookies = parseCookies(req);

  try {
    switch (action) {
      case "connect":      return await handleConnect(req, res, user);
      case "status":       return await handleStatus(req, res, user);
      case "events":       return await handleEvents(req, res, user);
      case "create-event": return await handleCreateEvent(req, res, user, cookies);
      case "delete-event": return await handleDeleteEvent(req, res, user, cookies);
      case "disconnect":   return await handleDisconnect(req, res, user, cookies);
      default:             return res.status(404).json({ error: `Unknown calendar action: ${action}` });
    }
  } catch (e) {
    if (e.code === "not_connected")    return res.status(404).json({ error: "not_connected" });
    if (e.code === "calendar_revoked") return res.status(401).json({ error: "calendar_revoked", message: "Calendar was revoked. Please reconnect." });
    console.error(`[calendar/${action}]`, e);
    return res.status(500).json({ error: e.message });
  }
}
