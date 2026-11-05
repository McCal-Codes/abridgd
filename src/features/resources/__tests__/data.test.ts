import { getAllEntries, LAST_VERIFIED, MAX_AGE_DAYS, RESOURCE_GROUPS } from "../data";
import { buildActionUrl } from "../phone";

describe("resource data", () => {
  const entries = getAllEntries();

  it("has the crisis lines first, with a call or text action on every entry", () => {
    expect(RESOURCE_GROUPS[0].id).toBe("now");
    for (const entry of entries) {
      expect(entry.actions.length).toBeGreaterThan(0);
    }
  });

  it("has unique ids and non-empty names and descriptions", () => {
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    for (const entry of entries) {
      expect(entry.name.trim()).not.toBe("");
      expect(entry.description.trim()).not.toBe("");
    }
  });

  it("only uses numbers that become valid tel: and sms: links", () => {
    for (const entry of entries) {
      for (const action of entry.actions) {
        expect(buildActionUrl(action)).not.toBeNull();
      }
    }
  });

  it("only links to https pages", () => {
    for (const entry of entries) {
      if (entry.url) expect(entry.url.startsWith("https://")).toBe(true);
    }
  });

  it("lists the numbers verified on 2026-11-05", () => {
    const byId = Object.fromEntries(entries.map((e) => [e.id, e]));
    expect(byId["988"].actions).toEqual([
      { kind: "call", number: "988" },
      { kind: "text", number: "988" },
    ]);
    expect(byId["crisis-text-line"].actions).toEqual([{ kind: "text", number: "741741", body: "HOME" }]);
    expect(byId["resolve"].actions).toEqual([{ kind: "call", number: "18887968226" }]);
    expect(byId["211"].actions).toEqual([{ kind: "call", number: "211" }]);
    expect(byId["food-bank"].actions).toEqual([{ kind: "call", number: "4124603663" }]);
    expect(byId["allegheny-link"].actions).toEqual([{ kind: "call", number: "8667302368" }]);
  });

  // Intentionally time-based: a wrong crisis number does real harm, so a list nobody has
  // re-checked in a year should fail loudly rather than quietly go out of date.
  it(`was verified within the last ${MAX_AGE_DAYS} days (re-check the numbers, then update LAST_VERIFIED)`, () => {
    const ageDays = (Date.now() - Date.parse(`${LAST_VERIFIED}T00:00:00Z`)) / 86400000;
    expect(ageDays).toBeLessThan(MAX_AGE_DAYS);
  });
});
