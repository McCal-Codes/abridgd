import { APP_VERSION } from "./appInfo";

export interface ReleaseNote {
  version: string;
  /** One line naming the theme of the release, in a reader's language. */
  headline: string;
  /** Short, concrete changes. Three to five reads best; more becomes a changelog. */
  items: string[];
}

/**
 * Reader-facing release notes, shown in the What's New flow after an update.
 *
 * Deliberately separate from CHANGELOG.md, which is written for engineers and says things
 * like "appVersionSource was remote in eas.json". Both describe the same releases; only one
 * of them belongs in front of a reader. Add an entry here as part of cutting a release — a
 * missing entry is handled gracefully but wastes the moment.
 */
export const RELEASE_NOTES: Record<string, Omit<ReleaseNote, "version">> = {
  "1.6.0": {
    headline: "Every section, actually reachable",
    items: [
      "Business, Sports, and Culture are browsable at last — Discover now switches between all five sections.",
      "Rebuilt the source list against live feeds: 19 working sources, up from 12. Culture went from one to five.",
      "Photo captions and credits now come through from the feeds instead of being dropped or stranded mid-article.",
      "The reading-speed slider actually changes reading speed. It never did before.",
      "A section that fails to load says so, instead of quietly showing fewer stories.",
    ],
  },
  "1.5.0": {
    headline: "A calmer, more honest brief",
    items: [
      "Home reads as a finite Morning Brief you can actually finish.",
      "A \"Why this story?\" panel on every article shows where it came from and when it was fetched.",
      "Sign in with Apple works for real, and the Profile screen was rebuilt around it.",
      "Bylines, sharper images, and fewer mangled characters across every source.",
    ],
  },
};

/** Returns the notes for a version, or null when that version shipped without any. The
 * caller shows a generic card in that case: a missing entry must never block an update. */
export const getReleaseNote = (version: string = APP_VERSION): ReleaseNote | null => {
  const note = RELEASE_NOTES[version];
  return note ? { version, ...note } : null;
};
