# ADR 0004: Theming and Semantic Colors

**Date**: 2026-01-15  
**Status**: Accepted  
**Author**: Engineering Lead

## Context

The Abridged app supports both light and dark modes. We needed a color system that is:
1. **Semantic**: Colors convey meaning (primary action, success, error) not just hue.
2. **Accessible**: Contrast ratios meet WCAG AA standards in both modes.
3. **Maintainable**: Single source of truth; easy to adjust across the app.
4. **Dynamic**: Respects iOS system settings (light/dark mode toggle).

Without a systematic approach, individual screens might use different shades of blue for buttons, leading to inconsistency and accessibility failures.

## Decision

**Use semantic color tokens (CSS-in-JS pattern) with a centralized theme file.**

Specifically:
- Define colors in `src/theme/colors.ts` using semantic names:
  - `primary` (brand color for main actions)
  - `secondary` (alternate actions)
  - `success` (positive feedback, e.g., saved article)
  - `error` (warnings, deletions)
  - `background`, `surface` (UI containers)
  - `text`, `textSecondary` (typography)
  - `border`, `divider` (layout)
- Each semantic token has a light-mode and dark-mode variant.
- Use `useColorScheme()` from React Native to detect system mode.
- Components import from `src/theme/colors.ts` instead of hardcoding hex values.

**Rationale:**
- Semantic tokens reduce decision-making ("what color should this button be?" → check `primary`).
- Centralized theme makes bulk changes easy (e.g., rebrand by changing 3 token values).
- Automatic dark-mode support via `useColorScheme()`.
- Accessibility: we can validate contrast ratios once, in the theme file.

## Consequences

**Positive:**
- Design consistency across screens.
- Easy to implement dark mode; just add a `dark: { ... }` object.
- One-file color audit (vs. hunting through 20 screens).
- New contributors can quickly understand the color palette.

**Negative:**
- Requires discipline: devs must use tokens, not hardcoded colors.
  - *Mitigated by: Linting rule (optional, future); design reviews.*
- If colors are very app-specific, generic semantic names might feel awkward.
  - *Mitigated by: Supplementary names (e.g., `newsBlue` alongside `primary`).*

## Alternatives considered

1. **Hardcoded colors in each component**
   - Rejected: Inconsistency, no dark-mode story, hard to maintain.

2. **CSS-in-JS library (styled-components, emotion)**
   - Rejected: Adds dependency; React Native supports inline styles natively.

3. **Designer tool with design tokens export (Figma tokens)**
   - Rejected: Overkill for current team size; tokens are simple enough to hand-maintain.

## Token naming convention

- Semantic: `primary`, `secondary`, `success`, `error`, `warning`, `info`
- Background: `background`, `surface`, `surfaceVariant`
- Typography: `text`, `textSecondary`, `textDisabled`
- Borders: `border`, `divider`, `outline`
- Feedback: `success`, `error`, `warning`

Example:
```typescript
export const colors = {
  light: {
    primary: '#0066CC',
    secondary: '#6200EE',
    error: '#B00020',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
  },
  dark: {
    primary: '#99CCFF',
    secondary: '#BB86FC',
    error: '#FF6B6B',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
  },
};
```

## Contrast validation

- Light mode: `text` (black) on `background` (white) ≥ 4.5:1
- Dark mode: `text` (white) on `background` (dark) ≥ 4.5:1
- All semantic colors (e.g., `error`) meet WCAG AA in both modes.
- Audit performed in `docs/standards/a11y-audit.md`.

## Implementation notes

- Colors are defined in `src/theme/colors.ts`.
- Theme is selected via `useColorScheme()` hook (React Native).
- Components use `useTheme()` custom hook to access the current theme.
- See `src/theme/typography.ts` and `src/theme/spacing.ts` for related design tokens.
- Dark mode is tested on every PR (see `docs/standards/afterflight.md`).

## Future considerations

- If design system grows, consider exporting tokens from Figma (via Tokens Studio or similar).
- Add a theme preview screen in Settings/Debug for QA and design verification.
