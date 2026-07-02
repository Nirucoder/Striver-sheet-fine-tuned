import { getPool } from "./_lib/auth.js";
import {
  getSessionUser,
  parseCookies,
  csrfMatches,
  CSRF_COOKIE,
  CSRF_HEADER,
} from "./_lib/session.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

/**
 * GET  /api/progress            -> load the signed-in user's progress
 * POST /api/progress { data }   -> upsert the signed-in user's progress
 *
 * The user id is derived from the HttpOnly session cookie and is NEVER taken
 * from the client, so a user can only ever read/write their own row.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", `Content-Type, ${CSRF_HEADER}`);

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: "DATABASE_URL not configured on server." });
  }

  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
      hint: "Your session is missing or expired. Please sign in again.",
    });
  }
  const userId = user.sub;
  const db = getPool();

  if (req.method === "GET") {
    try {
      const params = [userId];
      let query = "SELECT data, updated_at FROM user_progress WHERE user_id = $1";
      if (req.query.updatedAfter) {
        const updatedAfter = Date.parse(req.query.updatedAfter);
        if (Number.isNaN(updatedAfter)) {
          return res.status(400).json({ error: "Invalid updatedAfter timestamp" });
        }
        query += " AND updated_at > $2";
        params.push(new Date(updatedAfter));
      }
      const { rows } = await db.query(query, params);
      if (rows.length === 0) return res.status(404).json({ error: "No data found" });
      return res.json({ data: rows[0].data, updatedAt: rows[0].updated_at });
    } catch (e) {
      console.error("[progress GET]", e.message);
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (req.method === "POST") {
    const cookies = parseCookies(req);
    const headerToken = req.headers[CSRF_HEADER];
    if (!csrfMatches(cookies[CSRF_COOKIE], headerToken)) {
      return res.status(403).json({ error: "Invalid CSRF token" });
    }
    try {
      const { data } = req.body || {};
      if (!data) return res.status(400).json({ error: "No data provided" });
      const { rows } = await db.query(
        `INSERT INTO user_progress (user_id, data, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = NOW()
         RETURNING updated_at`,
        [userId, JSON.stringify(data)]
      );
      return res.json({ success: true, updatedAt: rows[0].updated_at });
    } catch (e) {
      console.error("[progress POST]", e.message);
      return res.status(500).json({ error: "Server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
