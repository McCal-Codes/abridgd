# Abridged App — Engineering Standards
Version 1.0  
Last Updated: January 15, 2026

This is the canonical engineering standards document. For workflow checklists, see [Preflight](preflight.md) and [Afterflight](afterflight.md).

## Goals
- Predictable releases
- Reproducible builds
- Reviewable changes
- Clear ownership and audit trails
- Fast rollback when something breaks

---

## 1. Versioning (SemVer + build numbers)

### 1.1 Public version (Marketing Version)
Use **Semantic Versioning**: `MAJOR.MINOR.PATCH`

- **MAJOR**: breaking change for users (rare)
- **MINOR**: new features, backwards compatible
- **PATCH**: bugfixes, no feature changes

Examples:
- `1.4.0` new reader mode feature
- `1.4.1` fixes crash in reader mode
- `2.0.0` major navigation redesign or data model break

### 1.2 Build number (Internal Version)
Maintain a monotonically increasing integer build number, e.g.:
- Marketing: `1.4.1`
- Build: `127`

Rule: **Every CI build and every App Store submission increments build number.**

**Current Version**: `1.0.2` (from SettingsScreen.tsx)

---

## 2. Release cadence and process

### 2.1 Release types
- **Patch release**: bugfix only, fastest path
- **Minor release**: features + fixes
- **Major release**: design/data/behavior shift

### 2.2 Release checklist
See [Afterflight](afterflight.md) for the complete pre-release checklist.

---

## 3. Git strategy

### 3.1 Branching
**Current: Trunk-based (master branch)**
- `master` is always releasable
- Work happens in short-lived branches:
  - `feature/<short-name>`
  - `fix/<short-name>`
  - `chore/<short-name>`

Merge via PR only.

### 3.2 Commit message convention
Use Conventional Commits:

- `feat: add saved articles`
- `fix: prevent crash on empty feed`
- `refactor: move tab routing into coordinator`
- `chore: bump dependencies`
- `docs: update standards`

This enables automated changelogs and clean history.

---

## 4. Tags and releases

### 4.1 Tag format
Tag releases as:
- `vMAJOR.MINOR.PATCH` (e.g., `v1.4.1`)

### 4.2 Release notes
Every release includes:
- Added
- Changed
- Fixed
- Known Issues (if any)

---

## 5. Changelog standard (Keep a Changelog style)

Maintain `CHANGELOG.md` with:

- `## [Unreleased]`
- `## [1.4.1] - YYYY-MM-DD`

Keep entries user-facing. No internal jargon.

---

## 6. Configuration and environments

### 6.1 Environments
Define explicit environments:
- `dev` (current: Expo development)
- `staging` (optional)
- `production`

Rules:
- Production endpoints and keys are never hardcoded in source.
- Environment selection must be visible in debug builds (e.g., small label in Settings/About).

### 6.2 Secrets
- No secrets in Git, ever.
- Use platform tooling (Keychain, CI secrets, etc.)
- Document required env vars in `README.md` without values.

**Current Status**: No external API keys required yet. RSS feeds are public.

---

## 7. Dependency management

Rules:
- Pin dependency versions (avoid floating ranges)
- Prefer fewer dependencies over "cool libraries"
- Every dependency must have:
  - clear purpose
  - maintenance signal (recent updates, active repo)
  - license compatibility

**Current Dependencies** (from package.json):
- React Native 0.81.5
- Expo ~54.0.31
- React Navigation 7.x
- Lucide React Native (icons)
- AsyncStorage (persistence)
- Cheerio (HTML parsing for full article content)

---

## 8. Code quality gates

### 8.1 PR requirements
Every PR must include:
- What changed (summary)
- Why it changed (reason)
- How to test (steps)
- Screenshots for UI changes
- Accessibility note for UI changes (Dynamic Type + VoiceOver sanity check)

### 8.2 "No silent breakage"
- New code must include tests when feasible.
- If untestable, include a manual test plan.

---

## 9. Naming conventions

### 9.1 Files and types
- Types: `PascalCase`
- Methods/vars: `camelCase`
- Constants: `UPPER_SNAKE_CASE` or `camelCase`
- File names match primary export:
  - `ArticleCard.tsx`
  - `RssService.ts`
  - `SettingsContext.tsx`

### 9.2 Feature folders
Organize by feature, not by type:

**Current Structure**:
```
src/
  components/     # Shared UI components
  screens/        # Screen-level components
  navigation/     # Navigation configuration
  context/        # React Context providers
  services/       # Business logic & data fetching
  types/          # TypeScript type definitions
  theme/          # Design tokens (colors, typography, spacing)
  utils/          # Helper functions
```

**Future**: Consider migrating to feature-based structure for v2.0.

---

## 10. Documentation standards

Must-have files:
- `README.md` (setup, run, environments) ✅
- `CHANGELOG.md` ✅
- `docs/standards/` (this folder) ✅
- `docs/architecture.md` (feature architecture) ⚠️
- `docs/adr/` (architectural decisions) ⚠️

For ADRs, see the [adr/](adr/) folder.

---

## 11. Testing standards (minimum viable)

- Unit tests for core logic
- Snapshot/UI tests optional but encouraged for key screens
- Always test:
  - cold launch
  - offline/empty state
  - slow network behavior
  - large text (Dynamic Type)
  - dark mode

**Current Status**: 
- ❌ No automated tests yet
- ✅ Manual testing on iOS devices

See [10) Implement minimum test harness](#TODO) for the testing roadmap.

---

## 12. Observability and crash handling

- Use structured logging (debug only)
- Capture non-sensitive errors centrally (if using analytics/crash reporting)
- Never log:
  - personal data
  - tokens/keys
  - full URLs containing identifiers

**Current Implementation**:
- Console.log for debugging
- No crash reporting yet (consider Sentry for production)

---

## 13. Definition of Done
A feature is "done" when:
- It meets acceptance criteria
- It has tests or a manual test plan
- It respects UI standards and accessibility basics
- It is documented if it changes behavior
- It is behind a safe rollout strategy if risky

---

## 14. Platform-Specific Considerations

### 14.1 React Native / Expo
- Use Expo SDK features when possible (reduces native code maintenance)
- Test on both iOS simulator and physical device
- Profile memory and performance for list-heavy screens
- Use React.memo and useMemo/useCallback appropriately

### 14.2 iOS Build Process
- Build scripts located in `scripts/build/`
- IPA generation: `npm run build:ipa`
- Quick builds: `npm run build:ipa:quick`
- Archive location: `ios/abridged.xcarchive/`
- Export location: `ios/ipas/Versions/`

---

## See Also
- [Preflight](preflight.md) — pre-change checklist
- [Afterflight](afterflight.md) — pre-merge/release checklist
- [Standards Governance Agent](standards-governance-agent.md) — how standards evolve
- [UI & Design Standards](ui-design.md) — design principles
- [Architecture Decisions](adr/) — load-bearing decisions
