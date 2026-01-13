import { Article } from './Article';

export interface Profile {
  id: string;
  name: string;
  savedArticles: Article[];
  // Add other profile-related settings here
}
