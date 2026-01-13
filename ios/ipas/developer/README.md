# Developer Builds

This folder contains development builds of the iOS app.

## Build Type
- **Configuration**: Debug/Development
- **Signing**: Development provisioning profile
- **Purpose**: Testing on registered development devices

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
Install via Xcode, Finder, or tools like `ios-deploy`:
```bash
# Via Xcode
# Drag the .ipa file onto a connected device in Xcode's Devices window

# Via command line (if device is connected)
xcrun devicectl device install app --device <DEVICE_ID> abridged.ipa
```

## Notes
- These builds are signed with a development certificate
- Only works on devices registered in the Apple Developer portal
- Not suitable for distribution outside the development team
