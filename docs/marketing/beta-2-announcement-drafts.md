# Beta 2 announcement drafts

Last updated: 2026-11-11

Drafts only. Nothing here has been posted. Review, edit and post under your own account. Tone follows Folio: first person, plain, honest that it is early, no hype.

## Before any of this goes out

1. The beta 2 GitHub release is published as a pre-release. The README now links the MIT license and no longer mentions the NDA. Re-test the APK link from a clean phone before posting.
2. Check each subreddit's self-promotion rules first (see `reddit-pittsburgh-launch.md`).
3. Marketing images are in `images/beta-2/` (see `README.md`). Still to capture: a multi-photo story for the photo strip, and the content note screen.
4. Run `npm run audit:feeds` and only name outlets that are healthy that day. WTAE stories with photos still lay out badly (TODO-148), so avoid showcasing WTAE.
5. Keep claims to what ships. Events and dark mode both show on a real device in beta 2, but do not claim anything that was not seen on a phone.

## 1. Short post (Bluesky, Threads, Mastodon)

I've been building a calmer way to read Pittsburgh news. Abridgd pulls local reporting into one short brief that actually ends. No ads, no account, no infinite scroll.

The Android beta is up as an APK. It's early and rough in places, and I'd like to know what breaks on your phone.

[release link]

## 2. Longer announcement (blog, newsletter, GitHub Discussions)

**Abridgd beta 2 is out for Android**

I got tired of news apps that feel like a slot machine, so I made one that stops. Abridgd collects Pittsburgh reporting from local outlets into one finite brief. You reach the end, and then you're done.

This beta adds:

- A swipeable photo strip with captions on stories that have more than one photo
- Cleaner full stories, with fewer logos, share bars and duplicate photos in the text
- A shorter, calmer Profile screen
- A choice of app icon: the slate bridge, or the same mark in teal, berry or paper
- A new muted palette

What it does not do yet: it is Android only for now (iPhone testers use TestFlight), it is signed with a debug key so updates may need an uninstall, and some WTAE stories with photos still look wrong. I'd rather say that up front.

Everything stays on your phone. There is no account and no ads. Install steps are in the guide: [link]. If something breaks, Settings, then App Info, then Send Feedback / Report a Bug, sends me your version and build.

## 3. r/Pittsburgh

Use the post in `reddit-pittsburgh-launch.md`. Update the Android line to say this is beta 2 and link the release. Lead with the finite-feed idea, not the feature list. Do not post until the rules check in step 2 above is done, and reply in the thread yourself.

## 4. Pitch to a local reporter or newsletter

Subject: A free Pittsburgh news app that ends (looking for beta testers)

Hi [name],

I'm a local developer. I built Abridgd, a free app that collects Pittsburgh reporting into one short brief with an end point: no ads, no account, no infinite scroll. Every story links back to the outlet that reported it.

It's in public beta on Android, with iPhone through TestFlight, and I'm looking for local readers to try it and tell me what is missing. If it fits something you cover or send out, I'm happy to answer questions or share screenshots.

[link] / [contact address]

Thanks,
[name]

## 5. Short replies for comments

- **Why not the outlets' own apps?** Each one is built to keep you scrolling. This is one quiet place across outlets that ends.
- **Do the outlets know?** It reads their public feeds, credits each outlet and links back to the original story. There is no partnership, and I won't imply one.
- **Is it paid?** No. No ads, no tracking account.
- **Where does my data go?** Saved stories, progress and settings stay on your phone. Anonymous crash reports go to Sentry.
- **Why an APK?** The Play Store release is still in progress.
