import { Linking } from "react-native";
import { isSafeExternalUrl, openExternalUrl } from "../externalLinks";

describe("isSafeExternalUrl", () => {
  it("accepts the web schemes article links actually use", () => {
    expect(isSafeExternalUrl("https://post-gazette.com/story")).toBe(true);
    expect(isSafeExternalUrl("http://example.com/story")).toBe(true);
  });

  it("rejects schemes a hostile feed could put in a <link> element", () => {
    // Linking.openURL hands these to the system: tel:/sms: reach the dialer, and a custom
    // scheme opens whichever app claims it.
    expect(isSafeExternalUrl("tel:+15551234567")).toBe(false);
    expect(isSafeExternalUrl("sms:+15551234567&body=hi")).toBe(false);
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeExternalUrl("abridged://settings")).toBe(false);
  });

  it("rejects empty and unparseable values", () => {
    expect(isSafeExternalUrl(undefined)).toBe(false);
    expect(isSafeExternalUrl("")).toBe(false);
    expect(isSafeExternalUrl("not a url")).toBe(false);
  });
});

describe("openExternalUrl", () => {
  const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true as never);

  beforeEach(() => openURL.mockClear());

  it("opens a web link", async () => {
    await expect(openExternalUrl("https://example.com/story")).resolves.toBe(true);
    expect(openURL).toHaveBeenCalledWith("https://example.com/story");
  });

  it("refuses a non-web scheme without calling into the system opener", async () => {
    await expect(openExternalUrl("tel:+15551234567")).resolves.toBe(false);
    expect(openURL).not.toHaveBeenCalled();
  });

  it("reports failure rather than throwing when the system cannot open the link", async () => {
    openURL.mockRejectedValueOnce(new Error("no handler"));
    await expect(openExternalUrl("https://example.com/story")).resolves.toBe(false);
  });
});
