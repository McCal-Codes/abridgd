# iOS 26 UI Components - Quick Reference

## Component Cheat Sheet

### 🔘 GlassButton

```tsx
// Standard glass button (most common)
<GlassButton
  label="Info"
  icon={<Info size={20} />}
  onPress={() => {}}
/>

// Filled button (primary actions)
<GlassButton
  label="Done"
  prominence="filled"
  onPress={() => {}}
/>

// Destructive button (delete, remove, etc.)
<GlassButton
  label="Delete"
  destructive
  onPress={() => {}}
/>

// Tinted button (secondary actions)
<GlassButton
  label="Share"
  prominence="tinted"
  onPress={() => {}}
/>
```

---

### 📋 BottomToolbar

```tsx
// Simple toolbar with one button
<BottomToolbar visible={true} blur>
  <ToolbarItem>
    <GlassButton label="Action" onPress={() => {}} />
  </ToolbarItem>
</BottomToolbar>

// Toolbar with buttons on both sides
<BottomToolbar visible={true} blur>
  <ToolbarItem>
    <GlassButton label="Delete" destructive />
  </ToolbarItem>
  
  <ToolbarSpacer spacing="flexible" /> {/* Pushes buttons apart */}
  
  <ToolbarItem>
    <GlassButton label="Done" prominence="filled" />
  </ToolbarItem>
</BottomToolbar>

// Toolbar with grouped buttons
<BottomToolbar visible={true} blur>
  <ToolbarSpacer spacing="flexible" />
  
  <ToolbarItemGroup gap={12}>
    <GlassButton label="New" icon={<Plus />} />
    <GlassButton label="Edit" icon={<Pencil />} />
  </ToolbarItemGroup>
</BottomToolbar>
```

---

### 📱 ZoomModal

```tsx
function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  const buttonRef = useRef<View>(null);

  return (
    <>
      {/* Trigger button with ref */}
      <View ref={buttonRef}>
        <GlassButton 
          label="Open" 
          onPress={() => setShowModal(true)} 
        />
      </View>

      {/* Modal that zooms from button */}
      <ZoomModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        sourceRef={buttonRef}
        blur
      >
        <View style={{ padding: 24 }}>
          <Text>Modal Content</Text>
        </View>
      </ZoomModal>
    </>
  );
}
```

---

### 📄 BlurSheet

```tsx
function MyComponent() {
  const [showSheet, setShowSheet] = useState(false);

  return (
    <BlurSheet
      visible={showSheet}
      onClose={() => setShowSheet(false)}
      detents={['medium', 'large']}
      initialDetent="medium"
      blur
    >
      <View style={{ paddingVertical: 20 }}>
        <Text style={styles.title}>Sheet Title</Text>
        <Text style={styles.body}>
          Drag up to expand, down to dismiss.
          Background becomes more opaque when expanded.
        </Text>
      </View>
    </BlurSheet>
  );
}
```

---

### 📰 NavigationHeader

```tsx
// In screen with custom header
function MyScreen() {
  return (
    <View>
      <NavigationHeader
        title="Screen Title"
        subtitle="Optional subtitle below"
        titleAlign="left"
        large
      />
      {/* Rest of screen content */}
    </View>
  );
}
```

---

## Common Patterns

### Pattern 1: Article Actions Toolbar

```tsx
<BottomToolbar visible={true} blur>
  <ToolbarItem>
    <GlassButton 
      label="Delete" 
      icon={<Trash size={18} />}
      destructive 
      onPress={handleDelete}
    />
  </ToolbarItem>
  
  <ToolbarSpacer spacing="flexible" />
  
  <ToolbarItemGroup gap={12}>
    <GlassButton 
      label="Share" 
      icon={<Share size={18} />}
      onPress={handleShare}
    />
    <GlassButton 
      label="Save" 
      icon={<Bookmark size={18} />}
      onPress={handleSave}
    />
  </ToolbarItemGroup>
</BottomToolbar>
```

### Pattern 2: Settings Sheet

