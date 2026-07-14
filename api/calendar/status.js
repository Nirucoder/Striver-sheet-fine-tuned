import { getPool } from "../_lib/auth.js";
import { getSessionUser } from "../_lib/session.js";
import { setCorsHeaders } from "../_lib/calendar.js";

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ connected: false, error: "Unauthorized" });

  try {
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
  } catch (e) {
    return res.status(500).json({ connected: false, error: e.message });
  }
}
