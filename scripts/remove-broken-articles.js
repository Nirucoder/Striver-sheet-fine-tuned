/**
 * Remove broken takeuforward article URLs from App.jsx (404 pages).
 * Only strips `article` field — keeps title, yt, practice, difficulty.
 * Skips extra LeetCode-only problems (they have no article).
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { loadProblems } from "./lib/parse-striver-steps.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_PATH = join(__dirname, "../src/App.jsx");
const CACHE_PATH = join(__dirname, "../scratch/tuf-article-cache.json");

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

async function checkArticle(url, cache) {
  if (cache[url]?.notFound !== undefined) return cache[url];
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await res.text();
  const result = { notFound: isArticleNotFound(html), status: res.status };
  cache[url] = result;
  saveCache(cache);
  return result;
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

let { content, problems } = loadProblems(APP_PATH);
const cache = loadCache();
const withArticle = problems.filter((p) => p.article?.includes("takeuforward.org"));
const uniqueUrls = [...new Set(withArticle.map((p) => p.article))];

console.log(`Checking ${uniqueUrls.length} article URLs...`);
for (const url of uniqueUrls) {
  await checkArticle(url, cache);
  await new Promise((r) => setTimeout(r, 60));
}

const removed = [];
for (const p of withArticle) {
  const info = cache[p.article];
  if (info?.notFound) {
    content = removeArticleField(content, p.title);
    removed.push({ title: p.title, article: p.article });
  }
}

writeFileSync(APP_PATH, content);
writeFileSync(join(__dirname, "../scratch/broken-articles-removed.json"), JSON.stringify(removed, null, 2));

console.log(`\nBroken articles removed: ${removed.length}`);
for (const r of removed.slice(0, 15)) {
  console.log(`  ✗ ${r.title}: ${r.article}`);
}
if (removed.length > 15) console.log(`  ... and ${removed.length - 15} more`);
