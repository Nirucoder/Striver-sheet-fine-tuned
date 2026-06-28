import * as oidcClient from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import connectPg from "connect-pg-simple";

let oidcConfig = null;

async function getOidcConfig() {
  if (!oidcConfig) {
    oidcConfig = await oidcClient.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  }
  return oidcConfig;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const PgStore = connectPg(session);
  const sessionStore = new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

export async function setupAuth(app, pool) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();
  const registeredStrategies = new Set();

  const ensureStrategy = (domain) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      passport.use(
        strategyName,
        new Strategy(
          {
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          async (tokens, done) => {
            const user = {};
            updateUserSession(user, tokens);
            const claims = tokens.claims();
            try {
              await pool.query(
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
  };

  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(async () => {
      try {
        const cfg = await getOidcConfig();
        const endUrl = oidcClient.buildEndSessionUrl(cfg, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href;
        res.redirect(endUrl);
      } catch {
        res.redirect("/");
      }
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const { rows } = await pool.query(
        "SELECT id, email, first_name, last_name, profile_image_url FROM users WHERE id = $1",
        [userId]
      );
      res.json(rows[0] || null);
    } catch (err) {
      console.error("[auth] get user error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  });
}

export async function isAuthenticated(req, res, next) {
  const user = req.user;
  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) return next();

  const refreshToken = user.refresh_token;
  if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

  try {
    const cfg = await getOidcConfig();
    const tokenResponse = await oidcClient.refreshTokenGrant(cfg, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
