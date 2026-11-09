import { isSensitiveKey, redactRecord, redactStorageEntries, redactValue } from "../redact";

describe("redact", () => {
  it("flags secret-bearing key names", () => {
    expect(isSensitiveKey("perplexityApiKey")).toBe(true);
    expect(isSensitiveKey("authToken")).toBe(true);
    expect(isSensitiveKey("appleUserId")).toBe(true);
    expect(isSensitiveKey("email")).toBe(true);
    expect(isSensitiveKey("fontSize")).toBe(false);
    expect(isSensitiveKey("tabLayout")).toBe(false);
  });

  it("redacts a settings record without touching ordinary values", () => {
    const out = redactRecord({ perplexityApiKey: "pplx-secret", fontSize: 1.2, tabLayout: "minimal" });
    expect(out).toEqual({ perplexityApiKey: "[redacted]", fontSize: 1.2, tabLayout: "minimal" });
  });

  it("leaves empty secrets empty so the dump still shows whether one is set", () => {
    expect(redactValue("perplexityApiKey", "")).toBe("");
    expect(redactValue("perplexityApiKey", null)).toBeNull();
  });

  it("redacts storage entries by key name", () => {
    expect(redactStorageEntries([["perplexityApiKey", "pplx-secret"], ["lineHeight", "1.5"]])).toEqual([
      ["perplexityApiKey", "[redacted]"],
      ["lineHeight", "1.5"],
    ]);
  });

  it("redacts email and apple id embedded in serialized profile JSON", () => {
    const profiles = JSON.stringify([{ id: "p1", name: "A", email: "a@b.com", appleUserId: "000123.abc" }]);
    const [[, redacted]] = redactStorageEntries([["profiles_v1", profiles]]);
    expect(redacted).not.toContain("a@b.com");
    expect(redacted).not.toContain("000123.abc");
    expect(redacted).toContain('"id":"p1"');
  });
});
