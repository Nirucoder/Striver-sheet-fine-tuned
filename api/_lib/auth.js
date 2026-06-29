import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from "pg";

const { Pool } = pg;

// --- Pool singleton ---
let pool;
export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

// --- Session middleware singleton ---
let sessionMiddleware;
export function getSessionMiddleware() {
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

// --- Middleware runner ---
export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (err) => (err ? reject(err) : resolve()));
  });
}

/**
 * Reads the session and returns the authenticated userId, or null.
 * Sessions are written by the Replit dev server's Passport-based auth;
 * on Vercel the session cookie is read from the same PostgreSQL store.
 */
export function getSessionUserId(req) {
  return req.session?.passport?.user?.claims?.sub ?? null;
}
