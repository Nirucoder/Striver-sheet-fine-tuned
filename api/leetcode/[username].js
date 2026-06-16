/**
 * GET /api/leetcode/[username]
 *
 * Proxy to LeetCode's public GraphQL API.
 * Fetches the 100 most recent accepted submissions for a user.
 * Running server-side avoids browser CORS restrictions and third-party rate limits.
 */
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
}
