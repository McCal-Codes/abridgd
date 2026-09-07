# RSS Content Use Audit

Last Updated: 2026-09-05

**Correction (2026-08-08):** Sections 2, 3, and 6 below previously stated the app never scrapes HTML and never displays full articles. That was inaccurate — `src/services/FullStoryService.ts` does fetch and extract full article HTML from the publisher's own page (via per-publisher CSS selectors, plus a TribLive-specific WordPress REST API path) to power the in-app "Abridged Reader" view, and caches the extracted text for 24 hours (`src/services/fullStoryCache.ts`). The sections below have been rewritten to describe this accurately rather than scaling the feature back, since it's a deliberate, user-facing reading feature, not an oversight. See the updated risk assessment in Section 10.
**App:** Abridgd
**Purpose:** Document legal, ethical, and platform-compliant use of RSS feeds

---

## 1. Scope of This Audit
This document audits how **Abridgd** consumes, processes, and displays RSS feeds provided by third-party publishers. It is intended to:

- Demonstrate good-faith compliance with copyright law
- Document adherence to publisher intent
- Reduce legal, platform, and reputational risk
- Serve as internal guidance for future development

This audit reflects the app’s **current behavior**, not hypothetical features.

---

## 2. Source Access & Authorization
### RSS Feed Access
- All RSS feeds consumed by the app are:
  - Publicly accessible
  - Not gated by authentication
  - Not paywalled
  - Not reverse-engineered or private endpoints

### Prohibited Access
The app **does not**:
- Bypass login systems
- Circumvent technical access controls
- Access feeds explicitly marked as private or restricted
- Bypass paywalls or reconstruct subscriber-only content (see "Paywall detection" below)

### Full-article extraction (see Section 3 for detail)
When an RSS body is short or a source is known to ship truncated summaries, the app fetches the
publisher's own article page and extracts the main article text via per-publisher CSS selectors
(`src/services/FullStoryService.ts`) to power the in-app "Abridged Reader" view. This is a
publicly-accessible-page fetch (same page a browser would load), not a login/paywall bypass — it
is covered under Section 3's content-usage policy, not this section's "prohibited access" list.

**Risk Level:** Low

---

## 3. Content Usage & Copyright Handling
### Content Displayed
- Article titles
- Publisher-provided summaries or excerpts (from RSS)
- Metadata (author, publication date, source name)
- Thumbnails and inline images explicitly included in the feed or article page
- **Full article body text**, extracted from the publisher's own public article page, for
  sources whose RSS feed ships only a truncated summary (`src/services/FullStoryService.ts`,
  triggered when the RSS body is short or the source is on a known-truncated list). This powers
  the "Abridged Reader" in-app reading view.

### Content Not Displayed
- Reconstructed paywalled content (paywalled/subscriber-only pages are never fetched or bypassed —
  see "Paywall detection" below)
