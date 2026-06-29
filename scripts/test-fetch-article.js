const urls = [
  "https://takeuforward.org/maths/count-digits-in-a-number/",
  "https://takeuforward.org/maths/reverse-a-number/",
  "https://takeuforward.org/data-structure/kadanes-algorithm-maximum-subarray-sum-in-an-array/",
];

for (const url of urls) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await res.text();
  const notFound = /Article Not Found|article may have been moved or deleted/i.test(html);
  const videoJson = html.match(/"video":"([a-zA-Z0-9_-]{11})"/)?.[1]
    || html.match(/\\"video\\":\\"([a-zA-Z0-9_-]{11})\\"/)?.[1];
  const ytUrls = [...html.matchAll(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g)].map((m) => m[1]);
  console.log({ url, notFound, videoJson, ytUrls: [...new Set(ytUrls)], len: html.length });
}
