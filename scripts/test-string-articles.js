const urls = [
  "https://takeuforward.org/data-structure/remove-outermost-parentheses",
  "https://takeuforward.org/data-structure/remove-outermost-parentheses/",
  "https://takeuforward.org/data-structure/reverse-words-in-a-string/",
  "https://takeuforward.org/data-structure/longest-common-prefix/",
];
for (const url of urls) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await res.text();
  const notFound = /Article Not Found|article may have been moved or deleted/i.test(html);
  const yt = [...html.matchAll(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g)].map((m) => m[1]);
  console.log({ url, notFound, yt: [...new Set(yt)] });
}
