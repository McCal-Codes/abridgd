#!/usr/bin/env node
/**
 * Quick secret/prompt leak scan.
 * Uses tracked git files to avoid node_modules/ios/android noise.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');

const allowList = new Set([
  '.env.example',
  'config.toml',
]);

const ignoreDirs = ['node_modules/', 'ios/Pods/', 'android/', 'build/', 'dist/', '.expo/'];

const patterns = [
  { name: 'OpenAI key', regex: /sk-[A-Za-z0-9]{32,}/g },
  { name: 'PPLX key', regex: /pplx-[A-Za-z0-9]{30,}/gi },
  { name: 'Google API key', regex: /AIza[0-9A-Za-z_-]{35}/g },
  { name: 'AWS secret key', regex: /aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}/i },
  { name: 'Private key block', regex: /-----BEGIN (?:RSA |DSA |EC )?PRIVATE KEY-----/g },
  { name: 'Sentry DSN', regex: /https?:\/\/[a-z0-9]+@o\d+\.ingest\.sentry\.io\/\d+/i },
  { name: 'Slack token', regex: /xox[baprs]-[A-Za-z0-9-]{10,}/g },
];

function getTrackedFiles() {
  const raw = execSync('git ls-files -z', { cwd: repoRoot });
  return raw
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .filter((file) => !ignoreDirs.some((dir) => file.startsWith(dir)));
}

function scanFile(file) {
  if (allowList.has(file)) return [];
  const fullPath = path.join(repoRoot, file);
  const stat = fs.statSync(fullPath);
  if (stat.size > 512 * 1024) return []; // skip >512KB to stay fast

  const content = fs.readFileSync(fullPath, 'utf8');
  const matches = [];

  for (const { name, regex } of patterns) {
    regex.lastIndex = 0;
    if (regex.test(content)) {
      matches.push(name);
    }
  }
  return matches.length ? [{ file, matches }] : [];
}

function main() {
  const files = getTrackedFiles();
  const findings = files.flatMap(scanFile);

  if (findings.length === 0) {
    console.log('[OK] No obvious secrets or AI prompt leaks found.');
    return;
  }

  console.error('[WARN] Potential leaks detected:');
  for (const { file, matches } of findings) {
    console.error(` - ${file}: ${matches.join(', ')}`);
  }
  console.error('\nReview and remove/redact before committing.');
  process.exitCode = 1;
}

main();
