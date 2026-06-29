import { writeFileSync } from "fs";

const url = "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z";
const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
const html = await res.text();
writeFileSync("scratch/tuf-sheet-page.html", html);
const apiUrls = [...html.matchAll(/https:\/\/[^\"'\s]+(?:api|sheet|a2z|problems)[^\"'\s]*/gi)].map((m) => m[0]);
console.log("api-like urls:", [...new Set(apiUrls)].slice(0, 30));
const videoInPage = [...html.matchAll(/youtu\.be\/([a-zA-Z0-9_-]{11})/g)].map((m) => m[1]);
console.log("videos in page:", [...new Set(videoInPage)]);
