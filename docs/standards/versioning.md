# Versioning Standard
Last Updated: 2026-11-09

How Abridgd numbers its releases. The mechanics of cutting one live in
[release-process.md](../process/release-process.md); this doc is the rules that process follows.

## 1. Two numbers, two jobs

| Number | Looks like | Who it is for | Rule |
|---|---|---|---|
| **Version** | `0.2.0` | People (stores, changelog, bug reports) | SemVer `MAJOR.MINOR.PATCH`, digits only |
| **Build number** | `41` | The stores | One whole number, shared by iOS and Android, **only ever goes up** |

Both stores reject a build number they have already seen, and Android refuses a lower `versionCode`
than the installed one. The version may be corrected; the build number never goes backwards.

## 2. Where they live

Version, in three places: `package.json`, `app.json` (`expo.version`), `src/config/appInfo.ts`
(`APP_VERSION`). Build number, in three places: `app.json` (`ios.buildNumber`, `android.versionCode`),
`src/config/appInfo.ts` (`APP_BUILD`). `eas.json` keeps `appVersionSource: "local"`, so `app.json` is
what EAS builds.

Never edit these by hand. Use `npm run version:bump` (it moves all six together) and let
`npm run version:check` in CI catch drift.

## 3. Pre-releases (betas)

A beta is the same version as the release it leads to, with a higher build number each time.

- **Git tag and GitHub release carry the label:** `v0.2.0-beta.1`, `v0.2.0-beta.2`, then `v0.2.0`.
  Mark beta releases as "pre-release" on GitHub.
- **The app files carry no label.** Apple's `CFBundleShortVersionString` allows digits and dots
  only, so `0.2.0-beta.1` cannot go in `app.json` or `appInfo.ts`. The beta is `0.2.0` there, and
  the build number tells one beta build from the next.
- **One tag = one build.** Rebuilding the same tag is not allowed: bump the build number
  (`version:bump build`) and cut the next `-beta.N`.
- **CHANGELOG:** while a beta is out, its notes sit under `## [0.2.0] - Unreleased`. Each beta tag
  does not get its own heading; the final release gets the date.

## 4. When to bump what

Unchanged from the release process (patch = invisible fix, minor = something new a user notices,
major = breaking). Two additions:

- **Bump only in the release PR**, never on a feature branch (also in CONTRIBUTING.md). Feature
  PRs add a line under `## [Unreleased]` and leave every number alone.
- **A version is bumped once per release train.** Betas of `0.2.0` do not touch the version, only
  the build number.

## 5. Tags

`vMAJOR.MINOR.PATCH` for releases and `vMAJOR.MINOR.PATCH-beta.N` for betas. Tag the merge commit on
`master` after the release PR lands. Tags are not moved or reused; if a tag is wrong, delete it and
cut a new build number rather than re-pointing it.

## 6. Resets and corrections

`version:bump X.Y.Z` sets a version outright, for corrections and deliberate resets. It still advances
the build number, so a reset never makes the build number go down.

**The 0.x reset (2026-11-09).** The 1.x line (last release `v1.5.7`, build 39) was a pre-launch
numbering. Abridgd restarts at `0.2.0` (beta 1, build 41) on the way to a first public `1.0.0`.
Consequences to keep in mind:

- Build numbers continue from 41, they do not restart.
- Android is unaffected by the lower version because `versionCode` rises.
- App Store Connect and TestFlight can reject a version string lower than one already submitted.
  Before the first iOS upload of `0.2.0`, confirm in App Store Connect that no `1.x` build was ever
  uploaded for this app. If one was, the iOS version must stay above it.
- The `v1.x` tags and releases stay as history. Do not delete them.
- Next public version after the betas is `0.2.0`, then `0.x` minors until `1.0.0` is declared.

## 7. Sources of truth

`CHANGELOG.md` is the record of what shipped. `VERSION_HISTORY.md` is a legacy planning file and is
not kept current; do not add to it.
