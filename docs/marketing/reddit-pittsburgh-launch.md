# r/Pittsburgh launch post (draft)

Last updated: 2026-11-11

A draft for a human to review, edit and post under their own account. Nothing here has been posted.

## Before posting

1. **Read r/Pittsburgh's rules first.** They could not be retrieved while drafting this, so nothing below is checked against them. Look at the sidebar and wiki for self-promotion limits, required flair, or a designated weekly thread. If the rules are unclear, message the mods before posting. Many city subreddits remove app promotion from accounts with no other history.
2. **Check the site copy.** Confirm the `abridgd-site` PR "Make launch-page claims match the app" is merged, so the page the post links to doesn't list City Paper or claim "0 trackers".
3. **Attach images.** Use `images/beta-2/abridgd-card.png` (see `README.md` in this folder). Optional: a real phone screenshot of the content note screen.
4. **Links.** The beta 2 release is published as a pre-release: https://github.com/McCal-Codes/abridgd/releases/tag/v0.2.0-beta.2. Install steps: https://github.com/McCal-Codes/abridgd/blob/master/docs/deployment/android-beta-install.md. Test the APK download from a clean phone. Only add an iPhone line if you have a current TestFlight public link.
5. **Sources audited 2026-11-11** with `npm run audit:feeds`: all 19 enabled sources were healthy. Disabled and not to be named: CBS Pittsburgh, City Paper, New Pittsburgh Courier, Pittsburgh Business Times, and the TribLive Business, TribLive Sports and Penguins feeds. Re-run the audit the day you post.
6. Events (the "This week" card) and dark mode are in beta 2 and were seen on a real phone, so they can be mentioned. Some WTAE stories with photos still lay out badly (TODO-148), so the post leads with other outlets.

## Post

**Title:** Cross over to calmer news: a free Pittsburgh news app with an end (looking for beta testers)

**Body:**

I'm a local developer. I got tired of news apps that feel like a slot machine, and Pittsburgh is the City of Bridges, so I built one that bridges you to the news without the anxiety. It's called Abridgd. It pulls reporting from WESA, PublicSource, TribLive, the Post-Gazette, WPXI and more (19 local outlets) into one short brief. You get to the end, and then you're done.

What it does:

- One short feed with a real "you're caught up" state, no infinite scroll
- A heads-up before heavy stories, with an optional breathing pause
- A "This week" events card for what's happening around town
- A one-word-at-a-time speed reader if you want it, or read articles the normal way
- No ads and no account. Saved stories, reading progress and settings stay on your phone
- Turn any outlet off, so the feed is yours

It's an early beta and it's rough in places. It's Android for now, and it's free. It isn't on Google Play yet, so it's an APK you install yourself (0.2.0 beta 2, Android 7 or newer, 64-bit phones). Steps and the download are here: [release link]. The app links out to the original stories and credits each outlet.

I'd really like to hear what's missing or broken, and which local sources I should add. Happy to answer questions about how it works.

## Likely questions, with answers that are true today

| Question | Answer |
|---|---|
| Why not just use the outlets' own apps? | One quiet place that ends, across outlets, with no alerts and no ads. It links out to each outlet's story. |
| Where does my data go? | Saved articles, reading progress and settings are stored on your phone. There's no account. Anonymous crash reports go to Sentry. The privacy page lists what the app contacts. |
| Does it use AI? | The daily digest can use an AI summary only if you paste in your own Perplexity key; otherwise it uses plain extracts from the articles. |
| Is it paid? | No upsell tier today. |
| Do the outlets know about this? | The app reads their public RSS feeds and shows their content with attribution and a link back (see `docs/compliance/rss_content_audit.md`). Don't claim any partnership. |
| Why a sideloaded APK? | Play Store release is in progress. |
| Will updates keep my saved stories? | The beta is debug-signed, so a later build may need an uninstall first. Export your profile from Profile, then Account and backup, beforehand. |
| How do I report a bug? | Settings, then App Info, then Send Feedback / Report a Bug, or contact@mcc-cal.com. Issues on GitHub also work. |

## Image and video kit

- `images/beta-2/abridgd-card.png` and `abridgd-split.png` (made from real phone screenshots; see `README.md`)
- Still worth capturing: a multi-photo story and the content note screen
- A 15 to 20 second screen recording of reaching the end of the feed
- Use the app icon from `assets/icon.png`
- Keep the tone calm and plain, matching `docs/product/vision.md`

## After posting

Reply in the thread yourself, don't argue with critics, and write down every feature request and source suggestion in `todo.md`.
