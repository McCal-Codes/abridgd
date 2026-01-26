# iOS 26 SwiftUI Toolbar & Sheet Enhancements — React Native Implementation
Last Updated: 2026-01-26

## Core Additions in iOS 26

* **Glass toolbar buttons** now extend the Liquid Glass design language into toolbars.
* **New navigation subtitle support** that appears below navigation titles.
* **Expanded semantic and positional toolbar placements** with clearer intent-based behavior.
* **Improved modal sheet behavior**, including transparency and new transitions.
* **Match geometry navigation transitions** for toolbar-initiated sheets.
* **New toolbar title display mode** (`inlineLarge`) for better large-title control.

---

## Navigation Subtitles

**SwiftUI:** `.navigationSubtitle(_:)`
**React Native:** `<NavigationHeader subtitle="..." />`

* Works in both large and inline title modes.
* Subtitle placement interacts with toolbar `principal`, `subtitle`, and `largeSubtitle` placements.

**Important behavior:**
* `principal` placement + subtitle duplicates subtitle unless managed explicitly.
* `toolbar(.subtitle)` and `toolbar(.largeSubtitle)` allow finer control but change layout rules.

**Implementation:**
```tsx
<NavigationHeader
  title="Screen Title"
  subtitle="Subtitle below title"
  titleAlign="left"
  large
/>
```

---

## Semantic Toolbar Placement (Preferred)

Use when intent matters more than position. SwiftUI chooses placement per platform.

### Common Placements

| SwiftUI | React Native | Behavior |
|---------|-------------|----------|
| `.confirmationAction` | `prominence="filled"` | Trailing edge, glass prominence |
| `.cancellationAction` | Standard with cancel icon | Leading edge |
| `.destructiveAction` | `destructive={true}` | Trailing edge, independent grouping |
| `.principal` | `titleAlign="center"` | Center title area |
| `.primaryAction` | `prominence="filled"` or `"tinted"` | Main trailing action |

**Key rules:**
* Ordering in code matters for items sharing the same edge.
* Semantic placement affects button styling automatically.
* Tinting only applies to labels, not button background.

**Example:**
```tsx
// Confirmation action (filled, trailing)
<GlassButton
  label="Done"
  icon={<Check size={20} />}
  prominence="filled"
  onPress={handleDone}
/>

// Cancellation action (standard, leading)
<GlassButton
  label="Cancel"
  icon={<X size={20} />}
  prominence="standard"
  onPress={handleCancel}
/>

// Destructive action (red, trailing)
<GlassButton
  label="Delete"
  icon={<Trash size={20} />}
  destructive
  onPress={handleDelete}
/>
```

---

## Positional Toolbar Placement

Use when exact layout control is required.

### Top Bar
* `.topBarLeading` → Not directly supported (use navigation header buttons)
* `.topBarTrailing` → Not directly supported (use navigation header buttons)

### Bottom Bar
* `.bottomBar` → `<BottomToolbar>`

**Centered by default:**
```tsx
<BottomToolbar visible={true} blur>
  <ToolbarItem>
    <GlassButton label="Action" onPress={() => {}} />
  </ToolbarItem>
</BottomToolbar>
```

### Grouping Behavior

* Same placement = auto-grouped
* Use `ToolbarItemGroup` to explicitly group items
* Use `ToolbarSpacer` to separate or distribute items

**ToolbarSpacer types:**
* `spacing="fixed"` → creates spacing between items
* `spacing="flexible"` → pushes items to opposite edges (especially useful in bottom bars)

---

## Bottom Toolbar Layout

* Multiple `.bottomBar` items auto-group.
* **Use fixed spacer** → separate buttons
* **Use flexible spacer** → push buttons to opposite sides
* No explicit leading/trailing variants exist for bottom bars.

**Example - Buttons on both sides:**
```tsx
<BottomToolbar visible={true} blur>
  <ToolbarItem>
    <GlassButton label="Delete" destructive onPress={handleDelete} />
  </ToolbarItem>

  <ToolbarSpacer spacing="flexible" /> {/* Pushes buttons apart */}

  <ToolbarItemGroup gap={12}>
    <GlassButton label="Share" icon={<Share />} onPress={handleShare} />
    <GlassButton label="Save" icon={<Bookmark />} onPress={handleSave} />
  </ToolbarItemGroup>
</BottomToolbar>
```

---

## Modal Sheets & fullScreenCover

* Sheets may appear partially transparent at medium detents.
* `fullScreenCover` may appear transparent in some iOS 26/Xcode betas.
  * **Fix:** force `.frame(maxWidth: .infinity, maxHeight: .infinity)` + system background.
