import { getPool, getGoogleUserId, getGoogleClientId, getAuthFailureReason } from "../_lib/auth.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: "DATABASE_URL not configured on server." });
  }

  const clientId = getGoogleClientId();
  if (!clientId) {
    return res.status(503).json({
      message: "Server misconfigured",
      hint: "GOOGLE_CLIENT_ID is not set in Vercel environment variables.",
    });
  }

  const sessionUserId = await getGoogleUserId(req);
  const { userId } = req.query;

  if (!sessionUserId) {
    const reason = await getAuthFailureReason(req);
    const hints = {
      missing_token: "No auth token sent. Sign out and sign in with Google again.",
      missing_client_id: "GOOGLE_CLIENT_ID is not set on the server.",
      invalid_token: "Google token rejected. Sign out and sign in again.",
      malformed_token: "Invalid auth token. Sign out and sign in again.",
    };
    return res.status(401).json({
      message: "Unauthorized",
      hint: hints[reason] || "Google sign-in token missing, expired, or invalid. Sign in again.",
      reason,
    });
  }
  if (sessionUserId !== userId) return res.status(403).json({ message: "Forbidden" });

  const db = getPool();

  if (req.method === "GET") {
    try {
      const { rows } = await db.query(
        "SELECT data, updated_at FROM user_progress WHERE user_id = $1",
        [userId]
      );
      if (rows.length === 0) return res.status(404).json({ error: "No data found" });
      return res.json({ data: rows[0].data, updatedAt: rows[0].updated_at });
    } catch (e) {
      console.error("[progress GET]", e.message);
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { data } = req.body || {};
      if (!data) return res.status(400).json({ error: "No data provided" });
      await db.query(
        `INSERT INTO user_progress (user_id, data, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = NOW()`,
        [userId, JSON.stringify(data)]
      );
      return res.json({ success: true });
    } catch (e) {
      console.error("[progress POST]", e.message);
      return res.status(500).json({ error: "Server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
