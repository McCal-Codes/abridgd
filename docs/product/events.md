# Local events

Last updated: 2026-11-05

A short, finite look at what is happening around Pittsburgh in the next 14 days. It follows the
product rules in [vision.md](./vision.md): calm (no badges, no live counts), finite (it ends), and
private (no account, no location, no tracking).

## Where it appears

- **Home:** a "This week" card with up to three events and a "See all events" link. It renders
  nothing while loading and nothing when there is nothing to show.
- **Events screen:** every event in the next 14 days, grouped by day, with filter chips and a
  finish line. Reached from the Home card.
- **Event detail:** a sheet with the organizer's summary, **Open on {organizer}**, **Save**,
  **Calendar** and **Share**.

## Sources

Every source is public, keyless and read directly from the organizer. Each event links back to the
organizer's own page and credits it ("Listed by ..."). Nothing is proxied.

| Source | How it is read |
|---|---|
| Kidsburgh, WQED, Bloomfield Development Corporation, Pittsburgh Parks Conservancy, Heinz History Center, Carnegie Museums | The Events Calendar (WordPress) JSON API: `/wp-json/tribe/events/v1/events` |
| City of Pittsburgh council and committee meetings | Legistar public API, `Events` endpoint only (other endpoints need a token) |

The list lives in `src/features/events/eventSources.ts` with a dated health note per source.
Run `npm run audit:events` to re-check them against the live web (not part of PR CI).

### Adding an organizer

Most local organizers use The Events Calendar plugin. To add one:

1. Check `https://<site>/wp-json/tribe/events/v1/events?per_page=1` returns JSON.
2. Add an entry to `EVENT_SOURCES` (`kind: "tribe"`, `baseUrl`, and a `defaultArea` only if every
   event is in one part of town).
3. Run `npm run audit:events`, then add a dated `healthNote`.

### Candidates checked and rejected (2026-11-05)

An earlier version of this page said iCal/RSS-only organizers "need a new parser kind". Checking each
one against the live site found none worth a parser:

| Candidate | What was found |
|---|---|
| East Liberty Development, Downtown Pittsburgh Partnership | `feed/?post_type=tribe_events` is not an events feed on these sites: it returns the ordinary news posts (no event dates), and `?ical=1` returns HTML. Their events are not machine-readable without a key. |
| Mattress Factory | The iCal export ignores date filters and paging: the same 50 events from Nov 2023 to Aug 2025, none upcoming. |
| Pitt campus calendar | A 1.6 MB iCal of 1,500 mostly campus-only events. Too heavy and the wrong audience. |

Build an iCal or RSS reader when there is an organizer that needs one and passes this check. Until
then it would be code with no consumer.

## Photos

The Events Calendar's JSON lists an event's photo with its resized versions. `pickEventImage` takes
the smallest version at least 600px wide (not the original upload), upgrades http to https, and
rejects non-http schemes and tracking beacons. Of 117 live events checked, 68 (58%) had a photo
(Kidsburgh 43 of 50, WQED 16 of 50, Parks Conservancy 7 of 7, Bloomfield 2 of 2, Heinz History
Center 0 of 8). The photo shows at the top of the event detail sheet, is decorative to screen
readers, is skipped in "text-only" image mode, and disappears if it fails to load. List cards stay
text-only.

## Areas and filters

Filter chips are built from what is listed, not hard-coded: All, Today and This weekend when they
would show something, then one chip per area that has events. An area comes from the venue's ZIP
code (`areas.ts`). ZIP codes are not neighborhoods, so the labels name a part of town (for example
"East End" covers East Liberty, Shadyside, Oakland, Squirrel Hill and Point Breeze). Venues in other
municipalities are "Outside the city", and events with no place that say they are virtual are
"Online".

## Add to calendar

The **Calendar** button uses the device's own add-event screen through `expo-calendar`'s
`createEventInCalendarAsync`: Android's calendar insert intent and iOS's event editor. The person
reviews the event, picks a calendar and saves it.

- No calendar permission is requested and the app never reads the calendar. The `expo-calendar`
  config plugin is deliberately **not** used, since it would add read and write permissions this
  flow does not need, and `READ_CALENDAR` / `WRITE_CALENDAR` are listed under `blockedPermissions`.
- iOS 16 and earlier require calendar access for the editor; the Info.plist usage strings explain
  that the app does not read the calendar.
- If the native screen is unavailable or throws, a Google Calendar link opens in the browser.
- **Not yet confirmed on a device:** all-day event times on Android (UTC midnight) and iOS.

## Saved events

Saved events are stored on the device per profile (`@abridged_saved_events_<profileId>`), with the
full event, so they stay readable after the listing leaves the window. They are dropped a month
after they end, and cleared by "Delete local data". A failed read never overwrites stored data.

## Limits

- A fetch that fails keeps each organizer's last good events; the screen says which organizer could
  not be reached.
- Events refresh at most every two hours; pull to refresh forces it.
- Bloomfield Development Corporation's host sits behind an anti-bot captcha that sometimes
  challenges automated clients; the app treats that as a failed fetch.
