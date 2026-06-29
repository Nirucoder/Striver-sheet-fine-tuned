import * as oidcClient from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from "pg";

const { Pool } = pg;

// --- Pool ---
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

// --- OIDC config (cached) ---
let oidcConfig = null;
export async function getOidcConfig() {
  if (!oidcConfig) {
    oidcConfig = await oidcClient.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  }
  return oidcConfig;
}

// --- Session middleware (cached) ---
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

// --- Passport (singleton setup) ---
let passportInitialized = false;
const registeredStrategies = new Set();

export function initPassport() {
  if (!passportInitialized) {
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((user, cb) => cb(null, user));
    passportInitialized = true;
  }
  return passport;
}

export async function ensureStrategy(domain) {
  const strategyName = `replitauth:${domain}`;
  if (!registeredStrategies.has(strategyName)) {
    const config = await getOidcConfig();
    const db = getPool();
    passport.use(
      strategyName,
      new Strategy(
        {
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        async (tokens, done) => {
          const claims = tokens.claims();
          const user = {
            claims,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: claims?.exp,
          };
          try {
            await db.query(
              `INSERT INTO users (id, email, first_name, last_name, profile_image_url, updated_at)
               VALUES ($1, $2, $3, $4, $5, NOW())
               ON CONFLICT (id) DO UPDATE SET
                 email = EXCLUDED.email,
                 first_name = EXCLUDED.first_name,
                 last_name = EXCLUDED.last_name,
                 profile_image_url = EXCLUDED.profile_image_url,
                 updated_at = NOW()`,
              [
                claims["sub"],
                claims["email"] || null,
                claims["first_name"] || null,
                claims["last_name"] || null,
                claims["profile_image_url"] || null,
              ]
            );
          } catch (err) {
            console.error("[auth] upsert user error:", err.message);
          }
          done(null, user);
        }
      )
    );
    registeredStrategies.add(strategyName);
  }
  return strategyName;
}

// --- Token refresh helper ---
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

/**
 * Checks whether req.user is authenticated and, if the access token has
 * expired, transparently refreshes it using the stored refresh token.
 * Saves the session after a successful refresh so the new tokens persist.
 *
 * Returns the validated user object, or null if authentication fails.
 */
export async function requireAuth(req, res) {
  const user = req.user;

  if (!user?.claims?.sub || !user?.expires_at) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) return user;

  // Token expired — try to refresh
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  try {
    const cfg = await getOidcConfig();
    const tokenResponse = await oidcClient.refreshTokenGrant(cfg, refreshToken);
    updateUserSession(user, tokenResponse);
    // Persist refreshed tokens back to the session store
    await new Promise((resolve, reject) =>
      req.session.save((err) => (err ? reject(err) : resolve()))
    );
    return user;
  } catch {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
}

// --- Middleware runner helper ---
export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (err) => (err ? reject(err) : resolve()));
  });
}

export { passport };
