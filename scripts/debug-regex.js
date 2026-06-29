import { readFileSync } from "fs";
const html = readFileSync("scratch/tuf-sheet-page.html", "utf8");
const idx = html.indexOf("Understand recursion");
const snippet = html.slice(idx - 30, idx + 120);
console.log(JSON.stringify(snippet));

// try looser regex
const re = /problem_name\\":\\"Understand recursion[^"]*\\",\\"article\\":\\"([^"]*)\\",\\"youtube\\":\\"([^"]*)\\"/;
console.log("Loose match:", html.match(re));
