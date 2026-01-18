# Backlog

## High Priority
- [x] **RSS Ingestion**: Connect to real data sources.
- [ ] **Enhance RSVP/Onboarding Tutorial**: Improve the existing onboarding flow with more interactive RSVP training
    - Add progressive speed training starting at 150-200 WPM
    - Better explain the "focus point" concept with visual aids
    - Add practice exercises to help users "graduate" to higher speeds
    - Consider adding refresher tutorials accessible from settings

### Pre-Launch/Beta Essentials
- [ ] **Privacy Policy & Terms of Service**: Create legal pages (link in app and App Store)
- [ ] **In-App Feedback Mechanism**: Add easy way for beta testers to submit feedback
- [ ] **Crash Reporting/Analytics**: Implement Sentry, Firebase Crashlytics, or similar
- [ ] **App Store Listing Optimization**: Refine keywords, description, screenshots

## Medium Priority

### Core Features
- [ ] **Share Article Functionality**: Share to social media, messages, email
- [ ] **Search Saved Articles**: Add search/filter within saved articles
- [ ] **Pull to Refresh**: Implement pull-to-refresh on feeds
- [ ] **Offline Reading Support**: Cache articles for offline access
- [ ] **Article Filtering**: Filter by category, date, or source

### Existing Features
- [ ] Connect `ArticleService` interface.
- [x] Local Storage for Saved Articles (using AsyncStorage).
- [x] Dark Mode Support (automatic theme switching).
    - [x] RSVP Reader specific dark mode styling (black background, white text).
- [ ] **Community Tab**: New section for protests, events, and resources (food banks, markets) filtered by Pittsburgh area.
- [ ] **Profile/Settings Navigation**: Replace Settings button with dedicated Profile tab in tab bar following Apple HIG
    - Move Settings to be accessible via Profile tab
    - Profile screen shows user info + settings access
    - Follows Apple's pattern of having profile/account in tab bar

### User Experience Polish
- [ ] **Empty States**: Design empty states for saved articles, feeds when no content
- [ ] **Error Handling**: Improve error recovery for network issues
- [ ] **Loading States**: Refine loading state animations/feedback
- [x] **Haptic Feedback**: Add haptic feedback for key interactions (implemented with expo-haptics)
- [ ] **Fine-Tune Grounding Mode Classification**: Improve when grounding mode prompts appear
    - [ ] Create sensitivity classifier utility to auto-detect sensitive keywords/topics in headlines and content
    - [ ] Add sensitivity level gradations (none, low, medium, high) instead of binary sensitive flag
    - [ ] Add topic tags (violence, tragedy, health, politics, accidents, etc.) for granular categorization
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
- [ ] **iPad Optimization**: Optimize layout for larger screens
- [ ] **Share Extension**: Save articles from Safari
- [ ] **Siri Shortcuts**: Voice commands for common actions

## Completed ✅
- [x] Basic onboarding flow with app introduction (completed)
- [x] RSVP reader demo in onboarding (completed)
- [x] Grounding/breathing exercise feature (completed)
- [x] Tab bar customization with minimal/comprehensive layouts (completed)
- [x] Settings screens structure (Reading, Digest, Customization, Sources, Tab Bar, Debug) (completed)

## Website/Marketing (Other Repo)
- [ ] **Marketing Landing Page**: Create webpage for app marketing and beta signup
    - Email capture form for TestFlight beta access
    - App overview and features showcase
    - Link to TestFlight once approved
    - Update/enhance onboarding tutorial explanation on website
    - Note: This is for the website repository
