#!/usr/bin/env node

/**
 * Events Health Audit
 *
 * Probes every source declared in src/features/events/eventSources.ts against the live web, with
 * the same URLs and headers the app uses (see eventsRepository.ts), for the app's 14-day window.
 *
 * A source is unhealthy when it errors, is bot-blocked, answers with something that is not the
 * expected JSON, or has an event with a start time that cannot be read. An empty window is
 * reported but is not a failure: a small organizer can genuinely have nothing on.
 *
 * Exits non-zero only when a default-enabled "healthy" source fails. Not part of PR CI, since it
 * depends on third-party sites being up (same policy as audit:feeds, see ADR-0005).
 *
 * Run: npm run audit:events
 */

const fs = require("fs");
const path = require("path");

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  // Same as the app (eventsRepository.ts): Legistar answers XML to the feed transport's default
  // Accept header, so event requests ask for JSON explicitly.
  Accept: "application/json",
};
const TIMEOUT_MS = 15000;
const WINDOW_DAYS = 14;

/** Reads id/kind/baseUrl/health out of the TS file by structure, so no ts-node is needed. */
function parseSources() {
  const file = path.join(__dirname, "..", "..", "src", "features", "events", "eventSources.ts");
  const text = fs.readFileSync(file, "utf8");
  const sources = [];
  const block = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*kind:\s*"([^"]+)",\s*baseUrl:\s*"([^"]+)"([\s\S]*?)\n  \},/g;
  let match;
  while ((match = block.exec(text))) {
    const rest = match[5];
    sources.push({
      id: match[1],
      name: match[2],
      kind: match[3],
      baseUrl: match[4],
      enabled: !/defaultEnabled:\s*false/.test(rest),
      health: (/health:\s*"([^"]+)"/.exec(rest) || [])[1] || "healthy",
    });
  }
  return sources;
}

const ymd = (date) => date.toISOString().slice(0, 10);
const addDays = (date, days) => new Date(date.getTime() + days * 86400000);

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers: HEADERS, signal: controller.signal, redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (/sgcaptcha/i.test(text)) {
      // SiteGround's anti-bot page. It answers some clients and not others, depending on the
      // client and how many requests the address has made, so it is a warning, not a failure.
      const error = new Error("bot challenge (SiteGround captcha); the app may be served normally");
      error.soft = true;
      throw error;
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`not JSON (starts "${text.slice(0, 30).replace(/\s+/g, " ")}")`);
    }
  } finally {
    clearTimeout(timer);
  }
}

async function probe(source) {
  const today = new Date();
  const start = ymd(addDays(today, -1));
  const end = ymd(addDays(today, WINDOW_DAYS + 1));

  if (source.kind === "legistar") {
    const filter = `EventDate ge datetime'${start}' and EventDate lt datetime'${end}'`;
    const json = await fetchJson(`${source.baseUrl}/Events?$filter=${encodeURIComponent(filter)}`);
    if (!Array.isArray(json)) throw new Error("expected a JSON array");
    const unreadable = json.filter((e) => !/^\d{1,2}:\d{2}\s*[AP]M$/i.test(e.EventTime || "")).length;
    return { count: json.length, unreadable, total: json.length };
  }

  const json = await fetchJson(
    `${source.baseUrl}/wp-json/tribe/events/v1/events?per_page=50&start_date=${start}&end_date=${end}`,
  );
  if (!json || !Array.isArray(json.events)) throw new Error("no events array in response");
  const unreadable = json.events.filter((e) => !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(e.start_date || "")).length;
  return { count: json.events.length, unreadable, total: json.total ?? json.events.length };
}

async function main() {
  const sources = parseSources();
  if (sources.length === 0) {
    console.error(`${RED}Could not parse any sources from eventSources.ts${RESET}`);
    process.exit(2);
  }

  let failedRequired = 0;
  console.log(`Probing ${sources.length} event sources for the next ${WINDOW_DAYS} days\n`);

  for (const source of sources) {
    const required = source.enabled && source.health === "healthy";
    try {
      const result = await probe(source);
      const problems = result.unreadable > 0 ? ` ${YELLOW}${result.unreadable} with an unreadable start time${RESET}` : "";
      const empty = result.count === 0 ? ` ${YELLOW}(empty window)${RESET}` : "";
      console.log(`${GREEN}ok${RESET}   ${source.name} ${DIM}${source.kind}${RESET} ${result.count} events (of ${result.total})${empty}${problems}`);
      if (result.unreadable > 0 && required) failedRequired++;
    } catch (error) {
      const hard = required && !error.soft;
      console.log(`${hard ? RED : YELLOW}${hard ? "fail" : "warn"}${RESET} ${source.name} ${DIM}${source.kind}${RESET} ${error.message}`);
      if (hard) failedRequired++;
    }
  }

  console.log("");
  if (failedRequired > 0) {
    console.log(`${RED}${failedRequired} required source(s) failed.${RESET} Update eventSources.ts (health + dated healthNote).`);
    process.exit(1);
  }
  console.log(`${GREEN}All required sources healthy.${RESET}`);
}

main();
