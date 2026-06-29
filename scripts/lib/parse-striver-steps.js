/**
 * Parse STRIVER_STEPS problem objects from App.jsx
 */
import { readFileSync } from "fs";

export function extractStriverBlock(content) {
  const start = content.indexOf("const STRIVER_STEPS = [");
  const end = content.indexOf("const DSA_TABLE");
  if (start === -1 || end === -1) throw new Error("STRIVER_STEPS block not found");
  return content.slice(start, end);
}

export function parseProblems(block) {
  const problems = [];
  const re = /\{ title:"([^"]+)"([^}]*)\}/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    const title = m[1];
    const rest = m[2];
    const yt = rest.match(/yt:"([^"]+)"/)?.[1];
    const article = rest.match(/article:"([^"]+)"/)?.[1];
    const practice = rest.match(/practice:"([^"]+)"/)?.[1];
    const difficulty = rest.match(/difficulty:"([^"]+)"/)?.[1];
    problems.push({ title, yt, article, practice, difficulty, index: m.index, raw: m[0] });
  }
  return problems;
}

export function isExtraLeetcodeProblem(p) {
  const practiceIsLeetcode = p.practice?.includes("leetcode.com");
  return practiceIsLeetcode && !p.article && !p.yt;
}

export function isOfficialSheetProblem(p) {
  if (p.article?.includes("takeuforward.org")) return true;
  if (p.yt && !isExtraLeetcodeProblem(p)) {
    // Has yt but no article — official lecture-style (basics, patterns, etc.)
    const practiceIsPlus = !p.practice || p.practice.includes("takeuforward.org");
    return practiceIsPlus || !!p.yt;
  }
  return false;
}

export function loadProblems(appPath) {
  const content = readFileSync(appPath, "utf8");
  const block = extractStriverBlock(content);
  return { content, block, problems: parseProblems(block) };
}
