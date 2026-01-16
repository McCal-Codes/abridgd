# Building IPAs and Uploading to TestFlight

Last Updated: 2026-01-16

This guide shows how to build an IPA locally (Xcode) and upload to TestFlight, plus how to use the project's helper script and EAS Build. It also covers upload options, common issues, and tips.

## Quick options overview

- Local Xcode Archive -> Export IPA -> Upload to App Store Connect (Transporter / altool)
- Use the repository script: `scripts/build/build-ipa.sh` (runs archive + export locally)
- Cloud builds & submissions: `eas build --platform ios --profile production --auto-submit`

Notes: this project includes `ios/ExportOptions.plist` and `scripts/build/build-ipa.sh` to help with local builds.

---

## 1) Prerequisites

- macOS with Xcode installed (Xcode 13+ recommended).
- An Apple Developer Program account (paid) for App Store / TestFlight distribution.
- App Store Connect access for the app's bundle identifier.
- Proper code signing credentials (developer/distribution certs and provisioning profiles) or allow Xcode/EAS to manage them.
- Optional: `eas` CLI (for cloud builds), `Transporter` app or Apple `altool`/`xcrun` for uploads.

---

## 2) Local Xcode Archive + Export (manual)

1. Open the project in Xcode (recommended): `ios/abridged.xcworkspace`.
2. Select the `abridged` scheme and set a Release build configuration.
3. Bump the build number and version in Xcode (or via `agvtool`) so App Store Connect accepts the upload.

Archive:

```bash
# from repository root, change to ios/
cd ios
xcodebuild -workspace abridged.xcworkspace \
  -scheme abridged \
  -configuration Release \
  -sdk iphoneos \
  archive \
  -archivePath abridged.xcarchive \
  -allowProvisioningUpdates
```

Export to IPA (uses `ExportOptions.plist` in `ios/` — edit if you need a different `method`):

```bash
xcodebuild -exportArchive \
  -archivePath abridged.xcarchive \
  -exportPath . \
  -exportOptionsPlist ExportOptions.plist
```

This should produce `abridged.ipa` in `ios/`.

---

## 3) Use the included helper script

The repo includes `scripts/build/build-ipa.sh`. From the `ios/` directory you can run the same workflow (it wraps `pod install`, `xcodebuild archive`, and `xcodebuild -exportArchive`).

Examples (from repo root):

```bash
# Full workflow (clean, archive, export)
./scripts/build/build-ipa.sh

# Create archive only
./scripts/build/build-ipa.sh archive

# Export IPA from existing archive
./scripts/build/build-ipa.sh export

# Clean artifacts
./scripts/build/build-ipa.sh clean
```

Notes:
- The script will create an `ExportOptions.plist` if none exists; it defaults to a `development` method — change to `app-store` or `ad-hoc` depending on your distribution needs.
- The script expects to be run from the `ios/` directory (it checks for the Xcode project files). You can run it from repo root but ensure the working directory is `ios/`.

---

## 4) Uploading the IPA to App Store Connect / TestFlight

Options:

- EAS Build + auto-submit: `npx eas build --platform ios --profile production --auto-submit` will build and submit to App Store Connect automatically.

- Transporter (GUI): open Apple Transporter (Mac App Store), sign in, drag the `.ipa` and upload.

- altool / xcrun (CLI): requires an app-specific password or API key. Example using an app-specific password:

```bash
xcrun altool --upload-app -f abridged.ipa -t ios -u "apple-id@example.com" -p "APP_SPECIFIC_PASSWORD"
```

(If you prefer the newer App Store Connect API key upload flow, use `altool` with the API key or `notarytool` where appropriate; consult Apple docs for the latest recommended CLI.)

---

## 5) TestFlight workflow basics

- After upload, open App Store Connect -> My Apps -> Your App -> TestFlight.
- For internal testers (members of your App Store Connect team), builds usually become available quickly.
- For external testers, Apple requires a beta app review — this can take hours to a day.
- Create TestFlight groups and add testers by email.
- Provide release notes for each build.

---

## 6) Using EAS Build / Submit

Expo's EAS Build can manage signing and submission for you. Example:

```bash
npx eas login
npx eas build --platform ios --profile production --auto-submit
```

EAS can manage credentials automatically or use your uploaded provisioning and certs. See Expo docs for `eas.json` profiles and credential handling.

---

## 7) Common problems and fixes

- Code signing errors:
  - Ensure the bundle identifier in `app.json` matches the App Store Connect app.
  - If Xcode cannot find provisioning profiles, allow automatic management or create provisioning profiles in Apple Developer portal and install them.

- Upload / validation errors:
  - Increment the build number (Version + Build) before uploading.
  - Check that required app icons and launch screen assets are present.
  - If you use capabilities (Push Notifications, Keychain, etc.) ensure entitlements and provisioning profiles include them.

- Missing entitlements / Capabilities warnings:
  - Open Xcode → Targets → Signing & Capabilities and enable the required capabilities.

- Rejected by App Review (for TestFlight external):
  - Review the rejection reason in App Store Connect and address privacy / functionality issues, then re-upload.

---

## 8) Security & automation tips

- For automated uploads, create an App Store Connect API key (recommended) and store it in CI secrets rather than using Apple ID + app-specific passwords.
- Use CI to build and submit (EAS or Fastlane) to avoid manual uploads.
- Maintain an `ExportOptions.plist` per distribution method (`development`, `ad-hoc`, `enterprise`, `app-store`) and commit them to the repo or keep templates.

---

## 9) References

- Apple: Archive and distribute an app
- Apple: App Store Connect Help — TestFlight
- Expo: EAS Build docs


---

If you'd like, I can also:

- Add UI in `docs/TabBarSettingsScreen.tsx` to tweak the docked/hidden heights (next task for tab-bar settings).
- Create CI examples (GitHub Actions) to build and submit using EAS or Fastlane with App Store Connect API keys.

Which of the above would you like next?
