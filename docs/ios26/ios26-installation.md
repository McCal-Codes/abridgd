# iOS 26 Components - Installation Guide
Last Updated: 2026-01-26

## Required Dependencies

The iOS 26 components require the following npm packages to be installed:

```bash
npx expo install expo-blur react-native-gesture-handler
```

## Setup Steps

### 1. Install Dependencies

```bash
npx expo install expo-blur react-native-gesture-handler
```

### 2. Configure Gesture Handler

Add to your root `index.ts` or `App.tsx` **before** other imports:

```typescript
import 'react-native-gesture-handler';
```

### 3. Wrap App with ThemeProvider

In your `App.tsx`:

```tsx
import { ThemeProvider } from './src/theme/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

## Verification

After installation, verify the setup:

```bash
# Clear cache and restart
npx expo start --clear

# On iOS (if using development build)
npx expo run:ios

# Verify no errors related to:
# - expo-blur
# - react-native-gesture-handler
# - ThemeContext
```

## Component Availability

Once dependencies are installed, you can use:

| Component | Dependency | Required |
|-----------|-----------|----------|
| GlassButton | expo-blur, ThemeContext | Yes |
| NavigationHeader | ThemeContext | Yes |
| BottomToolbar | expo-blur, ThemeContext | Yes |
| ZoomModal | expo-blur, react-native-reanimated, ThemeContext | Yes |
| BlurSheet | expo-blur, react-native-gesture-handler, react-native-reanimated, ThemeContext | Yes |

## Troubleshooting

### "Cannot find module 'expo-blur'"

```bash
npx expo install expo-blur
npx expo prebuild --clean  # If using development build
```

### "Cannot find module 'react-native-gesture-handler'"

```bash
npx expo install react-native-gesture-handler
# Add import at top of index.ts: import 'react-native-gesture-handler';
```

### "useTheme must be used within a ThemeProvider"

Wrap your app in `<ThemeProvider>`:

```tsx
import { ThemeProvider } from './src/theme/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        {/* ... */}
      </NavigationContainer>
    </ThemeProvider>
  );
}
```

### Blur effects not working on Android

This is expected - blur effects are iOS-only. Components automatically fall back to solid backgrounds on Android.

### Sheet gestures not working

Ensure gesture handler is:
1. Installed: `npx expo install react-native-gesture-handler`
2. Imported first in `index.ts`: `import 'react-native-gesture-handler';`
3. Cleared from cache: `npx expo start --clear`

## Version Requirements

Minimum versions:

```json
{
  "expo": "~54.0.0",
  "expo-blur": "~14.0.0",
  "react-native-gesture-handler": "~2.20.0",
  "react-native-reanimated": "~4.1.0",
  "expo-haptics": "~15.0.0"
}
```

## Next Steps

After installation:

1. Test the demo screen: Settings → Debug & Advanced → iOS 26 UI Demo
2. Review documentation: `docs/ios26-ui-components.md`
3. Try examples: `docs/ios26-quick-reference.md`
4. Integrate components into your screens

## Support

If issues persist:

1. Check all dependencies are installed
2. Verify ThemeProvider wraps your app
3. Clear Expo cache: `npx expo start --clear`
4. Rebuild development client (if using)
5. Check error logs for specific module issues
