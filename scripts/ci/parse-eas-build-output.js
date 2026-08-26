#!/usr/bin/env node

/**
 * Parses the JSON output of `eas build --json` into GitHub Actions step
 * outputs (build_id, build_url, archive_url).
 *
 * Previously this was inlined via a `node <<'EOF' ... EOF` heredoc directly
 * inside release-ios.yml's `run: |` block. That's fragile by construction:
 * a bash heredoc terminator (`<<'EOF'`, no dash) must sit at column 0 with
 * no leading whitespace, while a YAML block scalar requires every line to
 * be indented at least as much as its first line - those two constraints
 * are incompatible the moment the embedded script needs multiple lines,
 * and it broke the whole workflow file's YAML parsing silently (every
 * trigger failed with a generic "workflow file issue", including the
 * `release: published` trigger this workflow exists for). A real file
 * sidesteps the conflict entirely.
 *
 * Usage: node scripts/ci/parse-eas-build-output.js <path-to-eas-build.json>
 * Prints GITHUB_OUTPUT-formatted lines to stdout.
 */

const fs = require('fs');

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Usage: parse-eas-build-output.js <path-to-eas-build.json>');
  process.exit(1);
}

const raw = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);
const build = Array.isArray(data) ? data[0] : data;
const buildId = build?.id || '';
const buildUrl = build?.artifacts?.buildUrl || '';
const archiveUrl = build?.artifacts?.applicationArchiveUrl || '';

if (!buildId) {
  console.error('Missing build id in EAS JSON output.');
  process.exit(1);
}

process.stdout.write(`build_id=${buildId}\n`);

if (buildUrl) {
  process.stdout.write(`build_url=${buildUrl}\n`);
}

if (archiveUrl) {
  process.stdout.write(`archive_url=${archiveUrl}\n`);
}