- Publisher advertising, tracking scripts, or page chrome (only the extracted article-body
  selector's content is kept)
- Content presented as Abridgd's own reporting — every article keeps clear source attribution and
  a direct link back to the original (Section 4), and a persistent "Read Full Story on Web" action

### Intended Role of RSS and Full-Article Extraction
RSS remains the primary discovery mechanism — source name, headline, timing, and category all come
from the feed. Full-article extraction is a **secondary, in-app reading convenience** layered on
top of RSS for sources that ship truncated feeds, not a redistribution or archival product:

> Extraction reads the same publicly-accessible page a browser would; nothing paywalled or
> access-controlled is fetched, and every article still links directly to the publisher.

**Risk Level:** Moderate (see Section 10 for the full assessment and mitigations — attribution,
direct linking, a 24-hour cache TTL rather than permanent storage, per-source disable capability,
and the existing publisher takedown/request policy in this document).

---

## 4. Attribution & Publisher Transparency
Each article presented in the app includes:
- Clear publisher name
- Direct link to the original source
- Visual distinction between app UI and publisher branding

The app:
- Does not imply partnership or endorsement
- Does not use publisher logos as primary branding
- Does not obscure the original source

**Risk Level:** Low

---

## 5. Traffic Flow & Publisher Impact
Design intent:
- Encourage users to read full articles on publisher sites
- Preserve publisher traffic and analytics value

The app:
- Offers an in-app full-content reading view (Section 3) but never removes or hides the path back
  to the publisher — a "Read Full Story on Web" action is always present on every article
- Does not monetize publisher content directly (no ads inserted into extracted article text)
- Does not inject ads into third-party articles

**Risk Level:** Low

---

## 6. Caching & Network Behavior
### Feed Fetching
- RSS feeds are fetched at reasonable intervals (5-minute soft cache per source, `src/services/feed/`)
- Requests are rate-limited to avoid server strain; in-flight requests are de-duplicated

### Feed Caching
- Feed-level cached data (headlines, summaries, metadata) is temporary and periodically refreshed

### Full-Article Extraction Caching
- Extracted full-article text (Section 3) is cached per article URL for **24 hours**
  (`src/services/fullStoryCache.ts`), then expires on next read — this is a short-lived reading
  cache to avoid re-fetching a publisher's page on every article view, not a permanent archive or
  redistribution store
- Only the extracted main-article-text selector's content is retained, not the full raw page

**Risk Level:** Low–Moderate (bounded TTL and no redistribution mitigate the exposure introduced
by full-article extraction; see Section 10)

---

## 7. Publisher Control & Opt-Out
The app:
- Respects feed removal or deprecation
- Will remove sources upon valid publisher request
- Does not attempt to evade blocks or access restrictions

Implemented Safeguards:
- Source-level disable switch (`defaultEnabled` in `src/data/feedConfig.ts`, plus a per-user override), so a source can be turned off without a code deploy for user preferences, or with one for the default catalog.

Planned / Optional Safeguards:
- Internal blacklist for disallowed feeds

**Risk Level:** Low

---

## 8. Terms of Service Awareness
While RSS feeds are publicly accessible, publishers may impose usage restrictions via Terms of Service.

Mitigation approach:
- Conservative excerpt-only display
- Clear attribution and linking
- Good-faith response to complaints
- No adversarial posture toward publishers

**Legal Note:**
Potential ToS violations are civil matters, not criminal, and are mitigated by cooperative compliance.

---

## 9. Platform Policy Alignment
This implementation aligns with:
- Apple App Store content aggregation norms
- Common RSS reader precedents (news, podcast, feed apps)
- Industry-standard fair use practices

The app does not:
- Misrepresent content ownership
- Host pirated material
- Enable copyright infringement by design

**Risk Level:** Low

---

## 10. Overall Risk Assessment
| Area | Risk | Why |
| --- | --- | --- |
| Illegal access | Low | Only publicly-accessible pages are fetched; no login/paywall bypass |
| Copyright infringement | Moderate | Full-article text extraction (Section 3) goes beyond RSS-only excerpting; mitigated by direct attribution/linking, a 24h cache TTL (not permanent archival), per-source disable capability, and the takedown policy below |
| ToS disputes | Low–Moderate | Same mitigation set as copyright; cooperative, good-faith response posture (Section 8) |
| Platform rejection | Low | Extraction reads publicly-accessible pages only, consistent with common reader-mode/read-it-later app patterns |
| Publisher complaints | Moderate | Full-text extraction is the most likely source of a publisher complaint; the takedown/request policy (below) exists specifically to resolve this quickly |

**Overall Assessment:**

> The app's RSS usage is conservative and defensible. Full-article extraction is the one area with
> genuine, non-trivial risk — it is a deliberate reading-experience feature, not incidental
> behavior, and is scoped and mitigated (bounded caching, attribution, easy per-source disable,
> a working takedown process) rather than left undocumented.

---

## 11. Disclaimer
This document is for **internal documentation and risk assessment purposes only** and does not constitute legal advice.

For commercial scaling or high-traffic deployments, consultation with an IP or media attorney is recommended.

---

## 12. Source Health & Reliability

Consistent with the publisher-first posture in Sections 7–8, the app periodically probes configured sources for availability and stops pulling from endpoints that are no longer serving readable RSS/Atom content. This is framed as respecting publisher infrastructure — a source returning errors, an HTML page, or an empty feed is not retried indefinitely; it is disabled by default (`defaultEnabled: false` with a `health: "pending-replacement"` note in `src/data/feedConfig.ts`) until a working replacement is confirmed, rather than the app continuing to hit a broken or reconfigured endpoint.

**2026-06-25 source health probe** — the following sources were confirmed non-functional (HTML/403/404/empty/non-feed response) and are currently disabled pending replacement:

| Category | Source |
| --- | --- |
| Top | CBS Pittsburgh |
| Local | New Pittsburgh Courier |
| Local | The Incline |
| Business | Pgh Business Times |
| Business | TribLive Business |
| Sports | TribLive Sports |
| Sports | Penguins |
| Sports | Pirates |
| Sports | Pitt Panthers |
| Culture | City Paper |
| Culture | WESA Arts |

**2026-09-05 source health probe** — every configured URL was re-probed with the app's own
fetch headers (`npm run audit:feeds`, which reads the same list from `src/data/feedConfig.ts`).
12 of 28 sources were returning items. Results, by failure mode:

| Mode | Sources |
| --- | --- |
| Wrong URL shape (feed alive at a different path) | WESA, WESA Arts |
| HTTP 200 serving HTML instead of a feed | CBS Pittsburgh, Penguins |
| Valid rss+xml carrying zero items | TribLive Business, TribLive Sports |
| HTTP 403 bot-block (loads in a browser) | New Pittsburgh Courier, City Paper, Pgh Business Times |
| HTTP 404 | Pirates, TechVibe Radio, InnovatePGH, Pittsburgh Independent, City Cast |
| DNS/connection dead | The Incline, Pittsburgh Mom Collective |
| HTTP 200, empty body | Pitt Panthers |

**Resolution.** WESA was never broken — its feeds live at `<section>.rss`, not `<section>/rss`;
correcting the path restored both the Top-section and Arts feeds. Sources whose domain or path
is gone with no successor were removed outright (The Incline, Mom Collective, TechVibe,
InnovatePGH, Pittsburgh Independent, City Cast, Pirates, Pitt Panthers) rather than left in the
config as permanent dead weight. Seven verified news-outlet feeds were added: Post-Gazette A&E
and Sports, Pittsburgh Union Progress, The Allegheny Front, WQED, and Table Magazine. Enabled
sources went from 12 to 19.

Bot-blocked and empty-feed sources stay listed and disabled with a dated note naming the actual
failure, since a 403 may lift and an empty feed may refill — unlike a dead domain, those are
worth re-probing.

**Closed follow-up:** the 2026-06-25 probe left Pittsburgh Mag as the only enabled Culture
source, flagged then as a single point of failure to resolve. Culture now runs on five verified
sources (Pittsburgh Mag, WESA Arts, Post-Gazette A&E, WQED, Table Magazine). A test in
`src/data/__tests__/feedConfig.test.ts` now fails the build if any category drops below two
enabled sources, so this cannot silently recur. See
[ADR-0005](../standards/adr/0005-feed-pipeline-modularization.md) for the caching/reliability
design this rests on.

**Risk Level:** Low (this section documents operational reliability, not a new legal/compliance exposure)

---

## RSS Ethics Statement (for site/App Store)
"Abridgd aggregates publicly available RSS feeds to help readers discover journalism and commentary. We honor publisher ownership by showing source names, linking directly to the original articles, and offering a convenience reading view built only from each publisher's own public page for sources whose feeds ship truncated summaries. We do not bypass paywalls, redistribute or permanently archive publisher content, or monetize third-party content. If a publisher wants adjustments or removal, we will comply promptly."

---

## Paywall detection (non-bypass)
When identifying paywalled or subscriber-only items, we classify without attempting to evade access controls:

- **Use publisher signals:** Respect tags in RSS/HTML that indicate “subscriber-only,” “premium,” or similar. Only fetch HTML if permitted by ToS/robots, and only to read metadata (not to extract the article body).
- **Heuristics, not circumvention:** Short summaries plus “subscribe/premium” language, or known paywalled hosts, are treated as likely paywalled. Default to “may require subscription.”
- **No reconstruction:** Do not strip, render, or rebuild paywalled pages. Link users to the publisher instead.
- **Robots/ToS first:** If robots.txt or ToS disallow crawling beyond RSS, do not fetch the page; classify conservatively.
- **Publisher-first posture:** If a publisher requests removal or different handling, comply promptly. Prefer official APIs or licenses for deeper access.

---

## How paywalls work (reference)
Typical mechanisms publishers use to control access:

- **Hard paywall:** No full content without authentication/subscription; server or client blocks the body entirely.
- **Metered paywall:** Limited free articles per period; usage tracked via cookies/localStorage/account/session; access is blocked after the meter is reached.
- **Freemium/partial:** Some articles are free; others are marked “subscriber-only,” often showing only headline/lede.
- **Client-side overlay:** Page loads, then a script overlays/blurs content or shows a modal based on your state.
- **Server-side gating:** Server varies the payload (summary vs. full) based on auth/entitlements/referrer/device.
- **Tracking/heuristics:** Cookies/localStorage, IP, device/browser fingerprinting help enforce meters and limits.
- **Referrer/device rules:** Different allowances for search/social referrers or mobile vs. desktop; bot blocking may apply.
- **Structured signals:** Markup (e.g., `meteredPaywall`, subscription meta tags, AMP access rules) can indicate restricted content.

Compliance posture: respect the publisher’s Terms of Service. Subscribe/use approved APIs for full access; do not bypass.

---

## Publisher takedown/request policy (template)
**Purpose:** Provide a clear path for publishers to request changes or removal.

- **Contact:** `support@abridgd.app` (or designated inbox). Include “RSS Takedown Request” in the subject.
- **What to include:**
  - Source/feed URL(s)
  - Screenshots or examples
  - Requested action (remove source, change handling, update attribution)
  - Proof of ownership/authorization
- **Process:**
  1) Acknowledge within 2 business days.
  2) Temporarily disable the source in-app while reviewing (if the request is credible).
  3) Verify ownership and scope; confirm whether removal or handling change is required.
  4) Implement the change (disable/remove/update attribution) and purge cached items.
  5) Confirm resolution back to the requester.
- **Data handling:** Remove cached articles from the affected source during the takedown action.
- **Appeals/updates:** Publishers can re-enable by written request once concerns are resolved.

---

## Next steps (optional)
- Tighten this doc to a more formal legal style if needed.
