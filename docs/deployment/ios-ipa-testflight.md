# Building IPAs and Uploading to TestFlight

Last Updated: 2026-03-22

For Abridged, the normal IPA path is an EAS cloud build. That keeps releases working even though the repository does not depend on a checked-in native `ios/` folder for day-to-day development.

## Recommended options

- GitHub Actions: run `Release iOS Build`
- Local CLI: `npm run build:ipa` or `npm run build:ipa:submit`
- Manual native archive: only if you have generated or maintain a local `ios/` project yourself

## 1) EAS build from GitHub Actions

The repository now includes `.github/workflows/release-ios.yml`.

Run it from the Actions tab with:

- `profile=production` for a release/TestFlight build
- `profile=preview` for an internal smoke build
- `auto_submit=true` only when you want App Store Connect submission

Required secrets and setup:

- `EXPO_TOKEN` repository secret
- Expo project access for that token
- Apple credentials configured in EAS for `com.mccalmedia.abridged`

## 2) EAS build from your machine

```bash
npx eas login
npm ci
npm run build:ipa
```

For a direct TestFlight submission:

```bash
npm run build:ipa:submit
```

For a quicker internal build:

```bash
npm run build:ipa:quick
```

## 3) After the build finishes

- Open App Store Connect -> TestFlight
- Wait for Apple processing to finish
- Add release notes from `CHANGELOG.md`
- Assign internal or external tester groups

If you did not use `--auto-submit`, download or locate the finished IPA from EAS and submit it through your normal App Store Connect path.

## 4) Manual native archive fallback

Use this only when you intentionally want an Xcode-driven local archive.

Requirements:

- macOS with Xcode and CocoaPods
- A generated or maintained native `ios/` project
- Apple signing access for the bundle identifier

The legacy helper scripts still exist in `scripts/build/`, but they only work when a matching native iOS project is present locally.

Typical flow:

```bash
cd ios
../scripts/build/build-ipa.sh
```

## 5) Common problems

- Missing `EXPO_TOKEN`: GitHub Actions and non-interactive EAS builds will fail immediately.
- Apple credential errors: refresh the credentials in Expo before retrying `production`.
- Bundle identifier mismatch: keep `com.mccalmedia.abridged` aligned in Expo and App Store Connect.
- Stale release notes: update `CHANGELOG.md` before you trigger the release build.

## 6) References

- Expo: EAS Build
- Apple: App Store Connect TestFlight
