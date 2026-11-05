import { darkColors, lightColors, ThemeColors } from "../ThemeContext";

/** WCAG 2.x relative luminance and contrast ratio. */
const channel = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const luminance = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};
export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const AA = 4.5;

describe.each([
  ["light", lightColors],
  ["dark", darkColors],
] as [string, ThemeColors][])("%s theme text contrast (WCAG AA, 4.5:1)", (_name, colors) => {
  const surfaces: (keyof ThemeColors)[] = ["background", "surface", "secondaryBackground"];

  const textTokens: (keyof ThemeColors)[] = [
    "label",
    "secondaryLabel",
    "tertiaryLabel",
    "text",
    "textSecondary",
    "textTertiary",
    "tint",
    "tintStrong",
    "primary",
    "error",
  ];

  it.each(textTokens.flatMap((t) => surfaces.map((s) => [t, s] as const)))(
    "%s on %s",
    (token, surface) => {
      const ratio = contrast(colors[token] as string, colors[surface] as string);
      expect(ratio).toBeGreaterThanOrEqual(AA);
    },
  );

  it("filled teal controls: the on-colour text passes on the fill", () => {
    expect(contrast(colors.onTintStrong, colors.tintStrong)).toBeGreaterThanOrEqual(AA);
  });

  it("keeps tint, primary and tintStrong in step, so old and new code read the same", () => {
    expect(colors.tint).toBe(colors.tintStrong);
    expect(colors.primary).toBe(colors.tintStrong);
  });
});
