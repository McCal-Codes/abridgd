# Backlog

## Version 1.4 - The Refinement Release (In Progress)

**Vision:** Transform 1.4 into a polished, delightful experience that feels thoughtfully crafted in every interaction. Not just feature-complete, but genuinely special.

---

### Phase 1: Core Data & Persistence 🗄️

#### Saved Articles System (Enhanced)
- [ ] **Persistent Storage with AsyncStorage**
    - Migrate SavedArticlesContext to use AsyncStorage
    - Add versioned schema for future migrations
    - Implement data compression for large article bodies
    - Add save/load error handling with retry logic
    - Migration from in-memory state on first launch
- [ ] **Reading Progress Tracking**
    - Track scroll position in articles (resume where you left off)
    - Track RSVP reading progress (which word you stopped at)
    - Show progress indicators on ArticleCards (20%, 50%, 100% read)
    - "Continue Reading" section on HomeScreen for in-progress articles
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
    - ⏳ Show "Updated 2m ago" timestamp (state tracked, UI pending)
    - ⏳ Haptic feedback on refresh trigger (future enhancement)
- [x] **SectionScreen Pull-to-Refresh**
    - ✅ Consistent refresh UX across all sections
    - ✅ Timestamp tracking per section
    - ⏳ Smart caching (don't re-fetch if < 5 minutes old)
- [ ] **SavedScreen Pull-to-Refresh**
    - Refresh metadata for saved articles (view counts, comment counts if applicable)

#### Search & Filter (Power User Features)
- [ ] **Saved Articles Search**
    - Search bar in SavedScreen header (animated slide-down)
    - Real-time search with debouncing (300ms)
    - Search by headline, source, category, content preview
    - Highlight matching text in results
    - Recent searches history (last 5)
- [ ] **Advanced Filtering**
    - Filter by source (multi-select chips)
    - Filter by category (multi-select)
    - Filter by reading status (unread, in-progress, completed)
    - Filter by date added (today, this week, this month, older)
    - "Apply Filters" bottom sheet with live preview count
    - Save filter presets ("Unread Local News", "Today's Sports", etc.)
- [ ] **Sort Options**
    - Sort by date added (newest/oldest)
    - Sort by reading progress
    - Sort by article length (quick reads first)
    - Sort by source
---

### Phase 6: Profiles & Community 👥

#### Profile Tab (Active & Engaging)
- [ ] **Profile Screen Redesign**
    - User avatar/icon (with theme-aware colors)
    - Reading statistics dashboard:
        - Articles read this week/month/all-time
        - Current reading streak (with fire emoji 🔥)
        - Total reading time logged
        - Favorite categories (top 3 with percentages)
    - Quick actions: Settings, Send Feedback, Share App
    - "Sign in with Apple" CTA (for future sync features)
- [ ] **Profile Tab Integration**
    - Add Profile tab to bottom navigation (per Apple HIG)
    - Move Settings access to Profile screen
    - Profile icon in tab bar (User icon from lucide)
    - Badge notification for new features/tips

#### Community Tab (Pittsburgh-Focused)
- [ ] **Resource Categories**
    - Food Security: Food banks, pantries, free meals
    - Fresh Food: Farmers markets, community gardens, CSAs
    - Community Events: Festivals, meetups, workshops
    - Mutual Aid: Local support networks, volunteer opportunities
    - Civic Engagement: Town halls, protests, advocacy (opt-in)
- [ ] **Resource Cards**
    - Beautiful cards with location, hours, description
    - "Get Directions" button (opens Maps)
    - "Save to Favorites" functionality
    - "Share Resource" option
    - Distance from user (if location permission granted)
- [ ] **Submit Resource Form**
    - Simple form: Name, category, address, description, hours
    - Photo upload (optional)
    - "Submit for Review" (moderated before publishing)
    - Thank you message after submission
- [ ] **Filters & Search**
    - Filter by category
    - Filter by distance (needs location)
    - Search by name or keyword
    - "Open Now" filter for time-sensitive resources
- [ ] **Community Guidelines**
    - Clear explanation of what belongs in Community
    - Link to submit guidelines and moderation policy
    - Report inappropriate content option

---

### Phase 7: Animation & Accessibility ✨

#### Animation Settings (Global Control)
- [ ] **Animation Preferences Screen**
    - New section in Customization Settings
    - Global toggle: "Enable Animations" (master switch)
    - Respect system "Reduce Motion" preference
    - Allow override: "Use app setting instead of system"
    - Animation speed slider: 0.5× to 2× (default 1×)
    - Preview animations in settings (test button)
- [ ] **Per-Component Controls**
    - ZoomModal animation toggle
    - BlurSheet animation toggle
    - LiquidTabBar transitions toggle
    - Page transition effects toggle
    - Skeleton screen shimmer toggle
- [ ] **Apply Animation Settings**
    - Update all animated components to respect global settings
    - Provide instant/snap alternatives when animations disabled
    - Maintain haptics even when animations disabled (if enabled)

#### Comprehensive Accessibility Audit
- [ ] **VoiceOver Support**
    - Test entire app with VoiceOver enabled
    - Add meaningful labels to all interactive elements
    - Proper heading hierarchy in all screens
    - Announce state changes (article saved, refreshed, etc.)
    - Custom actions for swipe gestures (accessibility alternative)
- [ ] **Dynamic Type Support**
    - Test all screens at largest and smallest text sizes
    - Ensure no text truncation or layout breaks
    - Proper scaling of UI elements relative to text
    - Use UIFontMetrics equivalent for custom fonts
- [ ] **Color Contrast**
    - Ensure all text meets WCAG AA standards (4.5:1 minimum)
    - Test in light and dark mode
    - Verify colorblind-friendly palette (already using cyan)
    - Add high contrast mode option (if needed)
- [ ] **Keyboard Navigation** (if applicable)
    - Support for external keyboard on iPad
    - Logical tab order
    - Keyboard shortcuts for common actions
- [ ] **Haptic Feedback Options**
    - Global haptics toggle in settings
    - Intensity control (light, medium, strong)
    - Different feedback types for different actions

---

### Phase 8: Performance & Polish 🚀

#### Performance Optimization
- [ ] **Memory Management**
    - Profile memory usage across all screens
    - Optimize image loading (proper sizing, caching)
    - Release unused resources when navigating away
    - Fix any memory leaks (especially in RSVP reader)
- [ ] **Load Time Optimization**
    - Lazy load images below fold
    - Prefetch next articles while scrolling
    - Cache parsed RSS data (with TTL)
    - Optimize bundle size (remove unused dependencies)
    - Code splitting for rarely-used screens
- [ ] **Animation Performance**
    - Ensure 60fps on all transitions
    - Use native driver for all animations (where possible)
    - Reduce overdraw in complex views
    - Profile animations with React DevTools
- [ ] **Network Optimization**
    - Request batching for multiple feeds
    - Retry logic with exponential backoff
    - Cancel in-flight requests when navigating away
    - Compression for API responses

#### Offline Support & Caching
- [ ] **Article Caching System**
    - Cache full article content when saved
    - Cache images for saved articles
    - Automatic cache cleanup (LRU, max 100 articles or 500MB)
    - "Download for Offline" manual option
- [ ] **Offline Indicator**
  # Phase 10: Final Polish & Delight 💎

#### Micro-Interactions (Details Matter)
- [ ] **Haptic Feedback Refinement**
    - Different haptic types for different actions (success, warning, error)
    - Haptic on pull-to-refresh trigger point
    - Subtle haptic on tab switch
    - Satisfying haptic on article save
    - Gentle haptic on completing RSVP article
- [ ] **Sound Effects (Optional, Toggleable)**
    - Subtle sound on article save (soft "pop")
    - Completion sound for finishing RSVP article
    - Global toggle: "Enable Sound Effects" (off by default)
- [ ] **Animations & Transitions**
    - Smooth page curl on article navigation
    - Bounce effect on pull-to-refresh release
    - Satisfying scale effect on button press
    - Fluid tab bar item transitions
    - Staggered list item animations (cascade effect)
- [ ] **Loading Personality**
    - Fun loading messages that rotate:
        - "Brewing your news..."
        - "Gathering stories..."
        - "Almost there..."
        - "Fetching the good stuff..."
    - Different messages for different contexts
    - Occasional easter egg messages

#### Smart Features (Anticipate User Needs)
- [ ] **Smart Suggestions**
    - "Based on your reading, you might like..." section
    - Suggest enabling features after certain usage patterns:
        - After 10 articles: "Try RSVP mode for faster reading!"
        - After saving 5 articles: "Enable auto-save on completion?"
    - "Trending in Pittsburgh" section (most-read local articles)
- [ ] **Reading Insights**
    - Weekly reading recap notification (optional)
    - "You read 12 articles this week! 🎉"
    - Most-read category highlight
    - Reading time comparison to last week
- [ ] **Adaptive UI**
    - Remember preferred tab bar style (docked vs floating)
    - Remember preferred reading speed per article type
    - Adjust suggested RSVP speed based on completion rate
    - Auto-enable grounding mode if user always accepts it

#### Quality of Life Improvements
- [ ] **iOS 26 Demo Navigation**
    - Add NavigationHeader to iOS26DemoScreen
    - Back button to return to Debug settings
    - Document path: Settings → Debug → iOS 26 UI Demo
- [ ] **Settings Search** (Future)
    - Search bar in main Settings screen
    - Find any setting instantly
    - Jump directly to setting screen
- [ ] **Quick Actions** (Home Screen - iOS)
    - 3D Touch shortcuts from home screen:
        - "Read Top Story"
        - "Open Saved Articles"
        - "Add to Reading List" (with share extension)

---

##  - Show "Offline" badge in status area when no connection
    - Show which articles are available offline (cloud icon with checkmark)
    - Allow reading cached articles without connection
    - Queue actions (save, unsave) when offline, sync when online
- [ ] **Smart Sync**
    - Auto-sync saved articles when on WiFi
    - Background refresh for saved articles (iOS BackgroundTasks)
    - Conflict resolution (if same article edited on multiple devices in future)

---

### Phase 9: Pre-Launch Essentials 📱

#### Legal & Compliance
- [ ] **Privacy Policy**
    - Comprehensive privacy policy document
    - Cover: data collection, storage, third-party services (Sentry, Perplexity)
    - Link in Settings → About
    - Link in onboarding final screen
    - Also available at website URL
- [ ] **Terms of Service**
    - Clear terms of service document
    - Cover: acceptable use, user content, disclaimers
    - Link in Settings → About
    - Must accept on first launch (checkbox)

#### Feedback & Support
- [ ] **In-App Feedback System**
    - "Send Feedback" in Settings → About
    - Pre-filled email with device info, app version, iOS version
    - Categories: Bug Report, Feature Request, General Feedback
    - Optional screenshot attachment
    - Thank you message after sending
- [ ] **FAQ Section**
    - Common questions in Settings → Help
    - How to use RSVP reader
    - How to customize settings
    - What's grounding mode?
    - How to add sources
    - Troubleshooting tips

#### Crash Reporting & Monitoring
- [ ] **Sentry Configuration**
    - Proper DSN and environment setup
    - Release versioning and source maps
    - User context (anonymous ID, not PII)
    - Custom error boundaries with fallback UI
    - Performance monitoring enabled
- [ ] **Error Recovery**
    - Graceful error handling everywhere
    - User-friendly error messages (no stack traces)
    - Retry options for failed operations
    - Log errors to Sentry for investigation

#### App Store Preparation
- [ ] **App Store Connect Setup**
    - Prepare app description (compelling, clear)
    - Keywords optimization for ASO
    - Age rating determination
    - Content rights verification
- [ ] **Screenshots & Preview Video**
    - Beautiful screenshots for all device sizes
    - Showcase key features (RSVP, glass UI, settings)
    - Optional preview video (15-30 seconds)
- [ ] **TestFlight Beta**
    - Internal testing with team (if applicable)
    - External beta testing with 20-50 testers
    - Collect feedback and iterate
    - Beta tester thank you message
    - Total reading time logged
    - Favorite sources/categories
    - Share your reading stats as a card

---

### Phase 4: Empty States & Error Handling 🎨

#### Beautiful Empty States
- [x] **SavedScreen Empty State** ✅
    - ✅ Illustrated graphic (bookmark icon with glow + sparkles)
    - ✅ Helpful message: "Your reading list is empty"
    - ✅ CTA button: "Explore Top Stories" (tab-aware navigation)
    - ✅ Tips: "Swipe left on any article card to save it for later"
- [ ] **Search No Results**
    - Friendly message with search term
    - Suggestions: "Try different keywords" or "Clear filters"
    - Quick action: "View all saved articles"
- [ ] **Network Error State**
    - Airplane mode illustration
    - Clear explanation: "Can't connect to the internet"
    - Offline articles available (if any cached)
    - Retry button with loading state
- [ ] **Feed Load Error**
    - Gentle error message (not scary)
    - "Couldn't load new stories" with timestamp of last successful load
    - Show cached/old articles with "from cache" badge
    - Pull to retry

#### Loading States & Skeleton Screens
- [ ] **Smart Loading UI**
    - Skeleton screens for ArticleCards (don't show blank screen)
    - Shimmer effect on loading placeholders
    - Staggered skeleton reveal (feels faster)
    - Progressive image loading with blur-up effect
- [ ] **Contextual Loading Messages**
    - "Fetching local news..." (HomeScreen)
    - "Loading your saved articles..." (SavedScreen)
    - "Getting full story..." (ArticleScreen when fetching full text)
    - "Generating summary..." (when AI is processing)

---

### Phase 5: Onboarding & First-Time Experience 🎓

#### Enhanced Onboarding (Progressive & Delightful)
- [ ] **RSVP Speed Training (4-Step Journey)**
    - Step 1: Welcome & concept intro (existing)
    - Step 2: Slow practice (150 WPM) - "Find your rhythm"
    - Step 3: Medium practice (250 WPM) - "Feeling comfortable?"
    - Step 4: Fast practice (350 WPM) - "You're a natural!"
    - Interactive speed adjuster during practice
    - Success celebration with haptics when completing each level
- [ ] **Focus Point Explanation**
    - Visual diagram showing eye position
    - Animated demonstration of pivot letter concept
    - "Why this works" science explanation (brief)
    - A/B test different anchor strategies during onboarding
- [ ] **Grounding Mode Introduction**
    - Gentle explanation of why we offer this
    - Quick breathing exercise demo (15 seconds)
    - Opt-in choice: "Enable Grounding Mode?" (default: yes)
- [ ] **Personalization Questions**
    - "What news matters most to you?" (select categories)
    - "Reading speed preference?" (show estimated articles/hour)
    - "Tab bar style?" (preview minimal vs comprehensive)
- [ ] **Onboarding Completion Reward**
    - "Welcome home" message with confetti animation
    - First article suggestion based on interests
    - Optional: Enable notifications for daily digest

#### Tips & Hints System
- [ ] **Contextual Tooltips**
    - First time viewing article: "👈 Swipe left to save for later"
    - First saved article: "✨ Find your saved articles in the Saved tab"
    - After 5 articles: "🚀 Try Abridged Mode for faster reading"
    - Show once, never annoying
- [ ] **Settings Discoverability**
    - "New" badge on recently added settings
    - Feature callouts: "Try the experimental iOS 26 navbar!"
    - Guided tour option in Settings (optional restart of onboarding)

---

### Profiles & Community (Included in 1.4)
- [ ] Profiles tab in tab bar (Account overview, settings access, saved content)
- [ ] Community tab with local resources:
    - [ ] Food banks and mutual aid
    - [ ] Farmers markets and events
    - [ ] Protest/event listings (curated, opt-in)
    - [ ] Submit-a-resource form (moderated)
- [ ] Navigation updates to place Profile tab per Apple HIG
- [ ] Accessibility pass for new tabs

### Advanced Customization (Included in 1.4)
- [ ] Global animation enable/disable toggle
- [ ] Reduce Motion preference (respect system setting, allow override)
- [ ] Animation speed/scale control (0.5× – 2×)
- [ ] Apply settings to ZoomModal, BlurSheet, LiquidTabBar transitions

### Additional Features for 1.4
- [ ] Offline reading support with article caching
- [ ] Advanced article filtering (by category, date, source)
- [ ] App Store Connect submission preparation
- [ ] Comprehensive accessibility audit (VoiceOver, Dynamic Type, contrast)
- [ ] Performance optimization pass (memory, load times, animations)

---

## Version 1.5+ - Future Features (Backlog)

## Completed High Priority ✅
- [x] **RSS Ingestion**: Connect to real data sources.

## Future Backlog

### Core Features (Future)

### Offline & Caching (Future)
- [ ] **Offline Reading Support**: Cache articles for offline access
- [ ] **Article Filtering**: Filter by category, date, or source

### RSS Parser Enhancements (Future)
- [x] Implement source-specific full-article parsers for truncated feeds (WTAE, WPXI, CBS) - Completed in 1.1.0
- [x] Improve HTML content parsing for images/galleries - Completed in 1.1.0
- [ ] Add per-source normalization (author, timestamps, categories)
- [ ] Consider adding additional local sources (WESA/NPR, Technical.ly Pittsburgh) after validation
- [ ] Animation Settings (moved to 1.4+):
    - [ ] Global animation enable/disable toggle
    - [ ] Reduce Motion preference (respect system setting, allow override)
    - [ ] Animation speed/scale control (0.5× – 2×)
    - [ ] Apply settings to ZoomModal, BlurSheet, LiquidTabBar transitions

### User Experience Polish
- [ ] **Empty States**: Design empty states for saved articles, feeds when no content
- [ ] **Error Handling**: Improve error recovery for network issues
- [ ] **Loading States**: Refine loading state animations/feedback
- [x] **Haptic Feedback**: Add haptic feedback for key interactions (implemented with expo-haptics)
- [ ] **Fine-Tune Grounding Mode Classification**: Improve when grounding mode prompts appear
    - [ ] Create sensitivity classifier utility to auto-detect sensitive keywords/topics in headlines and content
    - [ ] Add sensitivity level gradations (none, low, medium, high) instead of binary sensitive flag
    - [ ] Add topic tags (violence, tragedy, health, politics, accidents, etc.) for granular categorization
    - [ ] Provide optional political perspective context (Right, Center, Left) for political articles so readers can choose their preferred viewpoint
    - [ ] Create grounding trigger settings UI so users can customize which levels/topics prompt grounding
    - [ ] Implement smart detection in RssService to automatically classify articles
    - [ ] Update ArticleScreen to use new sensitivity levels and topic-based triggers
    - Consider ML-based detection vs keyword-based patterns

### Technical Improvements
- [ ] **Accessibility Audit**: VoiceOver, Dynamic Type, color contrast compliance
- [ ] **Test Coverage**: Expand unit/integration tests
- [ ] **Performance Optimization**: Memory usage, load times, animation performance

## Low Priority
- [ ] **Awards**: Implement awards system/display.
- [ ] **Account System**:
    - [ ] Profile/Account creation with username
    - [ ] Export settings as copyable string (JSON-based for portability)
    - [ ] Import settings from copied string
    - [ ] Eventually upgrade to full authentication/backend login
    - Allows users to sync preferences across devices without full backend

### Future/Nice-to-Have
- [ ] **Push Notifications**: Breaking news alerts
- [ ] **Home Screen Widget**: Quick glance at top stories

### Version 1.2.0 (2026-01-18)
- [x] Experimental iOS 26 navbar option with feature flag

### Version 1.1.0 (2026-01-18)
- [x] Real RSS integration from Pittsburgh sources
- [x] Full article fetching service with source-specific parsers
- [x] HTML content parser for images and structured content
- [x] AI summarization service (Perplexity API)
- [x] iOS 26 UI component system (GlassButton, NavigationHeader, BottomToolbar, ZoomModal, BlurSheet)
- [x] RSVP Reader (Abridged Mode) with configurable speeds
- [x] Auto-save on reading completion
- [x] Grounding mode with breathing exercises
- [x] Swipe gestures (back navigation, save/unsave)
- [x] Dark mode with automatic theme switching
- [x] Comprehensive settings system (6 screens)
- [x] Tab bar customization (add/remove/reorder)
- [x] Haptic feedback throughout app
- [x] Profile system structure
- [x] Error handling system
- [x] Basic onboarding flow with app introduction
- [x] RSVP reader demo in onboarding
- [x] Settings screens structure (Reading, Digest, Customization, Sources, Tab Bar, Debug
- [x] Basic onboarding flow with app introduction (completed)
- [x] RSVP reader demo in onboarding (completed)
- [x] Grounding/breathing exercise feature (completed)
- [x] Tab bar customization with minimal/comprehensive layouts (completed)
- [x] Settings screens structure (Reading, Digest, Customization, Sources, Tab Bar, Debug) (completed)

## Website/Marketing (Other Repo)

### Landing Page & Web Presence
- [ ] **Marketing Landing Page**
    - Email capture form for TestFlight beta access with Mailchimp/ConvertKit integration
    - Hero section with app screenshot and compelling headline
    - Feature highlights with icons and descriptions
    - Video demo or animated GIF of RSVP reader in action
    - Social proof section (beta tester testimonials once available)
    - FAQ section addressing common questions
    - Footer with links to Privacy Policy, Terms, Contact
    - Responsive design for mobile/tablet/desktop
- [ ] **About Page**
    - Story behind Abridged (why it exists)
    - Mission and values
    - Team introduction (if applicable)
    - Pittsburgh connection and local focus
- [ ] **Features Page**
    - Detailed breakdown of key features:
        - RSVP Reader with interactive demo
        - Grounding Mode explanation
        - iOS 26 UI showcase
        - Customization options
        - Pittsburgh local news focus
    - Screenshots and screen recordings
    - Comparison to other news apps (subtle, not aggressive)
- [ ] **Blog/News Section** (Optional)
    - Launch announcement posts
    - Feature deep-dives
    - Pittsburgh news aggregation (meta-content)
    - Development updates and behind-the-scenes
    - SEO-optimized content for discovery

### SEO & Discovery
- [ ] **Search Engine Optimization**
    - Keyword research (news app, Pittsburgh news, RSVP reading, speed reading, etc.)
    - Meta titles and descriptions for all pages
    - Open Graph tags for social sharing
    - Twitter Card tags
    - Schema.org markup for app
    - XML sitemap
    - robots.txt configuration
- [ ] **Google Analytics & Tracking**
    - GA4 setup with conversion tracking
    - Track email signups, TestFlight clicks, page views
    - Funnel analysis (landing → signup → download)
    - Plausible Analytics alternative (privacy-focused)
- [ ] **Domain & Hosting**
    - Purchase domain (abridgd.app or similar)
    - Set up hosting (Vercel, Netlify, or Cloudflare Pages)
    - SSL certificate (automatic with most hosts)
    - CDN configuration for fast global loading
    - Configure DNS records

### Social Media & Community
- [ ] **Social Media Presence**
    - Twitter/X account (@abridgdapp or similar)
    - Instagram account for visual content
    - Optional: TikTok for short demos
    - LinkedIn page (for press and professional outreach)
    - Consistent branding across all platforms
- [ ] **Launch Content Calendar**
    - Pre-launch teasers (2-3 weeks before)
    - Feature highlights (one per week)
    - Behind-the-scenes development content
    - Beta tester spotlights
    - Launch day announcements
    - Post-launch updates and milestones
- [ ] **Community Building**
    - Discord or Slack community for beta testers
    - Reddit presence (r/pittsburgh, r/apps, relevant subreddits)
    - ProductHunt launch preparation
    - Hacker News post (Show HN: format)
    - Pittsburgh-specific forums and communities

### Press & Media Kit
- [ ] **Press Kit**
    - High-resolution app icon (multiple sizes)
    - Screenshots for press (light and dark mode)
    - App Store preview video for embedding
    - Company/product description (short, medium, long versions)
    - Founder/developer bio and photo
    - Press contact information
    - Product fact sheet
- [ ] **Press Release**
    - Launch announcement press release
    - Target: Pittsburgh tech blogs, local news outlets
    - Tech press (TechCrunch, The Verge, etc. - reach high)
    - Submit to PR distribution services
- [ ] **Media Outreach**
    - List of target publications and journalists
    - Personalized pitch emails
    - Review copies/TestFlight access for journalists
    - Follow-up schedule
    - Track coverage and mentions

### Beta Program Management
- [ ] **Beta Testing Hub**
    - Dedicated beta signup page
    - TestFlight instructions and troubleshooting
    - Beta tester onboarding email sequence
    - Feedback collection system (Typeform, Google Forms, or custom)
    - Beta tester recognition/rewards
    - Private Discord/Slack channel for testers
- [ ] **Beta Tester Resources**
    - Testing guide and priorities
    - Known issues list (updated regularly)
    - Feature roadmap visibility
    - How to submit bug reports
    - Feature request process

### App Store Optimization (ASO)
- [ ] **App Store Assets** (if not in app repo)
    - App name optimization
    - Subtitle (30 characters)
    - Keyword optimization (100 characters)
    - Screenshots with captions (all device sizes)
    - Preview video (15-30 seconds)
    - Promotional text (170 characters)
- [ ] **App Description**
    - Compelling opening paragraph
    - Feature bullet points
    - Pittsburgh focus highlighted
    - Call-to-action
    - Regular updates based on new features
- [ ] **Localization** (Future)
    - Spanish translation (large Pittsburgh demographic)
    - Additional languages based on demand

### Analytics & Growth
- [ ] **Conversion Optimization**
    - A/B test landing page headlines
    - Test different CTAs (button text, colors, placement)
    - Optimize email signup form (fields, copy, positioning)
    - Heat mapping (Hotjar or similar)
    - Session recordings to identify friction points
- [ ] **Email Marketing**
    - Welcome email sequence for signups
    - Launch announcement email
    - Feature update emails
    - Monthly newsletter (optional)
    - Re-engagement campaigns for inactive testers
    - Segmentation by user behavior
- [ ] **Referral Program** (Future)
    - Refer-a-friend incentives
    - Social sharing buttons and pre-written tweets
    - Track referral sources
    - Reward top referrers

### Legal & Compliance (Web)
- [ ] **Legal Pages on Website**
    - Privacy Policy (same as in-app)
    - Terms of Service (same as in-app)
    - Cookie policy (if using cookies)
    - DMCA policy (if applicable)
    - Accessibility statement
- [ ] **Cookie Consent**
    - GDPR-compliant cookie banner
    - Cookie preferences management
    - Clear explanation of tracking

### Technical Infrastructure
- [ ] **Website Performance**
    - Lighthouse score optimization (aim for 90+)
    - Image optimization (WebP format, lazy loading)
    - Minimize JavaScript bundle size
    - Fast loading on slow connections (< 3s)
- [ ] **Monitoring & Uptime**
    - Uptime monitoring (UptimeRobot, Pingdom)
    - Error tracking (Sentry for web)
    - Performance monitoring
    - Broken link checker
- [ ] **Email Infrastructure**
    - Email service provider setup (SendGrid, Mailgun, or Postmark)
    - Transactional email templates
    - Email deliverability monitoring
    - Unsubscribe management

### Post-Launch Marketing
- [ ] **Content Marketing**
    - "How to use RSVP reading" guide
    - "Best Pittsburgh news sources" article
    - "Digital wellness and news consumption" thought pieces
    - Guest posts on relevant blogs
- [ ] **Partnerships**
    - Reach out to Pittsburgh influencers and bloggers
    - Partner with local organizations
    - Cross-promotion with complementary apps
- [ ] **App Store Features**
    - Submit for App Store featuring
    - "Apps We Love" pitch
    - Time-based featuring opportunities (e.g., News & Events)
    - Collection inclusion pitches

### Metrics & KPIs
- [ ] **Track Success Metrics**
    - Website traffic (unique visitors, pageviews)
    - Email signup conversion rate
    - TestFlight download rate
    - App Store impressions and conversions
    - User retention rates
    - Active users (DAU, MAU)
    - Feature usage analytics
    - Net Promoter Score (NPS)
    - App Store ratings and reviews

---

## Security Playbook (GitHub Repos: Website + App)

Goal: reduce account/repo compromise risk, prevent secrets leaks, and catch vulnerable dependencies/unsafe code before it ships.

### 0) Baseline assumptions
- `main` is the protected integration branch.
- All changes land via PR (even if solo).
- CI runs on PRs and on a schedule.
- No secrets are ever committed to git (including "temporary" ones).

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
- [ ] Separate "checks" workflows from "deploy" workflows
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
- [ ] Never store secrets in client apps (mobile/web) as "hidden strings" (assume extractable)
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
- [ ] Avoid "latest" ranges for critical deps where possible
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
- [ ] Quick dependency "health" audit (maintained? trusted? necessary?)
