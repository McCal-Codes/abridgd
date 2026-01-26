import { getTabConfig } from "../RootNavigator";
import ProfileScreen from "../../screens/ProfileScreen";

describe("getTabConfig", () => {
  it("includes Profile tab in minimal layout and stays within 5 tabs", () => {
    const config = getTabConfig("minimal");
    const keys = Object.keys(config);
    expect(keys).toContain("profile");
    expect(keys.length).toBeLessThanOrEqual(5);
    expect(config.profile.component).toBe(ProfileScreen);
  });

  it("includes Profile tab in comprehensive layout and stays within 8 options", () => {
    const config = getTabConfig("comprehensive");
    expect(Object.keys(config)).toContain("profile");
    expect(config.profile.component).toBe(ProfileScreen);
  });
});
