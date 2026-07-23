/**
 * GET /api/leetcode/[username]
 *
 * Proxy to LeetCode's public GraphQL API.
 * Fetches accepted submissions for a user.
 * Running server-side avoids browser CORS restrictions.
 */

// Extend Vercel function timeout to 30s (Pro: 300s, Hobby: 30s)
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "username required" });

  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
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

  // Abort if LeetCode takes longer than 25s (leaves 5s buffer for Vercel)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const lcRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
        "Origin": "https://leetcode.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ query, variables: { username, limit: 500 } }),
    });
    clearTimeout(timeout);

    if (!lcRes.ok) {
      return res.status(502).json({ error: `LeetCode returned ${lcRes.status} — try again in a moment` });
    }

    const json = await lcRes.json();

    if (json.errors) {
      return res.status(422).json({ error: json.errors[0]?.message || "LeetCode GraphQL error" });
    }

    const submissions = json?.data?.recentAcSubmissionList ?? [];
    const submissionCalendar = json?.data?.matchedUser?.submissionCalendar ?? "{}";
    const submitStatsGlobal = json?.data?.matchedUser?.submitStatsGlobal ?? null;
    const allQuestionsCount = json?.data?.allQuestionsCount ?? null;
    return res.json({ submissions, submissionCalendar, submitStatsGlobal, allQuestionsCount });
  } catch (e) {
    clearTimeout(timeout);
    console.error("[leetcode proxy]", e.message);
    if (e.name === "AbortError") {
      return res.status(504).json({ error: "LeetCode took too long to respond — try again in a moment" });
    }
    return res.status(500).json({ error: e.message });
  }
}
