# Archived Roadmap (see `todo.md` for live backlog)

Last Updated: January 16, 2026 — **This file is now historical.**

**Source of truth:** Use the root [`todo.md`](../todo.md) for current priorities and sprint items. This file remains for reference to legacy TODO IDs and earlier release scoping.

**Quick Reference:**
- See [completed.md](./completed.md) for finished historical tasks
- Reference standards: [docs/standards/](../docs/standards/)
- Agent instructions: [.agentinstructions.md](../.agentinstructions.md)

---

## 📋 Version Roadmap

### 🚀 v1.1.0 (Current) — Build & Branding Complete

- [x] **TODO-001** | **v1.1.0** | Fix app icon loading regression
  - **Status**: ✅ Completed
  - **Description**: Regenerated native iOS/Android folders via prebuild to resolve icon display issue
  - **Effort**: 1 hour

- [x] **TODO-002** | **v1.1.0** | Rebrand app to "Abridgd"
  - **Status**: ✅ Completed
  - **Description**: Updated app.json display name, created branding standards doc, updated all screens/components
  - **Effort**: 2 hours

- [x] **TODO-003** | **v1.1.0** | Update bundle ID to com.mccalmedia.abridged
  - **Status**: ✅ Completed
  - **Description**: Changed iOS bundle ID, fixed EAS sandbox permissions, created .easignore
  - **Effort**: 1.5 hours

- [x] **TODO-004** | **v1.1.0** | Create What's New onboarding screen
  - **Status**: ✅ Completed
  - **Description**: WhatsNewScreen.tsx with 4 dismissible feature cards, linked in Settings
  - **Effort**: 2 hours
  - **Dependencies**: None

---

### 🔄 v1.2.0 (Next Release) — Enhanced Features & UX

- [ ] **TODO-005** | **v1.2.0** | Implement version tracking for auto-show What's New
  - **Status**: 🔜 Not Started
  - **Description**: Track last viewed version in AsyncStorage, auto-show What's New on version bump
  - **Effort**: 1.5 hours
  - **Definition of Done**: What's New screen appears automatically after app update, can be dismissed
  - **Dependencies**: TODO-004

- [ ] **TODO-006** | **v1.2.0** | Add article sharing functionality
  - **Status**: 🔜 Not Started
  - **Description**: Share article via native Share API to social media, messaging apps
  - **Effort**: 2 hours
  - **Definition of Done**: Share button on ArticleScreen, works on iOS/Android
  - **Dependencies**: None

- [ ] **TODO-007** | **v1.2.0** | Improve article search/filtering
  - **Status**: 🔜 Not Started
  - **Description**: Add search bar to HomeScreen, filter by source/topic/date
  - **Effort**: 2.5 hours
  - **Definition of Done**: Search works across all loaded articles, filters persist across sessions
  - **Dependencies**: SavedArticlesContext

- [ ] **TODO-008** | **v1.2.0** | Add offline reading support
  - **Status**: 🔜 Not Started
  - **Description**: Cache recent articles, allow reading saved articles without network
  - **Effort**: 3 hours
  - **Definition of Done**: Offline badge shows when no connectivity, cached articles display normally
  - **Dependencies**: SavedArticlesContext

---

### ✨ v1.3.0 & Beyond — Advanced Features & Community

- [ ] **TODO-009** | **v1.3.0** | Implement user preferences/reading history
  - **Status**: 🔜 Not Started
  - **Description**: Track reading history, personalize recommendations based on interests
  - **Effort**: 3 hours
  - **Definition of Done**: History persists across sessions, can be cleared from Settings
  - **Dependencies**: ProfileContext

- [ ] **TODO-010** | **v1.3.0** | Add dark mode support
  - **Status**: 🔜 Not Started
  - **Description**: System theme detection, manual override in Settings, persist preference
  - **Effort**: 2.5 hours
  - **Definition of Done**: Dark theme applies app-wide, respects system preference, can override manually
  - **Dependencies**: SettingsContext

- [ ] **TODO-011** | **v1.3.0** | Create digest customization screen
  - **Status**: 🔜 Not Started
  - **Description**: Allow users to customize digest frequency, topics, delivery time
  - **Effort**: 2.5 hours
  - **Definition of Done**: Digest settings persist, can enable/disable per topic
  - **Dependencies**: SettingsContext, DigestScreen

