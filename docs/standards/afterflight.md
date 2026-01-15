# Abridged App — Afterflight Check (Before Merging / Releasing)
Version 1.0  
Last Updated: January 15, 2026

## Purpose
Afterflight is the required checklist to run **before merging a PR** or **releasing to TestFlight / App Store**.  
It prevents regressions from entering the trunk and ensures the app remains in a releasable state.

If you skip Afterflight, you are accepting:
- Broken trunk (subsequent developers blocked)
- Unreleasable code (can't hotfix critical bug)
- Lost audit trail (no changelog, no tags, no context)

---

## 1) Code Review Signals
- [ ] PR description present and complete:
  - [ ] What changed? (summary)
  - [ ] Why? (reason / ticket / user problem)
  - [ ] How to test? (steps)
- [ ] At least one peer review completed
- [ ] Owner approval obtained
- [ ] CI/lint checks green (if applicable)
- [ ] No "TODO" or "FIXME" left behind (or documented in ADR)

---

## 2) Changelog & Documentation Gates
- [ ] Changelog entry added to `CHANGELOG.md` under `Unreleased`:
  - [ ] Format: `- [Added/Changed/Fixed] <short user-facing summary>`
  - [ ] At least one entry if the change affects users or process
- [ ] If change touches architecture / major structure:
  - [ ] ADR written in `docs/adr/` or `docs/architecture.md` updated
- [ ] If change touches UI/UX:
  - [ ] Relevant design doc referenced or updated
- [ ] If change touches standards themselves:
  - [ ] Entry added to `CHANGELOG.md`
  - [ ] Governance agent or affected standard doc updated

---

## 3) Regression Test Matrix (Spot-Check)
- [ ] Feature works end-to-end on:
  - [ ] iOS simulator (latest SDK)
  - [ ] iOS device (at least one physical device; ideally 2 iOS versions)
- [ ] Critical paths unaffected:
  - [ ] App launches without crash
  - [ ] Home/feed screen loads
  - [ ] Article read-through completes (if article-related)
  - [ ] Settings navigation works
- [ ] Accessibility spot-check:
  - [ ] VoiceOver reads key labels (if UI touched)
  - [ ] Dynamic Type extremes tested (if text changes)
- [ ] Dark mode verified (if UI touched)

---

## 4) Version & Build Metadata Check (Release-Affecting Changes Only)
If the change is a release:
- [ ] Version bumped in `package.json` and/or iOS `Info.plist` (SemVer rules from `docs/engineering-standards.md`)
- [ ] Build number incremented (monotonic integer, always increases)
- [ ] Release tag created (format: `vMAJOR.MINOR.PATCH`)
- [ ] Marketing version matches Git tag
- [ ] Build metadata consistent across platform (iOS)

---

## 5) Performance & Stability Scan
- [ ] No new console warnings or errors during typical user flow
- [ ] If parsing/networking changed:
  - [ ] Tested on slow network (throttle to 3G if possible)
  - [ ] Tested offline (confirm graceful handling)
  - [ ] Tested with empty/invalid feed (confirm error message)
- [ ] If list-heavy screens touched:
  - [ ] FlatList virtualization working (smooth scrolling)
  - [ ] Memory not leaking on repeated screen entry/exit (watch profiler)
- [ ] If images or media touched:
  - [ ] Load time acceptable
  - [ ] No O(n) image allocations in loops

---

## 6) Secrets & Security Check (For Any Production-Touching Change)
- [ ] No hardcoded API keys, endpoints, or tokens
- [ ] No logging of user data, tokens, or sensitive responses
- [ ] If adding external dependencies:
  - [ ] License compatible with project (check `package.json` and third-party notice)
  - [ ] Dependency is actively maintained (check GitHub repo: recent commits, issue response)

---

## 7) Releasable Trunk Verification
Before merge, confirm:
- [ ] All checks above completed ✓
- [ ] No breaking changes to data format (or migration included)
- [ ] No partial feature flags (either feature is complete or hidden behind a flag)
- [ ] No "this will break until I merge the other PR" dependencies (merge blockers must be explicitly called out)

---

## 8) Merge & Tag Protocol
- [ ] Squash or rebase to single clean commit (if policy requires)
- [ ] Commit message uses Conventional Commits format:
  - `feat: add reader mode`
  - `fix: prevent crash on empty feed`
  - `chore: update dependencies`
- [ ] Merge to `master` (trunk-based)
- [ ] Verify build triggers post-merge (CI runs, artifacts generated)

---

## Afterflight "Stop" Conditions (Do Not Merge)
Stop and fix if any are true:
- [ ] Changelog entry missing or incomplete
- [ ] App does not launch on simulator or device
- [ ] Accessibility regression introduced (VoiceOver broken, Dynamic Type broken, hit targets < 44pt)
- [ ] Version number is not bumped for a release
- [ ] ADR or architecture doc missing (if change is architectural)
- [ ] Security issue present (hardcoded key, sensitive log, unvalidated input)
- [ ] Performance regression without documented reason + mitigation

---

## Release-Specific Afterflight (TestFlight / App Store Submission)
Before archiving for export:
- [ ] Version tag matches `package.json` + iOS marketing version
- [ ] Build number is unique and monotonically increasing
- [ ] Signing certificate and provisioning profile valid
- [ ] Screenshots and release notes prepared
- [ ] Beta testers list (if TestFlight) updated
- [ ] Privacy labels / App Tracking Transparency state confirmed
- [ ] Entitlements file (`abridged.entitlements`) reviewed for permission creep

---

## Afterflight Minimal Checklist (For Tiny Fixes)
If the change is small (≤ 15 min) and low-risk:
- [ ] Changelog entry present
- [ ] App launches
- [ ] No regression test failures
- [ ] One peer approval