* Supports `.presentationDetents([.medium, .large])`.

**React Native Implementation:**
```tsx
<BlurSheet
  visible={showSheet}
  onClose={() => setShowSheet(false)}
  detents={['medium', 'large']}
  initialDetent="medium"
  blur
>
  {/* Sheet content - transparent at medium, opaque at large */}
</BlurSheet>
```

---

## Match Geometry Sheet Transitions

* New navigation transition using matched geometry.
* Sheet can zoom from initiating toolbar button instead of sliding up.

**SwiftUI Requirements:**
* Shared `@Namespace`
* `.navigationTransition(.zoom(sourceID:in:))` on presented view
* `.matchedTransitionSource(id:in:)` on initiating toolbar item

**React Native Implementation:**
```tsx
const buttonRef = useRef<View>(null);

<View ref={buttonRef}>
  <GlassButton
    label="Info"
    onPress={() => setShowModal(true)}
  />
</View>

<ZoomModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  sourceRef={buttonRef}  // Zooms from this button
  blur
>
  {/* Modal content */}
</ZoomModal>
```

* Produces smooth zoom-in / zoom-out behavior using spring physics.

---

## Toolbar Title Display Mode

**SwiftUI:** `.toolbarTitleDisplayMode(.inlineLarge)`
**React Native:** `<NavigationHeader titleAlign="left" large />`

* Allows large titles aligned to leading edge.

**Side effect:**
* Breaks `.cancellationAction` placement
* May collapse actions into "More" menu

**Workaround:**
* Use `.primaryAction` instead
* Insert fixed toolbar spacers to separate actions

---

## Practical Guidance for Implementation

### Prefer Semantic Placements
Unless layout precision is required, use semantic prominence styles:
* `prominence="filled"` for primary/confirmation actions
* `prominence="tinted"` for secondary actions
* `prominence="standard"` for neutral actions
* `destructive={true}` for dangerous actions

### Expect Layout Side Effects
When mixing subtitles, principal items, and inlineLarge titles:
* Test across iPhone and iPad
* Test sheet vs fullScreenCover
* Test large vs inline titles

### Use ToolbarSpacer Aggressively
To resolve grouping issues:
* Fixed spacers (12-16px) between related groups
* Flexible spacers to push items to edges

### Beta-Sensitive Behaviors
Some behaviors may change in Xcode 26/iOS 26 betas:
* Sheet transparency
* Full screen cover backgrounds
* Toolbar overflow handling

---

## Component API Reference

### GlassButton

```tsx
<GlassButton
  label="Button Text"
  icon={<Icon size={20} />}  // Optional
  onPress={() => {}}
  prominence="standard" | "tinted" | "filled"
  destructive={boolean}  // Red styling
  disabled={boolean}
/>
```

### NavigationHeader

```tsx
<NavigationHeader
  title="Title"
  subtitle="Subtitle"  // Optional
  titleAlign="left" | "center"
  large={boolean}  // 34pt vs 17pt
/>
```

### BottomToolbar

```tsx
<BottomToolbar visible={boolean} blur={boolean}>
  <ToolbarItem>{/* button */}</ToolbarItem>
  <ToolbarSpacer spacing="fixed" | "flexible" size={number} />
  <ToolbarItemGroup gap={number}>{/* buttons */}</ToolbarItemGroup>
</BottomToolbar>
```

### ZoomModal

```tsx
<ZoomModal
  visible={boolean}
  onClose={() => {}}
  sourceRef={buttonRef}  // Ref to trigger button
  blur={boolean}
  blurIntensity={number}
>
  {/* Modal content */}
</ZoomModal>
```

### BlurSheet

```tsx
<BlurSheet
  visible={boolean}
  onClose={() => {}}
  detents={['medium', 'large']}
  initialDetent="medium" | "large"
  blur={boolean}
  blurIntensity={number}
>
  {/* Sheet content */}
</BlurSheet>
```

---

## Design System Integration

### Glass Morphism
* Translucent backgrounds with blur (iOS native)
* Solid backgrounds with transparency (Android fallback)
* Layered depth with shadows
* Dynamic opacity based on context

### Animation System
All animations use spring physics:
```typescript
withSpring(targetValue, {
  damping: 20,
  stiffness: 300,
})
```

### Safe Area Handling
All components respect safe area insets:
```typescript
const insets = useSafeAreaInsets();
paddingBottom: Math.max(insets.bottom, 8)
```

---

## Testing Checklist

