# Abridged v1.4.2 — Beta Testing

Last Updated: 2026-07-01

Thank you for joining the Abridged beta! This build focuses on feed reliability, faster loading, and a calmer first-run experience.

### What's New in This Build

✨ **Morning Brief** — Home now opens with a finite, calm "Morning Brief" catch-up instead of an endless scroll, with honest "last updated" and cached-state messaging when a refresh doesn't succeed.
✨ **Faster launch** — Home and Section feeds now show your last-loaded stories immediately on open instead of waiting on a network round-trip every time; fresh stories load in behind the scenes.
✨ **More reliable feeds** — We audited every RSS source and turned off the ones that were silently broken, so a single dead feed can no longer blank out an entire section. Healthy sources now keep working even when one source is down.
✨ **Faster article opening** — Full-story content is now cached per article, so re-opening something you already read doesn't re-fetch it from the source site.
✨ **"Why this story?" panel** — Tap the new info action on an article to see its source, category, publish time, and why it's in your feed — plainly stated, no algorithmic-ranking claims.
✨ **Five-slide onboarding** — First run is now a shorter, app-like welcome flow with one optional grounding-preference choice instead of upfront layout configuration.

### What's Included

✓ Morning Brief home feed with Today's Brief and Continue Reading
✓ Section feeds (Local, Business, Sports, Culture) with pull-to-refresh
✓ Daily Digest — summarized top stories, with an optional on-device Perplexity key for AI summaries
✓ Saved Articles with swipe-to-save gestures
✓ Abridged Reader — a condensed, distraction-light reading mode
✓ Sensitive-content grounding: an optional pause/breathing prompt before emotionally heavy stories
✓ Reading progress tracking (Continue Reading, completion percentage)
✓ Light & dark themes with automatic system switching
✓ iOS 26-inspired glass UI (blur sheets, glass tab bar)

### What We're Testing

We especially need feedback on:
- **Feed reliability**: Do Local/Business/Sports/Culture ever show fewer stories than you'd expect, or an error where you wouldn't expect one?
- **Launch speed**: Does Home/Section feel instant on a warm relaunch? Does pull-to-refresh still work as expected?
- **Article loading**: Does opening an article feel immediate? Does the "full story" ever fail to load or show stale/short content?
- **Trust panel**: Does the "Why this story?" panel open reliably and read clearly, including with VoiceOver?
- **Onboarding**: Does the new five-slide flow feel too short, too long, or confusing on first launch?
- **Stability**: Any crashes, freezes, or stuck loading states?

### Known Limitations

⚠️ The Culture section currently relies on a single healthy source (Pittsburgh Mag) after disabling two broken feeds — expect thinner Culture coverage until a replacement source is added.
⚠️ Offline reading is not yet supported.
⚠️ Custom RSS feeds remain "coming soon."

### How to Report Issues

Found a bug? Use the "Report a Bug" option in Settings — it pre-fills your device info and app version.

For detailed feedback: contact@mcc-cal.com

### Thank You

Your testing and feedback are invaluable. Help us build the best calm news reader for Pittsburgh.

Happy reading!

---

Build: 1.4.2 | iOS 15.0+ | Questions? Email contact@mcc-cal.com
