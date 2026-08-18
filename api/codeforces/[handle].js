/**
 * GET /api/codeforces/[handle]
 *
 * Proxy to Codeforces' public user.status API. The browser only needs
 * accepted submissions; filtering here keeps the client payload small and
 * avoids exposing failed-attempt details in synced progress.
 */

export const config = { maxDuration: 30 };

const responseCache = new Map();
const inFlight = new Map();
const CACHE_TTL_MS = 120_000;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const handle = String(req.query?.handle || "").trim();
  if (!handle) return res.status(400).json({ error: "handle required" });
  const cacheKey = handle.toLowerCase();
  const now = Date.now();
  const cached = responseCache.get(cacheKey);
  if (cached?.data && cached.updatedAt + CACHE_TTL_MS > now) {
    return res.status(200).json(cached.data);
  }

  if (inFlight.has(cacheKey)) {
    try {
      const shared = await inFlight.get(cacheKey);
      return res.status(shared.status).json(shared.body);
    } catch {
      return res.status(502).json({ error: "Codeforces is unavailable right now. Try again shortly." });
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  const upstreamRequest = (async () => {
    const cfRes = await fetch(
      `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "StudyOS/1.0 (public activity tracker)",
        },
      }
    );
    clearTimeout(timeout);

    let json = {};
    try { json = await cfRes.json(); } catch {}
    if (!cfRes.ok) {
      return cfRes.status === 400
        ? { status: 422, body: { error: json.comment || "Codeforces handle was not found." } }
        : { status: 502, body: { error: `Codeforces responded with ${cfRes.status}` } };
    }
    if (json.status !== "OK" || !Array.isArray(json.result)) {
      return { status: 422, body: { error: json.comment || "Codeforces handle was not found or could not be read." } };
    }

    const submissions = json.result
      .filter(submission => submission?.verdict === "OK" && submission?.creationTimeSeconds)
      .map(submission => ({
        id: submission.id ?? null,
        contestId: submission.contestId ?? null,
        creationTimeSeconds: submission.creationTimeSeconds,
        verdict: submission.verdict,
        problem: {
          contestId: submission.problem?.contestId ?? submission.contestId ?? null,
          index: submission.problem?.index ?? null,
          name: submission.problem?.name || "Accepted problem",
          rating: submission.problem?.rating ?? null,
        },
      }));
    const data = { handle, submissions, fetchedAt: new Date().toISOString() };
    responseCache.set(cacheKey, { data, updatedAt: now });
    return { status: 200, body: data };
  })();

  inFlight.set(cacheKey, upstreamRequest);
  try {
    const result = await upstreamRequest;
    return res.status(result.status).json(result.body);
  } catch (error) {
    clearTimeout(timeout);
    return res.status(error.name === "AbortError" ? 504 : 502).json({
      error: error.name === "AbortError"
        ? "Codeforces took too long to respond — try again shortly"
        : "Codeforces is unavailable right now. Try again shortly",
    });
  } finally {
    inFlight.delete(cacheKey);
  }
}