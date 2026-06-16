/**
 * GET /api/health
 * Diagnostic endpoint — checks DATABASE_URL presence and DB connectivity.
 * Remove or protect this in production if desired.
 */
import pg from "pg";
const { Pool } = pg;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const url = process.env.DATABASE_URL;

  if (!url) {
    return res.status(200).json({
      status: "error",
      message: "DATABASE_URL environment variable is NOT set on this Vercel deployment.",
      db: false,
    });
  }

  // Mask credentials for safe display
  const masked = url.replace(/:([^@]+)@/, ":***@");

  try {
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
    const { rows } = await pool.query("SELECT NOW() AS now");
    await pool.end();
    return res.status(200).json({
      status: "ok",
      message: "Connected to database successfully.",
      db: true,
      serverTime: rows[0].now,
      connectionString: masked,
    });
  } catch (e) {
    return res.status(200).json({
      status: "error",
      message: e.message,
      db: false,
      connectionString: masked,
    });
  }
}
