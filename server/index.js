import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";
import { getPool, getGoogleUserId, getGoogleClientId, getAuthFailureReason } from "../api/_lib/auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "../dist");

const pool = getPool();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));

async function requireGoogleAuth(req, res, next) {
  if (!getGoogleClientId()) {
    return res.status(503).json({
      message: "Server misconfigured",
      hint: "GOOGLE_CLIENT_ID is not set.",
    });
  }
  const userId = await getGoogleUserId(req);
  if (!userId) {
    const reason = await getAuthFailureReason(req);
    return res.status(401).json({ message: "Unauthorized", reason });
  }
  req.googleUserId = userId;
  next();
}

app.get("/api/progress/:userId", requireGoogleAuth, async (req, res) => {
  try {
    if (req.googleUserId !== req.params.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { rows } = await pool.query(
      "SELECT data, updated_at FROM user_progress WHERE user_id = $1",
      [req.params.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "No data found" });
    res.json({ data: rows[0].data, updatedAt: rows[0].updated_at });
  } catch (e) {
    console.error("[progress get]", e.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/progress/:userId", requireGoogleAuth, async (req, res) => {
  try {
    if (req.googleUserId !== req.params.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: "No data provided" });
    await pool.query(
      `INSERT INTO user_progress (user_id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = NOW()`,
      [req.params.userId, JSON.stringify(data)]
    );
    res.json({ success: true });
  } catch (e) {
    console.error("[progress post]", e.message);
    res.status(500).json({ error: "Server error" });
  }
});

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
  const { username } = req.params;
  if (!username) return res.status(400).json({ error: "username required" });

  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const lcRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ query, variables: { username, limit: 100 } }),
    });

    if (!lcRes.ok) {
      return res.status(502).json({ error: `LeetCode responded with ${lcRes.status}` });
    }

    const json = await lcRes.json();

    if (json.errors) {
      return res.status(422).json({ error: json.errors[0]?.message || "LeetCode GraphQL error" });
    }

    const submissions = json?.data?.recentAcSubmissionList ?? [];
    return res.json({ submissions });
  } catch (e) {
    console.error("[leetcode proxy]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

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
