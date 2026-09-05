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

describe("isPhotoCredit length bounds", () => {
  it("does not treat a long paragraph that opens with an attribution phrase as a credit", () => {
    // Newsrooms open body copy this way. Without a length bound the content parser folded
    // these into the preceding image and dropped them from the article.
    const paragraph =
      "Courtesy of the Heinz History Center, the exhibit will run through the end of March and features more than two hundred objects drawn from the museum's permanent collection.";
    expect(isPhotoCredit(paragraph)).toBe(false);
  });

  it("does not treat a wire-service lede as a credit", () => {
    const lede =
      "Associated Press reporters spent six months reviewing county pension filings and found a shortfall that had gone unreported for years.";
    expect(isPhotoCredit(lede)).toBe(false);
  });

  it("still recognises the short attributions those patterns exist for", () => {
    expect(isPhotoCredit("Courtesy of the Heinz History Center")).toBe(true);
    expect(isPhotoCredit("AP Photo/Gene J. Puskar")).toBe(true);
    expect(isPhotoCredit("Photo: Jane Doe")).toBe(true);
  });
});

describe("parseHtmlContent keeps body copy", () => {
  it("does not swallow a long attribution-led paragraph into the image above it", () => {
    const nodes = parseHtmlContent(
      '<div><img src="https://x.test/a.jpg" />' +
        "<p>Courtesy of the Heinz History Center, the exhibit will run through the end of March and features more than two hundred objects drawn from the museum's permanent collection.</p>" +
        "<p>The council met on Tuesday.</p></div>",
    );

    expect(nodes).toHaveLength(3);
    expect(nodes[0].type).toBe("image");
    expect(nodes[0].credit).toBeUndefined();
    expect(nodes[1].text).toContain("Heinz History Center");
  });
});
