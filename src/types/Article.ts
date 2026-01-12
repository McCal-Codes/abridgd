export type ArticleCategory = 'Top' | 'Local' | 'Business' | 'Sports' | 'Culture';

export interface Article {
  id: string;
  headline: string;
  summary: string;
  body: string;
  source: string;
  timestamp: string;
  category: ArticleCategory;
  imageUrl?: string;
  readTimeMinutes: number;
}
