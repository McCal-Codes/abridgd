# Accessibility Audit — Dark Mode & Dynamic Type

Version 1.0  
Last Updated: January 15, 2026

## Purpose

Our engineering standards (and Apple HIG) require full support for:
- **Dark Mode**: Both light and dark color schemes
- **Dynamic Type**: Adjustable text sizes (from Extra Small to Extra Large, and Accessibility sizes)
- **VoiceOver**: Screen reader navigation and labeling
- **Contrast**: WCAG AA minimum contrast ratios

This document tracks the audit status and known gaps.

---

## Test Matrix

### Dark Mode Testing

| Screen | Light Mode | Dark Mode | Status | Notes |
|--------|-----------|----------|--------|-------|
| Home (Feed) | ✅ | ⚠️ Partial | 🔴 To Do | Colors not verified; needs manual test |
| Article | ✅ | ❓ Unknown | 🔴 To Do | Need to check background/text contrast |
| Saved | ✅ | ⚠️ Partial | 🔴 To Do | Navigation bar hard to read in dark |
| Settings | ✅ | ✅ | 🟢 Done | Custom theme selector verified |
| Digest (Future) | — | — | 🟡 N/A | Feature not yet implemented |

**Dark Mode Checklist:**
- [ ] Home screen: text, tabs, tab bar background contrast measured
- [ ] Article screen: article body text, title, metadata legible in dark mode
- [ ] Saved screen: list items, empty state message readable
- [ ] Settings screen: form inputs, toggles, section headers visible
- [ ] Navigation: tab icons and labels visible in dark mode
- [ ] Images: featured images have sufficient contrast/readability in dark context

### Dynamic Type Testing

| Screen | XS | S | M | L | XL | XXL | Accessibility | Status | Notes |
|--------|----|----|----|----|----|----|---|--------|-------|
| Home | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | ❓ | 🔴 To Do | No scaling observed yet |
| Article | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | ❓ | 🔴 To Do | Heading oversized in Large+ |
| Saved | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | ❓ | 🔴 To Do | List items may overlap |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 Done | All sizes tested and working |

**Dynamic Type Checklist:**
- [ ] Home: Feed titles and metadata scale proportionally; no truncation at XL+
- [ ] Article: Body text, heading, metadata all readable at XS and XXL
- [ ] Saved: List items don't overlap; spacing adjusts with text size
- [ ] Settings: Form labels and values readable at all sizes
- [ ] Custom fonts: If custom fonts are used, ensure they scale with system Dynamic Type setting

### VoiceOver Navigation

| Screen | Buttons Labeled | Custom Controls Labeled | Navigation Order | List Items | Status |
|--------|-----------------|------------------------|--------------------|------------|--------|
| Home | ✅ | ⚠️ | ✅ | ❓ | 🔴 To Do | Some custom elements unlabeled |
| Article | ✅ | ⚠️ | ✅ | N/A | 🔴 To Do | Need to label save button |
| Saved | ✅ | — | ✅ | ❓ | 🔴 To Do | List item interactions unclear |
| Settings | ✅ | ✅ | ✅ | ✅ | 🟢 Done | All controls labeled |

**VoiceOver Checklist:**
- [ ] Home: All buttons have descriptive labels; tab navigation order is logical
- [ ] Article: Save button labeled; share button labeled; back button labeled
- [ ] Saved: Delete button labeled for each item; empty state explained
- [ ] Settings: Toggle switches explained (e.g., "Dark mode: On"); form fields labeled
- [ ] Custom icons: All icon-only buttons have `accessibilityLabel` props
- [ ] Navigation: Tab names clear and concise (single nouns preferred)

### Contrast Verification

| Element | Light BG | Light FG | Ratio | Dark BG | Dark FG | Ratio | WCAG AA (4.5:1) |
|---------|----------|----------|-------|---------|---------|-------|-----------------|
| Primary Text | #FFFFFF | #000000 | — | #121212 | #FFFFFF | — | Check both |
| Secondary Text | #FFFFFF | #666666 | — | #121212 | #AAAAAA | — | Check both |
| Primary Button | #0066CC | #FFFFFF | ? | #0066CC | #FFFFFF | ? | Verify |
| Error Text | #B00020 | #FFFFFF | ? | #FF6B6B | #121212 | ? | Verify |
| Borders | #FFFFFF | #CCCCCC | ? | #1E1E1E | #444444 | ? | Verify |

