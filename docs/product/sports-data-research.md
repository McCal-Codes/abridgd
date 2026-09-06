# Sports Data & Live Scores — Research

Last Updated: 2026-09-06
Status: Research only. Nothing decided, nothing built.

## Why this note exists

Sports is already an `ArticleCategory` (`src/types/Article.ts:1`), so sports
*stories* arrive through the normal RSS pipeline today. The open question is
whether Abridgd should also carry **structured** sports data — scores, schedules,
standings — which is a different shape of content with different plumbing.

## The product question comes first

`docs/product/vision.md` lists the core values as **Calm**, **Finite**, **Focused**:

> "No breaking news banners, no red badges, no infinite scroll loops."
> "There is a 'done' state—you can catch up completely."

Live scores are, by construction, the opposite. A live score is a reason to keep
reopening the app, and the natural implementation — a polling ticker that updates
every 30 seconds — is a re-engagement mechanic. That is the thing the product
explicitly refuses to be.

This does not rule sports data out. It rules out one *framing* of it. Two
framings survive the vision test:

- **Settled results.** "Steelers 24 – Ravens 17, final." Yesterday's outcomes and
  today's fixtures, fetched once per session with the digest. Finite, has a done
  state, and reads like the sports page of a morning paper.
- **Follow-up context on a story.** A sports article in the feed gains a small
  provenance-style card showing the relevant final score, so the reader does not
  have to leave to find out what happened.

A live in-progress ticker only fits if it is opt-in, scoped to a team the user
chose, and does not badge or notify. Worth deciding deliberately rather than
arriving at by feature drift.

## Technical constraints specific to this app

**There is no backend.** Nothing in `src/` references a server; state lives in
AsyncStorage. That matters more here than it looks:

- Any API requiring a key would ship that key inside the JS bundle. Verified
  earlier that Expo only inlines `process.env.EXPO_PUBLIC_*` values actually
  referenced in code — but the moment sports code reads one, it is extractable
  from the APK. The Perplexity key avoids this by being user-supplied and stored
  in `expo-secure-store`; a sports key cannot reasonably be user-supplied.
- So the realistic options are: a **keyless** source, a **user-supplied** key, or
  **standing up a proxy** — which means accepting a backend the app has so far
  done without.

**Polling costs battery.** There is no `expo-background-fetch` or
`expo-task-manager` installed. Foreground-only polling is the sane starting
point and happens to align with the "settled results" framing.

**Score parsing is JavaScript**, so it falls under EAS Update ([ADR-0006](../standards/adr/0006-over-the-air-updates.md)) —
a broken parser after a provider changes its response shape is hot-fixable in
minutes rather than a store release. This is a real argument for doing it in JS
rather than native.

## Data sources

Pittsburgh's teams are a small, fixed set — Steelers (NFL), Penguins (NHL),
Pirates (MLB), Pitt Panthers (NCAA) — which keeps request volume trivial and
makes even restrictive free tiers workable.

| Source | Key? | Notes |
|---|---|---|
| **ESPN undocumented JSON** | No key | The endpoints espn.com itself uses. Free, no signup, broad coverage. **Unofficial**: no docs, no SLA, no stability guarantee, and it can change or close without notice. Terms of use are not written for third-party consumption, which is a licensing question, not just an engineering one. |
| **MySportsFeeds** | Yes | Free for non-commercial/hobbyist use across NFL, MLB, NBA, NHL. The non-commercial condition needs checking against a store-listed app. |
| **SportsDataIO** | Yes | Paid from ~$25/mo, with a free trial. Proper licensing and support. |
| **SharpAPI / Sportmonks** | Yes | Free tiers exist; coverage skews toward soccer. |
| **Sportradar** | Yes | Industry standard, enterprise pricing. Overkill here. |

Free tiers typically run 100–1,000 requests/month with **delayed updates of
15–60 minutes**. That delay is fatal for a live ticker and completely irrelevant
for settled results — another reason the second framing is the pragmatic one.

## Store policy

- **Avoid betting odds entirely.** Several of these providers lead with odds
  feeds. Including odds pulls the app into Google Play's real-money gambling
  policy and Apple's equivalent, with age-rating and territory consequences well
  out of proportion to the feature.
- Play's news-aggregator declaration ([Milestone 6](../standards/adr/0006-over-the-air-updates.md))
  is about article sourcing; adding a scores widget should not disturb it, but
  the Data safety form would need updating if any request carries user or device
  identifiers.
- Team names and league logos are trademarks. Text scores are fine; shipping
  club crests is not, absent a licence.

## If this gets built

Rough sequence, smallest useful thing first:

1. A `SportsService` alongside the feed services, returning a normalised
   `GameResult` regardless of provider — so the provider stays swappable, which
   matters a lot when the leading candidate is an unofficial endpoint.
2. Settled results only, fetched with the digest, cached per day.
3. A single card on the Digest screen: yesterday's finals, today's fixtures.
4. Team selection in Settings, defaulting to the four Pittsburgh teams.
5. Live in-progress state only if 1–4 prove worth keeping, and only opt-in.

## Open questions

- Is a backend acceptable? It settles the API-key problem and unlocks the
  licensed providers, but it is a real architectural change for an app that is
  currently entirely local.
- Is the unofficial ESPN path acceptable for a store-listed app, given it has no
  terms permitting third-party use?
- Does "sports scores" actually serve the Pittsburgh-local reader better than
  deepening what already exists — events, resources, mutual aid — which are
  closer to the stated community-first mission?
