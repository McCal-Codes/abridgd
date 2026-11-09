import { scrubBreadcrumb } from "../sentryScrub";

describe("scrubBreadcrumb", () => {
  it("drops console text entirely", () => {
    const out = scrubBreadcrumb({
      category: "console",
      message: "Fetch failed for https://triblive.com/local/secret-story/",
      data: { arguments: ["https://triblive.com/local/secret-story/"] },
    });
    expect(out?.message).toBe("[console message removed]");
    expect(out?.data).toBeUndefined();
  });

  it("keeps only the host of network request URLs", () => {
    const out = scrubBreadcrumb({
      category: "xhr",
      data: { url: "https://triblive.com/wp-json/wp/v2/posts?slug=secret-story", method: "GET" },
    });
    expect(out?.data).toEqual({ url: "https://triblive.com", method: "GET" });
  });

  it("strips URLs from free-text messages but keeps the host", () => {
    const out = scrubBreadcrumb({ category: "navigation", message: "opened https://a.com/x?y=1 ok" });
    expect(out?.message).toBe("opened https://a.com ok");
  });

  it("does not mutate the original breadcrumb", () => {
    const original = { category: "xhr", data: { url: "https://a.com/x" } };
    scrubBreadcrumb(original);
    expect(original.data.url).toBe("https://a.com/x");
  });
});
