import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cache = JSON.parse(readFileSync(join(__dirname, "../scratch/tuf-article-cache.json"), "utf8"));

let notFound = 0, withVideo = 0, validNoVideo = 0;
for (const [url, info] of Object.entries(cache)) {
  if (info.notFound) notFound++;
  else if (info.videoId) withVideo++;
  else validNoVideo++;
}
console.log({ total: Object.keys(cache).length, notFound, withVideo, validNoVideo });

// Sample valid without video
const samples = Object.entries(cache).filter(([, i]) => !i.notFound && !i.videoId).slice(0, 5);
console.log("\nValid without video:");
for (const [url] of samples) console.log(" ", url);
