import { sanitizeTabs } from "../SettingsContext";

describe("sanitizeTabs", () => {
  it("adds profile when missing and keeps max five tabs", () => {
    const result = sanitizeTabs(["home", "discover", "saved", "digest"], "minimal");
    expect(result).toContain("profile");
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("replaces last tab with profile if already at cap", () => {
    const result = sanitizeTabs(["home", "discover", "saved", "digest", "local"], "minimal");
    expect(result[result.length - 1]).toBe("profile");
  });

  it("filters out unsupported tabs per layout", () => {
    const result = sanitizeTabs(["top", "culture", "profile"], "comprehensive");
    expect(result).toEqual(["top", "local", "digest", "profile"]);
  });
});
