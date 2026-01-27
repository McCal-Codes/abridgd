# Backlog

> Adding tasks? Use this format: `- [ ] TODO-XXX | Scope | Brief description (1 line)` and keep statuses synchronized. Prefer adding new items here (source of truth) and mark related entries in `updates/todo.md` as historical only. When completed, move a summary to `updates/completed.md`.

<!--
Maintainer prompt: Backlog grooming guardrails

You are helping maintain and refine the product backlog for Abridged (iOS news app). Backlog below is the source of truth for Version 1.4+. Keep it clear, coherent, and execution-ready without losing nuance or intent.

Ground rules:
- Do not invent features beyond vision; do not delete—defer instead.
- Preserve voice (calm, intentional, trust-focused, Apple-native).
- Prefer small structural edits (grouping, renaming, deduping); keep markdown structure consistent.
- Todo format: `- [ ] TODO-XXX | Scope | Brief description (1 line)`; keep status synced. Backlog is live; `updates/todo.md` is historical only.

Tasks when editing:
1) Normalize/dedupe. Merge overlapping loading/error/offline bullets; keep crisp 1–2 line goals per phase.
2) Enforce priority spine: Stability → Core reading loop → Trust/identity.
3) Tighten wording for execution: actionable, shippable in 1–2 sittings; split if larger.
4) Align themes: Accessibility, Offline, Trust/Intent, Reader Identity; move items to correct phase if needed.
5) Tagging/IDs: Add unique TODO-XXX where obvious; don’t renumber existing.
6) Separation: App vs Website/Marketing vs Security. In web/marketing, keep 3–7 most important bullets per subsection.
7) Security Playbook: phrase as checklists/cadence, not maybes.

Output rules:
- Keep headings order (Version 1.4 → phases → Future → Defer → Web/Marketing → Security).
- Add a short “Backlog maintenance notes” delta when you edit.
-->

## Version 1.4 — The Refinement Release (In Progress)

**Vision:** Polish the reading experience so it feels calm, intentional, and Apple-native—trustworthy, resilient, and ready for launch.

---

### Priority Fixes & Stability — Do These First

- [x] TODO-025 | Stability | Screens: Home loading skeletons restored and WTAE feed reliability hardened.
- [ ] TODO-029 | Stability | Save/load resilience for SavedArticles (error handling + migration from in-memory on first launch).
- [ ] TODO-030 | Stability | Network/Feed error states with offline-friendly retry and last-updated labeling.
- [ ] TODO-031 | Stability | Loading and skeleton experience (avoid blank screens; progressive image loading).
- [ ] TODO-032 | Offline | Offline indicator + queued save/unsave actions until reconnected.
- [ ] TODO-033 | Accessibility | Accessibility audit (VoiceOver, Dynamic Type, contrast).
- [ ] TODO-034 | Controls | Global animation + haptics controls (respect Reduce Motion, allow overrides).

---

### Onboarding & Grounding Polish

- [x] Prevent overflow on grounding slide; keep breath bar and copy fully inside the card.
- [x] Full-width grounding style selector cards with visual previews and generous vertical spacing.
- [x] Centered, margin-aware pagination and action buttons with breathable padding.
- [ ] TODO-035 | Onboarding | Capture updated screenshots for docs and App Store metadata.

---

## Phase 1: Core Data & Persistence 🗄️
**Goal:** Make saving/continuing reading durable and migration-safe.

### Saved Articles System (Enhanced)
- [ ] TODO-040 | Storage | Migrate `SavedArticlesContext` to AsyncStorage.
- [ ] TODO-041 | Storage | Add versioned schema to support future migrations.
- [x] TODO-042 | Storage | Implement data compression for large article bodies (schema v2).
- [ ] TODO-043 | Stability | Add save/load error handling with retry logic.
- [ ] TODO-044 | Migration | Migrate in-memory saved items on first launch.

### Reading Progress Tracking
- [ ] TODO-045 | Progress | Track scroll position per article (resume where you left off).
- [ ] TODO-046 | Progress | Track RSVP progress (word index + timestamp).
- [ ] TODO-047 | Progress | Progress indicators on ArticleCards (unread/in-progress/completed).
- [x] TODO-048 | Progress | “Continue Reading” section on HomeScreen for in-progress articles.

### Smart Collections & States
- [ ] TODO-049 | States | Reading state model: Read Later / Archived / Favorite.
- [ ] TODO-050 | States | Last read timestamp persisted with saved items.
- [ ] TODO-051 | States | (Optional) Reading duration tracking (local-only).

