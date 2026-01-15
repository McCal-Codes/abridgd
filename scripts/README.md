# Scripts Directory

Operational power tools for the Abridged project. Organized by intent to prevent misuse and reduce cognitive load.

## Directory Structure

```
scripts/
  build/          → iOS build automation
  debug/          → Article scraper debugging & feed validation
  test/           → Feed and API testing utilities
  audit/          → Repo health checks (future)
```

---

## Build Scripts (`scripts/build/`)

### `build-ipa.sh`

**Purpose:** Full-featured iOS IPA build workflow with signing support.

**When to use:** For complete, signed builds with archiving and export options.

**Usage:**
```bash
npm run build:ipa                    # Standard build
npm run build:ipa clean              # Clean artifacts first
npm run build:ipa archive            # Archive build
./scripts/build/build-ipa.sh export  # Export archived build
```

**What it does:**
- Checks for signing credentials (ExportOptions.plist)
- Runs Xcode build for iOS
- Creates `.xcarchive` artifact
- Exports signed IPA file

---

### `build-ipa-quick.sh`

**Purpose:** Rapid, no-frills iOS IPA build. Minimal checks, fast iteration.

**When to use:** Local development testing, quick validation builds.

**Usage:**
```bash
./scripts/build/build-ipa-quick.sh
```

**What it does:**
- Creates/validates ExportOptions.plist (development method)
- Builds directly without archiving
- Exports IPA to `ios/ipas/`

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
| Build iOS IPA (standard) | `npm run build:ipa` |
| Build iOS IPA (quick) | `./scripts/build/build-ipa-quick.sh` |
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
