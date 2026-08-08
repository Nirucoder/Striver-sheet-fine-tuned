import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";
import { getPool, getGoogleClientId, verifyGoogleCredential } from "../api/_lib/auth.js";
import {
  signSession,
  getSessionUser,
  generateCsrfToken,
  buildSessionCookies,
  buildClearCookies,
  isSecureRequest,
  parseCookies,
  csrfMatches,
  CSRF_COOKIE,
  CSRF_HEADER,
} from "../api/_lib/session.js";
import calendarHandler from "../api/calendar/[action].js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "../dist");

const pool = getPool();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// LeetCode throttles repeated GraphQL requests. Keep the most recent complete
// response briefly and serve it during the cooldown so a temporary 429 never
// wipes the user's already-synced dashboard state.
const leetcodeCache = new Map();
const leetcodeInFlight = new Map();
const LEETCODE_CACHE_TTL_MS = 90_000;
const LEETCODE_RATE_LIMIT_COOLDOWN_MS = 60_000;

function setCookies(res, cookies) {
  res.setHeader("Set-Cookie", cookies);
}

// ── Session middleware: derive user from the HttpOnly session cookie ──────────
async function requireSession(req, res, next) {
  const user = await getSessionUser(req);
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
      hint: "Your session is missing or expired. Please sign in again.",
    });
  }
  req.user = user;
  next();
}

// ── Auth: exchange a Google credential for a durable app session ──────────────
app.post("/api/auth/google", async (req, res) => {
  if (!getGoogleClientId()) {
    return res.status(503).json({ message: "Server misconfigured", hint: "GOOGLE_CLIENT_ID is not set." });
  }
  if (!process.env.SESSION_SECRET) {
    return res.status(503).json({ message: "Server misconfigured", hint: "SESSION_SECRET is not set." });
  }
  const { payload, reason } = await verifyGoogleCredential(req.body?.credential);
  if (!payload) return res.status(401).json({ message: "Invalid Google credential", reason });

  const user = { sub: payload.sub, name: payload.name, email: payload.email, picture: payload.picture };
  const sessionToken = await signSession(user);
  const csrfToken = generateCsrfToken();
  setCookies(res, buildSessionCookies({ sessionToken, csrfToken, secure: isSecureRequest(req) }));
  res.json({ user });
});

app.get("/api/auth/me", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ user: null });
  res.json({ user: { sub: user.sub, name: user.name, email: user.email, picture: user.picture } });
});

app.post("/api/auth/logout", (req, res) => {
  setCookies(res, buildClearCookies({ secure: isSecureRequest(req) }));
  res.json({ success: true });
});

