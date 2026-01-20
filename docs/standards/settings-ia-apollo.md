# Abridged — Settings Information Architecture (Apollo)
Version 1.0  
Last Updated: January 20, 2026  
Status: Canonical (use for all Settings work)

## Purpose
Lock the Settings experience to a single, intent-based structure. Use this as the source of truth for navigation, grouping, and naming. No new features are introduced here.

## Apollo Principles (enforced)
- Intent-first, not feature-first.
- Each screen answers one question only.
- Power tools are earned and isolated.
- Debug stays visible but contained.
- No critical controls are hidden.
- Studios/editors are explicitly labeled.

## Top-Level Structure (final)
```
Settings
├─ Reading Experience
├─ Digest & Launch
├─ Grounding & Focus
├─ Navigation
│  └─ Tab Bar Studio
├─ Accessibility
├─ App Info
└─ Debug & Advanced
```
Seven entries only. Anything else is bloat.

## Screen Definitions (exact)

### Reading Experience
**Question:** “How do I read in this app?”  
**Includes:** Reader enabled, Reader mode (RSVP/standard), Reader focus color, Reader font size, Reader focus position (Early/Standard/Center — hide raw %), Reader speed controls, RSVP tutorial (revisit), Sources/feeds management lives here if it remains in Settings.  
**Excludes:** Grounding, animations, app-wide appearance.

### Digest & Launch
**Question:** “What do I see when I open the app, and how are summaries shown?”  
**Includes:** Welcome Back Digest toggle, Digest summary style (Fact-based / AI summary / Headlines only).  
**Scope:** Entry/overview only—no navigation or tab layout controls.

### Grounding & Focus
**Question:** “How does the app help me regulate when content is intense?”  
**Includes:** Grounding enabled, Grounding color, Breath duration, Number of breath cycles, Grounding animation style (Simple/Waves/Pulse), Grounding preview.  
**Tone:** Calm language; no technical/debug terms. Numbers OK for now; migrate to labeled modes later.

### Navigation
**Question:** “How do I move around the app?”  
**Includes:** Default navigation behavior (if not in Digest & Launch), entry point to Tab Bar Studio only. Keep this screen thin.

### Navigation → Tab Bar Studio
**Definition:** A studio (power tool), not a settings list.  
**Includes:** Default tab on launch, Live preview, Presets (iOS 26 Floating/Docked/Compact), Tab style philosophy (Minimal vs Comprehensive), Tab bar appearance (Floating/Compact/Standard, Show labels, Icon size), Advanced appearance (collapsed by default: heights, indicators, badges, content under tab bar), Active tabs (reorder/remove), Available tabs (add).  
**Rules:** Presets are starting points; advanced collapses by default; preview is mandatory.

### Accessibility
**Question:** “How does the app adapt to my needs?”  
**Includes:** Reduce motion, Enable/disable animations, Animation speed, Respect system text size (if not already implicit).  
**Rule:** Accessibility overrides other settings when conflicts arise.

### App Info
**Question:** “What app is this, and how do I contact you?”  
**Includes:** Version, Build, Privacy policy, Terms of service, Send feedback / report bug, What’s new, Redo onboarding, Revisit RSVP tutorial (dup allowed).  
**Behavior:** No feature toggles here.

### Debug & Advanced
**Question:** “What is the app doing, and how do I inspect or reset it?”  
**Keep categories:**  
- Data & Recovery: View stored settings, Reset to defaults, Clear all data.  
- Experiments: iOS 26 UI demo, Tab bar experiments, Apply iOS 26 preset, Experimental navbar toggle.  
- Developer Toggles: Advanced height controls, Verbose logging, Modal presentation style.  
- App State Snapshot: Reader enabled, Grounding enabled, Digest mode, Breath duration/cycles, experimental flags.  
**Rules:** Nothing required; everything reversible; risk is clearly signaled.

## Demotions / Renames / Guards
- **Customization** junk drawer is dissolved: reading controls → Reading Experience; grounding → Grounding & Focus; animation toggles → Accessibility; appearance items that aren’t built stay out.
- **Sources** belong with Reading Experience when presented inside Settings. If a dedicated Sources flow replaces it, remove the Settings entry rather than adding an eighth top-level item.
- **Navigation controls** live in Tab Bar Studio; keep Navigation list minimal.
- **Duplicate entries** allowed only for RSVP tutorial (App Info + Reading Experience) when it improves recall.
- **Debug-only features** stay in Debug & Advanced—never leak into user-facing screens.

## Implementation Notes (current app mapping)
- `SettingsScreen.tsx` must surface exactly the seven top-level entries above; App Info stays as a section on the root screen.  
- `ReadingSettingsScreen.tsx` → Reading Experience.  
- `DigestSettingsScreen.tsx` → Digest & Launch.  
 - `CustomizationSettingsScreen.tsx` has been decomposed: see `GroundingFocusSettingsScreen.tsx`, `AccessibilitySettingsScreen.tsx`, and updated `ReadingSettingsScreen.tsx`.  
- `TabBarSettingsScreen.tsx` → Navigation → Tab Bar Studio.  
- `DebugSettingsScreen.tsx` → Debug & Advanced.  
- `SourcesSettingsScreen.tsx` is housed under Reading Experience until a dedicated sources flow exists outside Settings.

## Enforcement
- Use this IA for new work, refactors, and reviews.  
- If a proposed setting doesn’t fit these questions, reconsider the feature or propose an ADR before adding it.  
- Update this doc and link changes in PR summaries when the IA evolves.
