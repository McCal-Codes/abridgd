# iOS 26 UI Component System

Modern glass morphism UI components inspired by iOS 26 SwiftUI enhancements.

## Overview

The iOS 26 UI system brings Apple's latest design language to React Native with:
- **Glass morphism effects** using native blur on iOS
- **Semantic prominence** for button hierarchy (standard, tinted, filled, destructive)
- **Spring physics animations** for natural motion
- **Gesture-driven interactions** with haptic feedback
- **Light & dark mode support** with automatic switching
- **Safe area handling** throughout

## Documents

### [iOS 26 UI Components](ios26-ui-components.md)
**Complete technical documentation** — Primary reference for implementation details:
- Design principles and SwiftUI mappings
- All 5 components with API references
- Platform differences (iOS blur vs Android solid)
- Integration patterns
- Testing checklist

### [Quick Reference](ios26-quick-reference.md)
**Code examples and patterns** — Copy-paste ready snippets:
- Component cheat sheets
- Common patterns (article actions, settings sheets, confirmation dialogs)
- Styling tips
- Performance optimizations
- Migration guide from standard components

### [Implementation Summary](ios26-implementation-summary.md)
**Executive overview** — High-level implementation summary:
- What was implemented
- Dependencies installed
- SwiftUI → React Native mapping table
- Testing results
- Next steps and potential enhancements

### [Installation Guide](ios26-installation.md)
**Setup instructions** — Getting started:
- Installing dependencies (`expo-blur`, `react-native-gesture-handler`)
- Required imports and wrappers
- ThemeProvider setup
- Troubleshooting installation issues

## Components

### GlassButton
Blur-effect button with semantic prominence styles (standard, tinted, filled, destructive). Includes haptic feedback and disabled states.

**When to use:** Primary actions, confirmation dialogs, toolbars

### NavigationHeader
Custom header with subtitle support, matching SwiftUI's `.navigationSubtitle()` API.

**When to use:** Screens needing contextual subtitles (e.g., "Last updated 2 hours ago")

### BottomToolbar
Glass toolbar with semantic item placement, fixed/flexible spacers, and item groups.

**When to use:** Article actions, editing tools, context-specific actions

### ZoomModal
Modal with zoom transition from source element, matching SwiftUI's `.matchGeometry` effect.

**When to use:** Expanding cards, fullscreen previews, focused interactions

### BlurSheet
Bottom sheet with dynamic transparency based on detent position (medium/large).

**When to use:** Settings panels, filters, contextual menus, confirmations

## Quick Start

```typescript
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/theme/ThemeContext';

function MyScreen() {
  const { colors } = useTheme();

  return (
    <GlassButton
      title="Save Article"
      prominence="filled"
      onPress={() => saveArticle()}
    />
  );
}
```

See [Quick Reference](ios26-quick-reference.md) for more examples.

---

**Related Documentation:**
- [Development Guide](../development/development.md) — Setting up the dev environment
- [Design Standards](../standards/design-standards.md) — UI/UX principles
- [Contributing Guide](../../CONTRIBUTING.md) — iOS 26 component guidelines
