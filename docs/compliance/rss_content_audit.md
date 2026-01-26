# RSS Content Use Audit
Last Updated: 2026-01-26
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
- Scrape HTML when RSS is unavailable
- Access feeds explicitly marked as private or restricted

**Risk Level:** Low

---

## 3. Content Usage & Copyright Handling
### Content Displayed
- Article titles
- Publisher-provided summaries or excerpts
- Metadata (author, publication date, source name)
- Thumbnails explicitly included in the feed

### Content Not Displayed
- Full copyrighted articles
- Reconstructed paywalled content
- Stored or cached full article bodies for redistribution
- Content presented in a way that replaces the publisher’s site

### Intended Role of RSS
RSS is treated as:

> A discovery and navigation mechanism, not a content replacement layer.

**Risk Level:** Low to Moderate (industry-standard use)

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
- Does not trap users inside a full-content reader
- Does not monetize publisher content directly
- Does not inject ads into third-party articles

**Risk Level:** Low

---

## 6. Caching & Network Behavior
### Feed Fetching
- RSS feeds are fetched at reasonable intervals
- Requests are rate-limited to avoid server strain

### Caching
- Cached data is temporary
- Cached content reflects publisher-provided summaries only
- No long-term archival of copyrighted text

**Risk Level:** Low

---

## 7. Publisher Control & Opt-Out
The app:
- Respects feed removal or deprecation
- Will remove sources upon valid publisher request
- Does not attempt to evade blocks or access restrictions

Planned / Optional Safeguards:
- Source-level disable switch
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
| Area | Risk |
| --- | --- |
| Illegal access | Low |
| Copyright infringement | Low–Moderate |
| ToS disputes | Low |
| Platform rejection | Low |
| Publisher complaints | Low |

**Overall Assessment:**

> The app’s RSS usage is conservative, defensible, and consistent with established industry practice.

---

## 11. Disclaimer
This document is for **internal documentation and risk assessment purposes only** and does not constitute legal advice.

For commercial scaling or high-traffic deployments, consultation with an IP or media attorney is recommended.

---

## RSS Ethics Statement (for site/App Store)
"Abridgd aggregates publicly available RSS feeds to help readers discover journalism and commentary. We honor publisher ownership by showing source names, linking directly to the original articles, and limiting in-app content to publisher-provided titles, summaries, and thumbnails. We do not bypass paywalls, reconstruct full articles, or monetize third-party content. If a publisher wants adjustments or removal, we will comply promptly."

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
