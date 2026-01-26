import { Article } from "./Article";

export type AchievementIcon = "sparkles" | "trophy" | "medal" | "target";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon?: AchievementIcon;
  threshold: {
    articlesRead?: number;
    savedActions?: number;
    savedArticles?: number;
  };
}

export interface AchievementState {
  earnedIds: string[];
  earnedAt?: Record<string, number>;
  version?: number;
}

export interface Profile {
  id: string;
  name: string;
  appleUserId?: string;
  email?: string;
  displayName?: string;
  codename?: string;
  stats?: {
    articlesRead: number;
    savedActions: number;
    lastReadAt?: number | null;
    lastSavedAt?: number | null;
    lastFetchedArticleIds?: string[];
    lastFetchedAt?: number | null;
  };
  settingsTag?: string;
  transferKey?: string;
  achievements?: AchievementState;
  savedArticles: Article[];
  // Add other profile-related settings here
}
