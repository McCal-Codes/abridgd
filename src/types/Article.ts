export type ArticleCategory = 'Top' | 'Local' | 'Business' | 'Sports' | 'Culture';

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
}
