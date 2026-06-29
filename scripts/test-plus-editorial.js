const slug = process.argv[2] || "remove-outermost-parentheses";
const url = `https://takeuforward.org/plus/dsa/problems/${slug}?tab=editorial`;
const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
const html = await res.text();
const notFound = /Article Not Found|not found/i.test(html);
const videoJson = html.match(/"video":"([a-zA-Z0-9_-]{11})"/)?.[1]
  || html.match(/\\"video\\":\\"([a-zA-Z0-9_-]{11})\\"/)?.[1];
const ytUrls = [...html.matchAll(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g)].map((m) => m[1]);
console.log({ url, notFound, videoJson, ytUrls: [...new Set(ytUrls)], len: html.length });
