import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from "pg";

const { Pool } = pg;

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

let sessionMiddleware;
function getSessionMiddleware() {
  if (!sessionMiddleware) {
    const PgStore = connectPg(session);
    sessionMiddleware = session({
      secret: process.env.SESSION_SECRET,
      store: new PgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: 7 * 24 * 60 * 60,
        tableName: "sessions",
      }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    });
  }
  return sessionMiddleware;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default function handler(req, res) {
  const origin = req.headers.origin || "";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  getSessionMiddleware()(req, res, async () => {
    const sessionUserId = req.session?.passport?.user?.claims?.sub;
    const { userId } = req.query;

    if (!sessionUserId || sessionUserId !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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
  });
}
