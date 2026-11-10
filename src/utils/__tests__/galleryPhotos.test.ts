import { selectGalleryPhotos } from "../galleryPhotos";

const img = (src: string, caption?: string, credit?: string) => ({ type: "image", src, caption, credit });

describe("selectGalleryPhotos", () => {
  it("keeps captioned and feed photos in order", () => {
    const photos = selectGalleryPhotos(
      [img("https://x.com/a.jpg", "Riders wait."), img("https://x.com/b.jpg"), img("https://x.com/c.jpg", undefined, "A. Reporter")],
      ["https://x.com/b.jpg"],
    );
    expect(photos.map((p) => p.uri)).toEqual([
      "https://x.com/a.jpg",
      "https://x.com/b.jpg",
      "https://x.com/c.jpg",
    ]);
  });

  it("drops uncaptioned page images such as related-story thumbnails", () => {
    const photos = selectGalleryPhotos(
      [img("https://x.com/related1.jpg"), img("https://x.com/related2.jpg")],
      [],
    );
    expect(photos).toEqual([]);
  });

  it("drops site chrome even when it has a caption", () => {
    const photos = selectGalleryPhotos(
      [
        img("https://x.com/static/site_branding/ap.png", "AP"),
        img("https://x.com/profile_photos/a.png", "Associated Press"),
        img("https://x.com/icons/x.svg", "Share"),
        img("https://x.com/logo.png", "Logo"),
      ],
      [],
    );
    expect(photos).toEqual([]);
  });

  it("removes duplicates", () => {
    const photos = selectGalleryPhotos(
      [img("https://x.com/a.jpg", "One"), img("https://x.com/a.jpg", "One again")],
      [],
    );
    expect(photos).toHaveLength(1);
  });
});
