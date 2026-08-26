import { decodeHtmlEntities } from "../htmlEntities";

describe("decodeHtmlEntities", () => {
  it("decodes decimal numeric entities", () => {
    expect(decodeHtmlEntities("It&#8217;s here")).toBe("It’s here");
  });

  it("decodes hex numeric entities", () => {
    expect(decodeHtmlEntities("It&#x2019;s here")).toBe("It’s here");
  });

  it("decodes common named entities not present in the old hand-rolled lists", () => {
    expect(decodeHtmlEntities("Caf&eacute; &amp; Co&copy;")).toBe("Café & Co©");
  });

  it("decodes nbsp, quotes, and dashes", () => {
    expect(decodeHtmlEntities("A&nbsp;B &mdash; C &ldquo;D&rdquo;")).toBe("A B — C “D”");
  });

  it("leaves unknown entities untouched", () => {
    expect(decodeHtmlEntities("&notarealentity;")).toBe("&notarealentity;");
  });

  it("returns falsy input unchanged", () => {
    expect(decodeHtmlEntities("")).toBe("");
  });
});
