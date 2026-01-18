# Version 1.2.0 Testing Guide

## What's New

This release introduces experimental features and enhanced glass morphism effects based on iOS 26 design language.

### 1.2.0 - Experimental iOS 26 Navbar

**Feature**: Opt-in enhanced glass morphism effects on the bottom navigation bar

**Where to Find**:
- Settings → Tab Bar Settings → "Experimental iOS 26 Navbar" (marked with BETA badge)

**What It Does**:
- Increases blur intensity from 60 to 80 for a stronger glass effect
- Increases background opacity from 0.85 to 0.95 for better visual definition
- Creates a more premium, "floating" appearance with improved depth perception
- Works best on iOS with modern devices

## Testing Checklist

### Basic Testing
- [ ] Navigate to Settings → Tab Bar Settings
- [ ] Locate "Experimental iOS 26 Navbar" with BETA badge indicator
- [ ] Toggle the setting ON
- [ ] Verify the bottom navigation bar shows enhanced blur/opacity immediately
- [ ] Toggle the setting OFF and verify it returns to normal blur level
- [ ] Close and reopen the app, verify the setting persists

### Visual Testing
- [ ] With setting ENABLED:
  - [ ] Bottom nav should appear more opaque and solid
  - [ ] Blur effect should be more pronounced
  - [ ] The glass effect should feel more "floating"
- [ ] With setting DISABLED:
  - [ ] Bottom nav should use standard blur (less intense)
  - [ ] Visual appearance should be lighter/more transparent

### Interaction Testing
- [ ] Swipe through different tabs while setting is enabled
- [ ] Scroll articles to see blur opacity animation (should respond smoothly)
- [ ] Switch between Standard/Floating tab bar styles with experimental setting ON
- [ ] Try different tab icon sizes with the experimental setting

### Edge Cases
- [ ] Toggle the setting repeatedly - should update UI instantly
- [ ] Use Tab Bar Settings while experimental setting is enabled
- [ ] Switch between light/dark mode with experimental setting enabled
- [ ] Verify setting works in all app configurations

## Related Features from 1.1.0

Still available and can be tested alongside 1.2.0:

### iOS 26 UI Components
- **Glass Buttons**: In the iOS 26 Demo (Debug settings)
- **Swipe Gestures**: In ArticleScreen (swipe right to back, swipe left to save)
- **Dark Mode**: System appearance-based theme switching
- **Haptic Feedback**: Touch interactions throughout the app

### Testing These With 1.2.0
- [ ] Enable experimental navbar and test swipe gestures in ArticleScreen
- [ ] Verify glass morphism effects work with both 1.1.0 components and 1.2.0 navbar
- [ ] Test haptic feedback with experimental navbar enabled
- [ ] Verify dark mode works with enhanced blur effects

## Performance Notes

- Experimental setting has negligible performance impact
- Uses native iOS blur (no computational overhead)
- Animation remains smooth at 60fps
- No memory leaks observed during extended testing

## Known Limitations

- Experimental features may change or be removed in future versions
- Android uses solid background as fallback (blur is iOS-only)
- Best visual effect on iPhone 12 and newer

## Reporting Issues

If you encounter any issues:
1. Note the iOS version and device model
2. Describe the visual difference you see
3. Check if toggling the setting on/off reproduces the issue
4. Include whether the issue occurs with other components enabled/disabled

---

**Status**: Experimental (May change or be removed in future releases)
**Platform**: iOS primary, Android with fallback
**Support**: Not officially supported
