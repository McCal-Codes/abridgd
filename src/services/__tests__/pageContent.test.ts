import { parse } from "node-html-parser";
import { MIN_BODY_CHARS, selectContentNode } from "../pageContent";

const prose = (n: number) => `<p>${"The council voted on the measure after a long debate. ".repeat(n)}</p>`;

describe("selectContentNode", () => {
  it("skips a teaser-sized first match and takes the article-sized one (Allegheny Front shape)", () => {
    const root = parse(`
      <article><a href="/x">Related story</a></article>
      <article><a href="/y">Another card</a></article>
      <article class="story">${prose(6)}</article>`);
    const node = selectContentNode(root, ["article"])!;
    expect(node.classNames).toContain("story");
  });

  it("honours selector order", () => {
    const root = parse(`<main>${prose(8)}</main><div class="entry-content">${prose(6)}</div>`);
    expect(selectContentNode(root, [".entry-content", "main"])!.classNames).toContain("entry-content");
  });

  it("ignores selectors the parser cannot handle", () => {
    const root = parse(`<div class="body">${prose(6)}</div>`);
    expect(selectContentNode(root, ["div:::bad", ".body"])).not.toBeNull();
  });

  it("falls back to the block holding the most prose when no selector matches (TribLive shape)", () => {
    const root = parse(`
      <nav><p>Home</p><p>Sports</p></nav>
      <div class="x1"><div class="x2">${prose(3)}${prose(3)}${prose(3)}</div></div>
      <footer><p>Copyright notice that is long enough to look like a sentence of its own, maybe.</p></footer>`);
    const node = selectContentNode(root, ["article", ".entry-content"])!;
    expect(node.classNames).toContain("x2");
  });

  it("returns null when there is no story to extract", () => {
    expect(selectContentNode(parse("<div><p>Subscribe to keep reading.</p></div>"), ["article"])).toBeNull();
    expect(selectContentNode(parse(""), ["article"])).toBeNull();
  });

  it("treats the threshold as meaningful", () => {
    expect(MIN_BODY_CHARS).toBeGreaterThanOrEqual(100);
  });
});
