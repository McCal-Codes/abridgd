# Abridged App — UI & Design Standards
Version 1.2
Last Updated: January 15, 2026

## Canonical Sources (Authoritative)

All UI decisions must align with Apple's official design system:

- Apple Design Portal
  https://developer.apple.com/design/

- Human Interface Guidelines — Tab Bars
  https://developer.apple.com/design/human-interface-guidelines/tab-bars

- Human Interface Guidelines — Toolbars
  https://developer.apple.com/design/human-interface-guidelines/toolbars#Best-practices

If a design choice contradicts these guidelines, it must be explicitly documented as an intentional deviation.

---

## 1. Core Philosophy (Non-Negotiable)

- Clarity over personality
- Familiar over clever
- Content over chrome

The interface must feel immediately understandable to experienced iOS users without onboarding or explanation. Brand expression should emerge through restraint, spacing, and hierarchy—not novel UI patterns.

---

## 2. Navigation Model

### 2.1 Tab Bars (Primary Navigation)

Use a tab bar only when:
- There are **3–5** top-level destinations
- Each destination is conceptually distinct
- Each tab maintains its own navigation state

**Rules**
- Minimum: 3 tabs
- Maximum: 5 tabs
- Each tab uses:
  - A single noun label
  - A system icon (SF Symbols)
  - A visible text label

**Behavior**
- Tapping the active tab returns the user to the root of that tab
- Switching tabs should feel instantaneous
- No loading spinners unless content truly changes

**Prohibited**
- Nested tab bars
- Using tabs for sequential or step-based flows
- Using tabs for settings or modals

**Current Implementation**
- Minimal mode: 4 tabs (Home, Discover, Saved, Digest)
- Comprehensive mode: 5 tabs (Top, Local, Business, Digest, Saved)
- All tabs use single-noun labels
- Icons rendered via Lucide React Native (approximates SF Symbols style)

---

### 2.2 Toolbars (Contextual Actions)

Toolbars are for **actions**, not destinations.

**Rules**
- Actions must relate to the current view's content
- Prefer system icons and system button styles
- Keep actions minimal and relevant

**Placement**
- Bottom toolbar: content-centric screens
- Top toolbar (navigation bar): hierarchy and primary actions

**Best Practices**
- Avoid destructive actions unless clearly labeled
- Prefer text buttons when icon meaning may be ambiguous
- Disable unavailable actions rather than hiding them

**Current Implementation**
- Settings gear icon in navigation bar (top-right)
- Hit target: 44pt minimum (including hitSlop)
- Tinted with primary color

---

## 3. Hierarchy & Layout

### 3.1 Layout

- Use system spacing and layout defaults
- Respect safe areas at all times
- Avoid custom grids unless they improve clarity

If layout code is fighting Auto Layout or SwiftUI defaults, the design likely needs revision.

**Current Implementation**
- SafeAreaView used at root level
- Tab bar height: 83pt with proper safe area padding
- Border widths: 0.5pt for subtle separation

---

### 3.2 Visual Hierarchy

Hierarchy should be communicated through:
1. Position
2. Size
3. Weight
4. Color (last)

Color must never be the sole indicator of meaning.

---

## 4. Typography

- Use the system font (San Francisco)
- Support Dynamic Type everywhere
- Avoid custom fonts unless there is a strong editorial justification
- Favor readable line lengths over density

Tone should come from spacing and rhythm, not font novelty.

**Current Implementation**
- Tab bar labels: 10pt, 500 weight
- Header titles: System serif, XL size, 700 weight
- Body text: System sans, appropriate sizes

**Deviation Note**: Article content uses serif font for editorial tone. This improves readability for long-form content.

---

## 5. Color & Materials

### 5.1 Color

- Full support for Light and Dark Mode
- Use semantic system colors, not hard-coded values
- Accent colors are for emphasis, not decoration

Avoid:
- Low-contrast text
- Large surfaces using brand color without semantic meaning

**Current Implementation**
- Theme system with semantic colors following iOS naming conventions:
  - `label`, `secondaryLabel`, `tertiaryLabel` (text hierarchy)
  - `background`, `secondaryBackground`, `surface` (backgrounds)
  - `separator`, `opaqueSeparator` (borders/dividers)
  - `tint` (primary interactive color)
  - System colors: `systemRed`, `systemBlue`
- Tab bar active tint: `colors.tint`
- Tab bar inactive tint: `colors.secondaryLabel`
- Backwards-compatible aliases maintained: `primary`, `text`, `textSecondary`, `border`

**TODO**: Implement full Dark Mode support (currently in backlog)

---

### 5.2 Materials

- Prefer flat surfaces
- Use blur and vibrancy sparingly
- Shadows only when communicating elevation or layering