- [ ] **TODO-012** | **v1.3.0** | Add push notifications for breaking news
  - **Status**: 🔜 Not Started
  - **Description**: Send opt-in push notifications for high-priority articles
  - **Effort**: 3 hours
  - **Definition of Done**: Notification permissions requested, breaking news triggers notification
  - **Dependencies**: None

- [ ] **TODO-013** | **v1.3.0** | Implement article source management
  - **Status**: 🔜 Not Started
  - **Description**: Add/remove news sources, manage feed sources from Settings
  - **Effort**: 2 hours
  - **Definition of Done**: Users can toggle sources on/off, UI updates dynamically
  - **Dependencies**: feedConfig.ts

---

### 📱 UI & Design Improvements (Backlog)

- [ ] **TODO-014** | **Backlog** | Refactor screen styling consistency
  - **Status**: 🔜 Not Started
  - **Description**: Standardize spacing, colors, typography across all screens
  - **Effort**: 3 hours
  - **Dependencies**: None

- [ ] **TODO-015** | **Backlog** | Add smooth screen transitions
  - **Status**: 🔜 Not Started
  - **Description**: Implement consistent navigation animations between screens
  - **Effort**: 2 hours
  - **Dependencies**: React Navigation config

- [ ] **TODO-016** | **Backlog** | Improve loading states and skeletons
  - **Status**: 🔜 Not Started
  - **Description**: Add skeleton loading screens for articles, smoother perceived performance
  - **Effort**: 2.5 hours
  - **Dependencies**: ArticleScreen, HomeScreen

- [ ] **TODO-017** | **Backlog** | Polish error states and fallback UI
  - **Status**: 🔜 Not Started
  - **Description**: Improve error messages, add retry buttons, empty state illustrations
  - **Effort**: 2 hours
  - **Dependencies**: ErrorBoundary

---

### 🔧 Testing & Quality (Backlog)

- [ ] **TODO-018** | **Backlog** | Expand Jest test coverage
  - **Status**: 🔜 Not Started
  - **Description**: Add tests for all screens, services, and context providers
  - **Effort**: 5 hours
  - **Definition of Done**: Coverage >80%, all critical paths tested
  - **Dependencies**: Jest config

- [ ] **TODO-019** | **Backlog** | Set up E2E testing with Detox
  - **Status**: 🔜 Not Started
  - **Description**: Add automated mobile app testing for critical user flows
  - **Effort**: 4 hours
  - **Definition of Done**: E2E tests run in CI, cover main navigation and article reading
  - **Dependencies**: None

- [ ] **TODO-020** | **Backlog** | Add performance monitoring
  - **Status**: 🔜 Not Started
  - **Description**: Integrate performance telemetry, track render times and memory usage
  - **Effort**: 2.5 hours
  - **Dependencies**: None

---

### 🌐 Platform Expansion (Backlog)

- [ ] **TODO-021** | **Backlog** | Deploy to Google Play Store
  - **Status**: 🔜 Not Started
  - **Description**: Set up Play Store listing, certificates, and automated deployment
  - **Effort**: 3 hours
  - **Definition of Done**: App available on Play Store, auto-deploys from CI
  - **Dependencies**: None

- [ ] **TODO-022** | **Backlog** | Set up analytics and crash reporting
  - **Status**: 🔜 Not Started
  - **Description**: Integrate Sentry for crash reports, track user engagement metrics
  - **Effort**: 2.5 hours
  - **Dependencies**: None

- [ ] **TODO-023** | **Backlog** | Create web companion dashboard
  - **Status**: 🔜 Not Started
  - **Description**: Web version allowing account sync, article browsing, digest customization
  - **Effort**: 8+ hours
  - **Dependencies**: Backend API

---

### 🛠️ v1.4.1 (UX & Stability)

