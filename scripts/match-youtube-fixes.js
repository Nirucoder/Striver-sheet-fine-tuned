/**
 * Match broken YouTube IDs to A2Z playlist videos (no search API)
 * Also scrape takeuforward article pages for embedded video links
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_PATH = join(__dirname, "../src/App.jsx");
const envContent = readFileSync(join(__dirname, "../.env"), "utf8");
const API_KEY = envContent.match(/^YOUTUBE_API_KEY=(.+)$/m)?.[1]?.trim();

const appContent = readFileSync(APP_PATH, "utf8");
const report = JSON.parse(readFileSync(join(__dirname, "../scratch/youtube-validation-report.json"), "utf8"));
const playlistVideos = JSON.parse(readFileSync(join(__dirname, "../scratch/a2z-playlist.json"), "utf8"));

const brokenIds = new Set(report.broken.map((b) => b.id));

function normalizeTitle(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function matchScore(problemTitle, videoTitle) {
  const p = normalizeTitle(problemTitle);
  const v = normalizeTitle(videoTitle);
  const pWords = p.split(" ").filter((w) => w.length > 2);
  if (pWords.length === 0) return 0;
  const matched = pWords.filter((w) => v.includes(w)).length;
  return matched / pWords.length;
}

// Extract entries with article URLs for broken yt links
const entryRegex = /\{[^}]*title:"([^"]+)"[^}]*\}/g;
const allEntries = [];
let m;
const lines = appContent.match(/const STRIVER_STEPS[\s\S]*?^];/m)?.[0] || appContent;
const blockRegex = /\{[^}]*title:"([^"]+)"([^}]*)\}/g;
while ((m = blockRegex.exec(lines)) !== null) {
  const title = m[1];
  const rest = m[2];
  const yt = rest.match(/yt:"([^"]+)"/)?.[1];
  const article = rest.match(/article:"([^"]+)"/)?.[1];
  if (yt) {
    const videoId = yt.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1];
    allEntries.push({ title, yt, videoId, article });
  }
}

const brokenEntries = allEntries.filter((e) => brokenIds.has(e.videoId));
const uniqueBroken = [...new Set(brokenEntries.map((e) => e.videoId))];

console.log(`Broken unique IDs: ${uniqueBroken.length}`);
console.log(`Playlist videos: ${playlistVideos.length}`);

// Match from playlist
const idReplacements = {};
const detailedFixes = [];

for (const oldId of uniqueBroken) {
  const linked = brokenEntries.filter((e) => e.videoId === oldId);
  let bestOverall = null;
  let bestOverallScore = 0;

  for (const entry of linked) {
    for (const pv of playlistVideos) {
      const score = matchScore(entry.title, pv.title);
      if (score > bestOverallScore) {
        bestOverallScore = score;
        bestOverall = { ...pv, matchedProblem: entry.title, score };
      }
    }
  }

  if (bestOverall && bestOverallScore >= 0.25) {
    idReplacements[oldId] = bestOverall.url;
    detailedFixes.push({
      oldId,
      newUrl: bestOverall.url,
      newTitle: bestOverall.title,
      score: bestOverallScore,
      method: "playlist",
      linkedProblems: linked.map((l) => l.title),
    });
  }
}

console.log(`Playlist matched: ${Object.keys(idReplacements).length}/${uniqueBroken.length}`);

// Scrape takeuforward articles for remaining
const unmatched = uniqueBroken.filter((id) => !idReplacements[id]);
const toScrape = [];
for (const oldId of unmatched) {
  const linked = brokenEntries.filter((e) => e.videoId === oldId);
  for (const entry of linked) {
    if (entry.article && !toScrape.find((t) => t.article === entry.article)) {
      toScrape.push({ oldId, title: entry.title, article: entry.article });
    }
  }
}

console.log(`Scraping ${toScrape.length} takeuforward articles for video links...`);

async function scrapeArticleVideo(articleUrl) {
  try {
    const res = await fetch(articleUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await res.text();
    // Look for youtube embeds or links
    const patterns = [
      /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/g,
      /youtu\.be\/([a-zA-Z0-9_-]+)/g,
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
    ];
    const ids = new Set();
    for (const pat of patterns) {
      let match;
      while ((match = pat.exec(html)) !== null) {
        ids.add(match[1]);
      }
    }
    return [...ids];
  } catch {
    return [];
  }
}

for (const item of toScrape.slice(0, 80)) {
  const ids = await scrapeArticleVideo(item.article);
  if (ids.length > 0) {
    const newUrl = `https://youtu.be/${ids[0]}`;
    if (!idReplacements[item.oldId]) {
      idReplacements[item.oldId] = newUrl;
      detailedFixes.push({
        oldId: item.oldId,
        newUrl,
        newTitle: `(from article) ${item.title}`,
        score: "article",
        method: "article",
        linkedProblems: brokenEntries.filter((e) => e.videoId === item.oldId).map((l) => l.title),
      });
    }
  }
  await new Promise((r) => setTimeout(r, 150));
}

console.log(`After article scrape: ${Object.keys(idReplacements).length}/${uniqueBroken.length}`);

const stillUnmatched = uniqueBroken.filter((id) => !idReplacements[id]);
console.log(`\nStill unmatched (${stillUnmatched.length}):`);
for (const id of stillUnmatched) {
  const linked = brokenEntries.filter((e) => e.videoId === id);
  console.log(`  ${id}: ${linked[0]?.title}`);
}

writeFileSync(join(__dirname, "../scratch/youtube-id-replacements.json"), JSON.stringify(idReplacements, null, 2));
writeFileSync(join(__dirname, "../scratch/youtube-detailed-fixes.json"), JSON.stringify(detailedFixes, null, 2));

// Verify all replacement IDs are valid (videos.list - cheap quota)
const newIds = [...new Set(Object.values(idReplacements).map((u) => u.split("/").pop()))];
console.log(`\nVerifying ${newIds.length} replacement video IDs...`);

async function verifyIds(ids) {
  const valid = new Set();
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = `https://www.googleapis.com/youtube/v3/videos?part=status&id=${batch.join(",")}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      console.error("Verify error:", data.error.message);
      break;
    }
    for (const item of data.items || []) {
      valid.add(item.id);
    }
  }
  return valid;
}

const validIds = await verifyIds(newIds);
const invalidReplacements = Object.entries(idReplacements).filter(
  ([, url]) => !validIds.has(url.split("/").pop())
);
if (invalidReplacements.length) {
  console.log(`WARNING: ${invalidReplacements.length} replacements are still invalid!`);
  for (const [oldId, url] of invalidReplacements) {
    delete idReplacements[oldId];
  }
  writeFileSync(join(__dirname, "../scratch/youtube-id-replacements.json"), JSON.stringify(idReplacements, null, 2));
}

console.log(`\nFinal valid replacements: ${Object.keys(idReplacements).length}/${uniqueBroken.length}`);
