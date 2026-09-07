import { isSafeExternalUrl } from "../openExternalUrl";

describe("isSafeExternalUrl", () => {
  it("accepts http and https", () => {
    expect(isSafeExternalUrl("https://example.com/article")).toBe(true);
    expect(isSafeExternalUrl("http://example.com/article")).toBe(true);
    expect(isSafeExternalUrl("HTTPS://EXAMPLE.COM")).toBe(true);
  });

  // The reason this helper exists: article links are third-party XML, and on web
  // RN's openURL routes to window.open where javascript: executes.
  it("refuses javascript: in any casing or with padding", () => {
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("JavaScript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("  javascript:alert(1)  ")).toBe(false);
  });

  it("refuses other schemes a feed could emit", () => {
    expect(isSafeExternalUrl("intent://scan/#Intent;scheme=zxing;end")).toBe(false);
    expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeExternalUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeExternalUrl("abridged://article/1")).toBe(false);
  });

  it("refuses empty, missing and schemeless values", () => {
    expect(isSafeExternalUrl(undefined)).toBe(false);
    expect(isSafeExternalUrl(null)).toBe(false);
    expect(isSafeExternalUrl("")).toBe(false);
    expect(isSafeExternalUrl("   ")).toBe(false);
    expect(isSafeExternalUrl("example.com/article")).toBe(false);
    expect(isSafeExternalUrl("//example.com/article")).toBe(false);
  });
});