---

## Phase 2: Empty, Error, Loading States 🎨
**Goal:** Keep feeds calm and informative when data is missing, slow, or failing.

- [x] TODO-028 | Phase 2: Empty, Error, Loading States | Add profile onboarding, single-line headers, cached story hydration, and fun loading/error surfaces for feeds.
- [ ] TODO-052 | Network | Offline-friendly error UI (“Can’t connect”) showing last successful update + “From cache” label when applicable.
- [ ] TODO-053 | Network | Retry flows reuse loading state and support pull-to-retry.
- [ ] TODO-054 | Loading | Skeleton cells + reserved image space to prevent layout jumps; progressive image loading.
- [ ] TODO-055 | Copy | Calm, minimal loading/error copy consistent across sections.

---

## Phase 3: Accessibility & Controls ♿
**Goal:** Respect user preferences for motion, haptics, and readability.

- [ ] TODO-034 | Controls | Global animation + haptics controls (respect Reduce Motion, allow overrides).
- [ ] TODO-056 | Controls | Animation speed/scale presets (0.5×–2×) gated by Reduce Motion.
- [ ] TODO-057 | Accessibility | VoiceOver labels everywhere + announce state changes.
- [ ] TODO-058 | Accessibility | Dynamic Type stress test (largest/smallest) across key screens.
- [ ] TODO-059 | Accessibility | Contrast checks for light/dark and colorblind friendliness.

---

## Phase 4: Offline & Caching 🚀
**Goal:** Ensure the reading loop works without network and recovers gracefully.

- [ ] TODO-032 | Offline | Offline indicator + queued save/unsave actions until reconnected.
- [ ] TODO-060 | Caching | Cache full article content when saved.
- [ ] TODO-061 | Caching | Cache images for saved articles.
- [ ] TODO-062 | Caching | Cache cleanup policy (LRU, size limit).
- [ ] TODO-063 | Offline | Apply queued actions on reconnect with status feedback.

---

## Phase 5: Refresh & Discovery ♻️
**Goal:** Keep content fresh without jitter while empowering power users.

- [x] TODO-064 | Refresh | HomeScreen pull-to-refresh + timestamp + haptics.
- [x] TODO-065 | Refresh | SectionScreen pull-to-refresh + per-section timestamp + cache TTL.
- [x] TODO-066 | Refresh | SavedScreen pull-to-refresh scaffold + timestamp + haptics.
- [x] TODO-067 | Search | SavedScreen debounced search + recent queries.
- [x] TODO-068 | Filters | Filters (source/category/status/date).
- [x] TODO-069 | Sorting | Sorting (newest/oldest/progress/length/source).
- [x] TODO-070 | UX | “No results” state with clear action.

---

## Phase 6: Trust & Intent (iOS 26-native) 🧭
**Goal:** Make feed logic legible and user-directed without algorithm creep.

### Trust Panel — “Why am I seeing this?”
- [ ] TODO-071 | Trust | ArticleScreen overflow action: “Why am I seeing this?” presented as BlurSheet (medium/large detents).
- [ ] TODO-072 | Trust | Panel fields: source + canonical domain, feed context (Top/Local/Digest), relevance reason, sensitive-content flags/grounding rationale, last updated timestamp (screen vs item).
- [ ] TODO-073 | Trust | Copy tone stays calm, factual, non-judgmental; VoiceOver reads combined summary.

### Follow System (explicit choice)
- [ ] TODO-074 | Follow | Follow Source from ArticleScreen + Sources screen.
- [ ] TODO-075 | Follow | Follow Topic from ArticleScreen tags or inferred list.
- [ ] TODO-076 | Follow | Follow Location scope (v1: Pittsburgh; later neighborhoods/radius).
- [ ] TODO-077 | Follow | Profile → Manage follows (sources, topics, location).
- [ ] TODO-078 | Follow | Feed integration: “Following” section inside Top/Digest; follows influence ordering without hiding other content.

---

## Phase 7: Reader Identity 🎛️
**Goal:** Make “how you read” intentional without settings sprawl.

