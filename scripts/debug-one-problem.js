import { readFileSync } from "fs";
const html = readFileSync("scratch/tuf-sheet-page.html", "utf8");
const idx = html.indexOf("Understand recursion");
console.log(html.slice(idx, idx + 350));
