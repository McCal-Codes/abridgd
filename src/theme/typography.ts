export const typography = {
  fontFamily: {
    // Fraunces (SIL OFL, loaded via @expo-google-fonts/fraunces in App.tsx).
    // Custom fonts don't support synthetic fontWeight on native, so bolder
    // text needs one of the weight-specific families below rather than
    // pairing `serif` with a `fontWeight` style.
    serif: 'Fraunces_400Regular',
    serifMedium: 'Fraunces_500Medium',
    serifSemibold: 'Fraunces_600SemiBold',
    serifBold: 'Fraunces_700Bold',
    sans: 'System',
    mono: 'Courier', // or 'Menlo', 'Monospace'
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 40,
  },
  lineHeight: {
    dense: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  weight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

/**
 * Dynamic Type policy.
 *
 * React Native scales text with the system setting by default, so the app already responds to
 * Larger Text — the risk is unbounded scaling breaking layout, not missing support. iOS goes up
 * to roughly 300%, which is enough to push a thumbnail off a card or truncate a tab label.
 *
 * Reading content stays uncapped: a reader who asked for larger text wants the article larger.
 * Chrome that sits beside a control, or must fit on one line, is capped instead — and capped
 * generously, since anything under about 1.2 defeats the point of the setting.
 */
export const fontScaleLimit = {
  /** Headlines and article body — no cap. Pass `undefined` to maxFontSizeMultiplier. */
  content: undefined,
  /** Buttons and other action labels. */
  action: 1.6,
  /** Row labels that sit next to a switch or chevron. */
  control: 1.5,
  /** Single-line meta text: bylines, timestamps, badges, tab labels. */
  meta: 1.4,
} as const;
