# Scripts Directory

Operational power tools for the Abridged project. Organized by intent to prevent misuse and reduce cognitive load.

## Directory Structure

```
scripts/
  build/          → iOS and Android build automation (EAS)
  debug/          → Article scraper debugging & feed validation
  test/           → Feed and API testing utilities
  audit/          → Repo health checks (future)
```

---

## Build Scripts (`scripts/build/`)

### `eas-build.js`

**Purpose:** Wrapper around `eas build` for both platforms. Validates the
platform and profile against `eas.json` before anything is uploaded, then
prints the app identity, version and resulting artifact type.

**When to use:** Any cloud build, iOS or Android.

**Usage:**
```bash
npm run build:ios              # production .ipa
npm run build:ios:preview      # internal-distribution .ipa
npm run build:android          # production .aab for Play
npm run build:android:preview  # sideloadable .apk
npm run build:all              # both platforms, production
npm run build -- android preview --clear-cache   # explicit form, extra eas flags
```

**What it does:**
- Rejects unknown platforms and profiles before a round trip to EAS
- Reports which artifact each platform will produce on the chosen profile
- Passes any additional arguments straight through to `eas build`

Builds run on EAS in the cloud; no local Xcode or Android SDK is required.

---

## Debug Scripts (`scripts/debug/`)

These scripts validate and debug article scrapers and RSS feeds. Use them to:
- Confirm feeds are accessible
- Test parsing logic
- Validate selectors for article content extraction

### `debug-live-scrapers.js`

**Purpose:** Test live RSS feeds (WTAE, CityPaper) and validate content extraction.

**When to use:** When adding new feeds or validating scraper logic.

**Usage:**
```bash
node scripts/debug/debug-live-scrapers.js
```

**What it does:**
- Fetches RSS feeds from configured sources
- Extracts first article link
- Tests HTML parsing and content extraction
- Reports what selectors work vs. fail

---

### `debug-wtae.js`

**Purpose:** Deep-dive debugging for a specific WTAE article.

**When to use:** When WTAE articles fail to parse, validate HTML structure.

**Usage:**
```bash
node scripts/debug/debug-wtae.js
```

**What it does:**
- Fetches a known WTAE article
- Tests multiple CSS selector rules for content extraction
- Outputs which selectors found content
- Useful for understanding page structure changes

---

## Test Scripts (`scripts/test/`)

### `test-triblive-api.js`

**Purpose:** Test TribLive WordPress REST API endpoint (pittsburghmagazine.com).

**When to use:** Validating API integration before app release.

**Usage:**
```bash
node scripts/test/test-triblive-api.js
```

**What it does:**
- Queries TribLive WP API for recent posts
- Validates response structure
- Logs post titles and content length
- Useful for API integration validation

---

### `test-triblive-full.js`

**Purpose:** End-to-end TribLive feed test (RSS → HTML parsing).

**When to use:** Validating entire scraper pipeline.

**Usage:**
```bash
node scripts/test/test-triblive-full.js
```

**What it does:**
- Fetches TribLive RSS feed
- Extracts first article link
- Fetches full article page HTML
- Tests content extraction from parsed HTML
- Useful for identifying feed or selector breakage

---

## Audit Scripts (`scripts/audit/`)

*Future home for repo health checks.*

Planned:
- Verify all scripts are in organized lanes (no root-level scripts)
- Ensure no `node_modules` committed
- Validate standards documentation exists

---

## Quick Reference

| Task | Command |
|------|---------|
| Build iOS IPA | `npm run build:ios` |
| Build Android AAB | `npm run build:android` |
| Build Android APK (preview) | `npm run build:android:preview` |
| Debug feeds (live) | `node scripts/debug/debug-live-scrapers.js` |
| Debug WTAE parsing | `node scripts/debug/debug-wtae.js` |
| Test TribLive API | `node scripts/test/test-triblive-api.js` |
| Test TribLive full pipeline | `node scripts/test/test-triblive-full.js` |

---

## Guidelines

✅ **Do:**
- Keep scripts focused on a single domain (build, debug, test, audit)
- Document new scripts in this README
- Use descriptive script names

❌ **Don't:**
- Add root-level scripts (use subdirectories)
- Mix unrelated concerns in one script
- Assume script purpose is obvious

---

## Adding New Scripts

When adding a new script:

1. **Choose the right folder:**
   - Building/packaging? → `build/`
   - Debugging/validating? → `debug/`
   - Testing/verifying? → `test/`
   - Health checks? → `audit/`

2. **Name clearly:** `verb-noun.sh` or `.js`
   - Good: `debug-wtae.js`, `test-triblive-api.js`
   - Bad: `helper.js`, `run.sh`, `script1.js`

3. **Document here:** Add a section above with purpose, usage, and what it does.

4. **Make it runnable:** Include usage examples.

---

## Node Version

This project requires Node.js **18.x** or higher. Check `.nvmrc` for the canonical version.

```bash
nvm use  # Use Node version from .nvmrc
```
