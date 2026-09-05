import { isPhotoCredit, splitCaptionAndCredit } from "../photoCredit";
import { parseHtmlContent } from "../contentParser";

describe("splitCaptionAndCredit", () => {
  it("returns nothing for empty input", () => {
    expect(splitCaptionAndCredit(undefined)).toEqual({});
    expect(splitCaptionAndCredit("   ")).toEqual({});
  });

  it("treats an attribution-only string as a credit", () => {
    expect(splitCaptionAndCredit("AP Photo/Gene J. Puskar")).toEqual({
      credit: "AP Photo/Gene J. Puskar",
    });
    expect(splitCaptionAndCredit("Photo: Jane Doe")).toEqual({ credit: "Photo: Jane Doe" });
  });

  it("splits a trailing parenthetical credit off the caption", () => {
    expect(
      splitCaptionAndCredit("Fans gather on the North Shore. (Photo: Jane Doe/AP)"),
    ).toEqual({ caption: "Fans gather on the North Shore", credit: "Photo: Jane Doe/AP" });
  });

  it("splits a trailing em-dash credit off the caption", () => {
    expect(splitCaptionAndCredit("The bridge at dusk — Getty Images")).toEqual({
      caption: "The bridge at dusk",
      credit: "Getty Images",
    });
  });

  it("decodes entities and collapses whitespace", () => {
    expect(splitCaptionAndCredit("Caf&eacute;   Rachel\nreopens")).toEqual({
      caption: "Café Rachel reopens",
    });
  });

  it("leaves prose that merely mentions a wire service alone", () => {
    const prose =
      "The Associated Press reported on Tuesday that the county had approved the measure after a lengthy debate that stretched well past midnight.";
    expect(isPhotoCredit(prose)).toBe(false);
    expect(splitCaptionAndCredit(prose).caption).toBe(prose);
  });
});

describe("parseHtmlContent captions", () => {
  it("reads a WordPress wp-caption block", () => {
    const nodes = parseHtmlContent(
      '<div class="wp-caption"><img src="https://x.test/a.jpg" /><p class="wp-caption-text">A mural downtown. (Photo: Jane Doe)</p></div>',
    );

    expect(nodes).toEqual([
      {
        type: "image",
        src: "https://x.test/a.jpg",
        caption: "A mural downtown",
        credit: "Photo: Jane Doe",
      },
    ]);
  });

  it("reads a figure/figcaption block and decodes its entities", () => {
    const nodes = parseHtmlContent(
      "<figure><img src=\"https://x.test/b.jpg\" /><figcaption>Caf&eacute; Rachel</figcaption></figure>",
    );

    expect(nodes[0]).toMatchObject({ type: "image", caption: "Café Rachel" });
  });

  it("folds a bare credit paragraph into the image above it", () => {
    const nodes = parseHtmlContent(
      '<div><img src="https://x.test/c.jpg" /><p>AP Photo/Gene J. Puskar</p><p>The county council met for three hours on Tuesday evening.</p></div>',
    );

    expect(nodes[0]).toMatchObject({ type: "image", credit: "AP Photo/Gene J. Puskar" });
    expect(nodes[1]).toMatchObject({ type: "text" });
    expect(nodes).toHaveLength(2);
  });
});