- [ ] TODO-079 | Reader Studio | Create Reader Studio surface (Profile → Reader Studio).
- [ ] TODO-080 | Reader Studio | RSVP speed presets + quick selection.
- [ ] TODO-081 | Reader Studio | Focus anchor strategy selector.
- [ ] TODO-082 | Reader Studio | Grounding style selector (swipeable cards with previews).
- [ ] TODO-083 | Reader Studio | Contrast + motion preferences linking to settings where needed.
- [ ] TODO-084 | Reader Studio | Use iOS 26 components (NavigationHeader title+subtitle; BlurSheet for deeper config).
- [ ] TODO-085 | Reader Studio | Preserve classic RSVP “writing”/pacing feel.

---

## Phase 8: Profiles 👤
**Goal:** Practical, calm profile surface focused on navigation and utility.

- [ ] TODO-086 | Profile | Redesign Profile screen for navigation-first utility (no gamification).
  - [ ] TODO-087 | Profile | Quick actions: Settings, Send Feedback, Share App.
  - [ ] TODO-088 | Profile | Entry points: Reader Studio, Sources/Topics, Reading History (when added).
- [ ] TODO-089 | Profile | Avoid streak/fire-emoji gamification in 1.4 (keep note for future).
> NOTE: “Profile tab integration” is already done per changelog.

---

## Phase 9: Pre-Launch Essentials 📱
**Goal:** Ship-ready compliance, feedback, and store assets.

- [ ] TODO-090 | Legal | Privacy policy (Sentry, Perplexity, storage).
- [ ] TODO-091 | Legal | Terms of service + first-launch acceptance.
- [ ] TODO-092 | Support | In-app feedback mail with device/app info.
- [ ] TODO-093 | Support | Help/FAQ section.
- [ ] TODO-094 | App Store | App Store Connect setup.
- [ ] TODO-095 | App Store | Screenshots & preview video (show RSVP + glass UI + trust panel).

---

## Version 1.5+ — Future Features (Roadmap-aligned)
**Goal:** Post-1.4 evolution that deepens the reading loop and trust model.

### Reading History (local-first)
- [ ] TODO-100 | History | Recently read list + resume points.
- [ ] TODO-101 | History | Clear history control.
- [ ] TODO-102 | History | Surface in Profile and/or Continue Reading.

### Editorial Quote / Excerpt Sharing
- [ ] TODO-103 | Sharing | Share selected paragraph or RSVP-highlighted text as image card with attribution.
- [ ] TODO-104 | Sharing | Keep sharing editorial (not viral) in tone.

### Smart Suggestions (after Follow + Trust Panel)
- [ ] TODO-105 | Suggestions | “Based on what you follow…” suggestions with transparent rationale.
- [ ] TODO-106 | Suggestions | No opaque “For You” ranking without explanation.

---

## Remove / Defer (to avoid feature drift)
**Goal:** Preserve focus for 1.4; revisit later if aligned.**

- [ ] TODO-120 | Defer | Community Tab (local resources) — move to 1.6+ unless core to launch.
- [ ] TODO-121 | Defer | Streaks/fire-emoji dashboards — defer to avoid engagement bias.
- [ ] TODO-122 | Defer | “Trending in Pittsburgh” — defer until metric definition is clear and non-creepy.

---

## Website/Marketing (Other Repo)
**Goal:** Launch-ready web presence that drives beta signups and trust without bloat.**

### Landing Page & Web Presence
- [ ] TODO-130 | Web | Marketing landing page with email capture, hero screenshot, feature highlights, and responsive layout.
- [ ] TODO-131 | Web | About page (story, mission/values, Pittsburgh focus).
- [ ] TODO-132 | Web | Features page showcasing RSVP, Grounding Mode, iOS 26 UI, customization, with screenshots/recordings.
- [ ] TODO-133 | Web | FAQ + footer links (Privacy, Terms, Contact) and optional blog/news section if time allows.

### SEO & Discovery
- [ ] TODO-134 | SEO | Keyword research + meta titles/descriptions + OG/Twitter cards.
- [ ] TODO-135 | SEO | Schema.org markup, XML sitemap, robots.txt.
- [ ] TODO-136 | Analytics | GA4 or Plausible tracking for signups/TestFlight clicks with funnel basics.

### Social, Launch Content, Community
- [ ] TODO-137 | Social | Stand up Twitter/X, Instagram, LinkedIn with consistent branding; optional TikTok.
- [ ] TODO-138 | Social | Launch content calendar (teasers → highlights → launch day → post-launch updates).
- [ ] TODO-139 | Community | Discord/Slack for beta testers + ProductHunt/HN/Reddit launch prep.

