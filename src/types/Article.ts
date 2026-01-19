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

export interface Article {
  id: string;
  headline: string;
  summary: string;
  body: string;
  source: string;
  timestamp: string;
  publishedAt: number; // Unix timestamp for when article was published
  category: ArticleCategory;
  imageUrl?: string;
  readTimeMinutes: number;
  isSensitive?: boolean;
  sensitivityWarning?: string;
  link?: string;
  tags?: string[];
  contentWarnings?: ContentWarning[];
  emotionalIntensity?: "low" | "medium" | "high";
}
