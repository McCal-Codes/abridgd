import type { GalleryPhoto } from "../components/PhotoGallery";
import { resolveMediaUri } from "./mediaUri";
import { NON_EDITORIAL_IMAGE } from "../services/pageContent";

interface ImageNodeLike {
  type: string;
  src?: string;
  caption?: string;
  credit?: string;
}

const NON_EDITORIAL = NON_EDITORIAL_IMAGE;

/**
 * Picks the photos worth a place in the story's photo strip.
 *
 * Full-story enrichment scrapes the publisher's page, and a page carries far more images than
 * the story has photos: logos, author avatars, and thumbnails for related stories. WTAE's pages
 * produced an "11 photos" strip of mostly logos. So an image qualifies only when it is clearly
 * editorial: it came from the feed's own media block, or the writer gave it a caption or credit.
 * Uncaptioned page images never qualify, and anything that looks like site chrome never does.
 */
export const selectGalleryPhotos = (
  nodes: ImageNodeLike[],
  feedImages: Array<string | undefined>,
  baseUrl?: string,
): GalleryPhoto[] => {
  const feed = new Set<string>();
  for (const src of feedImages) {
    const uri = src ? resolveMediaUri(src, baseUrl) : null;
    if (uri) feed.add(uri);
  }

  const seen = new Set<string>();
  const photos: GalleryPhoto[] = [];
  for (const node of nodes) {
    if (node.type !== "image" || !node.src) continue;
    const uri = resolveMediaUri(node.src, baseUrl);
    if (!uri || seen.has(uri) || NON_EDITORIAL.test(uri)) continue;
    const editorial = feed.has(uri) || !!node.caption || !!node.credit;
    if (!editorial) continue;
    seen.add(uri);
    photos.push({ uri, caption: node.caption, credit: node.credit });
  }
  return photos;
};
