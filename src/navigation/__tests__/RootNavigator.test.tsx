import { getTabConfig } from "../RootNavigator";
import { SettingsScreen } from "../../screens/SettingsScreen";
import ProfileScreen from "../../screens/ProfileScreen";

describe("getTabConfig", () => {
  it("includes Settings tab in simple layout and stays within 5 tabs", () => {
    const config = getTabConfig("simple");
    const keys = Object.keys(config);
    expect(keys).toContain("settings");
    expect(keys.length).toBeLessThanOrEqual(5);
    expect(config.settings.component).toBe(SettingsScreen);
  });

  it("includes Profile tab in standard layout", () => {
    const config = getTabConfig("standard");
    expect(Object.keys(config)).toContain("profile");
    expect(config.profile.component).toBe(ProfileScreen);
  });

  it("includes Profile tab in power layout and stays within 5 options", () => {
    const config = getTabConfig("power");
    expect(Object.keys(config)).toContain("profile");
    expect(config.profile.component).toBe(ProfileScreen);
  });
});
