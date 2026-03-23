# Backlog

## Version 1.4 - The Refinement Release (In Progress)

**Vision:** Transform 1.4 into a polished, delightful experience that feels thoughtfully crafted in every interaction. Not just feature-complete, but genuinely special.

**Recent release:** **v1.3.6** — Patch release stabilizing auth/settings (merged PR #2, 2026-01-26).

---

### Onboarding & Grounding Polish
- [x] Prevent overflow on grounding slide; keep breath bar and copy fully inside the card.
- [x] Full-width grounding style selector cards with visual previews and generous vertical spacing.
- [x] Centered, margin-aware pagination and action buttons with breathable padding.
- [ ] Capture updated screenshots for docs and App Store metadata.

### Phase 1: Core Data & Persistence 🗄️

#### Saved Articles System (Enhanced)
- [ ] **Persistent Storage with AsyncStorage**
    - Migrate SavedArticlesContext to use AsyncStorage
    - Add versioned schema for future migrations
    - ✅ Implement data compression for large article bodies
    - Add save/load error handling with retry logic
    - Migration from in-memory state on first launch
- [ ] **Reading Progress Tracking**
    - Track scroll position in articles (resume where you left off)
    - Track RSVP reading progress (which word you stopped at)
    - Show progress indicators on ArticleCards (20%, 50%, 100% read)
    - ✅ "Continue Reading" section on HomeScreen for in-progress articles
- [ ] **Smart Collections & Tags**
    - Auto-tag articles by category and topic
    - "Read Later" vs "Archived" states
    - Favorites/priority marking with star icon
    - Last read timestamp and reading duration tracking

---

### Phase 2: Refresh & Discovery ♻️

#### Pull-to-Refresh Implementation
- [x] **HomeScreen Pull-to-Refresh**
    - ✅ Smooth pull-to-refresh with native RefreshControl
    - ✅ Timestamp tracking (lastUpdated state)
    - ✅ Separate refreshing state (no full-screen loading on pull)
    - ✅ Show "Updated 2m ago" timestamp (UI)
    - ✅ Haptic feedback on refresh trigger
- [x] **SectionScreen Pull-to-Refresh**
    - ✅ Consistent refresh UX across all sections
    - ✅ Timestamp tracking per section
    - ✅ Show "Updated 2m ago" timestamp
    - ✅ Smart caching (don't re-fetch if < 5 minutes old)
- [x] **SavedScreen Pull-to-Refresh**
    - Placeholder refresh with updated timestamp + haptic; ready to plug in metadata (view counts, comments) when available
# Backlog (Adjusted)

## Version 1.4 — The Refinement Release (In Progress)

**Vision:** Polish the reading experience and navigation surfaces so the app feels calm, intentional, and Apple-native. Add trust + explicit intent features that complete the mental model without expanding surface area.

---

### Priority Fixes & Stability — Do These First

- [x] Stabilize auth/settings (backported & released in v1.3.6 — see PR #2)
- [x] Audit fix: restore real engineering gates (TypeScript clean, Jest green, Sentry/Jest ESM config)
- [x] Audit fix: RSS feed resilience (real error states, retry/cached-state UI, timestamp sort by `publishedAt`)
- [x] Audit fix: reading progress architecture (in-memory source of truth, batched persistence, profile-scoped keys)
- [x] Audit fix: persist active profile selection and isolate profile-specific state consistently
- [x] Audit fix: What's New/version gating (mark seen state so post-onboarding flow does not loop)
- [x] Audit fix: theme migration completion (replace static `theme/colors` imports with reactive theme tokens)
- [x] Audit fix: patch production dependency vulnerabilities in the feed/network runtime stack
- [ ] Save/load resilience for SavedArticles (error handling + migration from in-memory on first launch)
- [ ] Network/Feed error states (offline-friendly, retries, last-updated labeling)
- [ ] Loading/skeleton experience (avoid blank screens; progressive image loading)
- [ ] Offline indicator + queued actions (save/unsave) until reconnected
- [ ] Accessibility audit (VoiceOver, Dynamic Type, contrast)
- [ ] Global animation + haptics controls (respect Reduce Motion, provide overrides)

---

### Release 1.4 Salvage

- [x] Rebuild the digest slice on the current baseline
  - [x] Remove the embedded Perplexity key from app code
  - [x] Store the optional Perplexity key in Settings only
  - [x] Swap Daily Digest off `MOCK_ARTICLES` and onto live feed data
  - [x] Restore launch controls in Digest & Launch settings
  - [x] Keep extractive fallbacks and honest digest error states when AI or feed calls fail
- [ ] Salvage profile-based feed recency tracking from `release/1.4.0` without reintroducing profile persistence regressions
- [ ] Salvage remaining onboarding/profile polish from `release/1.4.0` in small tested slices instead of merging the branch wholesale

---

### Onboarding & Grounding Polish
- [x] Prevent overflow on grounding slide; keep breath bar and copy fully inside the card.
- [x] Full-width grounding style selector cards with visual previews and generous vertical spacing.
- [x] Centered, margin-aware pagination and action buttons with breathable padding.
- [ ] Capture updated screenshots for docs and App Store metadata.

---

## Phase 1: Core Data & Persistence 🗄️ (Keep)

### Saved Articles System (Enhanced)
- [ ] Persistent Storage with AsyncStorage
  - [ ] Migrate SavedArticlesContext to AsyncStorage
  - [ ] Add versioned schema for future migrations
  - [x] Implement data compression for large article bodies (schema v2)
  - [ ] Save/load error handling with retry logic
  - [ ] Migration from in-memory state on first launch

### Reading Progress Tracking
- [ ] Track scroll position in articles (resume where you left off)
- [ ] Track RSVP progress (word index + timestamp)
- [ ] Progress indicators on ArticleCards (unread/in-progress/completed)
- [x] Continue Reading section on HomeScreen for in-progress articles

### Smart Collections & States (Rename for clarity)
- [ ] Reading state model: Read Later / Archived / Favorite
- [ ] Last read timestamp
- [ ] (Optional) Reading duration tracking (local-only)

---

## Phase 2: Empty, Error, Loading States 🎨

### Network Error State
- [ ] Offline-friendly error UI (“Can’t connect” + last successful update)
- [ ] Retry with loading state
- [ ] Show cached items with a subtle “From cache” label

### Feed Load Error
- [ ] “Couldn’t load new stories” + timestamp of last success
- [ ] Pull to retry

### Loading / Skeletons
- [ ] Skeleton cells for feeds (avoid blank screen)
- [ ] Progressive image loading (reserve space to prevent layout jumps)
- [ ] Optional contextual loading messages (keep minimal and calm)

---

## Phase 3: Accessibility & Controls ♿

### Global Animation + Haptics Controls
- [ ] Global toggle: Enable Animations
- [ ] Respect Reduce Motion (system), allow override
- [ ] Animation speed/scale (0.5×–2×)
- [ ] Global haptics toggle + intensity levels

### Accessibility Audit
- [ ] VoiceOver labels everywhere + announce state changes
- [ ] Dynamic Type stress test (largest/smallest)
- [ ] Contrast checks (light/dark + colorblind friendliness)

---

## Phase 4: Offline & Caching 🚀 (Keep, but make it coherent)

### Offline Reading Support
- [ ] Cache full article content when saved
- [ ] Cache images for saved articles
- [ ] Cache cleanup (LRU, size limit)
- [ ] Offline indicator (“Offline” badge in status area)
- [ ] Queue actions (save/unsave) when offline, apply on reconnect

---

## Phase 5: Refresh & Discovery ♻️ (Keep)

### Pull-to-Refresh Implementation
- [x] HomeScreen pull-to-refresh + timestamp + haptics
- [x] SectionScreen pull-to-refresh + per-section timestamp + cache TTL
- [x] SavedScreen pull-to-refresh scaffold + timestamp + haptics

### Search & Filter (Power User Features)
- [x] SavedScreen debounced search + recent queries
- [x] Filters (source/category/status/date)
- [x] Sorting (newest/oldest/progress/length/source)
- [x] “No results” state with clear action

---

## Phase 6: Trust & Intent (NEW, iOS 26-native) 🧭

### Trust Panel — “Why am I seeing this?”
**Goal:** Make feed logic legible and non-manipulative.

- [ ] ArticleScreen overflow action: “Why am I seeing this?”
- [ ] Present as BlurSheet (medium/large detents)
- [ ] Panel includes:
  - [ ] Source + canonical link domain
  - [ ] Feed context (Top / Local / Digest)
  - [ ] Relevance reason (Local tag, Followed source/topic, Digest bucket)
  - [ ] Sensitive content flags + grounding rationale (if applicable)
  - [ ] Last updated timestamp (screen-level vs item-level correct placement)
- [ ] Copy tone: calm, factual, non-judgmental
- [ ] Accessibility: VoiceOver reads as one combined summary

### Follow System (explicit choice, no algorithm creep)
- [ ] Follow Source (from ArticleScreen + Sources screen)
- [ ] Follow Topic (from ArticleScreen tags or inferred topic list)
- [ ] Follow Location scope (v1: Pittsburgh; later: neighborhoods/radius)
- [ ] Profile → Manage:
  - [ ] Sources you follow
  - [ ] Topics you follow
  - [ ] Location scope
- [ ] Feed integration:
  - [ ] Follows influence ordering/sections, but do NOT hide non-followed content by default
  - [ ] Provide a clear “Following” section inside Top/Digest (not a new tab)

---

  ## Phase 7: Reader Identity (NEW) 🎛️

### Reader Studio (RSVP as an instrument, not a toggle)
**Goal:** Reduce settings sprawl and make “how you read” feel intentional.

- [ ] Create Reader Studio surface (Profile → Reader Studio)
- [ ] Contents:
  - [ ] RSVP speed presets (saved presets + quick selection)
  - [ ] Focus anchor strategy selector
  - [ ] Grounding style selector (swipeable cards, visual previews)
  - [ ] Contrast + motion preferences (links to settings where needed)
- [ ] Uses iOS 26 components:
  - [ ] NavigationHeader title + subtitle (no duplicate inline context)
  - [ ] BlurSheet for deeper configuration
- [ ] Ensure classic RSVP “writing” / pacing is preserved (do not over-sanitize)

---

## Phase 8: Profiles (Reduce scope, align to product) 👤

### Profile Screen (Practical, calm)
- [ ] Profile screen redesign focused on navigation + utility (not gamification-first)
  - [ ] Quick actions: Settings, Send Feedback, Share App
  - [ ] Entry points: Reader Studio, Sources/Topics, Reading History (when added)
- [ ] Avoid streak/fire-emoji gamification in 1.4 (can revisit later)

> NOTE: “Profile tab integration” is already done per changelog. Keep only what remains.

---

## Phase 9: Pre-Launch Essentials 📱 (Keep)

### Legal & Compliance
- [ ] Privacy policy (Sentry, Perplexity, storage)
- [ ] Terms of service + first-launch acceptance

### Feedback & Support
- [ ] In-app feedback mail with device/app info
- [ ] Help/FAQ section

### App Store Preparation
- [ ] App Store Connect setup
- [ ] Screenshots & preview video (show RSVP + glass UI + trust panel)

---

## Version 1.5+ — Future Features (Roadmap-aligned)

### Reading History (local-first)
- [ ] Recently read list + resume points
- [ ] Clear history control
- [ ] Surface in Profile and/or Continue Reading

### Editorial Quote / Excerpt Sharing
- [ ] Share selected paragraph or RSVP-highlighted text as image card
- [ ] Include attribution + source
- [ ] Keep it editorial, not viral

### Smart Suggestions (Only after Follow + Trust Panel)
- [ ] “Based on what you follow…” suggestions (explicit, transparent)
- [ ] No opaque “For You” ranking without explanation

---

## Remove / Defer (to avoid feature drift)

- [ ] Community Tab (local resources) — move to 1.6+ unless it’s core to launch
- [ ] Streaks/fire emoji dashboards — defer (can bias behavior toward engagement)
- [ ] “Trending in Pittsburgh” — defer until you have clear, non-creepy metric definition

---

## Website/Marketing (Other Repo)

### Landing Page & Web Presence
- [ ] Marketing Landing Page
  - [ ] Email capture form for TestFlight beta access with Mailchimp/ConvertKit integration
  - [ ] Hero section with app screenshot and compelling headline
  - [ ] Feature highlights with icons and descriptions
  - [ ] Video demo or animated GIF of RSVP reader in action
  - [ ] Social proof section (beta tester testimonials once available)
  - [ ] FAQ section addressing common questions
  - [ ] Footer with links to Privacy Policy, Terms, Contact
  - [ ] Responsive design for mobile/tablet/desktop
- [ ] About Page
  - [ ] Story behind Abridged (why it exists)
  - [ ] Mission and values
  - [ ] Team introduction (if applicable)
  - [ ] Pittsburgh connection and local focus
- [ ] Features Page
  - [ ] Detailed breakdown of key features:
    - [ ] RSVP Reader with interactive demo
    - [ ] Grounding Mode explanation
    - [ ] iOS 26 UI showcase
    - [ ] Customization options
    - [ ] Pittsburgh local news focus
  - [ ] Screenshots and screen recordings
  - [ ] Comparison to other news apps (subtle, not aggressive)
- [ ] Blog/News Section (Optional)
  - [ ] Launch announcement posts
  - [ ] Feature deep-dives
  - [ ] Pittsburgh news aggregation (meta-content)
  - [ ] Development updates and behind-the-scenes
  - [ ] SEO-optimized content for discovery

### SEO & Discovery
- [ ] Search Engine Optimization
  - [ ] Keyword research (news app, Pittsburgh news, RSVP reading, speed reading, etc.)
  - [ ] Meta titles and descriptions for all pages
  - [ ] Open Graph tags for social sharing
  - [ ] Twitter Card tags
  - [ ] Schema.org markup for app
  - [ ] XML sitemap
  - [ ] robots.txt configuration
- [ ] Google Analytics & Tracking
  - [ ] GA4 setup with conversion tracking
  - [ ] Track email signups, TestFlight clicks, page views
  - [ ] Funnel analysis (landing → signup → download)
  - [ ] Plausible Analytics alternative (privacy-focused)
- [ ] Domain & Hosting
  - [ ] Purchase domain (abridgd.app or similar)
  - [ ] Set up hosting (Vercel, Netlify, or Cloudflare Pages)
  - [ ] SSL certificate (automatic with most hosts)
  - [ ] CDN configuration for fast global loading
  - [ ] Configure DNS records

### Social Media & Community
- [ ] Social Media Presence
  - [ ] Twitter/X account (@abridgdapp or similar)
  - [ ] Instagram account for visual content
  - [ ] Optional: TikTok for short demos
  - [ ] LinkedIn page (for press and professional outreach)
  - [ ] Consistent branding across all platforms
- [ ] Launch Content Calendar
  - [ ] Pre-launch teasers (2-3 weeks before)
  - [ ] Feature highlights (one per week)
  - [ ] Behind-the-scenes development content
  - [ ] Beta tester spotlights
  - [ ] Launch day announcements
  - [ ] Post-launch updates and milestones
- [ ] Community Building
  - [ ] Discord or Slack community for beta testers
  - [ ] Reddit presence (r/pittsburgh, r/apps, relevant subreddits)
  - [ ] ProductHunt launch preparation
  - [ ] Hacker News post (Show HN: format)
  - [ ] Pittsburgh-specific forums and communities

### Press & Media Kit
- [ ] Press Kit
  - [ ] High-resolution app icon (multiple sizes)
  - [ ] Screenshots for press (light and dark mode)
  - [ ] App Store preview video for embedding
  - [ ] Company/product description (short, medium, long versions)
  - [ ] Founder/developer bio and photo
  - [ ] Press contact information
  - [ ] Product fact sheet
- [ ] Press Release
  - [ ] Launch announcement press release
  - [ ] Target: Pittsburgh tech blogs, local news outlets
  - [ ] Tech press (TechCrunch, The Verge, etc. - reach high)
  - [ ] Submit to PR distribution services
- [ ] Media Outreach
  - [ ] List of target publications and journalists
  - [ ] Personalized pitch emails
  - [ ] Review copies/TestFlight access for journalists
  - [ ] Follow-up schedule
  - [ ] Track coverage and mentions

### Beta Program Management
- [ ] Beta Testing Hub
  - [ ] Dedicated beta signup page
  - [ ] TestFlight instructions and troubleshooting
  - [ ] Beta tester onboarding email sequence
  - [ ] Feedback collection system (Typeform, Google Forms, or custom)
  - [ ] Beta tester recognition/rewards
  - [ ] Private Discord/Slack channel for testers
- [ ] Beta Tester Resources
  - [ ] Testing guide and priorities
  - [ ] Known issues list (updated regularly)
  - [ ] Feature roadmap visibility
  - [ ] How to submit bug reports
  - [ ] Feature request process

### App Store Optimization (ASO)
- [ ] App Store Assets (if not in app repo)
  - [ ] App name optimization
  - [ ] Subtitle (30 characters)
  - [ ] Keyword optimization (100 characters)
  - [ ] Screenshots with captions (all device sizes)
  - [ ] Preview video (15-30 seconds)
  - [ ] Promotional text (170 characters)
- [ ] App Description
  - [ ] Compelling opening paragraph
  - [ ] Feature bullet points
  - [ ] Pittsburgh focus highlighted
  - [ ] Call-to-action
  - [ ] Regular updates based on new features
- [ ] Localization (Future)
  - [ ] Spanish translation (large Pittsburgh demographic)
  - [ ] Additional languages based on demand

### Analytics & Growth
- [ ] Conversion Optimization
  - [ ] A/B test landing page headlines
  - [ ] Test different CTAs (button text, colors, placement)
  - [ ] Optimize email signup form (fields, copy, positioning)
  - [ ] Heat mapping (Hotjar or similar)
  - [ ] Session recordings to identify friction points
- [ ] Email Marketing
  - [ ] Welcome email sequence for signups
  - [ ] Launch announcement email
  - [ ] Feature update emails
  - [ ] Monthly newsletter (optional)
  - [ ] Re-engagement campaigns for inactive testers
  - [ ] Segmentation by user behavior
- [ ] Referral Program (Future)
  - [ ] Refer-a-friend incentives
  - [ ] Social sharing buttons and pre-written tweets
  - [ ] Track referral sources
  - [ ] Reward top referrers

### Legal & Compliance (Web)
- [ ] Legal Pages on Website
  - [ ] Privacy Policy (same as in-app)
  - [ ] Terms of Service (same as in-app)
  - [ ] Cookie policy (if using cookies)
  - [ ] DMCA policy (if applicable)
  - [ ] Accessibility statement
- [ ] Cookie Consent
  - [ ] GDPR-compliant cookie banner
  - [ ] Cookie preferences management
  - [ ] Clear explanation of tracking

### Technical Infrastructure
- [ ] Website Performance
  - [ ] Lighthouse score optimization (aim for 90+)
  - [ ] Image optimization (WebP format, lazy loading)
  - [ ] Minimize JavaScript bundle size
  - [ ] Fast loading on slow connections (< 3s)
- [ ] Monitoring & Uptime
  - [ ] Uptime monitoring (UptimeRobot, Pingdom)
  - [ ] Error tracking (Sentry for web)
  - [ ] Performance monitoring
  - [ ] Broken link checker
- [ ] Email Infrastructure
  - [ ] Email service provider setup (SendGrid, Mailgun, or Postmark)
  - [ ] Transactional email templates
  - [ ] Email deliverability monitoring
  - [ ] Unsubscribe management

### Post-Launch Marketing
- [ ] Content Marketing
  - [ ] “How to use RSVP reading” guide
  - [ ] “Best Pittsburgh news sources” article
  - [ ] “Digital wellness and news consumption” thought pieces
  - [ ] Guest posts on relevant blogs
  - [ ] Pittsburgh news aggregation (meta-content)
- [ ] Partnerships
  - [ ] Reach out to Pittsburgh influencers and bloggers
  - [ ] Partner with local organizations
  - [ ] Cross-promotion with complementary apps
- [ ] App Store Features
  - [ ] Submit for App Store featuring
  - [ ] “Apps We Love” pitch
  - [ ] Time-based featuring opportunities (e.g., News & Events)
  - [ ] Collection inclusion pitches

### Metrics & KPIs
- [ ] Track Success Metrics
  - [ ] Website traffic (unique visitors, pageviews)
  - [ ] Email signup conversion rate
  - [ ] TestFlight download rate
  - [ ] App Store impressions and conversions
  - [ ] User retention rates
  - [ ] Active users (DAU, MAU)
  - [ ] Feature usage analytics
  - [ ] Net Promoter Score (NPS)
  - [ ] App Store ratings and reviews

---

## Security Playbook (GitHub Repos: Website + App)

Goal: reduce account/repo compromise risk, prevent secrets leaks, and catch vulnerable dependencies/unsafe code before it ships.

### 0) Baseline assumptions
- `main` is the protected integration branch.
- All changes land via PR (even if solo).
- CI runs on PRs and on a schedule.
- No secrets are ever committed to git (including “temporary” ones).

---

### 1) Repo settings (one-time hardening)

#### 1.1 Protect how code gets into `main`
- [ ] Enable branch protection for `main`
  - [ ] Require pull request before merging (no direct pushes)
  - [ ] Require at least 1 approval
  - [ ] Require status checks to pass before merging (CI + security scans)
  - [ ] Require conversation resolution before merging
  - [ ] (Optional) Require signed commits
  - [ ] (Optional) Restrict who can push to matching branches

#### 1.2 Enable GitHub-native security features
- [ ] Enable Dependabot alerts
- [ ] Enable Dependabot security updates (auto PRs)
- [ ] Enable code scanning (CodeQL or equivalent)
  - [ ] Run on PRs
  - [ ] Run on default branch (scheduled)
- [ ] Enable secret scanning
- [ ] Enable secret scanning push protection (if available)

#### 1.3 Harden GitHub Actions (CI/CD attack surface)
- [ ] Set workflow permissions to least privilege (avoid broad write tokens)
- [ ] Pin third-party Actions to a commit SHA (not a moving tag)
- [ ] Separate “checks” workflows from “deploy” workflows
- [ ] Ensure deploy workflows do NOT run with secrets on untrusted PR code
- [ ] Limit who can approve/rerun privileged workflows (environments, reviewers)

#### 1.4 Add basic security docs + ownership
- [ ] Add `SECURITY.md` (how to report vulnerabilities, expected response)
- [ ] Add `CODEOWNERS` (even if it's just you)
- [ ] Add/update `.gitignore` to prevent committing local env files, build outputs, keys

---

### 2) Secrets policy (do not negotiate with the repo history)

#### 2.1 Rules
- [ ] Never store API keys/tokens in the repo (including config files)
- [ ] Never store secrets in client apps (mobile/web) as “hidden strings” (assume extractable)
- [ ] Use GitHub Secrets / Environment Secrets or your hosting provider's secret store

#### 2.2 If a secret is committed (incident response)
- [ ] Assume it is compromised
- [ ] Revoke/rotate immediately (provider dashboard)
- [ ] Remove from code paths
- [ ] Audit access logs if available
- [ ] If necessary, rewrite history ONLY after rotation (history rewrite is not rotation)

---

### 3) Dependency + supply chain safety (ongoing)

#### 3.1 Continuous dependency maintenance
- [ ] Review Dependabot PRs weekly (or as they arrive)
- [ ] Patch high/critical vulnerabilities ASAP
- [ ] Avoid unmaintained dependencies when alternatives exist

#### 3.2 Locking and provenance
- [ ] Use lockfiles when supported and commit them
- [ ] Avoid “latest” ranges for critical deps where possible
- [ ] For website: treat third-party scripts as supply-chain risk (pin versions, minimize vendors)

---

### 4) Code scanning + quality gates (ongoing)

#### 4.1 Required checks (must pass to merge)
- [ ] CI build passes (app + site)
- [ ] Lint/format (as applicable)
- [ ] Code scanning passes (or findings are triaged with documented rationale)

#### 4.2 Triage rules
- [ ] Security alerts are triaged within 24–72 hours
- [ ] High/critical: fix or mitigate before release
- [ ] False positives: document why and suppress narrowly

---

### 5) Release integrity (app + website)

#### 5.1 Git hygiene
- [ ] Tag releases (e.g., `vX.Y.Z`)
- [ ] Keep a simple CHANGELOG entry per release
- [ ] Prefer release branches or protected tags for production

#### 5.2 Access control
- [ ] Enable 2FA on GitHub account
- [ ] Use least privilege collaborators and tokens
- [ ] Rotate long-lived tokens periodically

---

### 6) Repo-specific notes

#### Website repo (common pitfalls)
- [ ] No secrets in static site code (analytics keys still matter)
- [ ] Minimize third-party JS; pin versions; audit periodically
- [ ] If using Actions for deploy: treat deploy as privileged, gated via environments

#### App repo (common pitfalls)
- [ ] No hardcoded API keys (clients can be reverse engineered)
- [ ] Keep dependencies current (SwiftPM/CocoaPods/Carthage)
- [ ] Ensure build/signing credentials are protected and not exposed to PR builds

---

### 7) Cadence checklist (repeatable)

Weekly:
- [ ] Review Dependabot alerts/PRs
- [ ] Check code scanning findings
- [ ] Check secret scanning alerts

Per PR:
- [ ] Confirm required checks run and pass
- [ ] Verify no new third-party Actions were added unpinned
- [ ] Verify no secrets/config leaks

Monthly:
- [ ] Review GitHub Actions permissions & environments
- [ ] Audit access tokens and remove unused ones
- [ ] Quick dependency “health” audit (maintained? trusted? necessary?)
    - Beta tester spotlights
