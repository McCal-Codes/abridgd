import { useEffect, useState } from "react";
import { Article } from "../types/Article";
import { fetchAndCacheFullStory } from "../services/fullStoryCache";

const TRUNCATED_SOURCES = ["WTAE", "WPXI", "CBS", "City Paper"];
const SHORT_BODY_THRESHOLD = 800;
const FETCH_DELAY_MS = 500;

export interface FullStoryEnrichmentState {
  enrichedBody: string | null;
  enrichedAuthor: string | null;
  /** A lead photo from the story's page, only set when the feed gave the article none. */
  enrichedImageUrl: string | null;
  isLoadingFullStory: boolean;
}

/**
 * Fetches a longer version of an article's body (cache-first, deduped) when the RSS body
 * looks truncated — either short, or from a source known to ship summary-only feeds.
 * Never blocks initial render: callers should render the article body immediately and swap
 * in `enrichedBody` only once/if it resolves and is longer than what's already shown.
 */
export const useFullStoryEnrichment = (
  article: Article,
  currentBodyLength: number,
): FullStoryEnrichmentState => {
  const [enrichedBody, setEnrichedBody] = useState<string | null>(null);
  const [enrichedAuthor, setEnrichedAuthor] = useState<string | null>(null);
  const [enrichedImageUrl, setEnrichedImageUrl] = useState<string | null>(null);
  const [isLoadingFullStory, setIsLoadingFullStory] = useState(false);

  useEffect(() => {
    setEnrichedBody(null);
    setEnrichedAuthor(null);
    setEnrichedImageUrl(null);

    const isTruncatedSource = TRUNCATED_SOURCES.some((source) => article.source.includes(source));
    const isShort = currentBodyLength < SHORT_BODY_THRESHOLD;

    // Some feeds (TribLive, Kidsburgh, NEXTpittsburgh, DK Pittsburgh Sports) carry no photo at
    // all, so a story with a full-length body can still be missing its lead image.
    const needsPhoto = !article.imageUrl && !(article.mediaImages && article.mediaImages.length > 0);

    if (!article.link || (!isShort && !isTruncatedSource && !needsPhoto)) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoadingFullStory(true);
      const fullStory = await fetchAndCacheFullStory(article.link!);
      if (!cancelled) {
        if (fullStory?.body && fullStory.body.length > currentBodyLength) {
          setEnrichedBody(fullStory.body);
        }
        if (fullStory?.author) {
          setEnrichedAuthor(fullStory.author);
        }
        if (needsPhoto && fullStory?.imageUrl) {
          setEnrichedImageUrl(fullStory.imageUrl);
        }
        setIsLoadingFullStory(false);
      }
    }, FETCH_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Deliberately keyed only on article.link, matching the prior inline effect: re-running
    // on every bodyContent change would re-trigger enrichment after we just applied it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.link]);

  return { enrichedBody, enrichedAuthor, enrichedImageUrl, isLoadingFullStory };
};
