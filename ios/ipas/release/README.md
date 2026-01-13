# Release Builds

This folder contains production release builds of the iOS app.

## Build Type
- **Configuration**: Release
- **Signing**: App Store distribution provisioning profile
- **Purpose**: Final production builds for App Store submission

## Folder Structure
Each build is organized by version and timestamp:
```
v{VERSION}_{YYYYMMDD_HHMMSS}/
  ├── abridged.ipa           # The App Store package
  ├── DistributionSummary.plist
  ├── ExportOptions.plist
  └── Packaging.log
```

## Submission
Upload to App Store Connect using:
- **Xcode**: Product → Archive → Distribute App
- **Transporter**: Apple's official upload tool
- **Command Line**: `xcrun altool --upload-app`

## Notes
- These builds are production-ready
- Must pass App Store review guidelines
- Version numbers must be incremented for each submission
- Keep archives for debugging production issues
