const url = process.argv[2];
const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
const html = await res.text();
const allVideos = [...html.matchAll(/"video":"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1]);
const allYt = [...html.matchAll(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g)].map((m) => m[1]);
console.log("url:", url);
console.log("video fields:", [...new Set(allVideos)]);
console.log("yt urls:", [...new Set(allYt)]);
