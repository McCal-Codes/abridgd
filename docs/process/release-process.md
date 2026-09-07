# Release Process — Abridged
Last Updated: 2026-08-25

This is the missing piece connecting docs that already existed separately: [push-policy.md](../push-policy.md)
(branch/PR policy), [branching-and-prs.md](branching-and-prs.md) (PR mechanics), `CHANGELOG.md`
(what shipped), `updates/todo.md` (task tracking), and the GitHub Actions workflows in
`.github/workflows/` (CI + the iOS release build). Individually those pieces were solid; nothing
tied them into one end-to-end flow, which is how version numbers drifted out of sync more than
once (see git history: `fix: align version strings across app.json, package.json, and appInfo.ts`),
and why `release-ios.yml` — a working, automated release-build pipeline — sat mostly unused while
builds got kicked off ad hoc from the command line instead.

This doc is written to be followed step-by-step, and to explain *why* each step exists — not just
what to type. If a step's reasoning stops making sense for how the project actually works, change
the step, but change this doc too.

## The three layers

Everything below fits into one of three layers. Keeping them distinct is what makes the whole
thing legible:

1. **Day-to-day development** — every commit, every PR. Doesn't involve version numbers at all.
2. **Deciding what kind of release this is** — a judgment call, made once per release, using SemVer.
3. **Mechanically producing the release** — bump files, tag, let automation build it. This part
   should feel boring and repeatable, because the interesting decisions already happened in layer 2.

---

## Layer 1: Day-to-day development

Already documented in [push-policy.md](../push-policy.md) and [branching-and-prs.md](branching-and-prs.md) — summarized here so the full lifecycle reads in one place.

- Branch off `master`: `feat/<name>`, `fix/<name>`, `chore/<name>`, `docs/<name>`, `test/<name>`, `ci/<name>`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary` — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`. This isn't ceremony — it's what makes `git log --oneline` scannable six months from now, and it's what the `type:` prefix in every commit in this repo's history is already doing.
- Open a PR. `ci.yml` runs automatically: repo-health audit, version-consistency check (see Layer 3), the full test suite, `tsc --noEmit`, and a build-check. All four must pass.
- Squash-merge into `master` once CI is green and the change is reviewed (see the PR checklist in [branching-and-prs.md](branching-and-prs.md)).

None of this touches version numbers. A `master` that's always green and always deployable is the
point — the release step below is what turns "deployable" into "deployed."

---

## Layer 2: What kind of release is this? (SemVer)

This project follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.

| Bump | When | Example from this repo |
|---|---|---|
| **PATCH** (`1.5.0` → `1.5.1`) | Bug fixes, dependency/security patches, doc-only fixes. No new user-facing capability. | `f80f7c7 chore(security): apply non-breaking npm audit fixes` |
| **MINOR** (`1.4.3` → `1.5.0`) | New features, redesigns, additive changes that don't break existing behavior. Most releases here are minor. | This session: real Apple Sign-In, Profile redesign, author bylines, photo-parsing fixes, tab bar fixes — several features, nothing broken, so `1.4.3` → `1.5.0` was correct. |
| **MAJOR** (`1.x.x` → `2.0.0`) | Breaking changes — a data-model change that invalidates old local profiles, dropping a platform, a rewrite of a core flow. Rare for an app like this. | Hasn't happened yet in this project's history. |

**Rule of thumb:** if you're unsure between patch and minor, ask "would a user notice something new,
or does it just work slightly better/safer than before?" New-and-noticeable → minor. Invisible fix →
patch.

Decide the bump *before* touching any files — it determines the exact version string every other
step uses.

---

## Layer 3: Producing the release

This is the part that should be mechanical. Every step is either a file edit or a single command.

### 1. Update the CHANGELOG

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/). Through the whole
development cycle, PRs should add their entries under `## [Unreleased]`. At release time:

1. Rename `## [Unreleased]` → `## [x.y.z] - YYYY-MM-DD` (today's date, the version you decided in Layer 2).
2. Add a fresh empty `## [Unreleased]` section above it for the next cycle.

### 2. Bump the version — in exactly three places

These three files must always agree. `npm run version:check` (wired into CI as of this doc)
enforces it, but run it locally too:

- `package.json` → `"version"`
- `app.json` → `expo.version`
- `src/config/appInfo.ts` → `APP_VERSION`

**Why three files and not one:** `package.json` is npm's source of truth, `app.json` is Expo's, and
`appInfo.ts` is what the app actually displays to users and puts in bug-report emails. Nothing
keeps them in sync automatically except this checklist and the CI check.

**A note on `app.json`'s `ios.buildNumber`:** as of 2026-08-25, `eas.json`'s `cli.appVersionSource`
is `"local"` — meaning `app.json` is the real source of truth for both version *and* build number
that EAS actually uses when building. (It used to be `"remote"`, which silently ignored whatever
was in `app.json` and tracked its own counter server-side — that's the exact bug that shipped one
build mislabeled `1.4.0` when the repo said `1.5.0`. Don't switch it back without a good reason.)
`eas.json`'s `production` profile has `autoIncrement: true`, so **EAS bumps `buildNumber` itself
during the build and writes the new value back into `app.json` on disk** — after running a build,
check `git status`, and commit that bump if EAS changed it. You don't need to touch `buildNumber`
by hand otherwise.

### 3. Commit and merge

```bash
git checkout -b chore/release-x.y.z
git add package.json app.json src/config/appInfo.ts CHANGELOG.md
git commit -m "chore(release): bump version to x.y.z"
git push -u origin chore/release-x.y.z
gh pr create --title "chore(release): bump version to x.y.z" --body "..."
```

Merge once CI passes (this now includes the version-consistency check).

### 4. Tag the release and let automation take it from there

This is the step that's been getting skipped — only `v1.3.0`, `v1.3.6`, and `v1.4.0` exist as tags
even though many more versions have shipped. Tagging isn't decorative: `.github/workflows/release-ios.yml`
is *already built* to trigger automatically on `release: published` — creating a GitHub Release from
the tag kicks off an EAS production build, waits for it, downloads the finished `.ipa`, and attaches
it to the release as a downloadable asset. Skipping the tag means skipping all of that and falling
back to running `eas build` by hand.

```bash
git checkout master && git pull
git tag vX.Y.Z
git push origin vX.Y.Z
gh release create vX.Y.Z --title "vX.Y.Z" --generate-notes
```

`--generate-notes` pulls in the merged PR titles since the last tag — good enough on its own, or
paste the relevant `CHANGELOG.md` section into `--notes` instead for more curated wording.

Publishing the release triggers `release-ios.yml` automatically. Watch it in the Actions tab, or:

```bash
gh run watch
```

### 5. Submit to TestFlight

The release workflow deliberately does **not** auto-submit (`auto_submit` defaults to `false` on
the `workflow_dispatch` trigger, and the `release: published` trigger hard-codes it to `false`) —
submitting to App Store Connect is a real, external, hard-to-fully-undo action, so it stays a
manual, deliberate step:

```bash
eas submit --platform ios --latest
```

...or download the `.ipa` from the GitHub Release and submit via Transporter/App Store Connect
directly.

### 6. Log it in `updates/todo.md`

Close out the relevant TODO-1xx entries for this release (mark `[x]`, add `**Completed**: <date>`)
so the changelog-of-work stays as reliable as `CHANGELOG.md` is for the changelog-of-behavior. See
existing entries for the format.

---

### Write the reader-facing release notes

Add an entry for the new version to `src/config/releaseNotes.ts` before tagging. This is what
readers see in the What's New flow after they update, and it is deliberately not CHANGELOG.md —
the changelog is written for engineers and says things like "appVersionSource was remote in
eas.json". Three to five concrete lines, in a reader's language, naming what changed for them.

A version with no entry falls back to a generic card rather than blocking the release, so this
never gates a ship — but the update lands without anything to say for itself.

## Quick reference (once you know the steps)

```bash
# 1. Decide: patch, minor, or major?
# 2. Update CHANGELOG.md: [Unreleased] -> [x.y.z] - YYYY-MM-DD, add a fresh [Unreleased]
# 3. Bump version in package.json, app.json, src/config/appInfo.ts
npm run version:check                      # must pass before committing
git add package.json app.json src/config/appInfo.ts CHANGELOG.md
git commit -m "chore(release): bump version to x.y.z"
# ...push, PR, merge...
git checkout master && git pull
git tag vX.Y.Z && git push origin vX.Y.Z
gh release create vX.Y.Z --generate-notes  # triggers the automated EAS build
gh run watch                               # optional, watch it build
eas submit --platform ios --latest         # manual, deliberate TestFlight submission
```

## Hotfixes

For an urgent production fix, follow [push-policy.md](../push-policy.md)'s hotfix process for the
branch/merge part, then still run the full Layer 3 release flow (version bump is almost always a
PATCH) — hotfixes still need a tag and a release to reach TestFlight through the automated path.

## Over-the-air updates (EAS Update)

A separate path from a release, for a different job. See
[ADR-0006](../standards/adr/0006-over-the-air-updates.md) for why it exists.

**The rule: an update fixes what is broken. It does not ship what is new.** Features go through a
release so they get review, a version number, and a changelog entry. A broken feed parser does not
need to wait for either.

```bash
npm run update:preview -- -m "Fix Culture feed parser"      # verify on internal builds first
npm run update:production -- -m "Fix Culture feed parser"
```

Both export with source maps, upload them to Sentry, then publish — in that order, so no user ever
runs code that cannot be symbolicated. Publishing to `production` is refused outright if Sentry is
not configured.

For anything with real blast radius, stage it:

```bash
npx eas update --branch production --rollout-percentage 10   # then widen
npx eas update:revert-update-rollout                         # or back it out
```

Only one update can be rolled out on a branch at a time, so resolve a staged rollout before the
next push.

**What an update cannot fix.** `runtimeVersion` uses the `fingerprint` policy, so anything touching
the native runtime — a new Expo module, permissions, `app.json` native keys, an SDK upgrade, the
icon or splash — changes the fingerprint, and the update is withheld from existing binaries rather
than delivered and fatal. Those need a build. JS, styling, copy, and navigation do not.

## External references

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [EAS Build versioning docs](https://docs.expo.dev/build-reference/app-versions/)
