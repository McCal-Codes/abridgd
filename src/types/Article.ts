export type ArticleCategory = "Top" | "Local" | "Business" | "Sports" | "Culture";

export type ContentWarning =
  | "politics"
  | "violence-realistic"
  | "violence-graphic"
  | "violence-fantasy"
  | "war"
  | "terrorism"
  | "abuse"
  | "crime"
  | "disaster"
  | "self-harm"
  | "health"
  | "medical"
  | "sexual-content"
  | "sexual-content-graphic"
  | "mature-themes"
  | "substance-use"
  | "gambling"
  | "hate-speech"
  | "graphic";

export interface ArticleProvenance {
  sourceName: string;
  /** Canonical domain the source publishes from, e.g. "wtae.com". */
  sourceDomain: string;
  category: ArticleCategory;
  publishedAt: number;
  /** Factual, non-personalized explanation of why this story is in the feed. */
  inclusionReason: string;
  /** This source's last successful fetch timestamp, or null if not yet refreshed this session. */
  sourceLastRefreshedAt: number | null;
}

export interface Article {
  id: string;
  headline: string;
  summary: string;
  body: string;
  source: string;
  author?: string;
  timestamp: string;
  publishedAt: number; // Unix timestamp for when article was published
  category: ArticleCategory;
  imageUrl?: string;
  /** Caption for `imageUrl`, from media RSS (`media:description`/`media:title`). */
  imageCaption?: string;
  /** Attribution for `imageUrl`, from `media:credit` or split out of the caption text. */
  imageCredit?: string;
  mediaImages?: string[];
  mediaVideos?: string[];
  readTimeMinutes: number;
  isSensitive?: boolean;
  sensitivityWarning?: string;
  link?: string;
  tags?: string[];
  contentWarnings?: ContentWarning[];
  emotionalIntensity?: "low" | "medium" | "high";
  provenance?: ArticleProvenance;
}
