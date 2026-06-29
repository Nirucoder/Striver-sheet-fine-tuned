import { readFileSync } from "fs";
const html = readFileSync("scratch/tuf-sheet-page.html", "utf8");
const patterns = [
  /problem_name\\":\\"([^\\]+)\\",\\"article\\":\\"([^\\]+)\\",\\"youtube\\":\\"([^\\]+)\\"/,
  /problem_name\\":\\"Understand recursion[^"]*\\",\\"article\\":\\"([^"]*)\\",\\"youtube\\":\\"([^"]*)\\"/,
  /"problem_name":"Understand recursion[^"]*","article":"([^"]*)","youtube":"([^"]*)"/,
];
for (let i = 0; i < patterns.length; i++) {
  console.log(`Pattern ${i}:`, html.match(patterns[i])?.slice(1, 4));
}
