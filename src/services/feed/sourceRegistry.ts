import { ArticleCategory } from "../../types/Article";
import { FeedSource, RSS_FEEDS, SourceHealth } from "../../data/feedConfig";

export type { FeedSource, SourceHealth };

const warnedStarvedCategories = new Set<ArticleCategory>();

/** Returns every configured source (enabled and disabled) for a category. Callers apply
 * user overrides on top of this via sourcePreferences. Logs once per category, per app
 * session, when the category's default-enabled source count drops to 1 or fewer — a
 * single point of failure worth knowing about even though it's an accepted trade-off. */
export const getSourcesForCategory = (category: ArticleCategory): FeedSource[] => {
  const sources = RSS_FEEDS[category] || [];

  if (!warnedStarvedCategories.has(category)) {
    const enabledCount = sources.filter((source) => source.defaultEnabled ?? true).length;
    if (enabledCount <= 1) {
      console.warn(
        `[sourceRegistry] Category "${category}" has only ${enabledCount} enabled source(s) by default.`,
      );
      warnedStarvedCategories.add(category);
    }
  }

  return sources;
};

export const getAllCategories = (): ArticleCategory[] => Object.keys(RSS_FEEDS) as ArticleCategory[];

export const getSourceDomain = (source: FeedSource): string => {
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return source.name;
  }
};
