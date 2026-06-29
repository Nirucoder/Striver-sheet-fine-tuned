const url = "https://takeuforward.org/data-structure/kadanes-algorithm-maximum-subarray-sum-in-an-array/";
const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
const html = await res.text();
const idx = html.indexOf("AHZpyENo7k");
console.log("idx", idx);
if (idx >= 0) console.log(html.slice(idx - 60, idx + 60));
const all = [...html.matchAll(/[a-zA-Z0-9_-]{11}/g)].filter((m) => m[0].includes("AHZ") || m[0].includes("kadane"));
console.log("matches", all.slice(0, 5).map((m) => m[0]));
