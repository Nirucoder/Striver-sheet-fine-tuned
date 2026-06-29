import { readFileSync, writeFileSync } from "fs";

const html = readFileSync("scratch/tuf-sheet-page.html", "utf8");

function contextAround(needle, radius = 200) {
  const idx = html.indexOf(needle);
  if (idx < 0) return null;
  return html.slice(Math.max(0, idx - radius), idx + radius);
}

const samples = [
  "Two Sum",
  "Remove Outermost Parentheses",
  "Reverse a Number",
  "Roman to Integer",
  "Longest Common Prefix",
  "Kadane",
];

for (const s of samples) {
  console.log("\n===", s, "===");
  console.log(contextAround(s)?.slice(0, 400));
}

// Try to find pattern: title near video id
const chunks = html.split("self.__next_f.push");
console.log("\nRSC chunks:", chunks.length);

// Look for video field patterns near problem names
const titleVideoPairs = [];
const re = /"title":"([^"\\]+(?:\\.[^"\\]*)*)"[^}]{0,500}?"video":"([a-zA-Z0-9_-]{11})"/g;
let m;
while ((m = re.exec(html)) !== null) {
  titleVideoPairs.push({ title: m[1].replace(/\\"/g, '"'), video: m[2] });
}
console.log("\nTitle-video pairs (pattern 1):", titleVideoPairs.length);
console.log(titleVideoPairs.slice(0, 10));

const re2 = /"problem_name":"([^"]+)"[^}]{0,300}?"video":"([a-zA-Z0-9_-]{11})"/g;
const pairs2 = [];
while ((m = re2.exec(html)) !== null) pairs2.push({ title: m[1], video: m[2] });
console.log("\nPattern 2:", pairs2.length, pairs2.slice(0, 5));

writeFileSync("scratch/tuf-sheet-pairs-debug.json", JSON.stringify({ titleVideoPairs: titleVideoPairs.slice(0, 50), pairs2 }, null, 2));
