import { APP_VERSION } from "../appInfo";
import { RELEASE_NOTES, getReleaseNote } from "../releaseNotes";

describe("release notes", () => {
  it("has an entry for the version being shipped", () => {
    // The What's New flow falls back to a generic card rather than blocking a release, which
    // means a missing entry ships silently. This is the thing that notices.
    expect(getReleaseNote(APP_VERSION)).not.toBeNull();
  });

  it("returns null for a version that has no notes", () => {
    expect(getReleaseNote("0.0.1-nonexistent")).toBeNull();
  });

  it("keeps every entry short enough to read on the update screen", () => {
    Object.entries(RELEASE_NOTES).forEach(([version, note]) => {
      expect(note.headline.length).toBeLessThanOrEqual(60);
      expect(note.items.length).toBeGreaterThanOrEqual(3);
      expect(note.items.length).toBeLessThanOrEqual(5);
      note.items.forEach((item) => {
        expect(item.length).toBeGreaterThan(0);
        // Anything longer is a changelog line that wandered into the reader-facing file.
        expect(`${version}: ${item}`.length).toBeLessThanOrEqual(180);
      });
    });
  });
});
