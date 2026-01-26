# TestFlight Testing Guide — Abridged v1.0.0

**Last Updated:** January 16, 2026
**Test Build:** 1.0.0 (Build #1)
**Platform:** iOS

---

## Welcome to Abridged Beta!

Thank you for testing **Abridged**, a calm and focused news reader for Pittsburgh. This guide outlines the features to test and what we're looking for.

---

## 📱 Features to Test

### 1. **Core Navigation**
- [ ] Bottom tab bar displays all 4 tabs: Home, Digest, Saved, Settings
- [ ] Tapping each tab navigates correctly
- [ ] Tab icons are clear and recognizable
- [ ] No crashes when switching between tabs rapidly

### 2. **Home Screen**
- [ ] Articles load and display properly
- [ ] Headlines, summaries, and source information are visible
- [ ] Images (if present) load without distortion
- [ ] Scrolling through article list is smooth
- [ ] Tapping an article navigates to the detail screen

### 3. **Article Detail Screen**
- [ ] Full article text displays clearly
- [ ] Typography is readable (font size, line spacing)
- [ ] Back button returns to previous screen
- [ ] Bookmark button toggles saved state
- [ ] "Read Full Story" link works (opens browser)
- [ ] Layout works on different device sizes (iPhone 14, 15, etc.)

### 4. **Digest Screen**
- [ ] Digest loads and displays a summary of today's news
- [ ] Scrolling is smooth
- [ ] Articles can be tapped to view details
- [ ] "Welcome back" message displays appropriately

### 5. **Saved Articles Screen**
- [ ] Articles can be bookmarked from the article detail screen
- [ ] Bookmarked articles appear in Saved tab
- [ ] Tapping a saved article opens it for reading
- [ ] Removing a bookmark updates the Saved list in real-time
- [ ] Empty state message displays when no articles are saved

### 6. **Settings Screen**
- [ ] All settings menu items display with icons and descriptions
- [ ] Tapping each settings menu item navigates to the correct screen
- [ ] Version number is displayed (1.0.0)
- [ ] Contact email works (opens mail app)
- [ ] Bug report option works (pre-fills email template)

### 7. **Theme & Customization**
- [ ] App uses clean, minimal design
- [ ] Text is readable with good contrast
- [ ] Spacing and alignment are consistent
- [ ] No broken layouts on edge cases (very long titles, etc.)
- [ ] Colors match the design system (see settings)

### 8. **Performance**
- [ ] App launches within 3 seconds
- [ ] Scrolling is smooth and responsive
- [ ] No noticeable lag when switching tabs
- [ ] Memory doesn't grow excessively during normal usage
- [ ] No crashes after 10+ minutes of use

---

## 🐛 Bug Report Template

If you find an issue, please report it with:

1. **What happened:** Clear description of the bug
2. **Steps to reproduce:** How to trigger the issue
3. **Expected behavior:** What should happen
4. **Actual behavior:** What actually happened
5. **Device & iOS version:** e.g., "iPhone 14, iOS 17.2"
6. **Screenshots/video:** Attach if helpful

**Send to:** contact@mcc-cal.com
**Subject:** Bug report: Abridged 1.0.0

---

## 📋 Checklist for Complete Testing

### Launch & First Time Use
- [ ] App installs without errors
- [ ] App launches successfully
- [ ] Onboarding screen (if present) displays correctly
- [ ] Navigation setup completes smoothly

### Daily Use Scenarios
- [ ] **Morning check:** Open app, view home feed, read 1-2 articles
- [ ] **Lunch break:** Open digest, quickly scan news, bookmark interesting article
- [ ] **Evening:** Open saved articles, re-read bookmarked content
- [ ] **Settings exploration:** Check all settings without crashes

### Edge Cases
- [ ] Open app after being closed for 5+ minutes
- [ ] Quickly switch between tabs 5+ times
- [ ] Try to open an article while scrolling
- [ ] Rotate device between portrait and landscape
- [ ] Use with WiFi and cellular networks

### Accessibility (if available)
- [ ] Text is large enough to read comfortably
- [ ] All buttons are easily tappable (48x48px minimum)
- [ ] No visual-only information (colors alone don't convey meaning)

---

## ✅ What We're Looking For

✓ **Stability:** No crashes or hangs
✓ **Performance:** Smooth scrolling and navigation
✓ **Usability:** Intuitive and clear interactions
✓ **Design:** Readable text, good spacing, consistent styling
✓ **Correctness:** Features work as described

---

## 🚀 Known Limitations (v1.0.0)

- **Live Content:** Currently using mock/demo data. Real RSS feeds coming in Phase 2.
- **Offline Mode:** Full offline support coming soon.
- **Dark Mode:** Coming in Phase 4.
- **Abridged Mode (RSVP):** Coming in Phase 3 beta.
- **Grounding Feature:** Emotional safety mode coming soon.

---

## 💬 Feedback

Your feedback shapes Abridged. We'd love to hear about:

- **What works well:** Features that feel intuitive and smooth
- **What's confusing:** Unclear labels, unexpected behaviors
- **What's missing:** Functionality you wish existed
- **Design feedback:** Visual or layout improvements

Send feedback directly to: **contact@mcc-cal.com**

---

## 🙏 Thank You!

Thank you for helping make Abridged better. Your testing and feedback are invaluable to delivering a high-quality app.

**Happy reading!**

---

*Questions? Email contact@mcc-cal.com or open the TestFlight feedback form.*