```tsx
const [showSettings, setShowSettings] = useState(false);

<GlassButton 
  label="Settings" 
  icon={<Settings />}
  onPress={() => setShowSettings(true)}
/>

<BlurSheet
  visible={showSettings}
  onClose={() => setShowSettings(false)}
  detents={['medium', 'large']}
  initialDetent="medium"
>
  <View style={styles.settingsContent}>
    <Text style={styles.settingsTitle}>Settings</Text>
    {/* Settings options */}
    <GlassButton 
      label="Done" 
      prominence="filled"
      onPress={() => setShowSettings(false)}
    />
  </View>
</BlurSheet>
```

### Pattern 3: Confirmation Dialog

```tsx
const buttonRef = useRef<View>(null);
const [showConfirm, setShowConfirm] = useState(false);

<View ref={buttonRef}>
  <GlassButton 
    label="Delete All" 
    destructive
    onPress={() => setShowConfirm(true)}
  />
</View>

<ZoomModal
  visible={showConfirm}
  onClose={() => setShowConfirm(false)}
  sourceRef={buttonRef}
  blur
>
  <View style={styles.confirmContent}>
    <Text style={styles.confirmTitle}>Are you sure?</Text>
    <Text style={styles.confirmMessage}>
      This action cannot be undone.
    </Text>
    
    <View style={styles.confirmActions}>
      <GlassButton 
        label="Cancel" 
        onPress={() => setShowConfirm(false)}
      />
      <GlassButton 
        label="Delete" 
        destructive
        prominence="filled"
        onPress={handleConfirmedDelete}
      />
    </View>
  </View>
</ZoomModal>
```

---

## Styling Tips

### Glass Button Colors
```tsx
// Buttons automatically adapt to theme colors
// Use primary color for main actions
<GlassButton prominence="filled" /> // Uses colors.primary

// Use destructive for dangerous actions
<GlassButton destructive /> // Uses colors.error

// Standard buttons use text color
<GlassButton prominence="standard" /> // Uses colors.text
```

### Toolbar Positioning
```tsx
// Toolbar is positioned absolutely at bottom
// Remember to add padding to scrollable content
<ScrollView
  contentContainerStyle={{ 
    paddingBottom: showToolbar ? 120 : 40 
  }}
>
```

### Modal Content Sizing
```tsx
// ZoomModal constrains width automatically
// BlurSheet height based on detents:
//   - medium: 50% of screen height
//   - large: full screen minus top inset

// Add padding to content
<ZoomModal>
  <View style={{ padding: 24 }}>
    {/* Content */}
  </View>
</ZoomModal>
```

---

## Performance Tips

1. **Memoize refs**: Use `useRef` to avoid recreating refs
2. **Conditional blur**: Disable blur on Android for better performance
3. **Lazy modals**: Only render modal content when visible
4. **Gesture optimization**: BlurSheet gestures are already optimized

```tsx
// Good: Conditional rendering
{visible && (
  <ZoomModal visible={visible}>
    <ExpensiveComponent />
  </ZoomModal>
)}

// Better: Modal handles visibility internally
<ZoomModal visible={visible}>
  <ExpensiveComponent />
</ZoomModal>
```

---

## Accessibility

All components include:
- ✅ Minimum 44pt touch targets
- ✅ Haptic feedback on iOS
- ✅ Clear visual states (normal, pressed, disabled)
- ✅ High contrast for destructive actions
- ✅ Screen reader support (via React Native)

---

## Migration Guide

### From TouchableOpacity to GlassButton

**Before:**
```tsx
<TouchableOpacity 
  style={styles.button} 
  onPress={handlePress}
>
  <Icon name="check" size={20} />
  <Text style={styles.buttonText}>Confirm</Text>
</TouchableOpacity>
```

**After:**
```tsx
<GlassButton
  label="Confirm"
  icon={<Check size={20} />}
  prominence="filled"
  onPress={handlePress}
/>
```

### From Standard Modal to ZoomModal

**Before:**
```tsx
<Modal visible={visible} onRequestClose={onClose}>
  <View style={styles.modalContainer}>
    {content}
  </View>
</Modal>
```

**After:**
```tsx
<ZoomModal
  visible={visible}
  onClose={onClose}
  sourceRef={triggerButtonRef}
  blur
>
  {content}
</ZoomModal>
```

---

## Demo Location

See all components in action:
**Settings → Debug & Advanced → iOS 26 UI Demo**

Or navigate directly:
```tsx
navigation.navigate('iOS26Demo');
```
