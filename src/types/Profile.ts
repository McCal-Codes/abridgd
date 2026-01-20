import { Article } from './Article';

export interface Profile {
  id: string;
  name: string;
  codename?: string;
  stats?: {
    articlesRead: number;
    savedActions: number;
    lastReadAt?: number | null;
  };
  savedArticles: Article[];
  // Add other profile-related settings here
}
