/**
 * Validates all YouTube links in App.jsx via YouTube Data API v3
 * Usage: node scripts/validate-youtube-links.js
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_PATH = join(__dirname, "../src/App.jsx");

// Load API key from .env
const envContent = readFileSync(join(__dirname, "../.env"), "utf8");
const keyMatch = envContent.match(/^YOUTUBE_API_KEY=(.+)$/m);
const API_KEY = keyMatch?.[1]?.trim();
if (!API_KEY) {
  console.error("YOUTUBE_API_KEY not found in .env");
  process.exit(1);
}

const appContent = readFileSync(APP_PATH, "utf8");

// Extract all yt URLs with surrounding title context
const ytRegex = /title:"([^"]+)"[^}]*?yt:"([^"]+)"/g;
const entries = [];
let m;
while ((m = ytRegex.exec(appContent)) !== null) {
  entries.push({ title: m[1], url: m[2] });
}

// Also extract unique video IDs
function extractVideoId(url) {
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (short) return short[1];
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watch) return watch[1];
  return null;
}

const uniqueIds = [...new Set(entries.map((e) => extractVideoId(e.url)).filter(Boolean))];
console.log(`Found ${entries.length} problem entries with yt links`);
console.log(`Unique video IDs: ${uniqueIds.length}\n`);

async function checkVideos(ids) {
  const results = {};
  // API allows up to 50 IDs per request
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = `https://www.googleapis.com/youtube/v3/videos?part=status,snippet&id=${batch.join(",")}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      console.error("API Error:", JSON.stringify(data.error, null, 2));
      process.exit(1);
    }
    const found = new Set((data.items || []).map((v) => v.id));
    for (const id of batch) {
      const item = (data.items || []).find((v) => v.id === id);
      results[id] = item
        ? {
            available: item.status?.embeddable !== false && item.status?.privacyStatus === "public",
            title: item.snippet?.title,
            channel: item.snippet?.channelTitle,
            privacy: item.status?.privacyStatus,
            embeddable: item.status?.embeddable,
          }
        : { available: false, title: null, reason: "NOT_FOUND" };
    }
  }
  return results;
}

async function searchVideo(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&channelId=UCMJUORDd2aN7K8eS8b0SlQ&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) return [];
  return (data.items || []).map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    url: `https://youtu.be/${item.id.videoId}`,
  }));
}

console.log("Checking YouTube API...");
const status = await checkVideos(uniqueIds);

const broken = [];
const working = [];
for (const [id, info] of Object.entries(status)) {
  if (!info.available) broken.push({ id, ...info });
  else working.push({ id, title: info.title });
}

console.log(`\n=== WORKING (${working.length}) ===`);
for (const w of working.slice(0, 5)) console.log(`  ✓ ${w.id}: ${w.title?.slice(0, 60)}`);
if (working.length > 5) console.log(`  ... and ${working.length - 5} more`);

console.log(`\n=== BROKEN / UNAVAILABLE (${broken.length}) ===`);
for (const b of broken) {
  const linked = entries.filter((e) => extractVideoId(e.url) === b.id);
  console.log(`\n  ✗ ${b.id} (${b.reason || b.privacy || "unavailable"})`);
  console.log(`    Linked problems: ${linked.map((l) => l.title).join(", ")}`);
}

// For broken videos, search for replacements
if (broken.length > 0) {
  console.log(`\n=== SEARCHING REPLACEMENTS ===`);
  for (const b of broken) {
    const linked = entries.filter((e) => extractVideoId(e.url) === b.id);
    const searchQuery = `takeuforward striver ${linked[0]?.title || ""}`;
    console.log(`\n  Searching: "${searchQuery}"`);
    const results = await searchVideo(searchQuery);
    for (const r of results) {
      console.log(`    → ${r.url} | ${r.title}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
}

// Write full report
const report = { working, broken, entries: entries.map((e) => ({ ...e, videoId: extractVideoId(e.url), status: status[extractVideoId(e.url)] })) };
import { writeFileSync } from "fs";
writeFileSync(join(__dirname, "../scratch/youtube-validation-report.json"), JSON.stringify(report, null, 2));
console.log("\nFull report saved to scratch/youtube-validation-report.json");
