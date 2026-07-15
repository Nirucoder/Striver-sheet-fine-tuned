/**
 * GET /api/lc-diff?slugs=two-sum,median-of-two-sorted-arrays,...
 *
 * Batch-fetches difficulty (Easy / Medium / Hard) from LeetCode's GraphQL API
 * for a comma-separated list of problem slugs.
 * Returns: { difficulties: { "two-sum": "Easy", ... } }
 *
 * Runs server-side to avoid browser CORS restrictions.
 * Fetches in parallel batches of 8 to stay friendly to LeetCode's API.
 */

const QUERY = `
  query questionDifficulty($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      difficulty
    }
  }
`;

const HEADERS = {
  "Content-Type": "application/json",
  "Referer": "https://leetcode.com",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

async function fetchOne(slug) {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ query: QUERY, variables: { titleSlug: slug } }),
    });
    if (!res.ok) return [slug, null];
    const json = await res.json();
    const diff = json?.data?.question?.difficulty || null;
    return [slug, diff];
  } catch {
    return [slug, null];
  }
}

async function batchFetch(slugs, batchSize = 8) {
  const results = {};
  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);
    const pairs = await Promise.all(batch.map(fetchOne));
    pairs.forEach(([slug, diff]) => {
      if (diff) results[slug] = diff;
    });
  }
  return results;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const raw = req.query.slugs || "";
  if (!raw) return res.status(400).json({ error: "slugs query param required" });

  const slugs = raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 200); // safety cap

  const difficulties = await batchFetch(slugs);
  // Cache for 24 hours — difficulties almost never change
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
  return res.json({ difficulties });
}
