import { buildFetchTargets } from "../transport";

describe("buildFetchTargets", () => {
  const feed = "https://example.com/feed?x=1&y=2";

  it("goes straight to the publisher on native, with no third-party proxy", () => {
    expect(buildFetchTargets(feed, false)).toEqual([feed]);
  });

  it("uses the CORS proxies only on web", () => {
    const targets = buildFetchTargets(feed, true);
    expect(targets).toHaveLength(2);
    expect(targets).not.toContain(feed);
    targets.forEach((target) => expect(target).toContain(encodeURIComponent(feed)));
  });
});