- [ ] Glass buttons render correctly in light/dark modes
- [ ] Haptic feedback works on button press (iOS only)
- [ ] Zoom modal animates from correct source position
- [ ] Blur sheet expands from medium to large detent
- [ ] Blur sheet dismisses on swipe down
- [ ] Bottom toolbar respects safe area insets
- [ ] Toolbar spacers properly separate buttons
- [ ] Navigation header subtitle displays correctly
- [ ] All components handle disabled states
- [ ] Destructive buttons show red styling

---

## Known Limitations

* Blur effects iOS-only (Android uses solid backgrounds)
* Zoom transition requires measuring source position (slight delay)
* Sheet gestures may conflict with ScrollView on Android
* Large sheets may not reach exact top on devices with notches
* Top bar positional placement not supported (use navigation headers instead)

---

## Credits

Inspired by Stuart Lynch's "iOS 26 Toolbar Enhancements" tutorial. Adapted from SwiftUI to React Native using expo-blur, react-native-reanimated, react-native-gesture-handler, and expo-haptics.

## Implemented Components

### 1. **GlassButton**
Location: `src/components/GlassButton.tsx`

iOS 26-inspired button with blur effect and prominence styles, similar to SwiftUI toolbar buttons.

**Features:**
- Three prominence styles matching SwiftUI:
  - **Standard**: Glass material with blur effect
  - **Tinted**: Subtle color tint with transparency
  - **Filled**: Solid color fill (confirmation actions)
- Destructive variant with red styling
- Haptic feedback on press (iOS)
- Disabled state support
- Icon + label layout

**Usage:**
```tsx
<GlassButton
  label="Done"
  icon={<Check size={20} color={colors.background} />}
  onPress={() => handleDone()}
  prominence="filled"
/>

<GlassButton
  label="Delete"
  icon={<Trash size={20} color={colors.error} />}
  onPress={() => handleDelete()}
  prominence="standard"
  destructive
/>
```

**iOS 26 Equivalents:**
- `.confirmationAction` placement → `prominence="filled"`
- `.destructiveAction` placement → `destructive={true}`
- Standard toolbar buttons → `prominence="standard"`

---

### 2. **NavigationHeader**
Location: `src/components/NavigationHeader.tsx`

Custom navigation header with subtitle support, similar to SwiftUI's `.navigationSubtitle()` modifier.

**Features:**
- Main title with optional subtitle
- Subtitle positioned below title, leading-aligned
- Large title mode (34pt) or standard (17pt)
- Left or center alignment options

**Usage:**
```tsx
<NavigationHeader
  title="iOS 26 Features"
  subtitle="Glass buttons, toolbars, and transitions"
  titleAlign="left"
  large
/>
```

**iOS 26 Equivalent:**
```swift
.navigationTitle("iOS 26 Features")
.navigationSubtitle("Glass buttons, toolbars, and transitions")
.toolbarTitleDisplayMode(.inlineLarge)
```

---

### 3. **BottomToolbar**
Location: `src/components/BottomToolbar.tsx`

Bottom toolbar with glass effect, supporting fixed and flexible spacers for arranging buttons.

**Features:**
- Glass blur effect (iOS) or solid background (Android)
- Safe area aware (respects bottom inset)
- Semantic toolbar item placement
- Fixed spacers (specific width) and flexible spacers (pushes items apart)
- Toolbar item groups for adjacent buttons

**Components:**
- `BottomToolbar` - Container with blur background
- `ToolbarItem` - Individual button wrapper
- `ToolbarSpacer` - Fixed or flexible spacing
- `ToolbarItemGroup` - Groups adjacent buttons

**Usage:**
```tsx
<BottomToolbar visible={true} blur>
  <ToolbarItem>
    <GlassButton label="Delete" icon={<Trash />} destructive />
  </ToolbarItem>

  <ToolbarSpacer spacing="flexible" />

  <ToolbarItemGroup gap={12}>
    <GlassButton label="New" icon={<Plus />} />
    <GlassButton label="Edit" icon={<Pencil />} />
  </ToolbarItemGroup>
</BottomToolbar>
```

**iOS 26 Equivalent:**
```swift
.toolbar {
  ToolbarItem(placement: .bottomBar) {
    Button("Delete", systemImage: "trash") { }
  }

  ToolbarSpacer(spacing: .flexible)

  ToolbarItemGroup(placement: .bottomBar) {
    Button("New", systemImage: "plus") { }
    Button("Edit", systemImage: "pencil") { }
  }
}
```

---

### 4. **ZoomModal**
Location: `src/components/ZoomModal.tsx`

Modal with zoom transition from source element, similar to SwiftUI's `.navigationTransition(.zoom)` with `.matchTransitionSource`.

