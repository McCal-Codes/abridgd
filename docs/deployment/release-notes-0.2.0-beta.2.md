# Abridgd 0.2.0 beta 2 (Android)

Last updated: 2026-11-11

A calmer way to read Pittsburgh news: one finite brief, no infinite scroll, no ads, no account. This is an early beta. It works, and it has rough edges.

**Android only.** iPhone testers get builds through TestFlight, separately from this release.

## Install

Download `abridgd-0.2.0-beta.2-android-arm64.apk` below and follow the [install guide](https://github.com/McCal-Codes/abridgd/blob/master/docs/deployment/android-beta-install.md). Android 7.0 or newer, 64-bit phones.

**Read this before updating:** this beta is signed with a debug key. If a later build will not install over this one, you will need to uninstall first. Export your profile from Profile, then Account and backup, before you do, so your saved stories come back.

## What is new since beta 1

- **Photo strip.** Stories with more than one photo show a swipeable strip under the headline, with captions and credits.
- **Cleaner full stories.** Publisher logos, author avatars, share bars, related-story cards, repeated headlines and duplicate copies of the same photo no longer end up in the story text.
- **Redone Profile.** A short, calm summary. Sign in, backup and delete moved to their own Account and backup screen.
- **New look.** A muted teal-green accent with a berry highlight, in light and dark mode.
- **Choose your app icon (Android).** Settings, then App Icon: the slate bridge, or the same mark in teal, berry or paper. The app closes briefly when the icon changes.
- **Android tab bar.** Solid, so headlines no longer show through it.
- **Smaller fixes.** Story cards stop repeating the headline as a description. The last story scrolls clear of the tab bar. Saved search and filter buttons sit on the title row. The Daily Digest and Settings titles line up with the other screens. Emoji in the app are now icons.

## Known issues

- Some WTAE stories with photos still lay out poorly. This is being worked on.
- Debug signing, as above. A release key is planned.
- Stories come straight from each outlet's feed, so an outlet that changes its feed or page layout can break a story until the app catches up. Sources marked unavailable in Settings stopped publishing a working feed.
- Tested on an Android emulator and not yet on a wide range of real phones. Tell me what you see on yours.

## Checksums

SHA-256 for `abridgd-0.2.0-beta.2-android-arm64.apk`:

```
a0816353c2c16ba008c34b43b1b673574e453961d9c3c694d530333e393ec050
```

## Feedback

Settings, then App Info, has **Send Feedback / Report a Bug**. Or open an issue on this repository. What is missing, what is broken, and which local sources I should add are all useful.
