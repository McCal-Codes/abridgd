#!/usr/bin/env node

/**
 * Publishes an over-the-air update, with source maps uploaded to Sentry first.
 *
 * `eas update` on its own would publish a bundle Sentry cannot symbolicate.
 * Each update ships a *different* JS bundle from the binary hosting it, so
 * without per-update source maps every OTA crash arrives as minified frames -
 * and OTA code is by definition the newest and least proven code running.
 * See ADR-0006.
 *
 * Order matters: export with source maps, upload them, then publish. Doing it
 * the other way round leaves a window where users can be running code that
 * cannot be debugged.
 *
 * Usage:
 *   node scripts/build/publish-update.js <branch> -m "message" [...eas flags]
 *
 * Refuses to publish to production without Sentry configured. Pass
 * --allow-unsymbolicated to override deliberately (for example, before Sentry
 * credentials exist).
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const EXPORT_DIR = path.join(ROOT, 'dist');
const PROTECTED_BRANCHES = ['production'];

const args = process.argv.slice(2);
const branch = args.find((a) => !a.startsWith('-'));
const allowUnsymbolicated = args.includes('--allow-unsymbolicated');
const passthrough = args.filter((a) => a !== branch && a !== '--allow-unsymbolicated');

if (!branch) {
  console.error('Usage: publish-update.js <branch> -m "message" [...eas flags]');
  process.exit(1);
}

const run = (command, commandArgs, extraEnv = {}) => {
  const result = spawnSync(command, commandArgs, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

/** Sentry needs all three to associate an uploaded map with a release. */
const sentryReady = ['SENTRY_ORG', 'SENTRY_PROJECT', 'SENTRY_AUTH_TOKEN'].every(
  (key) => process.env[key],
);

if (!sentryReady) {
  const missing = ['SENTRY_ORG', 'SENTRY_PROJECT', 'SENTRY_AUTH_TOKEN'].filter(
    (key) => !process.env[key],
  );
  const message = `Sentry is not configured (missing ${missing.join(', ')}). Crashes in this update will not symbolicate.`;

  if (PROTECTED_BRANCHES.includes(branch) && !allowUnsymbolicated) {
    console.error(`Refusing to publish to "${branch}". ${message}`);
    console.error('Pass --allow-unsymbolicated to publish anyway.');
    process.exit(1);
  }
  console.warn(`Warning: ${message}\n`);
}

fs.rmSync(EXPORT_DIR, { recursive: true, force: true });

console.log('Exporting bundle with source maps...');
run('npx', ['expo', 'export', '--dump-sourcemap', '--output-dir', 'dist']);

if (sentryReady) {
  console.log('\nUploading source maps to Sentry...');
  run('npx', ['sentry-expo-upload-sourcemaps', 'dist']);
}

console.log(`\nPublishing update to "${branch}"...`);
run('npx', ['eas', 'update', '--branch', branch, ...passthrough]);
