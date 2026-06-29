/**
 * Extract official problem mappings from TUF A2Z sheet page (authoritative source).
 */
import { writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

let html;
const cached = join(__dirname, "../scratch/tuf-sheet-page.html");
try {
  html = readFileSync(cached, "utf8");
  if (html.length < 100000) throw new Error("stale cache");
} catch {
  const res = await fetch("https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  html = await res.text();
  writeFileSync(cached, html);
}

function extractVideoId(youtube) {
  if (!youtube || youtube === "$undefined") return null;
  const decoded = youtube.replace(/\\u0026/g, "&");
  return decoded.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/)?.[1] || null;
}

const byArticle = {};
const byName = {};
const all = [];

const re =
  /problem_name\\":\\"([^"]*)\\",\\"article\\":\\"([^"]*)\\",\\"youtube\\":\\"([^"]*)\\"/g;
let m;
while ((m = re.exec(html)) !== null) {
  const name = m[1];
  const article = m[2];
  const youtube = m[3];
  const id = extractVideoId(youtube);
  if (!id) continue;
  const url = `https://youtu.be/${id}`;
  const normArticle = article.replace(/\/$/, "").toLowerCase();
  all.push({ name, article, youtube: url });
  byArticle[normArticle] = { name, youtube: url };
  if (!byName[name]) byName[name] = url;
}

writeFileSync(join(__dirname, "../scratch/tuf-official-by-article.json"), JSON.stringify(byArticle, null, 2));
writeFileSync(join(__dirname, "../scratch/tuf-official-sheet-yt.json"), JSON.stringify(byName, null, 2));
writeFileSync(join(__dirname, "../scratch/tuf-official-sheet-all.json"), JSON.stringify(all, null, 2));

console.log(`Official entries with YouTube: ${all.length}`);
console.log(`By article: ${Object.keys(byArticle).length}, By name: ${Object.keys(byName).length}`);
console.log("Understand recursion:", byName["Understand recursion by print something N times"]);
