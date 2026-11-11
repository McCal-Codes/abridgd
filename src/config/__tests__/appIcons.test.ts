import { APP_ICON_OPTIONS, getAppIconLabel } from "../appIcons";

describe("app icon options", () => {
  it("starts with the default icon and has unique ids", () => {
    expect(APP_ICON_OPTIONS[0].id).toBeNull();
    const ids = APP_ICON_OPTIONS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("names the current icon, falling back to the default", () => {
    expect(getAppIconLabel(null)).toBe("Slate");
    expect(getAppIconLabel("Berry")).toBe("Berry");
    expect(getAppIconLabel("Unknown")).toBe("Slate");
  });

  it("matches the icons registered in app.json", () => {
    const app = require("../../../app.json");
    const plugin = app.expo.plugins.find((p: unknown) => Array.isArray(p) && p[0] === "expo-alternate-app-icons");
    const registered = plugin[1].map((icon: { name: string }) => icon.name).sort();
    const offered = APP_ICON_OPTIONS.map((o) => o.id).filter(Boolean).sort();
    expect(offered).toEqual(registered);
  });
});
