import * as ExpoHaptics from "expo-haptics";
import {
  configureHaptics,
  getHapticLevel,
  ImpactFeedbackStyle,
  impactAsync,
  notificationAsync,
  NotificationFeedbackType,
  selectionAsync,
} from "../haptics";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
}));

describe("haptics honour the setting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    configureHaptics("normal");
  });

  it("does nothing at all when off", async () => {
    configureHaptics("off");
    await impactAsync(ImpactFeedbackStyle.Heavy);
    await selectionAsync();
    await notificationAsync(NotificationFeedbackType.Error);
    expect(ExpoHaptics.impactAsync).not.toHaveBeenCalled();
    expect(ExpoHaptics.selectionAsync).not.toHaveBeenCalled();
    expect(ExpoHaptics.notificationAsync).not.toHaveBeenCalled();
  });

  it("passes everything through unchanged at normal", async () => {
    await impactAsync(ImpactFeedbackStyle.Medium);
    await selectionAsync();
    await notificationAsync(NotificationFeedbackType.Warning);
    expect(ExpoHaptics.impactAsync).toHaveBeenCalledWith("medium");
    expect(ExpoHaptics.selectionAsync).toHaveBeenCalled();
    expect(ExpoHaptics.notificationAsync).toHaveBeenCalledWith("warning");
  });

  it("steps impacts one lighter at subtle and turns notifications into a light tap", async () => {
    configureHaptics("subtle");
    await impactAsync(ImpactFeedbackStyle.Heavy);
    await impactAsync(ImpactFeedbackStyle.Light);
    await notificationAsync(NotificationFeedbackType.Success);
    expect(ExpoHaptics.impactAsync).toHaveBeenNthCalledWith(1, "medium");
    expect(ExpoHaptics.impactAsync).toHaveBeenNthCalledWith(2, "light"); // never below the lightest
    expect(ExpoHaptics.impactAsync).toHaveBeenNthCalledWith(3, "light");
    expect(ExpoHaptics.notificationAsync).not.toHaveBeenCalled();
  });

  it("steps impacts one heavier at strong, capped at the heaviest", async () => {
    configureHaptics("strong");
    await impactAsync(ImpactFeedbackStyle.Light);
    await impactAsync(ImpactFeedbackStyle.Heavy);
    expect(ExpoHaptics.impactAsync).toHaveBeenNthCalledWith(1, "medium");
    expect(ExpoHaptics.impactAsync).toHaveBeenNthCalledWith(2, "heavy");
  });

  it("reports the current level", () => {
    configureHaptics("subtle");
    expect(getHapticLevel()).toBe("subtle");
  });
});
