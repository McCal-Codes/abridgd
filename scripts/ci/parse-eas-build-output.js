#!/usr/bin/env node

/**
 * Parses the JSON output of `eas build --json` into GitHub Actions step
 * outputs, and derives everything the release workflow needs from it so the
 * workflow itself contains no app-specific strings.
 *
 * Every identity value (app name, Expo account, project slug) is read from
 * app.json, so a rebrand or an account move needs no CI edits.
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
 * Note on `artifacts.buildUrl`: despite the name, EAS returns the artifact
 * download URL there, byte-identical to `applicationArchiveUrl` - not a link
 * to the build page. The build page URL is constructed here instead.
 *
 * Usage: node scripts/ci/parse-eas-build-output.js <eas-build.json> [release-tag]
 * Prints GITHUB_OUTPUT-formatted lines to stdout.
 */

const fs = require('fs');
const path = require('path');

const KNOWN_EXTENSIONS = ['ipa', 'apk', 'aab'];

const PLATFORM_LABELS = {
  ios: 'iOS',
  android: 'Android',
};

const jsonPath = process.argv[2];
const releaseTag = process.argv[3] || '';

if (!jsonPath) {
  console.error('Usage: parse-eas-build-output.js <eas-build.json> [release-tag]');
  process.exit(1);
}

const build = (() => {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  return Array.isArray(data) ? data[0] : data;
})();

if (!build?.id) {
  console.error('Missing build id in EAS JSON output.');
  process.exit(1);
}

const appConfig = require(path.join(__dirname, '..', '..', 'app.json')).expo;

/** Filesystem-safe form of the app's display name, e.g. "Abridgd" -> "abridgd". */
const appSlug = String(appConfig.name)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const platform = String(build.platform || '').toLowerCase();
const platformLabel = PLATFORM_LABELS[platform] || platform;
const archiveUrl = build.artifacts?.applicationArchiveUrl || '';

/**
 * iOS is always .ipa; Android is .aab on production and .apk on preview.
 * Reading the extension off the URL keeps that matrix out of the workflow.
 */
const archiveExt = (() => {
  if (!archiveUrl) return '';
  const ext = archiveUrl.split('?')[0].split('.').pop()?.toLowerCase() || '';
  if (!KNOWN_EXTENSIONS.includes(ext)) {
    console.error(`Unexpected artifact extension '${ext}' from ${archiveUrl}`);
    process.exit(1);
  }
  return ext;
})();

const outputs = {
  build_id: build.id,
  build_page_url:
    appConfig.owner && appConfig.slug
      ? `https://expo.dev/accounts/${appConfig.owner}/projects/${appConfig.slug}/builds/${build.id}`
      : '',
  archive_url: archiveUrl,
  archive_ext: archiveExt,
  platform,
  platform_label: platformLabel,
  app_name: appConfig.name,
  app_version: build.appVersion || '',
  app_build_version: build.appBuildVersion || '',
  profile: build.buildProfile || '',
  distribution: (build.distribution || '').toLowerCase(),
  status: build.status || '',
  git_commit: build.gitCommitHash || '',
  expires_at: build.expirationDate || '',
  duration_minutes: build.metrics?.buildDuration
    ? Math.round(build.metrics.buildDuration / 60000)
    : '',
};

if (archiveExt) {
  // e.g. abridgd-v1.5.0-android.aab, falling back to the version when the
  // build was not triggered from a release tag.
  const version = releaseTag || `v${outputs.app_version || appConfig.version}`;
  outputs.artifact_name = `${appSlug}-${version}-${platform}`;
  outputs.artifact_filename = `${outputs.artifact_name}.${archiveExt}`;
  outputs.asset_label = `${appConfig.name} ${platformLabel} ${archiveExt.toUpperCase()}`;
}

for (const [key, value] of Object.entries(outputs)) {
  if (value !== '' && value !== undefined && value !== null) {
    process.stdout.write(`${key}=${value}\n`);
  }
}
