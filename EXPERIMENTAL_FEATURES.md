# Experimental Features

This document outlines experimental features that are available for testing but not yet part of the default user experience.

## iOS 26 Navbar (BETA)

### Overview
An experimental implementation of iOS 26 SwiftUI glass morphism design language applied to the bottom navigation bar. This feature demonstrates advanced blur and transparency effects that provide a more modern, premium appearance.

### How to Enable
1. Navigate to **Settings → Tab Bar Settings**
2. Scroll down to the **Appearance** section
3. Toggle **Experimental iOS 26 Navbar** (marked with BETA badge)
4. The bottom navigation bar will immediately reflect the enhanced glass morphism effects

### What Changes
When enabled, the experimental iOS 26 navbar applies:
- **Enhanced Blur Intensity**: Increases from 60 to 80 for a stronger glass effect
- **Higher Opacity**: Background becomes more opaque (0.95 vs 0.85) to define the glass surface better
- **Better Visual Definition**: Creates a more pronounced "floating" appearance with improved depth perception

### Technical Details
- **Setting Key**: `experimentalIOS26NavBar` in AsyncStorage
- **Default**: Disabled (false)
- **Platform**: iOS primary, with Android fallback
- **Dependencies**: `expo-blur` for native iOS blur effects

### Code Changes
- **SettingsContext.tsx**: Added boolean state with async persistence
- **LiquidTabBar.tsx**: Conditional blur intensity based on feature flag
- **TabBarSettingsScreen.tsx**: UI toggle with BETA badge indicator

### Testing
To test this feature:
1. Enable the setting in TabBar Settings
2. Observe the enhanced blur and opacity on the bottom navigation bar
3. Scroll through content to see blur opacity animation effects
4. Toggle on/off to compare the visual difference
5. The effect works best on iOS with supported devices

### Feedback
This experimental feature allows users to opt-in to test new design improvements before they become the default. Your feedback on the visual appearance and performance is valuable for future iterations.

### Stability
- **Status**: Experimental (may change or be removed)
- **Performance Impact**: Minimal (uses native iOS blur)
- **Breaking Changes**: None (backward compatible)
- **Support**: Not officially supported; use at own risk

---

**Note**: Experimental features are subject to change without notice. Settings are preserved in AsyncStorage, so your preference will be remembered even after closing the app.
