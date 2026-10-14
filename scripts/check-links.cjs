"use strict";

// Checks every "Related links" URL in scripts/app.js and reports any that no
// longer open. Run before each release:
//   node --use-system-ca scripts/check-links.cjs
// (--use-system-ca trusts the same certificates as the browser; without it,
// sites such as health.go.ke can fail in Node although they open in Chrome.)

const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
const urls = [...new Set([...source.matchAll(/url: "(https?:\/\/[^"]+)"/g)].map((match) => match[1]))];
const browserHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
};

async function check(url) {
  try {
    const response = await fetch(url, { headers: browserHeaders, redirect: "follow", signal: AbortSignal.timeout(30000) });
    const notFoundPage = /\/404\b|\/home\/404/.test(response.url);
    return { url, ok: response.ok && !notFoundPage, status: response.status, final: response.url };
  } catch (error) {
    return { url, ok: false, status: error.name === "TimeoutError" ? "timeout" : error.message };
  }
}

(async () => {
  const results = await Promise.all(urls.map(check));
  let failures = 0;
  for (const result of results) {
    if (!result.ok) failures += 1;
    const moved = result.final && result.final !== result.url ? ` -> ${result.final}` : "";
    console.log(`${result.ok ? "OK  " : "FAIL"}  ${result.status}  ${result.url}${moved}`);
  }
  console.log(`\n${urls.length - failures} of ${urls.length} links open.`);
  process.exitCode = failures ? 1 : 0;
})();
