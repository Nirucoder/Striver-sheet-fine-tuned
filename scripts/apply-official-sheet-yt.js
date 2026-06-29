/**
 * Apply official TUF A2Z sheet YouTube links to App.jsx.
 * Priority: exact title > alias > article URL (article is fallback only).
 * Skips extra LeetCode-only problems.
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { loadProblems, isExtraLeetcodeProblem } from "./lib/parse-striver-steps.js";
import { TITLE_ALIASES } from "./lib/title-aliases.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_PATH = join(__dirname, "../src/App.jsx");

function normalizeTitle(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeArticle(url) {
  if (!url) return null;
  return url.replace(/\/$/, "").toLowerCase();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateYtField(content, title, newUrl) {
  const escaped = escapeRegex(title);
  const pattern = new RegExp(`(title:"${escaped}"[^}]*?)yt:"[^"]+"`, "g");
  return content.replace(pattern, `$1yt:"${newUrl}"`);
}

function resolveOfficial(p, byName, byNormName, byArticle) {
  if (byName[p.title]) return { url: byName[p.title], source: "exact-title" };

  const alias = TITLE_ALIASES[p.title];
  if (alias && byName[alias]) return { url: byName[alias], source: "alias" };

  const norm = normalizeTitle(p.title);
  if (byNormName[norm]) return { url: byNormName[norm].url, source: "norm-title" };

  if (p.article) {
    const normArt = normalizeArticle(p.article);
    if (byArticle[normArt]) return { url: byArticle[normArt].youtube, source: "article" };
  }

  return null;
}

let { content, problems } = loadProblems(APP_PATH);
const byArticle = JSON.parse(readFileSync(join(__dirname, "../scratch/tuf-official-by-article.json"), "utf8"));
const byName = JSON.parse(readFileSync(join(__dirname, "../scratch/tuf-official-sheet-yt.json"), "utf8"));

const byNormName = {};
for (const [name, url] of Object.entries(byName)) {
  byNormName[normalizeTitle(name)] = { url, name };
}

const toUpdate = problems.filter((p) => p.yt && !isExtraLeetcodeProblem(p));
const fixes = [];
const noOfficial = [];

for (const p of toUpdate) {
  const match = resolveOfficial(p, byName, byNormName, byArticle);
  if (!match) {
    noOfficial.push(p.title);
    continue;
  }

  const currentId = p.yt.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
    || p.yt.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1];
  const officialId = match.url.split("/").pop();

  if (currentId !== officialId) {
    content = updateYtField(content, p.title, match.url);
    fixes.push({ title: p.title, before: p.yt, after: match.url, source: match.source });
  }
}

writeFileSync(APP_PATH, content);
writeFileSync(join(__dirname, "../scratch/official-sheet-yt-fixes.json"), JSON.stringify(fixes, null, 2));

console.log(`Problems checked: ${toUpdate.length}`);
console.log(`YouTube fixes applied: ${fixes.length}`);
console.log(`No official mapping (unchanged): ${noOfficial.length}`);

for (const f of fixes.slice(0, 25)) {
  console.log(`  [${f.source}] ${f.title}`);
  console.log(`    ${f.before} → ${f.after}`);
}
if (fixes.length > 25) console.log(`  ... and ${fixes.length - 25} more`);
