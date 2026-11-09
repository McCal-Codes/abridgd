import { Alert, Linking, Platform } from "react-native";
import { actionLabel, buildActionUrl, performAction } from "../phone";

describe("buildActionUrl", () => {
  const original = Platform.OS;
  afterEach(() => {
    Platform.OS = original;
  });

  it("builds tel: links from digits", () => {
    expect(buildActionUrl({ kind: "call", number: "988" })).toBe("tel:988");
    expect(buildActionUrl({ kind: "call", number: "18887968226" })).toBe("tel:18887968226");
  });

  it("builds sms: links, with the body separator each platform expects", () => {
    expect(buildActionUrl({ kind: "text", number: "988" })).toBe("sms:988");
    Platform.OS = "ios";
    expect(buildActionUrl({ kind: "text", number: "741741", body: "HOME" })).toBe("sms:741741&body=HOME");
    Platform.OS = "android";
    expect(buildActionUrl({ kind: "text", number: "741741", body: "HOME" })).toBe("sms:741741?body=HOME");
  });

  it("refuses anything that is not plain digits", () => {
    expect(buildActionUrl({ kind: "call", number: "988; rm" })).toBeNull();
    expect(buildActionUrl({ kind: "call", number: "tel:988" })).toBeNull();
    expect(buildActionUrl({ kind: "call", number: "" })).toBeNull();
    expect(buildActionUrl({ kind: "call", number: "12" })).toBeNull();
    expect(buildActionUrl({ kind: "call", number: "1".repeat(20) })).toBeNull();
  });

  it("labels actions", () => {
    expect(actionLabel({ kind: "call", number: "988" })).toBe("Call");
    expect(actionLabel({ kind: "text", number: "988" })).toBe("Text");
    expect(actionLabel({ kind: "call", number: "988", label: "Dial" })).toBe("Dial");
  });
});

describe("performAction", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("opens the dialer", async () => {
    jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    const open = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    open.mockClear();

    await expect(performAction({ kind: "call", number: "988" }, "988")).resolves.toBe(true);
    expect(open).toHaveBeenCalledWith("tel:988");
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("shows the number when the device cannot place calls", async () => {
    jest.spyOn(Linking, "canOpenURL").mockResolvedValue(false);
    const open = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    open.mockClear(); // React Native's jest setup already mocks Linking; drop earlier tests' calls

    await expect(performAction({ kind: "call", number: "211" }, "2-1-1")).resolves.toBe(false);
    expect(open).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith("Can't open the phone", expect.stringContaining("2-1-1"));
  });

  it("shows the number when opening throws, and never opens a bad number", async () => {
    jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    const open = jest.spyOn(Linking, "openURL").mockRejectedValue(new Error("nope"));
    await expect(performAction({ kind: "text", number: "988" }, "988")).resolves.toBe(false);
    expect(Alert.alert).toHaveBeenCalledTimes(1);

    open.mockClear();
    await expect(performAction({ kind: "call", number: "abc" }, "abc")).resolves.toBe(false);
    expect(open).not.toHaveBeenCalled();
  });
});
