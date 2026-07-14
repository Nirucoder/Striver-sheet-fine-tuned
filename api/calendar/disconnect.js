import { getPool } from "../_lib/auth.js";
import { getSessionUser, csrfMatches, parseCookies, CSRF_COOKIE, CSRF_HEADER } from "../_lib/session.js";
import { setCorsHeaders, deleteConnection } from "../_lib/calendar.js";

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const cookies = parseCookies(req);
  if (!csrfMatches(cookies[CSRF_COOKIE], req.headers[CSRF_HEADER])) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  try {
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
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
