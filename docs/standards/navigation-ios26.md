# iOS 26 Navigation Patterns — Abridged App
Version 1.0 · January 20, 2026

## Why this exists
Apple is nudging apps toward spatially coherent navigation: fewer hard dividers, context-aware materials, and motion that explains hierarchy. This doc captures how Abridged should apply those patterns.

## Principles
- Tabs stay primary: 3–5 modes, noun labels, no utility tabs (settings/debug).
- Navigation is attached to content: floating/glassy surfaces, minimal chrome.
- Motion explains hierarchy: shared context on transitions, not gratuitous flair.
- Secondary flows use sheets, not deep pushes, to keep context visible.

## Patterns to follow
- **Glass headers:** Use blurred/translucent headers that compress visually. Keep one primary action; overflow secondary actions into a sheet.
- **Navigation subtitles:** Add quiet context under the title (e.g., “Saved · 42 items”). Prefer subtitles over persistent filter chips when scope fits.
- **Floating tab capsule:** Continue using the liquid/floating tab bar with 3–5 semantic tabs. No tabs for settings/modals.
- **Sheets instead of menus:** Prefer medium/large sheets for filters, per-view settings, and quick actions; allow swipe-down dismissal.
- **Matched-geometry feel:** When entering detail (e.g., an article), carry forward the tapped element (image/title) so the destination feels connected. Respect Reduce Motion.

## When to avoid
- Adding utility tabs (Settings, Debug, About) or dense icon rows.
- Hard separators between screens; rely on material/blur and spacing instead of thick dividers.
- Using motion as decoration or gating interactions.

## Implementation notes (React Native / Expo)
- Use `GlassStackHeader` (blur + subtitle) as the default header in navigation.
- Keep tab icons/labels semantic; cap at 5 tabs.
- For sheets, prefer the shared sheet component (or `@gorhom/bottom-sheet` if adopted) and ensure swipe-down dismissal.
- For shared-element style transitions, lean on Reanimated/React Navigation helpers while honoring Reduce Motion.

## Accessibility
- Preserve 44pt hit targets (back/close/primary actions).
- Provide VoiceOver labels for icon-only buttons.
- Respect Dynamic Type and Reduce Motion in headers, sheets, and transitions.

## Deviation log
If we ever break these rules (e.g., adding a utility tab), document the rationale, user benefit, and mitigations here.
