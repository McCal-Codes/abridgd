import { extractWordPressSlug, getHostname, hostMatchesDomain } from "../FullStoryService";

describe("FullStoryService URL helpers", () => {
  it("extracts the hostname of an http(s) URL", () => {
    expect(getHostname("https://www.TribLive.com/news/story/")).toBe("www.triblive.com");
    expect(getHostname("http://wesa.fm:8080/x")).toBe("wesa.fm");
    expect(getHostname("ftp://triblive.com/x")).toBeNull();
    expect(getHostname("not a url")).toBeNull();
  });

  it("matches a domain and its subdomains only", () => {
    expect(hostMatchesDomain("https://triblive.com/a", "triblive.com")).toBe(true);
    expect(hostMatchesDomain("https://www.triblive.com/a", "triblive.com")).toBe(true);
  });

  it("does not match a domain that merely appears elsewhere in the URL", () => {
    expect(hostMatchesDomain("https://evil.example/?u=triblive.com", "triblive.com")).toBe(false);
    expect(hostMatchesDomain("https://nottriblive.com/a", "triblive.com")).toBe(false);
    expect(hostMatchesDomain("https://triblive.com.evil.example/a", "triblive.com")).toBe(false);
  });

  it("extracts a plain WordPress slug and rejects anything else", () => {
    expect(extractWordPressSlug("https://triblive.com/local/cleanup-continues/")).toBe(
      "cleanup-continues",
    );
    expect(extractWordPressSlug("https://triblive.com/local/cleanup-continues/?utm=1#top")).toBe(
      "cleanup-continues",
    );
    expect(extractWordPressSlug("https://triblive.com/a/b%26evil=1")).toBeNull();
    expect(extractWordPressSlug("https://triblive.com/")).toBeNull();
  });
});
