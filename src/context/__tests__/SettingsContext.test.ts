import { sanitizeTabs } from "../SettingsContext";

describe("sanitizeTabs", () => {
  it("adds profile when missing and keeps max five tabs", () => {
    const result = sanitizeTabs(["home", "discover", "saved", "digest"], "standard");
    expect(result).toContain("profile");
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("replaces last tab with profile if already at cap", () => {
    const result = sanitizeTabs(["home", "discover", "saved", "digest", "local"], "standard");
    expect(result[result.length - 1]).toBe("profile");
  });

  it("filters out unsupported tabs per layout", () => {
    const result = sanitizeTabs(["top", "culture", "profile"], "power");
    expect(result).toEqual(["top", "local", "digest", "saved", "profile"]);
  });

  it("allows two-tab simple layout and keeps only allowed tabs", () => {
    const result = sanitizeTabs(["home", "settings", "profile"], "simple");
    expect(result).toEqual(["home", "settings"]);
  });
});
