import { ReadingProgress } from "../types/ReadingProgress";

/** Content below the saved offset that must exist before restoring, so a partially-laid-out
 * article doesn't get scrolled to a position it hasn't rendered yet. */
const REQUIRED_HEADROOM = 200;

export type RestoreDecision =
  | { action: "restore"; offset: number }
  | { action: "skip"; reason: "no-saved-position" | "already-completed" }
  | { action: "wait"; reason: "content-too-short" };

/**
 * Decides whether to return a reader to where they stopped.
 *
 * The article screen has always written `scrollPixels` on every scroll and never read it back,
 * so "Continue Reading" opened the article at the top. This is the missing half.
 */
export const resolveRestoreOffset = (
  saved: Pick<ReadingProgress, "scrollPixels" | "status"> | undefined | null,
  contentHeight: number,
): RestoreDecision => {
  const offset = saved?.scrollPixels ?? 0;

  if (!offset) return { action: "skip", reason: "no-saved-position" };

  // Re-opening something you finished should start at the beginning, not at the end.
  if (saved?.status === "completed") return { action: "skip", reason: "already-completed" };

  // Body text, images and full-story enrichment all land in stages; wait for a layout tall
  // enough to actually hold the offset.
  if (contentHeight < offset + REQUIRED_HEADROOM) {
    return { action: "wait", reason: "content-too-short" };
  }

  return { action: "restore", offset };
};
