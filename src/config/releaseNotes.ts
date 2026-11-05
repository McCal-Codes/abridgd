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
  "0.2.0": {
    headline: "Events, local help, and a calmer welcome",
    items: [
      "See what's on around Pittsburgh: a \"This week\" card on Home and an Events screen, with a one-tap way to add any event to your calendar.",
      "Resources, in Settings: crisis lines and local services in one place, working offline.",
      "A new welcome that lets you pick your newsrooms and choose how heavy stories are handled.",
      "Dark mode that follows your phone, easier-to-read text, and stories that now show a lead photo and byline.",
      "Fixes: saved articles now survive a profile import, and the Haptics setting actually works.",
    ],
  },
  "1.5.7": {
    headline: "Every section, and where you left off",
    items: [
      "Business, Sports and Culture are browsable at last — Discover switches between all five sections.",
      "19 working sources, up from 12. Culture went from one to five.",
      "Swipe left on any story to save it, and pick up articles where you stopped reading.",
      "Pinch, double-tap and drag photos to look closer, with captions and credits carried over from the source.",
      "The reading-speed slider changes reading speed. It never did before.",
    ],
  },
  "1.5.6": {
    headline: "Every section, and where you left off",
    items: [
      "Business, Sports and Culture are browsable at last — Discover switches between all five sections.",
      "19 working sources, up from 12. Culture went from one to five.",
      "Swipe left on any story to save it, and pick up articles where you stopped reading.",
      "Pinch, double-tap and drag photos to look closer, with captions and credits carried over from the source.",
      "The reading-speed slider changes reading speed. It never did before.",
    ],
  },
  "1.5.5": {
    headline: "Every section, and where you left off",
    items: [
      "Business, Sports and Culture are browsable at last — Discover switches between all five sections.",
      "19 working sources, up from 12. Culture went from one to five.",
      "Swipe left on any story to save it, and pick up articles where you stopped reading.",
      "Pinch, double-tap and drag photos to look closer, with captions and credits carried over from the source.",
      "The reading-speed slider changes reading speed. It never did before.",
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
