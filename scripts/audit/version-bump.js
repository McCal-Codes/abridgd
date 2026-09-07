#!/usr/bin/env node

/**
 * Version Bump
 *
 * The release process asks for the version to be bumped "in exactly three
 * places" by hand, and the build number in two more. That ritual has already
 * failed once - see release-process.md on the build that shipped labelled
 * 1.4.0 when the repo said 1.5.0 - and src/config/appInfo.ts's APP_BUILD had
 * drifted to "1" against an iOS buildNumber of 36, which users saw in every
 * bug report they sent.
 *
 * This owns all six locations so they cannot disagree:
 *
 *   version       package.json, app.json (expo.version), appInfo.ts APP_VERSION
 *   build number  app.json (ios.buildNumber, android.versionCode), appInfo.ts APP_BUILD
 *
 * iOS and Android share one build number. Keeping them in lockstep means
 * APP_BUILD is meaningful on both platforms and there is one number to reason
 * about rather than two that drift apart.
 *
 * Run: node scripts/audit/version-bump.js <major|minor|patch|build|X.Y.Z>
 *
 * `build` bumps only the build number, for a rebuild of an unchanged version.
 * An explicit X.Y.Z sets that version outright, for corrections and resets.
 * Every form advances the build number, because both stores reject a
 * resubmitted build number - and unlike the version, it can never go backwards.
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const RELEASE_TYPES = ['major', 'minor', 'patch', 'build'];
const EXPLICIT_VERSION = /^\d+\.\d+\.\d+$/;

const projectRoot = path.resolve(__dirname, '../../');
const releaseType = process.argv[2];
const isExplicit = EXPLICIT_VERSION.test(releaseType || '');

if (!RELEASE_TYPES.includes(releaseType) && !isExplicit) {
  process.stderr.write(`Usage: version-bump.js <${RELEASE_TYPES.join('|')}|X.Y.Z>\n`);
  process.exit(1);
}

const paths = {
  packageJson: path.join(projectRoot, 'package.json'),
  appJson: path.join(projectRoot, 'app.json'),
  appInfo: path.join(projectRoot, 'src/config/appInfo.ts'),
};

const packageJson = JSON.parse(fs.readFileSync(paths.packageJson, 'utf-8'));
const appJson = JSON.parse(fs.readFileSync(paths.appJson, 'utf-8'));
let appInfo = fs.readFileSync(paths.appInfo, 'utf-8');

const currentVersion = packageJson.version;
const parsed = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)$/);

if (!parsed) {
  process.stderr.write(`${RED}package.json version "${currentVersion}" is not MAJOR.MINOR.PATCH.${RESET}\n`);
  process.exit(1);
}

const [major, minor, patch] = parsed.slice(1).map(Number);

const nextVersion = isExplicit
  ? releaseType
  : {
      major: `${major + 1}.0.0`,
      minor: `${major}.${minor + 1}.0`,
      patch: `${major}.${minor}.${patch + 1}`,
      build: currentVersion,
    }[releaseType];

/**
 * Take the highest build number across all three locations rather than trusting
 * any one of them, so a drifted value can never send the number backwards -
 * both stores permanently reject a build number that has already been used.
 */
const currentBuild = Math.max(
  Number(appJson.expo.ios?.buildNumber) || 0,
  Number(appJson.expo.android?.versionCode) || 0,
  Number(appInfo.match(/APP_BUILD\s*=\s*"(\d+)"/)?.[1]) || 0,
);
const nextBuild = currentBuild + 1;

packageJson.version = nextVersion;
appJson.expo.version = nextVersion;
appJson.expo.ios.buildNumber = String(nextBuild);
appJson.expo.android.versionCode = nextBuild;

appInfo = appInfo
  .replace(/(APP_VERSION\s*=\s*")[^"]+(")/, `$1${nextVersion}$2`)
  .replace(/(APP_BUILD\s*=\s*")[^"]+(")/, `$1${nextBuild}$2`);

fs.writeFileSync(paths.packageJson, JSON.stringify(packageJson, null, 2) + '\n');
fs.writeFileSync(paths.appJson, JSON.stringify(appJson, null, 2) + '\n');
fs.writeFileSync(paths.appInfo, appInfo);

process.stdout.write(
  `\n${GREEN}Bumped ${releaseType}${RESET}\n` +
    `  version       ${currentVersion} -> ${nextVersion}\n` +
    `  build number  ${currentBuild} -> ${nextBuild}\n\n` +
    `${DIM}  package.json, app.json (version, ios.buildNumber, android.versionCode),\n` +
    `  src/config/appInfo.ts (APP_VERSION, APP_BUILD)${RESET}\n\n` +
    `Next: update CHANGELOG.md, commit, then tag.\n\n`,
);