**Current Implementation**
- Flat surfaces throughout
- Minimal shadows (removed heavy elevation)
- Border-based separation

---

## 6. Motion & Feedback

Motion should:
- Explain cause and effect
- Reinforce hierarchy
- Never distract from content

**Rules**
- Follow system animation curves
- Keep durations short
- Respect Reduce Motion accessibility settings

Avoid animations that delay comprehension or feel decorative.

**Current Implementation**
- System navigation transitions (handled by React Navigation)
- Button activeOpacity: 0.4 (subtle feedback)

---

## 7. Controls & Components

### 7.1 Icons & Symbols

**Standard: Use Lucide React Native icons, NOT emojis**

All interactive elements, navigation tabs, and UI indicators must use proper icon symbols from the Lucide React Native library. Emojis must never be used in the user interface.

**Rules**
- Use Lucide React Native icons for all UI elements
- Icons should approximate SF Symbols style and meaning
- Maintain consistent sizing across similar contexts
- Use semantic icon choices (e.g., `Home` for home, `Bookmark` for saved)

**Prohibited**
- Emojis in navigation tabs
- Emojis in buttons or interactive controls
- Emojis as status indicators
- Emojis in settings menus

**Rationale**
- Emojis render inconsistently across platforms and OS versions
- Icons provide better accessibility support
- Icons scale properly at all sizes
- Icons maintain visual consistency with iOS design language
- Icons support proper color theming (light/dark mode)

**Current Implementation**
- Tab bar icons: Lucide React Native (`Home`, `Search`, `Bookmark`, `Star`, `Flame`, `MapPin`, `Briefcase`, `Trophy`, `Palette`, `Newspaper`)
- Settings menu icons: Lucide React Native (`BookOpen`, `Newspaper`, `Palette`, `Rss`, `Layout`, `Bug`)
- Action icons: Lucide React Native (`Waypoints`, `Zap`, `Bookmark`, `Wind`, `ArrowRightCircle`)

**Exception**: Emojis may be used sparingly in:
- User-generated content
- Educational/onboarding content where emotion is intentionally conveyed
- Loading state fun facts (as decorative text content, not UI elements)

---

### 7.2 Buttons

- Use system button styles
- Labels should be clear verbs
- One primary action per screen

**Current Implementation**
- TouchableOpacity with system-like behavior
- Minimum 44pt hit targets
- Clear visual feedback on press

---

### 7.3 Lists

- Lists are the default container for structured content
- Custom layouts must demonstrably improve clarity over lists

---

## 8. Accessibility (Required)

- Dynamic Type support
- VoiceOver labels for all interactive elements
- Minimum hit target size: 44pt
- Sufficient color contrast in all modes

Accessibility is a design constraint, not a post-launch task.

**Current Status**
- ✅ Minimum hit targets enforced
- ✅ Tab bar labels visible
- ⚠️  Dynamic Type: Partial (needs audit)
- ⚠️  VoiceOver: Needs comprehensive testing
- ⚠️  Contrast ratios: Need verification for Dark Mode

---

## 9. Deviation Policy

If deviating from Apple's guidelines:
1. Document the deviation
2. Explain the user benefit
3. Confirm platform expectations are not broken

If all three cannot be satisfied, do not proceed.

**Documented Deviations**
1. **Lucide Icons vs SF Symbols**: Using Lucide React Native for cross-platform consistency. Icons selected to approximate SF Symbol style and meaning.
2. **Serif typography in reader**: Editorial content uses serif for improved long-form readability, aligning with reader expectations for news content.

---

## 10. Design Decision Checklist

Before shipping any UI decision, ask:
- Would this confuse a first-time iOS user?
- Does this solve a real user problem?
- Could this be simpler using a system component?

When uncertain, default to the system.

---

## Version History

### v1.3 (January 19, 2026)
- **Added icon standard**: All UI elements must use Lucide React Native icons, NOT emojis
- Documented rationale for icon vs emoji usage
- Updated TabBarSettingsScreen to use Lucide icons instead of emojis
- Standardized icon usage across all settings screens
- Clarified exceptions for emoji usage (user-generated content, educational contexts only)
- Added icon implementation examples

### v1.2 (January 15, 2026)
- Reduced comprehensive mode from 7 to 5 tabs (Apple HIG compliance)
- Simplified all tab labels to single nouns
- Improved tab bar spacing and safe area handling
- Changed Settings from text button to gear icon (toolbar pattern)
- **Migrated to semantic color naming** following iOS conventions
- Updated color system: `label`, `tint`, `separator`, etc.
- Implemented floating tab bar (inset capsule) with rounded corners and subtle shadow to match Apple HIG examples
- Documented current implementation details
- Added deviation policy with justifications

### v1.0 (Initial)
- Established core design principles
- Defined canonical sources
- Set navigation model rules
