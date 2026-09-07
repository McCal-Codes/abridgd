import { AccessibilityInfo } from "react-native";
import { announceForAccessibility, announceRefreshResult } from "../announce";

describe("announceRefreshResult", () => {
  const announce = jest.spyOn(AccessibilityInfo, "announceForAccessibility").mockImplementation();

  beforeEach(() => announce.mockClear());

  it("reports how many stories loaded", () => {
    announceRefreshResult(12, false);
    expect(announce).toHaveBeenCalledWith("12 stories loaded");
  });

  it("uses the singular for one story", () => {
    announceRefreshResult(1, false);
    expect(announce).toHaveBeenCalledWith("1 story loaded");
  });

  it("says the refresh failed rather than reporting a count", () => {
    // A failed refresh leaves cached stories on screen, so a count would imply success.
    announceRefreshResult(12, true);
    expect(announce).toHaveBeenCalledWith("Couldn't refresh. Showing the stories already loaded.");
  });

  it("passes an arbitrary message straight through", () => {
    announceForAccessibility("Saved articles up to date");
    expect(announce).toHaveBeenCalledWith("Saved articles up to date");
  });
});
