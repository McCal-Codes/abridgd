# Install the Abridgd Android beta

Last updated: 2026-11-11

Abridgd is not on Google Play yet. The Android beta is an APK you install yourself. It takes about two minutes.

## What you need

- An Android phone running Android 7.0 or newer, with a 64-bit (arm64) processor. That is nearly every phone made in the last several years. A 32-bit-only phone will not install it.
- About 150 MB of free space.

## Install

1. On your phone, open the [latest release](https://github.com/McCal-Codes/abridgd/releases) and download `abridgd-0.2.0-beta.2-android-arm64.apk`.
2. Open the file from your Downloads or from the notification. Android will say your browser is not allowed to install unknown apps. Tap **Settings**, turn on **Allow from this source**, then go back.
3. Tap **Install**. If Google Play Protect says it has not seen this app, that is expected: the beta is not distributed through Google Play. Tap **More details**, then **Install anyway**.
4. Open Abridgd. The first launch walks you through a short welcome.

After installing you can turn "Allow from this source" back off.

## Check the download (optional)

Each release lists a SHA-256 checksum. To check it on a computer:

```bash
sha256sum abridgd-0.2.0-beta.2-android-arm64.apk
```

The output should match the checksum on the release page exactly.

## Updating to a newer beta

This is the rough edge of the beta. These builds are signed with a debug key, not a release key. Android only updates an app in place when the new build has the same signature, and a later build may use a different key. If an update fails to install, you have to uninstall Abridgd first, which erases the app's data from your phone.

To keep your saved stories and reading progress:

1. Before uninstalling, open **Profile**, then **Account and backup**, and use **Export profile**. Send the key to yourself (email, notes, anywhere you can copy it from).
2. Uninstall Abridgd and install the new APK.
3. In **Account and backup**, paste the key into **Import profile**.

This is a stopgap. A proper release key is on the list, and when it lands the key will stay the same from then on.

## What stays on your phone

Saved stories, reading progress and settings are stored only on your phone. There is no account and no ads. The app fetches stories directly from each outlet's feed and page.

## Something broke

Settings, then **App Info**, has **Send Feedback / Report a Bug**, which opens an email with your version and build filled in. You can also open an issue on the [repository](https://github.com/McCal-Codes/abridgd/issues). Screenshots help.

## Uninstall

Press and hold the Abridgd icon, then choose **Uninstall**. This removes everything the app stored.