### Press & Media Kit
- [ ] TODO-140 | Press | Media kit: app icon, screenshots (light/dark), preview video, product fact sheet, founder bio, press contact.
- [ ] TODO-141 | Press | Launch press release + targeted outreach list (Pittsburgh + tech press) with follow-up plan.

### App Store Optimization (ASO)
- [ ] TODO-142 | ASO | App name/subtitle/keywords + promotional text.
- [ ] TODO-143 | ASO | Screenshot set with captions across device sizes + short preview video.
- [ ] TODO-144 | ASO | Future localization plan (start with Spanish).

### Technical Infrastructure (Web)
- [ ] TODO-145 | Web Perf | Lighthouse 90+ targets: image optimization (WebP/lazy), minimized JS, fast loads <3s.
- [ ] TODO-146 | Reliability | Uptime monitoring + error/performance tracking; broken link checks.
- [ ] TODO-147 | Email | ESP setup (SendGrid/Mailgun/Postmark), templates, deliverability monitoring, unsubscribe handling.

---

## Security Playbook (GitHub Repos: Website + App)
**Goal:** Reduce compromise risk and keep supply chain clean.**

### 0) Baseline assumptions
- `main` is the protected integration branch.
- All changes land via PR (even if solo).
- CI runs on PRs and on a schedule.
- No secrets are ever committed to git (including “temporary” ones).

### 1) Repo settings (one-time hardening)
- [ ] TODO-150 | Security | Enable branch protection for `main` (PR required, approval, status checks, conversation resolution; optional: signed commits/push restrictions).
- [ ] TODO-151 | Security | Enable Dependabot alerts + security updates.
- [ ] TODO-152 | Security | Enable code scanning (PR + scheduled on default branch).
- [ ] TODO-153 | Security | Enable secret scanning + push protection (if available).
- [ ] TODO-154 | Security | Harden GitHub Actions: least-privilege permissions, pin third-party Actions by SHA, separate checks vs deploy, block secrets on untrusted PRs, limit reruns.
- [ ] TODO-155 | Security | Add SECURITY.md, CODEOWNERS, and tighten `.gitignore` for env/build outputs.

### 2) Secrets policy (do not negotiate with history)
- [ ] TODO-156 | Secrets | Enforce “no secrets in repo/client”; use provider or GitHub secrets.
- [ ] TODO-157 | Secrets | Incident playbook: revoke/rotate immediately, remove from code paths, audit access logs, rewrite history only after rotation.

### 3) Dependency + supply chain safety (ongoing)
- [ ] TODO-158 | Supply Chain | Weekly Dependabot triage; patch high/critical quickly; avoid unmaintained deps.
- [ ] TODO-159 | Supply Chain | Lockfiles committed; avoid `latest` for critical deps; pin/limit third-party web scripts.

### 4) Code scanning + quality gates (ongoing)
- [ ] TODO-160 | Quality | Required checks: CI build, lint/format, code scanning; triage alerts within 24–72h (fix/mitigate or narrowly suppress false positives).

### 5) Release integrity (app + website)
- [ ] TODO-161 | Release | Tag releases (vX.Y.Z), keep CHANGELOG entries, prefer release branches/protected tags.
- [ ] TODO-162 | Access | Enable 2FA; least-privilege collaborators/tokens; rotate long-lived tokens periodically.

### 6) Repo-specific notes
- [ ] TODO-163 | Web Security | No secrets in static site; pin and audit third-party JS; gate deploy workflows via environments.
- [ ] TODO-164 | App Security | No hardcoded API keys; keep mobile dependencies current; protect build/signing credentials from PR exposure.

### 7) Cadence checklist (repeatable)
- [ ] TODO-165 | Cadence Weekly | Review Dependabot alerts/PRs; check code scanning and secret scanning alerts.
- [ ] TODO-166 | Cadence Per PR | Verify required checks, no unpinned new Actions, no secrets/config leaks.
- [ ] TODO-167 | Cadence Monthly | Review Actions permissions/environments; audit access tokens; dependency health spot-check.

---

### Backlog maintenance notes
- Merged duplicate backlogs into a single, ordered Version 1.4 spine.
- Added TODO IDs (029–167) and scoped bullets to be execution-ready and non-duplicative.
- Clarified phase goals and moved offline/controls items to coherent homes.
- Trimmed Website/Marketing into goal-led sections and tightened Security Playbook into checklist tasks.
