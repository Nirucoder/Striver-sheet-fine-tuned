/**
 * Fetch A2Z DSA playlist and match broken video IDs to correct ones
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(join(__dirname, "../.env"), "utf8");
const API_KEY = envContent.match(/^YOUTUBE_API_KEY=(.+)$/m)?.[1]?.trim();

const PLAYLIST_ID = "PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz";

async function ytFetch(path) {
  const url = `https://www.googleapis.com/youtube/v3/${path}${path.includes("?") ? "&" : "?"}key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) {
    console.error("API Error:", data.error.message);
    throw new Error(data.error.message);
  }
  return data;
}

console.log(`Fetching playlist ${PLAYLIST_ID}...`);
const playlistVideos = [];
let pageToken = "";
do {
  const data = await ytFetch(
    `playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ""}`
  );
  for (const item of data.items || []) {
    if (item.snippet.resourceId?.videoId) {
      playlistVideos.push({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        url: `https://youtu.be/${item.snippet.resourceId.videoId}`,
      });
    }
  }
  pageToken = data.nextPageToken || "";
  process.stdout.write(`\r  Fetched ${playlistVideos.length} videos...`);
} while (pageToken);
console.log(`\nTotal: ${playlistVideos.length} videos`);

writeFileSync(join(__dirname, "../scratch/a2z-playlist.json"), JSON.stringify(playlistVideos, null, 2));

// Load validation report
const report = JSON.parse(readFileSync(join(__dirname, "../scratch/youtube-validation-report.json"), "utf8"));
const brokenIds = new Set(report.broken.map((b) => b.id));

// Build ID replacement map by searching playlist for each broken entry
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

// For each broken video ID, find best playlist match for each linked problem
const idReplacements = {}; // oldId -> newUrl (best match across all linked problems)
const detailedFixes = [];

const brokenEntries = report.entries.filter((e) => brokenIds.has(e.videoId));
const uniqueBroken = [...new Set(brokenEntries.map((e) => e.videoId))];

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

  if (bestOverall && bestOverallScore >= 0.3) {
    idReplacements[oldId] = bestOverall.url;
    detailedFixes.push({
      oldId,
      oldUrl: `https://youtu.be/${oldId}`,
      newUrl: bestOverall.url,
      newTitle: bestOverall.title,
      matchedProblem: bestOverall.matchedProblem,
      score: bestOverallScore,
      linkedProblems: linked.map((l) => l.title),
    });
  } else {
    // Try YouTube search as fallback
    const searchQuery = `striver ${linked[0]?.title}`;
    const searchData = await ytFetch(
      `search?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&maxResults=5`
    );
    const results = (searchData.items || []).map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      url: `https://youtu.be/${item.id.videoId}`,
    }));

    // Verify search result exists
    if (results.length > 0) {
      const verify = await ytFetch(`videos?part=status&id=${results[0].id}`);
      if (verify.items?.[0]) {
        idReplacements[oldId] = results[0].url;
        detailedFixes.push({
          oldId,
          oldUrl: `https://youtu.be/${oldId}`,
          newUrl: results[0].url,
          newTitle: results[0].title,
          matchedProblem: linked[0]?.title,
          score: "search",
          linkedProblems: linked.map((l) => l.title),
        });
      }
    }
    await new Promise((r) => setTimeout(r, 100));
  }
}

console.log(`\nFound replacements for ${Object.keys(idReplacements).length}/${uniqueBroken.length} broken IDs`);

const unmatched = uniqueBroken.filter((id) => !idReplacements[id]);
if (unmatched.length) {
  console.log(`\nStill unmatched (${unmatched.length}):`);
  for (const id of unmatched) {
    const linked = brokenEntries.filter((e) => e.videoId === id);
    console.log(`  ${id}: ${linked.map((l) => l.title).join(", ")}`);
  }
}

writeFileSync(join(__dirname, "../scratch/youtube-id-replacements.json"), JSON.stringify(idReplacements, null, 2));
writeFileSync(join(__dirname, "../scratch/youtube-detailed-fixes.json"), JSON.stringify(detailedFixes, null, 2));

console.log("\nSample fixes:");
for (const fix of detailedFixes.slice(0, 15)) {
  console.log(`  ${fix.oldId} → ${fix.newUrl.split("/").pop()}`);
  console.log(`    "${fix.newTitle?.slice(0, 70)}"`);
}
