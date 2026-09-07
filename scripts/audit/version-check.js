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
const appBuildMatch = appInfoSource.match(/APP_BUILD\s*=\s*"([^"]+)"/);

const versions = {
  'package.json': packageJson.version,
  'app.json (expo.version)': appJson.expo && appJson.expo.version,
  'src/config/appInfo.ts (APP_VERSION)': appInfoMatch && appInfoMatch[1],
};

/**
 * Build numbers matter as much as versions: both stores permanently reject a
 * resubmitted one, and APP_BUILD is user-visible in the bug report template,
 * so a stale value sends misleading reports. These had drifted to 36 / 1 / 1
 * before anything checked them.
 */
const builds = {
  'app.json (ios.buildNumber)': appJson.expo && appJson.expo.ios && appJson.expo.ios.buildNumber,
  'app.json (android.versionCode)':
    appJson.expo && appJson.expo.android && appJson.expo.android.versionCode,
  'src/config/appInfo.ts (APP_BUILD)': appBuildMatch && appBuildMatch[1],
};

process.stdout.write('\n📋 Version Consistency Check\n' + '='.repeat(50) + '\n\n');

const report = (title, entries) => {
  process.stdout.write(`  ${title}\n`);
  Object.entries(entries).forEach(([label, value]) => {
    process.stdout.write(`    ${label.padEnd(38)} ${value === undefined || value === null ? '(missing)' : value}\n`);
  });
  process.stdout.write('\n');
};

report('Version', versions);
report('Build number', builds);

const versionValues = Object.values(versions);
const versionsAgree =
  versionValues.every(Boolean) && new Set(versionValues).size === 1;

// Compared as strings so "36" and 36 agree - app.json stores versionCode as a
// number and buildNumber as a string.
const buildValues = Object.values(builds).map((v) =>
  v === undefined || v === null ? null : String(v),
);
const buildsPresent = buildValues.every((v) => v !== null && v !== '');
const buildsAgree = buildsPresent && new Set(buildValues).size === 1;
const buildsAreIntegers = buildValues.every((v) => v !== null && /^\d+$/.test(v));

const failures = [];
if (!versionsAgree) failures.push('Version strings do not match across all three files.');
if (!buildsPresent) failures.push('A build number is missing.');
else if (!buildsAreIntegers) failures.push('Build numbers must be whole numbers.');
else if (!buildsAgree) failures.push('Build numbers do not match across all three locations.');

if (failures.length === 0) {
  process.stdout.write(
    `${GREEN}✓ Version ${versionValues[0]} (build ${buildValues[0]}) is consistent everywhere.${RESET}\n\n`,
  );
  process.exit(0);
}

process.stdout.write(`${RED}✗ ${failures.join('\n✗ ')}${RESET}\n\n`);
process.stdout.write(
  '  Fix with: npm run version:bump build   (or major|minor|patch)\n' +
    '  See docs/process/release-process.md for the release checklist.\n\n',
);
process.exit(1);
