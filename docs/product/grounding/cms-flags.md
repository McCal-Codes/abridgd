# Grounding Content Flags & Fallback Logic

**Purpose**
Expose lightweight editorial metadata that tells the app when to offer grounding, with transparent heuristics when metadata is missing.

---

## Editorial Schema (preferred source)
| Field | Type | Values | Notes |
| --- | --- | --- | --- |
| `emotional_intensity` | enum | `low`, `medium`, `high` | High triggers Tier 1 offer + Tier 3 prompt options. Medium is informational only. |
| `content_warning` | boolean | true/false | Indicates explicit violence, abuse, self-harm, disaster. true triggers Tier 1 offer and marks article as "heavy" for post-offers if user opts in. |
| `warning_tags` | array<string> | e.g., `violence`, `war`, `court-testimony` | Optional, surfaced in CMS only for transparency + analytics. |
| `recommended_grounding_style` | enum | `steady`, `settle`, `anchor`, `companion` | Optional override. Defaults follow UX spec; Companion ignored unless user opted in. |
| `post_offer_allowed` | boolean | true/false | Lets editors suppress Tier 3 even if intensity is high (e.g., time-sensitive breaking news). Defaults to true. |

**Workflow guidance**
- Editors already label content warnings; reuse the same UI with one additional dropdown for intensity.
- Defaults: `emotional_intensity = medium`, `content_warning = false`, `post_offer_allowed = true`.

---

## Heuristic Fallback (when metadata missing)
Only activates for Tier 1 suggestion; never auto-starts grounding.

**Inputs**
- Section / topic taxonomy
- Keyword list (violence, assault, overdose, wildfire, etc.)
- Article length (word count) and structure (number of paragraphs)
- Published time and source reliability (optional confidence weighting)

**Scoring**
1. Start at 0.
2. +2 for each keyword match (cap at +4).
3. +2 if in high-intensity sections (courts, crime, disasters, national security).
4. +1 if estimated read time > 6 minutes.
5. +1 if includes gallery or graphic markers.

**Decision**
- Score ≥4 ⇒ suggest Tier 1 pre-entry offer (display text identical to editorial flow).
- Score <4 ⇒ no grounding prompt.
- Heuristic never enables Tier 2 or Tier 3 by itself and never overrides editorial suppression.

**Transparency**
- Log when heuristics fire (article id, score, matched signals) for tuning.
- Surface a lightweight badge in CMS dashboards so editors can override by adding official metadata.

---

## App Logic Summary
1. **Article load** → read editorial flags.
2. **Pre-entry (Tier 1)**
   - Trigger if `content_warning = true` OR `emotional_intensity = high` OR heuristic score ≥4.
   - Use `recommended_grounding_style` if present; otherwise launch Steady.
3. **Inline reset (Tier 2)**
   - Driven by client-only signals (scroll depth/time), independent of CMS fields.
4. **Post-article (Tier 3)**
   - Trigger if `content_warning = true` OR `emotional_intensity = high`, AND user toggled "Offer after heavy articles", AND `post_offer_allowed = true`.
   - Launch Settle by default unless editor overrides style.

---

## Data Model Placement
- Add fields to the article record in CMS (e.g., Contentful or Sanity) with clear editorial descriptions.
- Sync fields through content API → mobile article schema without transformation.
- Keep fallback scoring inside ingestion service so mobile clients receive a boolean `should_offer_pre_entry` flag plus metadata (who set it: `editorial` or `heuristic`).

---

## QA & Analytics
- Track uptake: prompt views, accepts, skips, completion % (no per-user health data, only aggregated counts).
- Compare heuristic-triggered vs editorial-triggered acceptance to tune keywords.
- Provide weekly editor report listing articles lacking metadata but repeatedly scoring high heuristically.
