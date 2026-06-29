import { loadProblems } from "./lib/parse-striver-steps.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { problems } = loadProblems(join(__dirname, "../src/App.jsx"));

const withYt = problems.filter((p) => p.yt);
const withArticle = problems.filter((p) => p.article);
const both = problems.filter((p) => p.yt && p.article);
const articleOnly = problems.filter((p) => p.article && !p.yt);
const ytNoArticle = problems.filter((p) => p.yt && !p.article);
const leetcodeExtra = problems.filter((p) => p.practice?.includes("leetcode.com") && !p.article && !p.yt);

console.log("Total problem objects:", problems.length);
console.log("With yt:", withYt.length);
console.log("With article:", withArticle.length);
console.log("With both:", both.length);
console.log("Article only:", articleOnly.length);
console.log("Yt no article:", ytNoArticle.length);
console.log("LeetCode extras (no yt, no article):", leetcodeExtra.length);
