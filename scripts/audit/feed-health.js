#!/usr/bin/env node

/**
 * Feed Health Audit
 *
 * Probes every RSS source declared in src/data/feedConfig.ts against the live web, using the
 * same headers the app's feed transport sends, so results match what readers actually get.
 *
 * A source is unhealthy when it 404s, is bot-blocked, serves HTML instead of a feed, or
 * returns a valid feed with zero items — the last mode is the one that used to fail silently.
 *
 * Exits non-zero only when a DEFAULT-ENABLED source is unhealthy. Disabled sources are probed
 * and reported anyway, since a "pending-replacement" source coming back to life is worth knowing.
 *
 * Run: npm run audit:feeds
 */

const fs = require("fs");
const path = require("path");

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

// Mirrors src/services/feed/transport.ts — publishers behave differently per user agent, so a
// probe that sends node's default UA would report failures the app never sees, and vice versa.
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};
const TIMEOUT_MS = 15000;

/** Parses the source list out of the TS config by structure rather than importing it, so the
 * script stays dependency-free (no ts-node) and runnable in CI or on a bare checkout. */
function parseFeedConfig() {
  const file = path.join(__dirname, "..", "..", "src", "data", "feedConfig.ts");
  const source = fs.readFileSync(file, "utf8");
  const body = source.slice(source.indexOf("export const RSS_FEEDS"));

  const sources = [];
  const categoryPattern = /^\s{2}(\w+):\s*\[$/gm;
  const categories = [...body.matchAll(categoryPattern)].map((match) => ({
    name: match[1],
    start: match.index + match[0].length,
  }));

  categories.forEach((category, index) => {
    const end = index + 1 < categories.length ? categories[index + 1].start : body.length;
    const block = body.slice(category.start, end);
    const entryPattern = /\{([^{}]*)\}/g;
    let entry;
    while ((entry = entryPattern.exec(block)) !== null) {
      const chunk = entry[1];
      const name = /name:\s*"([^"]+)"/.exec(chunk);
      const url = /url:\s*"([^"]+)"/.exec(chunk);
      if (!name || !url) continue;
      sources.push({
        category: category.name,
        name: name[1],
        url: url[1],
        enabled: !/defaultEnabled:\s*false/.test(chunk),
      });
    }
  });

  return sources;
}

async function probe(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(source.url, {
      headers: HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") || "";
    const body = await response.text();
    const items = (body.match(/<item\b|<entry\b/g) || []).length;

    if (!response.ok) return { ...source, ok: false, items, reason: `HTTP ${response.status}` };
    if (/text\/html/.test(contentType) || /^\s*<!DOCTYPE html/i.test(body)) {
      return { ...source, ok: false, items, reason: `HTTP 200 serving HTML (${contentType})` };
    }
    if (items === 0) return { ...source, ok: false, items, reason: "valid feed, zero items" };
    return { ...source, ok: true, items, reason: `${items} items` };
  } catch (error) {
    const reason = error.name === "AbortError" ? `timed out after ${TIMEOUT_MS}ms` : error.message;
    return { ...source, ok: false, items: 0, reason };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const sources = parseFeedConfig();
  process.stdout.write(`Probing ${sources.length} feeds from src/data/feedConfig.ts\n\n`);

  const results = [];
  for (const source of sources) {
    // Sequential on purpose: a burst of parallel requests to the same publishers is exactly
    // what gets an app's user agent rate-limited or blocked.
    results.push(await probe(source));
  }

  let currentCategory = null;
  for (const result of results) {
    if (result.category !== currentCategory) {
      currentCategory = result.category;
      process.stdout.write(`${currentCategory}\n`);
    }
    const mark = result.ok ? `${GREEN}ok  ${RESET}` : result.enabled ? `${RED}FAIL${RESET}` : `${YELLOW}off ${RESET}`;
    const label = result.enabled ? result.name : `${result.name} ${DIM}(disabled)${RESET}`;
    process.stdout.write(`  ${mark} ${label.padEnd(40)} ${result.reason}\n`);
  }

  const brokenEnabled = results.filter((result) => !result.ok && result.enabled);
  const revivedDisabled = results.filter((result) => result.ok && !result.enabled);

  process.stdout.write("\n");
  if (revivedDisabled.length > 0) {
    process.stdout.write(
      `${YELLOW}${revivedDisabled.length} disabled source(s) are healthy again — consider re-enabling: ${revivedDisabled
        .map((result) => result.name)
        .join(", ")}${RESET}\n`,
    );
  }

  if (brokenEnabled.length > 0) {
    process.stdout.write(
      `${RED}❌ ${brokenEnabled.length} enabled source(s) unhealthy: ${brokenEnabled
        .map((result) => `${result.name} (${result.reason})`)
        .join(", ")}${RESET}\n`,
    );
    process.exit(1);
  }

  process.stdout.write(`${GREEN}✅ All ${results.filter((r) => r.enabled).length} enabled sources healthy${RESET}\n`);
}

main().catch((error) => {
  process.stdout.write(`${RED}Feed health audit crashed: ${error.message}${RESET}\n`);
  process.exit(1);
});
