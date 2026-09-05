import { resolveMediaUri } from "../mediaUri";

const ARTICLE = "https://www.post-gazette.com/local/2026/09/05/story.html";

describe("resolveMediaUri", () => {
  it("passes absolute https through untouched", () => {
    expect(resolveMediaUri("https://cdn.test/a.jpg", ARTICLE)).toBe("https://cdn.test/a.jpg");
  });

  it("upgrades absolute http, which ATS would otherwise block", () => {
    expect(resolveMediaUri("http://cdn.test/a.jpg", ARTICLE)).toBe("https://cdn.test/a.jpg");
  });

  it("completes a protocol-relative URL", () => {
    expect(resolveMediaUri("//cdn.test/a.jpg", ARTICLE)).toBe("https://cdn.test/a.jpg");
  });

  it("resolves a root-relative path against the article's origin", () => {
    // The old helper produced "https:/images/a.jpg" here, which loaded as nothing.
    expect(resolveMediaUri("/images/a.jpg", ARTICLE)).toBe(
      "https://www.post-gazette.com/images/a.jpg",
    );
  });

  it("resolves a document-relative path against the article's origin", () => {
    expect(resolveMediaUri("images/a.jpg", ARTICLE)).toBe(
      "https://www.post-gazette.com/images/a.jpg",
    );
    expect(resolveMediaUri("./images/a.jpg", ARTICLE)).toBe(
      "https://www.post-gazette.com/images/a.jpg",
    );
  });

  it("leaves a data URI alone", () => {
    const inline = "data:image/png;base64,iVBORw0KGgo=";
    expect(resolveMediaUri(inline, ARTICLE)).toBe(inline);
  });

  it("gives up on a relative path when the article link cannot supply an origin", () => {
    expect(resolveMediaUri("/images/a.jpg", undefined)).toBeUndefined();
    expect(resolveMediaUri("/images/a.jpg", "not-a-url")).toBeUndefined();
  });

  it("returns undefined for empty input", () => {
    expect(resolveMediaUri(undefined, ARTICLE)).toBeUndefined();
    expect(resolveMediaUri("   ", ARTICLE)).toBeUndefined();
  });
});
