#!/usr/bin/env node

/**
 * Thin wrapper around `eas build` that fails fast on local mistakes.
 *
 * An `eas build` with a bad profile name is only rejected after the project
 * has been fingerprinted and uploaded, so a typo costs a round trip. This
 * validates platform and profile against eas.json first, then prints exactly
 * what is about to be built - app identity, version, and the resulting
 * artifact type - so you know what you are shipping before it queues.
 *
 * Usage:
 *   node scripts/build/eas-build.js <ios|android|all> [profile] [...eas flags]
 *
 * Defaults to the production profile. Any extra arguments are passed through
 * to eas build untouched, e.g. `--auto-submit`, `--local`, `--clear-cache`.
 */

const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const PLATFORMS = ['ios', 'android', 'all'];

const [platform, maybeProfile, ...passthrough] = process.argv.slice(2);

if (!platform || !PLATFORMS.includes(platform)) {
  console.error(`Usage: eas-build.js <${PLATFORMS.join('|')}> [profile] [...eas flags]`);
  process.exit(1);
}

// A leading flag means the profile was omitted, not that the flag is a profile.
const profileGiven = maybeProfile && !maybeProfile.startsWith('-');
const profile = profileGiven ? maybeProfile : 'production';
const extraArgs = profileGiven ? passthrough : [maybeProfile, ...passthrough].filter(Boolean);

const easConfig = require(path.join(ROOT, 'eas.json'));
const profiles = Object.keys(easConfig.build || {});

if (!profiles.includes(profile)) {
  console.error(`Unknown build profile "${profile}".`);
  console.error(`Available in eas.json: ${profiles.join(', ')}`);
  process.exit(1);
}

const appConfig = require(path.join(ROOT, 'app.json')).expo;

/** What each platform actually produces on this profile, for the summary line. */
const artifactFor = (target) => {
  if (target === 'ios') return 'ipa';
  const buildType = easConfig.build[profile]?.android?.buildType;
  if (buildType === 'apk') return 'apk';
  if (buildType === 'app-bundle') return 'aab';
  return 'aab (EAS default)';
};

const targets = platform === 'all' ? ['ios', 'android'] : [platform];

console.log(`${appConfig.name} ${appConfig.version}`);
console.log(`  profile   ${profile}`);
for (const target of targets) {
  const id =
    target === 'ios' ? appConfig.ios?.bundleIdentifier : appConfig.android?.package;
  const build =
    target === 'ios' ? appConfig.ios?.buildNumber : appConfig.android?.versionCode;
  console.log(`  ${target.padEnd(9)} ${id} (${build}) -> .${artifactFor(target)}`);
}
console.log();

const args = ['eas', 'build', '--platform', platform, '--profile', profile, ...extraArgs];
const child = spawn('npx', args, { cwd: ROOT, stdio: 'inherit' });

child.on('error', (error) => {
  console.error(`Failed to start eas build: ${error.message}`);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 1));
