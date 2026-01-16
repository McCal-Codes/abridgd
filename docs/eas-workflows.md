# EAS Workflows (automation)

Version: 1.0

Last Updated: 2026-01-16

This project includes example EAS Workflows to automate common EAS CLI tasks.

Files added
- `.eas/workflows/build-ios-production.yml` — kicks off an iOS production build on pushes to `main`.
- `.eas/workflows/submit-ios.yml` — submits an iOS build to the store on pushes to `main`.
- `.eas/workflows/publish-update.yml` — publishes an OTA update for the current branch on any push.

How to use

1. Make sure your project is linked to your Expo account and your GitHub repository (see Expo docs for linking a repository).
2. Install EAS CLI locally (already included in devDependencies):

```bash
npm install
npx eas --version
```

3. Run a workflow locally or trigger it from the Expo/EAS service.

Run a workflow with the CLI (example):

```bash
npm run eas:workflow:run -- .eas/workflows/build-ios-production.yml
```

Or run directly with EAS:

```bash
eas workflow:run .eas/workflows/build-ios-production.yml
```

Notes
- The workflow YAMLs are based on the Expo docs: https://docs.expo.dev/eas/workflows/automating-eas-cli/
- Customize `params` (profiles, platforms, branches) to match your EAS configuration in `eas.json` and your repo branch strategy.
- To enable automatic runs on GitHub pushes, ensure the Expo GitHub app is installed and connected for this project.

If you want, I can:
- Add more workflows (Android, dev builds, previews).
- Add CI integration examples (GitHub Actions invoking `eas workflow:run`).
## EAS Workflows (automation)

This project includes example EAS Workflows to automate common EAS CLI tasks.

Files added
- `.eas/workflows/build-ios-production.yml` — kicks off an iOS production build on pushes to `main`.
- `.eas/workflows/submit-ios.yml` — submits an iOS build to the store on pushes to `main`.
- `.eas/workflows/publish-update.yml` — publishes an OTA update for the current branch on any push.

How to use

1. Make sure your project is linked to your Expo account and your GitHub repository (see Expo docs for linking a repository).
2. Install EAS CLI locally (already included in devDependencies):

```bash
npm install
# EAS Workflows (automation)

Version: 1.0

Last Updated: 2026-01-16

This project includes example EAS Workflows to automate common EAS CLI tasks.

Files added
- `.eas/workflows/build-ios-production.yml` — kicks off an iOS production build on pushes to `main`.
- `.eas/workflows/submit-ios.yml` — submits an iOS build to the store on pushes to `main`.
- `.eas/workflows/publish-update.yml` — publishes an OTA update for the current branch on any push.

How to use

1. Make sure your project is linked to your Expo account and your GitHub repository (see Expo docs for linking a repository).
2. Install EAS CLI locally (already included in devDependencies):

```bash
npm install
npx eas --version
```

3. Run a workflow locally or trigger it from the Expo/EAS service.

Run a workflow with the CLI (example):

```bash
npm run eas:workflow:run -- .eas/workflows/build-ios-production.yml
```

Or run directly with EAS:

```bash
eas workflow:run .eas/workflows/build-ios-production.yml
```

Notes
- The workflow YAMLs are based on the Expo docs: https://docs.expo.dev/eas/workflows/automating-eas-cli/
- Customize `params` (profiles, platforms, branches) to match your EAS configuration in `eas.json` and your repo branch strategy.
- To enable automatic runs on GitHub pushes, ensure the Expo GitHub app is installed and connected for this project.

If you want, I can:
- Add more workflows (Android, dev builds, previews).
- Add CI integration examples (GitHub Actions invoking `eas workflow:run`).

