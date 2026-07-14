import { getPool } from "../_lib/auth.js";
import { getSessionUser, parseCookies, isSecureRequest } from "../_lib/session.js";
import { getCalendarClientId, getCalendarClientSecret, getRedirectUri } from "../_lib/calendar.js";

export default async function handler(req, res) {
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
