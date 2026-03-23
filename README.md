<p align="center">
  <img src="assets/icon.png" alt="Abridged app icon" width="128" height="128">
</p>

<h1 align="center">Abridged</h1>

<p align="center">
  A calm, local-first news reader for Pittsburgh.
</p>

<p align="center">
  Built to make local news feel finite, readable, and worth returning to.
</p>

<p align="center">
  <a href="./CHANGELOG.md">Changelog</a> |
  <a href="./docs/deployment/ios-ipa-testflight.md">IPA + TestFlight Guide</a> |
  <a href="./docs/deployment/deployment.md">Release Guide</a> |
  <a href="./docs/README.md">Docs Index</a>
</p>

## Why Abridged

Abridged is an iOS-first reading app that rethinks how local news should feel. Instead of endless feeds, aggressive alerts, and cluttered layouts, it focuses on a quieter experience: trusted local coverage, clear reading surfaces, intentional navigation, and a product that respects the reader's attention.

The project starts with Pittsburgh. The goal is simple: make it easier to catch up on what matters locally without the mental tax of modern news apps.

## What You Get Today

- Pittsburgh-focused coverage from multiple local news sources
- A clean home feed, section views, and digest-style reading flows
- Classic reading plus a faster Abridged reader mode for quick catch-ups
- Saved articles, continue-reading state, and profile-aware preferences
- Light and dark themes, reader controls, haptics, and accessibility-minded UI
- Better resilience around feed errors, cached content, and refresh behavior

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- React Navigation 7
- AsyncStorage for local persistence
- Jest + React Native Testing Library

## Run It Locally

### Prerequisites

- Node `20.19.4` (see `.nvmrc`)
- npm
- Xcode for local iOS development
- Android Studio for local Android development

### Setup

```bash
git clone https://github.com/McCal-Codes/abridgd.git
cd abridgd
npm install
npm start
```

From the Expo prompt:

- `i` or `npm run ios` for iOS
- `a` or `npm run android` for Android
- `w` or `npm run web` for web

### Useful Scripts

- `npm start` - start the Expo dev server
- `npm test` - run the Jest test suite
- `npm run test:coverage` - generate coverage output
- `npm run repo:health` - run the repository health audit
- `npm run build:ipa` - start a production EAS iOS build
- `npm run build:ipa:quick` - start a preview EAS iOS build
- `npm run build:ipa:submit` - start a production EAS iOS build and auto-submit it to TestFlight

## Install a Build

### Install the current beta with TestFlight

This is the recommended path for testers and stakeholders.

1. Install Apple's TestFlight app on your iPhone or iPad.
2. Accept the latest Abridged invite or public testing link from the team.
3. Open the TestFlight listing for Abridged and tap `Install`.
4. Update in place as new builds are published.

### Build an IPA with EAS

This is the default release path for the repo. EAS builds the IPA in the cloud and can submit it to App Store Connect without a checked-in `ios/` directory.

Requirements:

- Expo account access with permission to this project
- An `EXPO_TOKEN` or local `npx eas login` session
- Apple signing configured in EAS for the app's bundle identifier

Build commands:

```bash
npm run build:ipa
```

or

```bash
npm run build:ipa:submit
```

Use `npm run build:ipa:quick` when you want a faster preview/internal build instead of the production profile.

If you need a manual local Xcode archive path instead, generate or maintain a native `ios/` project first and then follow the advanced guide below.

For the full build, submit, and fallback archive workflow, see [docs/deployment/ios-ipa-testflight.md](./docs/deployment/ios-ipa-testflight.md).

## Release a New Version

The project uses Semantic Versioning for public releases and EAS auto-increments the iOS build number for the `production` profile.

1. Update `CHANGELOG.md` under `[Unreleased]` with the user-facing notes for the release.
2. Confirm the release version in `package.json` and keep any iOS release metadata aligned.
3. Run the release checks:

   ```bash
   npm test
   npx tsc --noEmit
   npm run repo:health
   ```

4. Trigger the preferred GitHub Actions workflow from `Actions -> Release iOS Build`, or run the CLI fallback:

   ```bash
   npx eas build --platform ios --profile production --auto-submit
   ```

   The workflow expects an `EXPO_TOKEN` repository secret, can optionally auto-submit the build to TestFlight, and can attach the finished IPA to an existing GitHub release tag.

5. In App Store Connect, verify processing, add release notes, and assign the correct tester groups.
6. Tag the release as `vMAJOR.MINOR.PATCH`.
7. Publish the GitHub Release using the notes from `CHANGELOG.md`.

If you need a manual native archive instead of EAS submission, use the fallback guide in [docs/deployment/ios-ipa-testflight.md](./docs/deployment/ios-ipa-testflight.md).

## Changelog and GitHub Releases

`CHANGELOG.md` is the source of truth for release notes in this repository.

Keep the README high-level. Put version-by-version details in the changelog, then reuse that same copy for:

- GitHub Releases
- TestFlight release notes
- internal release summaries

Start here: [CHANGELOG.md](./CHANGELOG.md)

## Documentation

- [Docs index](./docs/README.md)
- [Deployment guide](./docs/deployment/deployment.md)
- [IPA and TestFlight guide](./docs/deployment/ios-ipa-testflight.md)
- [Engineering standards](./docs/standards/README.md)
- [Product vision](./docs/product/vision.md)
- [Feature summary](./docs/product/FEATURES.md)

## Contributing and Security

- [Contributing guide](./CONTRIBUTING.md)
- [Security policy](./SECURITY.md)

## License

This repository is proprietary. See the beta legal documents in [docs/NDA/](./docs/NDA/).