**Features:**
- Zooms from button/element that triggered it
- Spring physics animation using react-native-reanimated
- Blur backdrop effect
- Source position tracking
- Automatic center positioning

**Usage:**
```tsx
const buttonRef = useRef<View>(null);

<View ref={buttonRef}>
  <GlassButton
    label="Info"
    onPress={() => setShowModal(true)}
  />
</View>

<ZoomModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  sourceRef={buttonRef}
  blur
>
  <View style={styles.modalContent}>
    {/* Modal content */}
  </View>
</ZoomModal>
```

**iOS 26 Equivalent:**
```swift
@Namespace private var namespace

Button("Info") { showModal = true }
  .matchTransitionSource(id: "info", in: namespace)

.sheet(isPresented: $showModal) {
  InfoView()
    .navigationTransition(.zoom(sourceID: "info", in: namespace))
}
```

---

### 5. **BlurSheet**
Location: `src/components/BlurSheet.tsx`

Bottom sheet with dynamic blur/transparency effect. Background becomes transparent at medium detent, opaque at full height.

**Features:**
- Multiple detent support (medium = 50%, large = full screen)
- Dynamic transparency based on expansion state
- Swipe gestures for expand/collapse/dismiss
- Blur background effect
- Spring physics animations
- Snap points with velocity detection

**Usage:**
```tsx
<BlurSheet
  visible={showSheet}
  onClose={() => setShowSheet(false)}
  detents={['medium', 'large']}
  initialDetent="medium"
  blur
>
  <View style={styles.sheetContent}>
    {/* Sheet content */}
  </View>
</BlurSheet>
```

**iOS 26 Equivalent:**
```swift
.sheet(isPresented: $showSheet) {
  SheetContent()
    .presentationDetents([.medium, .large])
    .presentationBackgroundInteraction(.enabled)
}
// Background automatically becomes transparent at medium detent in iOS 26
```

---

## Demo Screen

Location: `src/screens/iOS26DemoScreen.tsx`

Comprehensive demonstration of all iOS 26-inspired components. Accessible from Debug & Advanced settings.

**Features:**
- Glass button styles showcase (standard, tinted, filled, destructive)
- Zoom modal transition demo
- Blur sheet with detents demo
- Bottom toolbar with spacers demo
- Custom navigation header with subtitle
- Interactive examples with real functionality

**Navigation:**
Settings → Debug & Advanced → "iOS 26 UI Demo"

---

## Technical Implementation

### Dependencies
- **expo-blur**: Glass morphism effects (iOS blur, Android fallback)
- **expo-haptics**: Tactile feedback for buttons
- **react-native-reanimated**: Smooth animations and gestures
- **react-native-gesture-handler**: Pan gestures for sheets

### Animation System
All animations use spring physics for natural, responsive motion:
```typescript
withSpring(targetValue, {
  damping: 20,
  stiffness: 300,
})
```

### Blur Effects
iOS uses native blur with configurable intensity:
```typescript
<BlurView
  intensity={isDark ? 40 : 30}
  tint={isDark ? 'dark' : 'light'}
  style={styles.blur}
/>
```

Android fallbacks to solid backgrounds with slight transparency.

### Safe Area Handling
All components respect safe area insets using `react-native-safe-area-context`:
```typescript
const insets = useSafeAreaInsets();
paddingBottom: Math.max(insets.bottom, 8)
```

---

## Design Principles

### Glass Morphism
- Translucent backgrounds with blur
- Subtle color tints
- Layered depth with shadows
- Dynamic opacity based on context

### Semantic Placement
Buttons use semantic prominence styles rather than explicit positioning:
- **Confirmation actions**: Filled prominence, trailing position
- **Cancellation actions**: Standard prominence, leading position
- **Destructive actions**: Red tint, standard prominence
- **Primary actions**: Tinted or filled prominence

### Motion Design
- Spring animations (damping: 20-30, stiffness: 300-400)
- Velocity-based gesture responses
- Snap points for sheets and modals
- Zoom transitions from source elements

### Accessibility
- Minimum touch target: 44pt (iOS guidelines)
- Haptic feedback for tactile confirmation
- Disabled states with reduced opacity
- High contrast for destructive actions

---

## Integration Guide

### Using GlassButton in Existing Screens

Replace standard buttons with glass buttons:

**Before:**
```tsx
<TouchableOpacity onPress={handleSave}>
  <Text>Save</Text>
</TouchableOpacity>
```

**After:**
```tsx
<GlassButton
  label="Save"
  icon={<Check size={20} color={colors.background} />}
  onPress={handleSave}
  prominence="filled"
/>
```

