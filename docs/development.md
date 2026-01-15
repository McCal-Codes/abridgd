# Development Environment Setup

Complete guide for setting up your local development environment for Abridged.

**Last Updated:** January 15, 2026

---

## Prerequisites

### Required Tools

1. **Node.js** — Version specified in `.nvmrc` (18+)
   ```bash
   # Using nvm (recommended)
   nvm install
   nvm use

   # Verify
   node --version  # Should match .nvmrc
   ```

2. **npm** or **yarn** — Package manager
   ```bash
   npm --version  # Comes with Node
   ```

3. **Expo CLI** — Installed via project dependencies
   ```bash
   npm install  # Installs expo CLI locally
   ```

4. **Git** — Version control
   ```bash
   git --version
   ```

### Platform-Specific Requirements

#### iOS Development (macOS only)

1. **Xcode** (latest stable)
   - Install from Mac App Store
   - Install Command Line Tools:
     ```bash
     xcode-select --install
     ```

2. **CocoaPods** (for iOS dependencies)
   ```bash
   sudo gem install cocoapods
   ```

3. **iOS Simulator** — Included with Xcode

#### Android Development (All platforms)

1. **Android Studio** — [Download](https://developer.android.com/studio)
2. **Android SDK** — Installed via Android Studio
3. **Android Emulator** — Set up via Android Studio AVD Manager

---

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd abridged
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Expo SDK and React Native
- Navigation libraries
- Testing frameworks (Jest)
- Development tools

### 3. Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# .env
EXPO_PUBLIC_API_URL=https://api.example.com
# Add other environment variables as needed
```

**Important:** Never commit `.env` to git. It's already in `.gitignore`.

### 4. iOS-Specific Setup (macOS only)

Install CocoaPods dependencies:

```bash
cd ios
pod install
cd ..
```

**Signing Configuration:**

For local development, Xcode will auto-generate a development certificate. For building IPAs:

1. Open `ios/abridged.xcworkspace` in Xcode
2. Select the `abridged` target
3. Go to "Signing & Capabilities"
4. Select your development team
5. Update `ExportOptions.plist` if needed (see `docs/build/troubleshooting-scanning.md`)

---

## Running the App

### Development Server

Start the Expo development server:

```bash
npm start
# or
npx expo start
```

This opens the Expo DevTools in your browser.

### Run on iOS

```bash
npm run ios
# or
npx expo run:ios
```

Opens in iOS Simulator by default.

### Run on Android

```bash
npm run android
# or
npx expo run:android
```

Opens in Android Emulator or connected device.

### Run on Physical Device

1. Install **Expo Go** app on your phone
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code from Expo DevTools
   - iOS: Use Camera app
   - Android: Use Expo Go app

---

## Development Tools

### VS Code Setup (Recommended)

Install recommended extensions when prompted, or manually install:

- **React Native Tools** — Debugging support
- **ESLint** — Code linting
- **Prettier** — Code formatting
- **EditorConfig** — Consistent formatting (already configured in `.editorconfig`)

Workspace settings are in `.vscode/settings.json`.

### Testing

Run all tests:

```bash
npm test
# or
npm run test:watch  # Watch mode
```

Run specific test:

```bash
npx jest src/screens/__tests__/ArticleScreen.test.tsx
```

Coverage report:

```bash
npm run test:coverage
```

### Repository Health Check

Validate repo organization:

```bash
npm run repo:health
```

This checks for:
- Proper script organization
- Essential documentation
- Git hygiene

---

## Building for Production

### iOS IPA

**Standard build:**

```bash
npm run build:ipa
```

**Quick build (development signing):**

```bash
npm run build:ipa:quick
```

See `scripts/README.md` for detailed build script documentation.

### Android APK/AAB

```bash
npx expo build:android
```

---

## Common Issues & Solutions

### "Metro bundler failed to start"

```bash
# Clear cache
npx expo start -c
```

### "Pod install failed" (iOS)

```bash
cd ios
pod deintegrate
pod install
cd ..
```

### "Module not found"

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### "Xcode build failed"

1. Clean build folder: Xcode → Product → Clean Build Folder
2. Ensure CocoaPods are up to date: `cd ios && pod install`
3. Check `docs/build/troubleshooting-scanning.md`

### TypeScript errors in VS Code

```bash
# Restart TypeScript server
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## Environment-Specific Notes

### Node Version Management

Always use the Node version specified in `.nvmrc`:

```bash
# Automatically switch when entering directory (with nvm)
echo 'nvm use' >> ~/.zshrc  # or ~/.bashrc
```

### iOS Deployment Target

Minimum iOS version: **13.0** (specified in `ios/Podfile`)

### Android Min SDK

Minimum Android API: **21** (Android 5.0)

---

## Development Workflow

### Before Starting Work

1. Pull latest changes: `git pull`
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Check repo health: `npm run repo:health`

### Before Committing

1. Run tests: `npm test`
2. Check for linting errors
3. Follow commit message template (`.gitmessage`)
4. Review `docs/standards/preflight.md`

### Before Pushing

1. Ensure all tests pass
2. Verify no sensitive data is committed
3. Check that build works locally

---

## Debugging

### React Native Debugger

Enable Debug Mode in Expo Dev Menu:
- iOS Simulator: Cmd+D
- Android Emulator: Cmd+M (macOS) or Ctrl+M (Windows/Linux)

Select "Debug Remote JS" or "Open React DevTools"

### Console Logs

View logs in terminal where `expo start` is running.

### Advanced Debugging

See `docs/debugging.md` for:
- React DevTools setup
- Network request inspection
- Performance profiling
- Native module debugging

---

## Additional Resources

- **Architecture:** `docs/architecture.md`
- **Engineering Standards:** `docs/standards/engineering.md`
- **Design Standards:** `docs/standards/design-standards.md`
- **Debugging Guide:** `docs/debugging.md`
- **Deployment:** `docs/deployment.md`

---

## Getting Help

**Issues with setup?**

1. Check this guide first
2. Search existing [GitHub Issues](../../issues)
3. Check `docs/debugging.md`
4. Create a new issue using the bug report template

**Questions about architecture or patterns?**

1. Check `docs/standards/` for governance docs
2. Review relevant ADRs in `docs/standards/adr/`
3. Ask in team discussions
