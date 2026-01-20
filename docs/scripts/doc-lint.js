#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function findMarkdownFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...findMarkdownFiles(full));
    } else if (e.isFile() && full.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

function firstNonEmptyLine(lines) {
  for (const l of lines) {
    if (l.trim() !== "") return l.replace(/\r?\n$/, "");
  }
  return "";
}

function lintFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  const lines = raw.split(/\r?\n/);
  const first = firstNonEmptyLine(lines);
  const hasTitle = /^#\s+/.test(first);
  const hasLastUpdated = /Last Updated:/i.test(raw);
  const startsWithCodeFence = raw.trimStart().startsWith("```");
  const endsWithCodeFence = raw.trimEnd().endsWith("```");

  const issues = [];
  if (!hasTitle) issues.push("MISSING_TITLE");
  if (!hasLastUpdated) issues.push("MISSING_LAST_UPDATED");
  if (startsWithCodeFence || endsWithCodeFence) issues.push("POTENTIAL_CODE_FENCE_WRAPPER");

  return { file, issues, firstLine: first };
}

function main() {
  const root = path.join(__dirname, "..");
  const docsDir = path.join(root, ".."); // project/docs/
  const scanDir = path.join(process.cwd(), "docs");
  if (!fs.existsSync(scanDir)) {
    console.error("No docs/ directory found at", scanDir);
    process.exit(2);
  }

  const files = findMarkdownFiles(scanDir);
  const results = files.map(lintFile);
  let totalIssues = 0;

  console.log("\nDoc linter results:");
  for (const r of results) {
    if (r.issues.length === 0) {
      console.log(`  OK: ${path.relative(process.cwd(), r.file)}`);
    } else {
      totalIssues += r.issues.length;
      console.log(
        `  ISSUE: ${path.relative(process.cwd(), r.file)} -> ${r.issues.join(", ")} -- first: "${
          r.firstLine
        }"`
      );
    }
  }

  console.log("\nSummary:");
  console.log(`  Files scanned: ${results.length}`);
  console.log(`  Total issues found: ${totalIssues}`);

  if (totalIssues > 0) process.exit(1);
  process.exit(0);
}

main();
