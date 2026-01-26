# Onboarding + What’s New Standard (iOS 26)
Last Updated: 2026-01-26

**Caleb voice-preserving rules.** Default rubric for reviewing/revising onboarding (first run + major re-entry) and What’s New (post-update highlights). Goal: improve clarity, pacing, and iOS 26 fit **without rewriting Caleb’s voice**. Micro-adjustments only.

---

## Core Principle
Do **not** rewrite copy. Do **micro-adjustments** only.

Allowed edits:
- Remove redundancy
- Split a sentence into two beats for rhythm
- Replace one vague word with one concrete word
- Move a line to a better screen
- Add one short line tying a feature to a real user moment

Not allowed:
- Turning the voice into marketing
- Removing personality lines unless they confuse or overpromise
- “Polishing” into blandness

---

## What iOS 26 Rewards
Onboarding and What’s New should:
1) Feel like the real app (not a tutorial layer)
2) Show value fast (under 5 seconds)
3) Use progressive disclosure (avoid feature dumps)
4) Use reversibility language (“optional”, “change anytime”, “not now”)
5) Prefer “show me” UI stubs over logo/icon moments
6) Avoid dead interactions (no button should do nothing)
7) Respect accessibility (Reduced Motion must not break meaning)

---

# Part A: Onboarding Standard

## Canonical 5-Slide Flow (keep order unless strong reason)
1) Welcome / problem recognition (human, fast)
2) Live demo of core mechanic (the “aha”)
3) Optional grounding (sensitive UX, reversible choice)
4) Make it yours (personalization, proof via UI stub)
5) Trust pledge + start (no account/no tracking + CTA)

## Slide-by-Slide Audit Template
For each slide, produce:
- **What works** (keep)
- **What’s fighting you** (risk)
- **Micro-adjust** (minimal change)
- **UI note** (visual proof / component change)
- **Pass criteria** (when this slide is “done”)

## Slide Standards (rules)
**1) Welcome**
- Clean, controlled paragraph (avoid stacking many reasons)
- If title is bold, description must be short and grounded
- Prefer a small feed preview stub over a large icon placeholder

**2) RSVP Demo**
- Keep concrete explanation: “one word at a time, locked in place”
- Personality allowed if it reinforces calm + humanity
- Avoid medical claims; playful metaphors okay if clearly playful
- Avoid immediate autoplay that feels out of control (tap-to-start or auto-run then pause)

**3) Grounding**
- Must say: optional + reversible
- Tie to a future moment: when it appears (heavy stories), what it costs (~30s), skipping is fine
- Compact height: reduce density via layout, not tiny fonts

**4) Make It Yours**
- Keep “quiet corner of the internet” vibe
- Show a settings preview stub (2–3 static toggles/sliders) instead of icon-only placeholder

**5) Ready**
- Trust pledge belongs here
- Avoid literal overpromises (“just the news” → “no clutter”)
- Dual CTA is good (Start vs Fine-tune)

## Cross-Slide Non-Negotiables
- No dead buttons: if it looks tappable, it must do something
- Skip must not punish the user
- Density adapts to height (especially grounding slide)
- “Show me the app” beats “logo time”

## Priority Fix Order (minimal disruption)
1) Make “Swipe to continue” tap-advance (no dead button)
2) Reduce grounding slide density on compact height (layout, not copy)
3) Replace icon-only placeholders (slides 1 + 4) with UI preview stubs

---

# Part B: What’s New Standard

## Purpose (different from Onboarding)
What’s New re-orients returning users quickly, highlights meaningful changes, offers a clean “Done,” and avoids re-teaching basics.

## When to Show
- Show only when app version changed meaningfully (major or feature release)
- Only if user hasn’t dismissed this version yet
- Store last-seen version (e.g., `lastSeenWhatsNewVersion`) and compare to current
- Pass: user sees it once per version, not every launch

## Content Rules
Each item must be one of:
1) User-facing feature (new capability)
2) Noticeable experience change (speed, stability, UI behavior)
3) Policy/trust change (privacy, accounts, tracking)
4) Naming/branding change (only if users will notice)

Avoid (or demote to changelog):
- Developer workflow changes
- Internal docs improvements (unless user-facing)

If internal change is included, phrase as user outcome (“Faster updates”, “More reliable releases”).
Pass: a non-developer user finds every bullet relevant.

## Layout Rules (iOS 26 fit)
**Header**: Title “What’s New”; version label `vX.Y.Z`; short, calm subtext.
**Feature cards**: 3–6 items max; title short; description 1–2 sentences; optional “Learn more”. Prefer a single “Done” action that marks seen; per-item dismiss only if lightweight.
**Exit**: One strong “Done”; don’t trap users.
Pass: readable in <20s, exits cleanly.

## Voice Rules (Caleb style, minimal change)
- Human, specific, not hype-y, slightly warm/editorial
- Allowed: “on your terms”, “quiet”, “clean”, “no noise”, “we’re glad you’re here”
- Avoid: “revolutionary”, “best ever”, overly internal details

## Applying the Standard (guidance)
- Keep original item titles/descriptions visible when auditing.
- Suggest minimal edits focused on user impact clarity.
- Flag internal-only items to move to changelog.

## Output Requirements When Using This Standard
- When auditing: keep original text visible; propose minimal edits; flag internal items.
- When changing code: do **not** modify files in place; create a COPY file (e.g., `WhatsNewScreen.v2.tsx`) and include a short changelog comment at top.
