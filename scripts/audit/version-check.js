#!/usr/bin/env node

/**
 * Version Consistency Check
 *
 * Verifies package.json, app.json (expo.version), and
 * src/config/appInfo.ts (APP_VERSION) all agree. These three files have
 * drifted before (see git history: "fix: align version strings across
 * app.json, package.json, and appInfo.ts") because nothing enforced them
 * staying in sync. This script is that enforcement.
 *
 * Run: node scripts/audit/version-check.js
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

const projectRoot = path.resolve(__dirname, '../../');

const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
const appJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'app.json'), 'utf-8'));
const appInfoSource = fs.readFileSync(
  path.join(projectRoot, 'src/config/appInfo.ts'),
  'utf-8',
);

const appInfoMatch = appInfoSource.match(/APP_VERSION\s*=\s*"([^"]+)"/);

const versions = {
  'package.json': packageJson.version,
  'app.json (expo.version)': appJson.expo && appJson.expo.version,
  'src/config/appInfo.ts (APP_VERSION)': appInfoMatch && appInfoMatch[1],
};

process.stdout.write('\n📋 Version Consistency Check\n' + '='.repeat(50) + '\n\n');

const values = Object.values(versions);
const allPresent = values.every(Boolean);
const allMatch = allPresent && new Set(values).size === 1;

Object.entries(versions).forEach(([label, value]) => {
  process.stdout.write(`  ${label.padEnd(38)} ${value || '(missing)'}\n`);
});

process.stdout.write('\n');

if (allMatch) {
  process.stdout.write(`${GREEN}✓ All three sources agree: ${values[0]}${RESET}\n\n`);
  process.exit(0);
}

process.stdout.write(
  `${RED}✗ Version mismatch.${RESET} These three files must always match.\n` +
    `  See docs/process/release-process.md for the release checklist.\n\n`,
);
process.exit(1);
