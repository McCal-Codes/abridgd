# Structured Data & Better Viewables — Research

Last Updated: 2026-09-06
Status: Research only. Nothing decided, nothing built.

## The idea

Today Abridgd renders exactly one kind of thing: an article. Everything in the
app — the feed, the digest, saved items, the RSVP reader — is text with
provenance attached.

The proposal is a second kind of thing: **structured data, rendered as a
viewable**. A final score. Tomorrow's forecast. The next three buses. A council
vote tally. Not prose about the thing — the thing itself, laid out to be read at
a glance.

The important realisation is that this is **one primitive, not one feature**.
Once the app can render a compact table or stat card with a source and a
timestamp, sports results, weather, transit, and civic data all become the same
component with different adapters behind it. Building "live scores" gets you
scores. Building the viewable gets you all of it.

## What fits the product, and what does not

`docs/product/vision.md` commits to **Calm**, **Finite**, **Focused**:

> "No breaking news banners, no red badges, no infinite scroll loops."
> "There is a 'done' state—you can catch up completely."

That rules out anything that updates while you watch it. A live score ticker or
a minute-by-minute bus countdown is a reason to keep reopening the app — the
exact mechanic the product refuses to be.

What passes the test is **data with a settled state**:

| Fits | Does not fit |
|---|---|
| Yesterday's finals, today's fixtures | Live in-progress ticker |
| Today's forecast and any active alerts | Radar that refreshes while you watch |
| Scheduled departures for a saved stop | Real-time "arriving in 3 min" countdown |
| A council vote result, a budget line | A live-updating results dashboard |

Same data in every row. The difference is whether the app is presenting a
finished fact or asking you to keep watching.

## Why civic data is the better starting point

Sports data is entirely commercially licensed. Civic data is largely public
domain — and this app has no backend, so that difference decides things.

Any provider requiring a key would ship that key inside the JS bundle. (Verified
earlier: Expo only inlines `process.env.EXPO_PUBLIC_*` values actually
referenced in code, but the moment feature code reads one it is extractable from
the APK. The Perplexity key sidesteps this by being user-supplied and stored in
`expo-secure-store`; that trick does not generalise.)

So keyless, openly-licensed sources are worth far more here than they would be
in an app that already had a server.

### Sources, ranked by fit

**National Weather Service — `api.weather.gov`**
The strongest candidate by some distance. No API key, no registration, no paid
tier. US Government public domain, explicitly free to use for any purpose,
roughly 5,000 requests/hour. Requires a descriptive `User-Agent` identifying the
app and a contact — trivial, and it rejects requests without one. Forecasts and
active alerts for Pittsburgh, keyless and properly licensed, with no backend
needed.

**WPRDC — `data.wprdc.org`**
The Western Pennsylvania Regional Data Center, run by Pitt's UCSUR with the City
and Allegheny County. CKAN-based open data covering transportation, public
safety, budgets, permits. Public datasets, mostly static or slow-moving, which
suits a daily digest better than a live feed does. The closest match to the
vision's "Local Resources" and "Community Events" pillars.

**Pittsburgh Regional Transit**
Split personality. Static GTFS schedules are downloadable and open — fine for
"next scheduled departures". The TrueTime **real-time** API requires a
registered key, which reintroduces the key problem. Given the vision rules out
live countdowns anyway, the static half is both the licensable part and the part
that fits.

**Sports (ESPN, MySportsFeeds, SportsDataIO, Sportradar)**
ESPN's undocumented JSON endpoints are keyless and broad, but unofficial: no
docs, no SLA, and no terms permitting third-party use — a licensing question,
not merely a stability one. The licensed alternatives all need keys and mostly
gate live updates behind paid tiers, with free tiers delayed 15–60 minutes.
Conveniently, that delay is irrelevant to settled results, which is the only
framing that fits anyway.

**Hard avoid: betting odds.** Several sports providers lead with odds feeds.
Including them pulls the app into Google Play's and Apple's real-money gambling
policies, with age-rating and territory consequences far out of proportion to
the feature.

## Technical notes

- **Rendering is JavaScript**, so adapters fall under EAS Update
  ([ADR-0006](../standards/adr/0006-over-the-air-updates.md)). When a provider
  changes its response shape, that is a minutes-long hot fix rather than a store
  release. This is a strong argument for keeping adapters in JS.
- **Reuse the provenance model.** `ArticleProvenance` in
  `src/types/Article.ts:23` already carries source name, domain, timestamp and an
  inclusion reason. A structured viewable needs exactly the same fields, and
  Play's news-aggregator policy already requires showing source and date. Worth
  generalising rather than inventing a parallel shape.
- **Caching mirrors the feed.** Per-source caching already exists
  ([ADR-0005](../standards/adr/0005-feed-pipeline-modularization.md)); a data
  viewable is another source with a longer TTL.
- **Trademarks.** Text scores and team names are fine; club crests and league
  logos are not, absent a licence. Weather and civic data carry no such issue.
- **Data safety.** Any request carrying a location — a saved transit stop, a
  forecast point — becomes a Play Data safety disclosure. Coarse city-level
  requests avoid it; precise coordinates do not.

## If this gets built

Smallest useful thing first, proving the primitive before the content:

1. A `DataCard` component — title, rows, source, timestamp — reusing the
   provenance treatment articles already have.
2. Weather as the first adapter. Keyless, public domain, genuinely useful daily,
   and it validates the primitive with no licensing question to resolve.
3. One card on the Digest screen, alongside the existing summary.
4. A second adapter — civic or sports — to prove the abstraction holds.
5. Team or stop selection in Settings only once more than one adapter exists.

## Open questions

- Does a data card belong on Digest, on Home, or as its own surface? Digest has
  the strongest claim: it is already the "here is your day" screen.
- Is a backend ever acceptable? It would unlock the licensed sports providers and
  PRT real-time, at the cost of an architecture the app has so far done without.
- Does this deepen the Pittsburgh-local mission, or dilute a reader into a
  dashboard? Weather and transit clearly serve "Local Resources". Sports is
  less obviously in service of the stated community-first mission.
