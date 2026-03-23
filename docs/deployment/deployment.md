# Deploying to TestFlight (iOS)

Last Updated: 2026-03-22

The default release path for Abridged is an EAS cloud build. The repository does not rely on a checked-in native `ios/` directory for normal releases, so the safest path is either the GitHub Actions workflow or the equivalent local EAS command.

## Preferred path: GitHub Actions

Use the `Release iOS Build` workflow from the repository's Actions tab.

Inputs:

- `profile`: `production` for TestFlight-ready builds, `preview` for internal smoke builds
- `auto_submit`: when enabled with `production`, EAS will submit the finished build to App Store Connect
- `wait_for_build`: keeps the workflow open until the cloud build finishes
- `attach_to_release`: downloads the finished IPA and uploads it to the matching GitHub release
- `release_tag`: required when `attach_to_release=true` in a manual run

Requirements:

- Repository secret `EXPO_TOKEN`
- Expo project access for the token owner
- Apple credentials already configured in EAS for `com.mccalmedia.abridged`

## CLI fallback

If you want to run the release from your own machine instead of GitHub Actions:

```bash
npx eas login
npm ci
npx eas build --platform ios --profile production --auto-submit
```

Useful variants:

```bash
npm run build:ipa
npm run build:ipa:quick
npm run build:ipa:submit
```

## Release checklist

1. Confirm the release version in `package.json` and `app.json`.
2. Finalize the release notes in `CHANGELOG.md`.
3. Run:

```bash
npm test -- --runInBand
npx tsc --noEmit
npm run repo:health
```

4. Start the production EAS build.
5. Verify the build in App Store Connect and assign tester groups.
6. Tag the release as `vMAJOR.MINOR.PATCH`.
7. Reuse the same changelog notes for the GitHub Release.

## Troubleshooting

- Missing `EXPO_TOKEN`: add it as a repository secret before running the workflow.
- EAS credential errors: refresh Apple credentials in Expo before retrying a production build.
- Bundle identifier mismatch: keep `com.mccalmedia.abridged` aligned across Expo, EAS, and App Store Connect.
- Need a manual native archive: use the fallback notes in [ios-ipa-testflight.md](./ios-ipa-testflight.md).