- [x] **TODO-028** | **v1.4.1** | Surface profile onboarding, single-line headers, caching, and friendly loaders/errors
  - **Status**: ✅ Completed
  - **Description**: Added a once-per-release profile primer with animated codename, constrained profile text, and a fun loading bar, and SectionScreen now hydrates from cached stories, shows the FunLoadingIndicator while refreshing, and offers a friendlier error/retry experience.
  - **Effort**: 2 hours
  - **Dependencies**: ProfileContext, RssService, SectionScreen

### 💬 Advanced Features & Community (Backlog)

- [ ] **TODO-026** | **v1.4.0+** | Add note-taking on articles
  - **Status**: 🔜 Not Started
  - **Description**: Allow users to highlight text and add notes within articles
  - **Effort**: 3.5 hours
  - **Definition of Done**: Notes persist per article, can export notes
  - **Dependencies**: SavedArticlesContext

- [ ] **TODO-027** | **v1.4.0+** | Enable article comments & discussion
  - **Status**: 🔜 Not Started
  - **Description**: Community comments section below each article, threaded discussions
  - **Effort**: 5 hours
  - **Definition of Done**: Comments load, users can post, moderation tools available
  - **Dependencies**: Backend API

- [ ] **TODO-028** | **v1.4.0+** | Add calendar invite generation
  - **Status**: 🔜 Not Started
  - **Description**: Create calendar events from news items (conferences, launches, deadlines)
  - **Effort**: 2.5 hours
  - **Definition of Done**: Calendar integration with iOS/Android native calendar apps
  - **Dependencies**: None

- [ ] **TODO-029** | **v1.4.0+** | Create community events tab
  - **Status**: 🔜 Not Started
  - **Description**: Community-submitted events, RSVPs, local news aggregation
  - **Effort**: 4 hours
  - **Definition of Done**: Events tab shows community events with RSVP capability
  - **Dependencies**: Backend API

- [ ] **TODO-030** | **v1.4.0+** | Build attendee management for events
  - **Status**: 🔜 Not Started
  - **Description**: Track event attendance, attendance checks, post-event feedback
  - **Effort**: 3.5 hours
  - **Definition of Done**: Event organizers can manage attendee lists, send updates
  - **Dependencies**: Backend API, TODO-029

---

## 📊 Progress Overview

| Version | Total Tasks | Completed | In Progress | Remaining |
|---------|------------|-----------|------------|-----------|
| v1.1.0  | 4          | 4         | 0          | 0         |
| v1.2.0  | 4          | 0         | 0          | 4         |
| v1.3.0  | 5          | 0         | 0          | 5         |
| v1.4.0+ | 5          | 0         | 0          | 5         |
| Backlog | 12         | 0         | 0          | 12        |
| **Total** | **30**    | **4**     | **0**      | **26**    |

---

## 🎯 Current Focus (v1.2.0)

### Active Tasks

1. **TODO-005** — Version tracking for auto-show What's New
2. **TODO-006** — Article sharing functionality
3. **TODO-007** — Search/filtering improvements
4. **TODO-008** — Offline reading support

### Definition of Done (All v1.2.0 Tasks)

This sprint is considered complete only when:
- [ ] All 4 tasks have passing tests
- [ ] No console errors in dev or production builds
- [ ] Features validated on iOS and Android
- [ ] CHANGELOG updated with all v1.2.0 entries
- [ ] ACHIEVED.md documents completion

---

## 📝 How to Add Tasks

When adding a new task:

1. **Add to appropriate version section**
2. **Format**: `- [ ] **TODO-XXX** | **vX.Y.Z** | Task Title`
3. **Include metadata**:
   - Status (🔜 Not Started / 🔄 In Progress / ✅ Completed)
   - Description
   - Effort estimate (hours)
   - Dependencies (if any)
   - Definition of Done (for major features)
4. **Update ACHIEVED.md when completed**
5. **Update CHANGELOG.md with version entry**

---

## 💾 Commit Format

When working on tasks, use:

```
[TODO-XXX] Task Title

- Added/Fixed/Implemented description
- References vX.Y.Z release target
```

Example:
```
[TODO-005] Version tracking for auto-show What's New

- Added version storage in AsyncStorage
- Tracks lastViewedVersion and compares to app.json version
- Auto-shows WhatsNewScreen on version mismatch
- Closes TODO-005 for v1.2.0
```
