/**
 * Apply YouTube ID replacements to App.jsx
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_PATH = join(__dirname, "../src/App.jsx");

const replacements = JSON.parse(
  readFileSync(join(__dirname, "../scratch/youtube-id-replacements.json"), "utf8")
);

// Manual fixes for the 2 unmatched (no A2Z playlist match)
replacements["tnSi6synbgM"] = "https://youtu.be/b7AYbpM5YrE"; // Power Set | Bit Masking
replacements["amnrMX4NyiE"] = "https://youtu.be/HqPJF2L5h9U"; // Introduction to Heap (greedy+heap problem)

let content = readFileSync(APP_PATH, "utf8");
let count = 0;

for (const [oldId, newUrl] of Object.entries(replacements)) {
  const oldPatterns = [
    `https://youtu.be/${oldId}`,
    `https://www.youtube.com/watch?v=${oldId}`,
  ];
  for (const oldUrl of oldPatterns) {
    const occurrences = content.split(oldUrl).length - 1;
    if (occurrences > 0) {
      content = content.split(oldUrl).join(newUrl);
      count += occurrences;
      console.log(`  ${oldId} → ${newUrl.split("/").pop()} (${occurrences}x)`);
    }
  }
}

writeFileSync(APP_PATH, content);
console.log(`\nTotal replacements: ${count}`);
