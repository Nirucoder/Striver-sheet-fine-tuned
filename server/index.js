import express from "express";
import cors from "cors";
import pg from "pg";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "../dist");

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

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
        "Referer": "https://leetcode.com",
        "User-Agent": "Mozilla/5.0 (compatible; StudyOS/1.0)",
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

// Serve built frontend in production
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("/{*splat}", (_req, res) => res.sendFile(join(distDir, "index.html")));
}

const PORT = process.env.PORT || process.env.API_PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
