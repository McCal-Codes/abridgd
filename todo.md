# TODO - Abridged Project Roadmap

> **IMPORTANT FOR AGENTS**: Check this file when starting work. Reference task IDs in commits and PRs. Update status as you work.

## Priority Levels
- **[P0] CRITICAL**: Current sprint (v1.1.0) - Must complete before release
- **[P1] HIGH**: Next release (v1.2.0) - Schedule for near future
- **[P2] MEDIUM**: Planned (v1.3.0) - Nice to have, non-blocking
- **[P3] LOW**: Backlog/Research - Long-term, exploratory

## Current Sprint (v1.1.0 - In Progress)

### Infrastructure & Build
- [ ] **v1.1.0-001 [P0]** | EAS Build Success
  - Current: iOS build in progress on EAS servers
  - Blocked by: Sandbox permission errors (partially resolved by removing ios/ from git)
  - Next: Monitor build completion, resolve any remaining errors
  - Doc: `docs/ios-ipa-testflight.md`

- [ ] **TODO-002** | TestFlight Submission
  - Current: Ready after build succeeds
  - Next: Run `npx eas submit --platform ios --latest`
  - Doc: `docs/ios-ipa-testflight.md`

- [ ] **TODO-003** | Android Build & Release
  - Current: Not started (iOS priority first)
  - Next: Set up Android keystore, configure eas.json for Android
  - Dependencies: TODO-001, TODO-002 (iOS must be stable first)

### Features & Screens
- [x] **TODO-004** | What's New Onboarding Screen
  - Status: COMPLETED 2026-01-16
  - Completed: WhatsNewScreen component with 4 feature cards
  - Linked in Settings menu with Sparkles icon
  - Features: dismissible cards, empty state, changelog reference
  - PR: feat: create What's New onboarding screen

- [ ] **TODO-005** | Version Tracking for Auto-Show
  - Current: WhatsNewScreen created but not auto-triggered on app launch
  - Next: Add version tracking to SettingsContext to show on first launch after update
  - Implementation: Store lastSeenVersion in AsyncStorage, compare with app.json version
  - Estimated effort: 1-2 hours

- [ ] **TODO-006** | Dark Mode Implementation
  - Current: Design system supports it, not implemented
  - Next: Create dark theme in `src/theme/colors.ts`
  - Reference: ADR-0004 (Theming and semantic colors)
  - Estimated effort: 2-3 hours

### Documentation & Standards
- [x] **TODO-007** | Branding Standards Document
  - Status: COMPLETED 2026-01-16
  - Completed: `docs/standards/branding.md` with full specifications
  - Covers: Official name "Abridgd", technical vs. display names, governance

- [x] **TODO-008** | Comprehensive CHANGELOG
  - Status: COMPLETED 2026-01-16
  - Completed: Full semantic versioning, version history, upgrade guides
  - Covers: v0.1.0, v1.0.0, v1.1.0 with detailed change tracking

- [ ] **TODO-009** | API Documentation
  - Current: Not started
  - Next: Document all context providers (ProfileContext, SettingsContext, etc.)
  - Format: JSDoc comments + markdown in `docs/api/`
  - Estimated effort: 2-3 hours

- [ ] **TODO-010** | Component Library Documentation
  - Current: Components exist but not formally documented
  - Next: Create Storybook or markdown docs for each component
  - Candidates: LiquidTabBar, ScaleButton, ArticleCard, etc.
  - Estimated effort: 3-4 hours

### Testing
- [ ] **TODO-011** | Increase Test Coverage to 80%
  - Current: Basic test setup, minimal coverage
  - Next: Add tests for contexts, utilities, screens
  - Target: 80% line coverage by v1.2.0
  - Blockers: None
  - Reference: `docs/standards/testing-baseline.md`

- [ ] **TODO-012** | E2E Tests with Detox
  - Current: Not started
  - Next: Set up Detox, write critical user journey tests
  - Estimated effort: 4-6 hours
  - Blocked by: TODO-001 (need stable iOS build first)

### Performance & Monitoring
- [ ] **TODO-013** | Analytics Integration
  - Current: Not started
  - Next: Add Expo Analytics or similar
  - Metrics: App opens, screen views, feature usage
  - Estimated effort: 2 hours

- [ ] **TODO-014** | Performance Profiling
  - Current: Not started
  - Next: Profile bundle size, render performance, memory usage
  - Tools: React DevTools Profiler, Flipper
  - Estimated effort: 2-3 hours

