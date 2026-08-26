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
