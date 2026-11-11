import { Platform } from "react-native";
import { canChooseAppIcon } from "../appIconSupport";

describe("canChooseAppIcon", () => {
  const original = Platform.OS;
  afterEach(() => {
    Platform.OS = original;
  });

  it("is offered on Android when the device supports it", () => {
    Platform.OS = "android";
    expect(canChooseAppIcon(true)).toBe(true);
    expect(canChooseAppIcon(false)).toBe(false);
  });

  it("stays hidden on iOS until it has been checked on a device", () => {
    Platform.OS = "ios";
    expect(canChooseAppIcon(true)).toBe(false);
  });
});