### Adding Bottom Toolbar to Articles

Add toolbar below article content for actions:

```tsx
<BottomToolbar visible={showToolbar} blur>
  <ToolbarItem>
    <GlassButton
      label="Delete"
      icon={<Trash />}
      destructive
      onPress={handleDelete}
    />
  </ToolbarItem>

  <ToolbarSpacer spacing="flexible" />

  <ToolbarItemGroup gap={12}>
    <GlassButton label="Share" icon={<Share />} onPress={handleShare} />
    <GlassButton label="Save" icon={<Bookmark />} onPress={handleSave} />
  </ToolbarItemGroup>
</BottomToolbar>
```

### Replacing Modals with ZoomModal

Enhance modal presentations with zoom transitions:

```tsx
// Get reference to trigger button
const buttonRef = useRef<View>(null);

// Wrap button in View with ref
<View ref={buttonRef}>
  <GlassButton label="Info" onPress={() => setShowModal(true)} />
</View>

// Use ZoomModal instead of standard Modal
<ZoomModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  sourceRef={buttonRef}
  blur
>
  {/* Your modal content */}
</ZoomModal>
```

### Using BlurSheet for Settings

Replace bottom sheets or pickers:

```tsx
<BlurSheet
  visible={showSettings}
  onClose={() => setShowSettings(false)}
  detents={['medium', 'large']}
  initialDetent="medium"
>
  <View style={styles.settingsContent}>
    <Text style={styles.title}>Settings</Text>
    {/* Settings UI */}
  </View>
</BlurSheet>
```

---

## Comparison with iOS 26 SwiftUI

| SwiftUI Feature | React Native Implementation | Notes |
|----------------|----------------------------|-------|
| `.toolbar` | `<BottomToolbar>` | Bottom toolbar only (top toolbar uses navigation) |
| `ToolbarItem(placement: .confirmationAction)` | `<GlassButton prominence="filled">` | Filled prominence for primary actions |
| `ToolbarItem(placement: .destructiveAction)` | `<GlassButton destructive>` | Red tint for destructive actions |
| `ToolbarSpacer(spacing: .flexible)` | `<ToolbarSpacer spacing="flexible">` | Direct equivalent |
| `.navigationSubtitle()` | `<NavigationHeader subtitle="...">` | Custom component required |
| `.navigationTransition(.zoom)` | `<ZoomModal>` | Similar spring physics |
| `.matchTransitionSource()` | `sourceRef` prop | Uses refs for position tracking |
| `.presentationDetents([.medium, .large])` | `detents={['medium', 'large']}` | Direct equivalent |
| Sheet background transparency | Animated opacity | Dynamic based on detent position |

---

## Future Enhancements

### Potential Additions
1. **Top toolbar** - Similar to bottom but for navigation headers
2. **Toolbar overflow** - "More" menu for too many buttons
3. **Toolbar badge** - Notification indicators on toolbar buttons
4. **Sheet drag indicator** - Customizable handle styles
5. **Modal detents** - Add detent support to ZoomModal
6. **Toolbar title** - Large title support in toolbar
7. **Toolbar search** - Inline search bar in toolbar

### Performance Optimizations
- Memoize button components
- Use `react-native-screens` for native modals
- Implement gesture throttling for sheets
- Add animation cancellation on unmount

---

## Testing

### Manual Testing Checklist
- [ ] Glass buttons render correctly in light/dark modes
- [ ] Haptic feedback works on button press (iOS only)
- [ ] Zoom modal animates from correct source position
- [ ] Blur sheet expands from medium to large detent
- [ ] Blur sheet dismisses on swipe down
- [ ] Bottom toolbar respects safe area insets
- [ ] Toolbar spacers properly separate buttons
- [ ] Navigation header subtitle displays correctly
- [ ] All components handle disabled states
- [ ] Destructive buttons show red styling

### Known Limitations
- Blur effects iOS-only (Android uses solid backgrounds)
- Zoom transition requires measuring source position (slight delay)
- Sheet gestures may conflict with ScrollView on Android
- Large sheets may not reach exact top on devices with notches

---

## Credits

Inspired by Stuart Lynch's "iOS 26 Toolbar Enhancements" tutorial:
- Glass material buttons
- Semantic toolbar placements
- Navigation subtitles
- Modal sheet zoom transitions
- Dynamic sheet background transparency

Adapted from SwiftUI to React Native using:
- expo-blur for glass morphism
- react-native-reanimated for spring animations
- react-native-gesture-handler for swipe gestures
- expo-haptics for tactile feedback