**Contrast Checklist:**
- [ ] Use WebAIM Contrast Checker or similar tool to verify all color pairs
- [ ] Minimum ratio for normal text: 4.5:1
- [ ] Minimum ratio for large text (18pt+): 3:1
- [ ] Check both light and dark mode; document in `src/theme/colors.ts`

---

## Known Issues & Fixes Needed

### High Priority (Release-Blocking)

- **Issue**: Article screen heading not responsive to Dynamic Type at XXL
  - **Fix**: Use `allowFontScaling={true}` prop on `Text` component; avoid fixed font sizes
  - **Owner**: Frontend (to assign)
  - **Effort**: 1–2 hours

- **Issue**: Navigation tab labels not visible in dark mode
  - **Fix**: Use semantic color token (`text` instead of hardcoded `#000000`)
  - **Owner**: Frontend (to assign)
  - **Effort**: 30 min

### Medium Priority (Next Release)

- **Issue**: Home screen feed list items may overlap at XL Dynamic Type
  - **Fix**: Adjust spacing/padding; test with content at larger sizes
  - **Owner**: Frontend (to assign)
  - **Effort**: 1 hour

- **Issue**: Save button on article screen not labeled for VoiceOver
  - **Fix**: Add `accessibilityLabel="Save article"` prop
  - **Owner**: Frontend (to assign)
  - **Effort**: 15 min

### Low Priority (Backlog)

- **Issue**: Article metadata (author, date) uses hardcoded gray color; not semantic
  - **Fix**: Use `textSecondary` token from theme
  - **Owner**: Design review needed
  - **Effort**: 30 min

---

## Audit Checklist (For QA & Designers)

Before shipping a release, run this checklist:

- [ ] **Dark Mode**: Open app in dark mode on 1 iOS device + 1 simulator; spot-check main screens
- [ ] **Dynamic Type**: 
  - Open Settings → Accessibility → Larger Accessibility Sizes (or Custom)
  - Set to XXL; navigate Home, Article, Saved; check for overflow/truncation
  - Set to XS; check nothing is too small to read or tap
- [ ] **VoiceOver**: 
  - Enable Settings → Accessibility → VoiceOver
  - Navigate through Home, Article, Saved tabs using VoiceOver gestures
  - Confirm all buttons and interactive elements are labeled
  - Check that navigation order makes sense
- [ ] **Contrast**: Run WCAG contrast check on 3 key screens (Home, Article, Settings)
- [ ] **Device Coverage**: Test on at least 2 iOS versions (current and N-1)

---

## Tools & Resources

- **Contrast Checker**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Accessibility Inspector**: Xcode → Accessibility Inspector (built-in)
- **Dynamic Type Tester**: React Native Testing Library + custom test harness
- **VoiceOver**: iOS Settings → Accessibility → VoiceOver (toggle on/off as needed)

---

## Tracking & Next Steps

| Task | Owner | Due | Status |
|------|-------|-----|--------|
| Home Dark Mode test | — | ASAP | 🔴 Not Started |
| Article Dark Mode test | — | ASAP | 🔴 Not Started |
| Dynamic Type XXL test (all screens) | — | ASAP | 🔴 Not Started |
| VoiceOver label audit | — | Before Release | 🔴 Not Started |
| Contrast ratio verification | — | Before Release | 🔴 Not Started |
| Fix high-priority issues (3 items) | — | Next Release | 🔴 Not Started |

---

## See also

- [Preflight](preflight.md) → section 5 (Accessibility Preflight)
- [Afterflight](afterflight.md) → section 3 (Regression Test Matrix, spot-checks)
- [UI & Design Standards](ui-design.md) → dark mode and typography sections
- [ADR 0004](adr/0004-theming-and-semantic-colors.md) → how colors are managed