---

## Future Releases (v1.2.0 and beyond)

### Content & Feeds
- [ ] **TODO-015** | Custom RSS Feed URL Support
  - User can add arbitrary RSS feeds
  - Validation and error handling
  - Estimated effort: 2-3 hours

- [ ] **TODO-016** | Feed Refresh & Caching Strategy
  - Implement smart refresh (background, on-demand, scheduled)
  - Cache strategy: SQLite or AsyncStorage
  - Estimated effort: 3-4 hours

### Personalization
- [ ] **TODO-017** | User Preferences Persistence
  - Save: digest style, reading mode, category preferences
  - Sync: cloud backup (Firebase or custom)
  - Estimated effort: 3-4 hours

- [ ] **TODO-018** | Reading History
  - Track articles read
  - Show "Continue Reading" suggestions
  - Privacy: local-only option
  - Estimated effort: 2-3 hours

### Advanced Features
- [ ] **TODO-019** | Offline Support
  - Download articles for offline reading
  - Sync when connection restored
  - Estimated effort: 4-6 hours

- [ ] **TODO-020** | Push Notifications
  - Breaking news alerts
  - Daily digest delivery
  - Customizable categories
  - Estimated effort: 2-3 hours

- [ ] **TODO-026** | Article Note-Taking Feature
  - Users can create and save notes while reading articles
  - Notes associated with specific articles
  - Quick access to notes from article view
  - Export notes (copy, email, etc.)
  - Estimated effort: 3-4 hours

- [ ] **TODO-027** | Comment Section on Articles
  - Enable user discussions on articles
  - Nested reply threads
  - User avatars and timestamps
  - Moderation tools
  - Can be local-only or cloud-backed
  - Estimated effort: 4-6 hours
  - Dependencies: User profiles (TODO-017)

- [ ] **TODO-028** | Calendar Invite Auto-Generation
  - Detect events in articles (dates, times, locations)
  - Create calendar invites (iCal format)
  - One-tap add to Apple Calendar / Google Calendar
  - Extract event details: title, date, time, location from article content
  - Estimated effort: 3-4 hours

### Community & Social
- [ ] **TODO-029** | Community Tab with Events
  - New tab for local/community events
  - Event aggregation from articles
  - Event filtering by category, date, location
  - Add to calendar integration
  - RSVP tracking within app
  - Estimated effort: 5-7 hours
  - Dependencies: TODO-028 (calendar integration)

- [ ] **TODO-030** | Event Attendee Management API
  - Connect to event management system (Eventbrite, Meetup, custom)
  - Incrementally add attendees from app
  - Track RSVP status (going, maybe, not going)
  - Sync attendee counts back to source
  - Estimated effort: 4-6 hours
  - Dependencies: TODO-029 (Community tab)

### Infrastructure
- [ ] **TODO-021** | CI/CD Enhancements
  - GitHub Actions: automated testing on PR
  - Automated version bumping
  - Pre-release testing on TestFlight
  - Estimated effort: 2-3 hours

- [ ] **TODO-022** | Monitoring & Error Tracking
  - Sentry integration
  - Crash reporting
  - Performance monitoring
  - Estimated effort: 2 hours

---

## Backlog (Low Priority / Research)

- [ ] **TODO-023** | Web Version (React Web)
  - Share code with React Native via monorepo
  - Estimated effort: 8-12 hours (major undertaking)

- [ ] **TODO-024** | Desktop App (Electron)
  - Mac/Windows native app
  - Estimated effort: Research required

- [ ] **TODO-025** | API Server
  - Backend for custom RSS parsing, summarization
  - Estimated effort: 12-20 hours (major undertaking)

## Definition of Done

For each TODO item, completion requires:
1. ✅ Code implementation
2. ✅ Tests added/updated (if applicable)
3. ✅ Documentation updated (code + markdown)
4. ✅ CHANGELOG.md entry
5. ✅ ACHIEVED.md updated
6. ✅ Commit message references TODO-XXX

---

## Tracking Legend

| Status | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Completed |
| `[>]` | Blocked/Waiting |

---

## Reference

- **Standards**: `docs/standards/` - All engineering & design standards
- **Architecture**: `docs/architecture.md` - Design decisions
- **Changelog**: `CHANGELOG.md` - Version history
- **Achieved**: `ACHIEVED.md` - Completed milestones
- **Vision**: `docs/vision.md` - Product direction