// ── Progress: user id comes from the session, never from the client ───────────
app.get("/api/progress", requireSession, async (req, res) => {
  try {
    const params = [req.user.sub];
    let query = "SELECT data, updated_at FROM user_progress WHERE user_id = $1";
    if (req.query.updatedAfter) {
      const updatedAfter = Date.parse(req.query.updatedAfter);
      if (Number.isNaN(updatedAfter)) {
        return res.status(400).json({ error: "Invalid updatedAfter timestamp" });
      }
      query += " AND updated_at > $2";
      params.push(new Date(updatedAfter));
    }
    const { rows } = await pool.query(query, params);
    if (rows.length === 0) return res.status(404).json({ error: "No data found" });
    res.json({ data: rows[0].data, updatedAt: rows[0].updated_at });
  } catch (e) {
    console.error("[progress get]", e.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/progress", requireSession, async (req, res) => {
  const cookies = parseCookies(req);
  if (!csrfMatches(cookies[CSRF_COOKIE], req.headers[CSRF_HEADER])) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: "No data provided" });
    const { rows } = await pool.query(
      `INSERT INTO user_progress (user_id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = NOW()
       RETURNING updated_at`,
      [req.user.sub, JSON.stringify(data)]
    );
    res.json({ success: true, updatedAt: rows[0].updated_at });
  } catch (e) {
    console.error("[progress post]", e.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Legacy sync-code endpoints (kept for one-time migration) ──────────────────
app.get("/api/sync/:code", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT data, updated_at FROM sync_data WHERE code = $1",
      [req.params.code]
    );
    if (rows.length === 0) return res.status(404).json({ error: "No data found for this code" });
    res.json({ data: rows[0].data, updatedAt: rows[0].updated_at });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/sync/:code", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: "No data provided" });
    await pool.query(
      `INSERT INTO sync_data (code, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (code) DO UPDATE SET data = $2, updated_at = NOW()`,
      [req.params.code, JSON.stringify(data)]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/leetcode/:username", async (req, res) => {
  const username = String(req.params.username || "").trim();
  if (!username) return res.status(400).json({ error: "username required" });
  const cacheKey = username.toLowerCase();
  const now = Date.now();
  const cached = leetcodeCache.get(cacheKey);

  if (cached?.data && cached.updatedAt + LEETCODE_CACHE_TTL_MS > now) {
    return res.json(cached.data);
  }
  if (cached?.rateLimitedUntil > now) {
    if (cached.data) {
      return res.json({
        ...cached.data,
        rateLimited: true,
        retryAfterSeconds: Math.ceil((cached.rateLimitedUntil - now) / 1000),
      });
    }
    return res.status(429).json({
      error: "LeetCode is temporarily rate limiting requests. Try again shortly.",
      retryAfterSeconds: Math.ceil((cached.rateLimitedUntil - now) / 1000),
    });
  }
  // The dashboard and DSA page can both refresh on the same mount. Reuse the
  // same upstream request rather than sending another GraphQL request.
  if (leetcodeInFlight.has(cacheKey)) {
    try {
      const shared = await leetcodeInFlight.get(cacheKey);
      return res.status(shared.status).json(shared.body);
    } catch (e) {
      return res.status(502).json({ error: "LeetCode sync is unavailable right now. Try again shortly." });
    }
  }

  const query = `
    query leetcodeStudyStats($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        submissionCalendar
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const upstreamRequest = (async () => {
    const lcRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        Origin: "https://leetcode.com",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ query, variables: { username, limit: 500 } }),
    });

    if (!lcRes.ok) {
      if (lcRes.status === 429) {
        const rateLimitedUntil = now + LEETCODE_RATE_LIMIT_COOLDOWN_MS;
        leetcodeCache.set(cacheKey, { ...cached, rateLimitedUntil });
        if (cached?.data) {
          return {
            status: 200,
            body: {
              ...cached.data,
              rateLimited: true,
              retryAfterSeconds: Math.ceil(LEETCODE_RATE_LIMIT_COOLDOWN_MS / 1000),
            },
          };
        }
        return {
          status: 429,
          body: {
            error: "LeetCode is temporarily rate limiting requests. Try again shortly.",
            retryAfterSeconds: LEETCODE_RATE_LIMIT_COOLDOWN_MS / 1000,
          },
        };
      }
      return { status: 502, body: { error: `LeetCode responded with ${lcRes.status}` } };
    }

    const json = await lcRes.json();

    if (json.errors) {
      return { status: 422, body: { error: json.errors[0]?.message || "LeetCode GraphQL error" } };
    }

    const data = {
      submissions: json?.data?.recentAcSubmissionList ?? [],
      submissionCalendar: json?.data?.matchedUser?.submissionCalendar ?? "{}",
      submitStatsGlobal: json?.data?.matchedUser?.submitStatsGlobal ?? null,
      allQuestionsCount: json?.data?.allQuestionsCount ?? null,
    };
    leetcodeCache.set(cacheKey, { data, updatedAt: now, rateLimitedUntil: 0 });
    return { status: 200, body: data };
  })();
  leetcodeInFlight.set(cacheKey, upstreamRequest);
  try {
    const result = await upstreamRequest;
    if (result.status === 429) {
      res.setHeader("Retry-After", String(LEETCODE_RATE_LIMIT_COOLDOWN_MS / 1000));
    }
    return res.status(result.status).json(result.body);
  } catch (e) {
    console.error("[leetcode proxy]", e.message);
    return res.status(500).json({ error: e.message });
  } finally {
    leetcodeInFlight.delete(cacheKey);
  }
});

// ── Google Calendar (backend OAuth, tokens stored in DB) ──────────────────────
const withAction = (action) => (req, res) => {
  req.query = { ...req.query, action };
  return calendarHandler(req, res);
};
app.get("/api/calendar/connect",         withAction("connect"));
app.get("/api/calendar/callback",        withAction("callback"));
app.get("/api/calendar/status",          withAction("status"));
app.get("/api/calendar/debug",           withAction("debug"));
app.get("/api/calendar/events",          withAction("events"));
app.post("/api/calendar/create-event",   withAction("create-event"));
app.delete("/api/calendar/delete-event", withAction("delete-event"));
app.post("/api/calendar/disconnect",     withAction("disconnect"));

app.get("/api/health", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW() AS now");
    res.json({ status: "ok", db: true, serverTime: rows[0].now });
  } catch (e) {
    res.status(500).json({ status: "error", db: false, message: e.message });
  }
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("/{*splat}", (_req, res) => res.sendFile(join(distDir, "index.html")));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
