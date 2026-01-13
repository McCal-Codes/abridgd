# Release Candidate Builds

This folder contains release candidate builds of the iOS app.

## Build Type
- **Configuration**: Release
- **Signing**: Ad-hoc or TestFlight provisioning profile
- **Purpose**: Pre-release testing before final release

## Folder Structure
Each build is organized by version and timestamp:
```
v{VERSION}_{YYYYMMDD_HHMMSS}/
  ├── abridged.ipa           # The installable app
  ├── DistributionSummary.plist
  ├── ExportOptions.plist
  └── Packaging.log
```

## Installation
- **TestFlight**: Upload to App Store Connect for beta testing
- **Ad-hoc**: Install on registered devices via Xcode or enterprise tools

## Notes
- These builds are optimized for release
- Should be thoroughly tested before promoting to release
- May include beta features not in production
