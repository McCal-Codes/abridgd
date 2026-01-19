# Grounding UX Spec — One Pager

**Goal**
Provide a calm, optional regulation layer that respects reading flow. Grounding is never prescriptive; it simply offers a rounded, breathing surface the reader can enter and exit at will.

---

## Appearance Principles
- Rounded geometry everywhere (full-bleed cards, sheets, buttons).
- "Motion over instruction": breathing loops explain themselves; no text coaching or timers.
- Never mimics loading states—no spinners, bars, or rigid arcs.
- Stillness feels alive via subtle micro-motion rather than frozen UI.

---

## Style System (fixed set)
| Style | Description | Default Use |
| --- | --- | --- |
| **Steady** | Full-screen rounded rectangle that gently inhales (expand), pauses, exhales (contract). Exhale is longer. | Global default anytime grounding launches. |
| **Settle** | Low-amplitude gradient/vignette that slowly exhales without holds; ideal for decompression. | Post-article offers. |
| **Anchor** | Edge-originating cues; center stays calm. | Inline pull-down reset. |
| **Companion** | Rounded blob with abstract face and breathing rhythm. Hidden unless toggled in settings. | Opt-in only. |

---

## Tiered Triggers & UX
1. **Tier 0 — Never interrupt**
   - Grounding never starts itself mid-article.

2. **Tier 1 — Gentle pre-entry**
   - Shown before opening qualified articles (content warning, high emotional intensity, long-form tension).
   - UI: one-line affordance above headline — *"Take a breath before reading"* with Skip.
   - Tap launches **Steady** for ~20–30s.

3. **Tier 2 — Optional inline reset**
   - Available during reading via manual pull-down, or surfaced when scroll depth + dwell time indicate strain.
   - UI: rounded sheet revealed from top, default **Anchor**, dismiss with tap.

4. **Tier 3 — Post-article decompression**
   - Offered at the end of heavy content (or when user toggles "Offer after heavy articles").
   - UI: bottom sheet prompt — *"Reset before moving on"*, launches **Settle** for 30–60s.

**Never**: forced sessions, mid-sentence popups, coaching language, or "you should calm down" framing.

---

## Defaults & Settings (minimal)
- Grounding mode: **On** by default.
- Style default: **Steady**.
- Pace: Standard (≈30s loops). Optional Slow pace extends exhale but keeps rhythm ratios.
- Offers: Pre-entry **On**, post-article **Off** until user opts in.
- Sensory toggles: Reduce motion, Reduce brightness shifts, Haptics On/Off, Sound Off/On.

Copy blocks:
- **Grounding description:** *"A brief, optional pause to help you stay oriented while reading."*
- **Before heavy articles:** *"Offer a short reset before starting."*

---

## Success Criteria
- Reader always feels in control (clear Skip/Dismiss, no forced overlay).
- Editorial tone stays calm and serious—no therapy promises.
- 90%+ of scenarios handled by defaults; settings exist but remain tucked away.
- Implementation hooks align with CMS flags + heuristics (see companion docs).
