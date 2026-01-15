# Abridged App — Preflight Check (Before Making Changes)
Version 1.0  
Last Updated: January 15, 2026

## Purpose
Preflight is the required checklist to run **before** making code or UI changes.  
It prevents avoidable regressions, standards drift, and "local-only" breakage.

If you skip Preflight, you are accepting increased risk of:
- UI inconsistency (HIG drift)
- accessibility regressions
- performance regressions
- broken builds / unreleasable trunk

---

## 1) Scope & Intent (Write this down first)
- [ ] What am I changing? (1–3 sentences)
- [ ] Why am I changing it? (user problem / bug / requirement)
- [ ] What is the acceptance criteria? (observable outcomes)
- [ ] What is the blast radius? (files, screens, features affected)

---

## 2) Standards Alignment (Non-Negotiable)
- [ ] Read the relevant standards doc(s):
  - [ ] `docs/design-standards.md` (if UI/navigation/layout/typography changes)
  - [ ] `docs/standards/accessibility.md` (if anything interactive changes)
  - [ ] `docs/engineering-standards.md` (versioning/changelog/release process)
  - [ ] `docs/architecture.md` (if structure/data/state changes)
- [ ] If change might conflict with Apple HIG:
  - [ ] Identify the conflict explicitly
  - [ ] Document deviation + user benefit + platform expectations preserved
  - [ ] If you can't justify all three, do not proceed

---

## 3) Repo Health (Fast Sanity Check)
- [ ] Pull latest `master` (or main branch) before starting
- [ ] Create a short-lived branch:
  - [ ] `feature/<name>` or `fix/<name>` or `chore/<name>`
- [ ] Confirm the app launches on at least one target:
  - [ ] iOS simulator
  - [ ] (Preferred) one physical iOS device

---

## 4) UX / UI Change Preflight (If UI is touched)
- [ ] Navigation model confirmed:
  - [ ] Tabs are 3–5, distinct destinations, single noun labels
  - [ ] No tabs used for flows/settings/modals
  - [ ] Toolbars contain actions only (not destinations)
- [ ] Layout rules confirmed:
  - [ ] Safe areas respected
  - [ ] System spacing defaults used unless justified
  - [ ] No "fighting the system" layout code
- [ ] Visual hierarchy uses:
  - [ ] position / size / weight first
  - [ ] color last (never the only meaning)

---

## 5) Accessibility Preflight (If anything interactive changes)
- [ ] Hit targets meet minimum 44pt (use hitSlop if needed)
- [ ] VoiceOver labels planned for:
  - [ ] icon-only buttons
  - [ ] custom controls
- [ ] Dynamic Type impact considered (at least the extremes)
- [ ] Reduce Motion respected (no essential meaning conveyed by animation)

---

## 6) Performance Preflight (If lists, images, parsing, or networking changes)
- [ ] Identify the critical path affected (launch, feed load, article open)
- [ ] Confirm no new main-thread heavy work is being added:
  - [ ] expensive parsing
  - [ ] big synchronous transforms
  - [ ] uncontrolled rerenders in large lists
- [ ] For list-heavy screens:
  - [ ] virtualization behavior considered (FlatList settings, memoization)
  - [ ] image loading behavior considered (lazy, caching)

---

## 7) Data / Contract Preflight (If API/RSS parsing/storage changes)
- [ ] Data shape changes identified
- [ ] Backwards compatibility assessed (Saved items, persisted state)
- [ ] Migration strategy defined if required
- [ ] Error handling plan included (offline/empty/invalid feed)

---

## 8) Release Impact Check
- [ ] Is this change release-affecting?
  - [ ] If yes, plan:
    - [ ] version bump (SemVer)
    - [ ] build number increment strategy
    - [ ] changelog entry scope

---

## Preflight "Stop" Conditions (Do Not Proceed)
Stop and re-scope if any are true:
- [ ] You cannot describe acceptance criteria clearly
- [ ] The change breaks Apple HIG expectations without a documented deviation
- [ ] You are changing architecture without updating `architecture.md` / ADR
- [ ] You are touching interactive UI without an accessibility plan
- [ ] You are introducing a dependency without a clear reason + maintenance signal

---

## Minimal Preflight for Tiny Fixes (≤ 15 min changes)
If the change is truly small:
- [ ] Pull latest + branch created
- [ ] Acceptance criteria stated
- [ ] App launches
- [ ] No accessibility regression introduced
