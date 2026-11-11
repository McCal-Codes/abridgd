import { parse } from "node-html-parser";
import { MIN_BODY_CHARS, selectContentNode, stripPageChrome } from "../pageContent";

describe("stripPageChrome", () => {
  const body = `<p>${"The council voted on the measure after a long debate. ".repeat(8)}</p>`;

  it("removes logos, related-story cards and share bars but keeps story photos", () => {
    const root = parse(`<div id="s">
      <img src="https://cdn.example.com/wtae-logo.png">
      ${body}
      <figure><img src="https://cdn.example.com/photo-1.jpg"><figcaption>A crowd gathers.</figcaption></figure>
      <div class="related-stories"><a href="/x"><img src="https://cdn.example.com/thumb.jpg">Other story</a></div>
      <aside><img src="https://cdn.example.com/ad.jpg"></aside>
    </div>`);
    const node = root.querySelector("#s")!;
    stripPageChrome(node);
    expect(node.innerHTML).toContain("photo-1.jpg");
    expect(node.innerHTML).toContain("A crowd gathers.");
    expect(node.innerHTML).not.toContain("logo");
    expect(node.innerHTML).not.toContain("thumb.jpg");
    expect(node.innerHTML).not.toContain("ad.jpg");
  });

  it("removes the repeated headline and dateline furniture but keeps prose", () => {
    const root = parse(`<div id="s"><h1>Big headline</h1><div>Updated: 12:11 PM EST Nov 10, 2026</div>
      <div>Editorial Standards ⓘ</div><div>Digital Content Manager</div>${body}</div>`);
    const node = root.querySelector("#s")!;
    stripPageChrome(node);
    expect(node.text).not.toContain("Big headline");
    expect(node.text).not.toContain("Updated");
    expect(node.text).not.toContain("Editorial Standards");
    expect(node.text).not.toContain("Digital Content Manager");
    expect(node.text).toContain("The council voted");
  });

  it("keeps one copy of a photo embedded twice at different sizes", () => {
    const root = parse(`<div id="s">${body}<img src="https://x.com/a/photo.jpg?w=800"><img src="https://x.com/a/photo-300x200.jpg"><img src="https://x.com/a/other.jpg"></div>`);
    const node = root.querySelector("#s")!;
    stripPageChrome(node);
    expect(node.querySelectorAll("img").length).toBe(2);
  });

  it("never removes a wrapper that holds most of the story", () => {
    const root = parse(`<div id="s"><div class="share-wrapper">${body}</div></div>`);
    const node = root.querySelector("#s")!;
    stripPageChrome(node);
    expect(node.text).toContain("The council voted");
  });
});

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
