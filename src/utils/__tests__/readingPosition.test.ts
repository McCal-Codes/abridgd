import { resolveRestoreOffset } from "../readingPosition";

describe("resolveRestoreOffset", () => {
  it("restores the saved offset once the content is tall enough to hold it", () => {
    expect(resolveRestoreOffset({ scrollPixels: 800, status: "in-progress" } as never, 4000)).toEqual({
      action: "restore",
      offset: 800,
    });
  });

  it("waits while the article is still laying out", () => {
    // Body text, images and full-story enrichment arrive in stages; scrolling to an offset the
    // layout hasn't reached yet would silently land at the bottom of what exists so far.
    expect(resolveRestoreOffset({ scrollPixels: 800, status: "in-progress" } as never, 500)).toEqual({
      action: "wait",
      reason: "content-too-short",
    });
  });

  it("starts a finished article at the top instead of its own ending", () => {
    expect(resolveRestoreOffset({ scrollPixels: 3000, status: "completed" } as never, 5000)).toEqual({
      action: "skip",
      reason: "already-completed",
    });
  });

  it("does nothing for an article with no saved position", () => {
    expect(resolveRestoreOffset(undefined, 5000)).toEqual({
      action: "skip",
      reason: "no-saved-position",
    });
    expect(resolveRestoreOffset({ scrollPixels: 0, status: "unread" } as never, 5000)).toEqual({
      action: "skip",
      reason: "no-saved-position",
    });
  });
});
