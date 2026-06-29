/**
 * Sync official A2Z sheet YouTube links from takeuforward articles.
 * Removes broken article URLs (404 / Article Not Found).
 *
 * Only touches official sheet problems (with takeuforward article URLs).
 * Skips extra LeetCode-only problems entirely.
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { loadProblems, isExtraLeetcodeProblem } from "./lib/parse-striver-steps.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_PATH = join(__dirname, "../src/App.jsx");
const CACHE_PATH = join(__dirname, "../scratch/tuf-article-cache.json");

function extractVideoFromHtml(html) {
  const patterns = [
    /"video":"([a-zA-Z0-9_-]{11})"/,
    /\\"video\\":\\"([a-zA-Z0-9_-]{11})\\"/,
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pat of patterns) {
    const m = html.match(pat);
    if (m) return m[1];
  }
  return null;
}

function isArticleNotFound(html) {
  return /Article Not Found|article may have been moved or deleted/i.test(html);
}

function loadCache() {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function fetchArticle(articleUrl, cache) {
  if (cache[articleUrl]) return cache[articleUrl];

  try {
    const res = await fetch(articleUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      redirect: "follow",
    });
    const html = await res.text();
    const result = {
      notFound: isArticleNotFound(html),
      videoId: extractVideoFromHtml(html),
      status: res.status,
    };
    cache[articleUrl] = result;
    saveCache(cache);
    return result;
  } catch (err) {
    const result = { notFound: true, videoId: null, status: 0, error: String(err) };
    cache[articleUrl] = result;
    saveCache(cache);
    return result;
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeArticleField(content, title) {
  const escaped = escapeRegex(title);
  const pattern = new RegExp(
    `(title:"${escaped}",(?:[^}]*?))article:"https://takeuforward\\.org[^"]*",`,
    "g"
  );
  return content.replace(pattern, `$1`);
}

function updateYtField(content, title, newUrl) {
  const escaped = escapeRegex(title);
  const pattern = new RegExp(`(title:"${escaped}"[^}]*?)yt:"[^"]+"`, "g");
  return content.replace(pattern, `$1yt:"${newUrl}"`);
}

// ─── Main ───────────────────────────────────────────────────────────────────
let { content, problems } = loadProblems(APP_PATH);
const cache = loadCache();

const officialWithArticle = problems.filter(
  (p) => p.article?.includes("takeuforward.org") && !isExtraLeetcodeProblem(p)
);

console.log(`Official problems with article: ${officialWithArticle.length}`);
console.log(`Skipping LeetCode extras: ${problems.filter(isExtraLeetcodeProblem).length}`);

const brokenArticles = [];
const ytFixes = [];
const articleVideoMap = {};
const uniqueArticles = [...new Set(officialWithArticle.map((p) => p.article))];

console.log(`\nFetching ${uniqueArticles.length} unique article URLs...`);
let fetched = 0;
for (const url of uniqueArticles) {
  await fetchArticle(url, cache);
  fetched++;
  if (fetched % 25 === 0) process.stdout.write(`\r  ${fetched}/${uniqueArticles.length}`);
  await new Promise((r) => setTimeout(r, 80));
}
console.log(`\r  Done fetching ${uniqueArticles.length} URLs`);

for (const p of officialWithArticle) {
  const info = cache[p.article];
  if (!info) continue;

  if (info.notFound) {
    brokenArticles.push({ title: p.title, article: p.article });
    content = removeArticleField(content, p.title);
    continue;
  }

  if (info.videoId) {
    const official = `https://youtu.be/${info.videoId}`;
    articleVideoMap[p.title] = official;

    const currentId = p.yt?.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
      || p.yt?.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1];

    if (p.yt && currentId !== info.videoId) {
      content = updateYtField(content, p.title, official);
      ytFixes.push({ title: p.title, before: p.yt, after: official, source: "article" });
    }
  }
}

writeFileSync(APP_PATH, content);

writeFileSync(join(__dirname, "../scratch/broken-articles-removed.json"), JSON.stringify(brokenArticles, null, 2));
writeFileSync(join(__dirname, "../scratch/yt-sync-fixes.json"), JSON.stringify(ytFixes, null, 2));
writeFileSync(join(__dirname, "../scratch/tuf-official-yt-by-title.json"), JSON.stringify(articleVideoMap, null, 2));

console.log(`\nBroken articles removed: ${brokenArticles.length}`);
for (const b of brokenArticles.slice(0, 15)) {
  console.log(`  ✗ ${b.title}: ${b.article}`);
}
if (brokenArticles.length > 15) console.log(`  ... and ${brokenArticles.length - 15} more`);

console.log(`\nYouTube fixes applied: ${ytFixes.length}`);
for (const f of ytFixes.slice(0, 15)) {
  console.log(`  ${f.title}`);
  console.log(`    ${f.before} → ${f.after}`);
}
if (ytFixes.length > 15) console.log(`  ... and ${ytFixes.length - 15} more`);

console.log(`\nArticles with embedded video: ${Object.keys(articleVideoMap).length}`);
console.log(`LeetCode extras untouched: yes`);
