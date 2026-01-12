---
description: Build a signed iOS IPA file locally without a paid Apple Developer Account (v0.0.1)
---

This workflow creates an iOS .ipa file using your free Apple ID for signing. This is useful for testing on your own registered devices.

### Prerequisites

1.  **Xcode**: Must be installed.
2.  **ExportOptions.plist**: A file at `ios/ExportOptions.plist` configured for "development" export.
    *   *Create this file if it doesn't exist (see step 3).*
3.  **Connected Device**: Your iPhone/iPad should be connected via USB at least once to be registered in Xcode.

### Workflow Steps

1.  **Navigate to iOS folder**
    ```bash
    cd ios
    ```

2.  **Install Pods**
    Ensure dependencies are up to date. This also applies critical project patches.
    ```bash
    pod install --repo-update
    ```

3.  **Create ExportOptions.plist** (If missing)
    Create a file named `ExportOptions.plist` in the `ios` directory with this content:
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
        <key>method</key>
        <string>development</string>
        <key>teamID</key>
        <string>8GU67G2W48</string>
        <key>compileBitcode</key>
        <false/>
    </dict>
    </plist>
    ```
    *(Note: Replace `8GU67G2W48` with your actual Team ID if it changes. You can find this in Xcode > Settings > Accounts).*

4.  **Archive the Build**
    Clean and create an archive.
    ```bash
    xcodebuild -workspace abridged.xcworkspace \
      -scheme abridged \
      -configuration Release \
      -sdk iphoneos \
      archive \
      -archivePath abridged.xcarchive \
      -allowProvisioningUpdates
    ```

5.  **Export the IPA**
    Generate the .ipa file from the archive.
    ```bash
    xcodebuild -exportArchive \
      -archivePath abridged.xcarchive \
      -exportPath . \
      -exportOptionsPlist ExportOptions.plist
    ```

6.  **Locate the File**
    Your file will be at: `ios/abridged.ipa`
