# Resources

Last updated: 2026-11-05

A Settings screen (Settings > Resources) listing local help and services, for the moments a story
lands close to home or someone just needs a number. It follows the product rules in
[vision.md](./vision.md): nothing is tracked, nothing needs an account, and it works offline.

## What it is

- **Bundled and offline.** The list lives in `src/features/resources/data.ts`. There is no network
  request and no analytics event; the app never learns which entry anyone opened.
- **Hand-off to the phone.** Call and Text buttons open the dialer or messages app through `tel:`
  and `sms:` links built only from this bundled list (`phone.ts`). If a device cannot place calls
  (a tablet), a message shows the number instead of doing nothing.
- **Emergencies first.** "In an emergency, call 911" sits above everything, and the crisis lines
  come before everyday services.
- **Honest about itself.** The footer says when the numbers were last checked and that Abridgd is
  not affiliated with these services.

## Current entries

| Entry | Number | Notes |
|---|---|---|
| 988 Suicide & Crisis Lifeline | 988 (call or text) | Free, 24/7 |
| Re:solve Crisis Network | 1-888-796-8226 | Allegheny County, 24/7 |
| Crisis Text Line | Text HOME to 741741 | Free, 24/7 |
| 211 Southwest PA | 2-1-1 | Food, housing, bills, care |
| Greater Pittsburgh Community Food Bank | 412-460-3663 | |
| Allegheny Link | 866-730-2368 | Housing and county services, Mon to Fri, 8 to 5 |

Verified against several sources on 2026-11-05. Pittsburgh's 311 line was left out because its
number could not be confirmed.

## Changing the list

A wrong number in a crisis list does real harm, so changes are deliberate:

1. Confirm the number and hours on the organization's own site.
2. Update the entry and `LAST_VERIFIED` in `data.ts`.
3. Run `npm test`. `data.test.ts` checks every entry has an action, that every number becomes a
   valid link, that links are https, and that the list was verified within a year. That last check
   is intentionally time-based: when it fails, re-check the numbers rather than silencing it.
4. Update the table above and the `[Unreleased]` changelog.

Entries that are national (988, Crisis Text Line) are stable; the local ones (Re:solve, Allegheny
Link, the food bank) are the ones to re-check.
