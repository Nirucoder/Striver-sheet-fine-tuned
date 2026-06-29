import { readFileSync } from "fs";

const html = readFileSync("scratch/tuf-sheet-page.html", "utf8");

// Test patterns
const patterns = [
  /"problem_name":"((?:\\.|[^"\\])*)"[^}]*?"youtube":"((?:\\.|[^"\\])*)"/g,
  /\\"problem_name\\":\\"((?:\\\\.|[^"\\])*)\\"[^}]*?\\"youtube\\":\\"((?:\\\\.|[^"\\])*)\\"/g,
  /problem_name\\":\\"([^\\]+)\\"[^}]*?youtube\\":\\"([^\\]+)\\"/g,
];

for (let i = 0; i < patterns.length; i++) {
  const re = patterns[i];
  const matches = [...html.matchAll(re)].slice(0, 5);
  console.log(`Pattern ${i}: ${matches.length} (first 5)`);
  for (const m of matches) console.log(" ", m[1], "->", m[2]);
}

// Manual sample
const idx = html.indexOf("Two Sum");
console.log("\nRaw context:", html.slice(idx - 50, idx + 200));
