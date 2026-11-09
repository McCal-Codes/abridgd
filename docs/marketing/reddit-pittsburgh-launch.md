# r/Pittsburgh launch post (draft)

Last updated: 2026-11-05

A draft for a human to review, edit and post under their own account. Nothing here has been posted.

## Before posting

1. **Read r/Pittsburgh's rules first.** They could not be retrieved while drafting this, so nothing below is checked against them. Look at the sidebar and wiki for self-promotion limits, required flair, or a designated weekly thread. If the rules are unclear, message the mods before posting. Many city subreddits remove app promotion from accounts with no other history.
2. **Merge the site copy fix** (`abridgd-site` PR "Make launch-page claims match the app"), so the page the post links to doesn't list City Paper or claim "0 trackers".
3. **Add the three screenshots** the launch page references (`assets/shot-brief.png`, `shot-reader.png`, `shot-saved.png`). They don't exist yet, so the page currently shows placeholders.
4. **Have working install links**: the current TestFlight public link and the latest GitHub release APK. Test both from a clean phone.
5. Only list sources that are enabled and healthy in `src/data/feedConfig.ts` on the day you post. Run `npm run audit:feeds` first.
6. Don't mention Events or dark mode until they ship.

## Post

**Title:** I built a calmer way to read Pittsburgh news. Looking for beta testers

**Body:**

I'm a local developer, and I got tired of news apps that feel like a slot machine. So I made Abridgd, a free app for iPhone and Android that pulls Pittsburgh reporting from [WTAE, WPXI, WESA, PublicSource, TribLive, the Post-Gazette and more] into one finite morning brief. You get to the end, and then you're done.

What it does:

- One short feed with a real "you're caught up" state, no infinite scroll
- Content notes before heavy stories, and an optional breathing pause that's off by default
- A one-word-at-a-time speed reader if you want it, or read articles the normal way
- Saved articles and your reading progress stay on your phone. No account, no ads
- Turn any outlet off, so the feed is yours

It's a beta and it's rough in places. iPhone is through TestFlight: [link]. Android isn't on Google Play yet, so it's an APK you install yourself, with steps here: [link]. The app links out to the original stories and credits each outlet.

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
| How do I report a bug? | [contact address from the site] |

## Image and video kit

- 3 to 4 phone screenshots: Morning Brief, Reader, Saved, a content note
- A 15 to 20 second screen recording of reaching the end of the feed
- Use the app icon from `assets/icon.png`
- Keep the tone calm and plain, matching `docs/product/vision.md`

## After posting

Reply in the thread yourself, don't argue with critics, and write down every feature request and source suggestion in `todo.md`.
