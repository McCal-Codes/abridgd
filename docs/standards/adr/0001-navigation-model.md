# ADR 0001: Navigation Model (Tabs + Settings)

**Date**: 2026-01-15  
**Status**: Accepted  
**Author**: Engineering Lead

## Context

The Abridged app is a news digest reader with multiple distinct user workflows:
- Browse and read articles (primary feed)
- Save articles for later
- Customize feed sources and digest settings
- Adjust reading preferences (text size, fonts, dark mode)

We needed a navigation model that is:
1. Intuitive for iOS users (follows Apple HIG)
2. Scalable (room for 1–2 new tabs without cramping the interface)
3. Accessible (VoiceOver-friendly, no gesture overload)

## Decision

**Use a tab bar (3–5 tabs) with a dedicated Settings destination.**

Specifically:
- **Home** (feed): Default tab, shows personalized digest/article list
- **Saved**: Bookmarked articles
- **Digest**: (Future) AI-summarized digest view
- **Settings**: Account, source management, reading preferences

**Rationale for this model:**
- Tab bar is the iOS standard for multi-section apps; users expect it.
- Each tab is a distinct, primary destination (not a flow or modal).
- Settings is a top-level tab (not buried in a menu) because users frequently adjust preferences.
- We reserve room for 1–2 more tabs (e.g., Trending, Offline) without cramping.

## Consequences

**Positive:**
- Users immediately understand the app structure.
- Navigation is persistent and easy to navigate via VoiceOver.
- Settings access is always one tap away.

**Negative:**
- Settings as a tab may feel unusual compared to other news apps (many bury it in a menu).
  - *Mitigated by: Settings tab has a clear icon and label; users quickly learn its location.*
- Adding tabs beyond 5 will require a redesign (e.g., "More" menu).

## Alternatives considered

1. **Hamburger menu with side drawer**
   - Rejected: Less discoverable, harder for VoiceOver users, not iOS convention for main navigation.

2. **Settings in a top-right gear icon**
   - Rejected: Settings are secondary, but the app frequently requires preference changes; deserves a tab.

3. **Slide-over settings panel**
   - Rejected: Gesture-heavy, breaks VoiceOver predictability.

## Implementation notes

- All screens are wrapped in `react-navigation` with bottom-tab navigator.
- Each tab can have its own stack navigator (for drill-down navigation).
- Settings tab includes sub-screens (Sources, Reading Prefs, About).
- See `docs/standards/ui-design.md` for specific styling and safe-area rules.
