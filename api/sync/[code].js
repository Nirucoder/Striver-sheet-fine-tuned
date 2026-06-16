import pg from "pg";

const { Pool } = pg;
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

// Increase Vercel's default 4MB body limit to 10MB so large progress payloads don't get rejected
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: "DATABASE_URL not configured on server." });
  }

  const { code } = req.query;
  const db = getPool();

  if (req.method === "GET") {
    try {
      const { rows } = await db.query(
        "SELECT data, updated_at FROM sync_data WHERE code = $1",
        [code]
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "No data found for this code" });
      return res.json({ data: rows[0].data, updatedAt: rows[0].updated_at });
    } catch (e) {
      console.error("[sync GET]", e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { data } = req.body || {};
      if (!data) return res.status(400).json({ error: "No data provided" });
      await db.query(
        `INSERT INTO sync_data (code, data, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (code) DO UPDATE SET data = $2, updated_at = NOW()`,
        [code, JSON.stringify(data)]
      );
      return res.json({ success: true });
    } catch (e) {
      console.error("[sync POST]", e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
