import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArticleCategory } from "../types/Article";
import { FeedHealth } from "../types/FeedHealth";

export const SOURCE_PREFS_STORAGE_KEY = "newsSourcePreferences";

export type SourceOverrideMap = Record<string, boolean>;

export interface CustomFeed {
  id: string;
  name: string;
  url: string;
  category: ArticleCategory;
  addedAt: number;
  health?: FeedHealth;
}

export interface SourcePreferences {
  overrides: SourceOverrideMap;
  customFeeds: CustomFeed[];
}

const DEFAULT_PREFS: SourcePreferences = {
  overrides: {},
  customFeeds: [],
};

const persistPreferences = async (prefs: SourcePreferences) => {
  await AsyncStorage.setItem(SOURCE_PREFS_STORAGE_KEY, JSON.stringify(prefs));
};

export const getSourceKey = (category: ArticleCategory, sourceName: string) =>
  `${category}::${sourceName}`;

export const loadSourcePreferences = async (): Promise<SourcePreferences> => {
  try {
    const stored = await AsyncStorage.getItem(SOURCE_PREFS_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFS;
    }
    const parsed = JSON.parse(stored);
    return {
      overrides: parsed.overrides || {},
      customFeeds: parsed.customFeeds || [],
    };
  } catch (error) {
    console.warn("Failed to load source preferences", error);
    return DEFAULT_PREFS;
  }
};

export const updateSourceEnabled = async (
  category: ArticleCategory,
  sourceName: string,
  enabled: boolean,
  defaultEnabled = true,
): Promise<SourcePreferences> => {
  const current = await loadSourcePreferences();
  const key = getSourceKey(category, sourceName);
  const overrides: SourceOverrideMap = { ...current.overrides };
  if (enabled === defaultEnabled) {
    delete overrides[key];
  } else {
    overrides[key] = enabled;
  }
  const next = { ...current, overrides };
  await persistPreferences(next);
  return next;
};

export const saveSourceOverrides = async (overrides: SourceOverrideMap) => {
  const current = await loadSourcePreferences();
  const next = { ...current, overrides };
  await persistPreferences(next);
  return next;
};

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const normalizeUrl = (url: string) => url.trim();

export const addCustomFeed = async (
  feed: Omit<CustomFeed, "id" | "addedAt"> & { health?: FeedHealth },
): Promise<SourcePreferences> => {
  const current = await loadSourcePreferences();
  const normalizedUrl = normalizeUrl(feed.url);
  const normalizedName = feed.name.trim();

  if (!normalizedName || !normalizedUrl) {
    throw new Error("Feed name and URL are required.");
  }

  const duplicate = current.customFeeds.find(
    (f) => f.url === normalizedUrl || f.name.toLowerCase() === normalizedName.toLowerCase(),
  );

  if (duplicate) {
    throw new Error("That feed is already added.");
  }

  const newFeed: CustomFeed = {
    id: generateId(),
    name: normalizedName,
    url: normalizedUrl,
    category: feed.category,
    addedAt: Date.now(),
    health: feed.health,
  };

  const next = { ...current, customFeeds: [...current.customFeeds, newFeed] };
  await persistPreferences(next);
  return next;
};

export const removeCustomFeed = async (id: string): Promise<SourcePreferences> => {
  const current = await loadSourcePreferences();
  const toRemove = current.customFeeds.find((f) => f.id === id);
  const filtered = current.customFeeds.filter((f) => f.id !== id);

  // Clean up overrides for the feed being removed
  const overrides = { ...current.overrides };
  if (toRemove) {
    const key = getSourceKey(toRemove.category, toRemove.name);
    delete overrides[key];
  }

  const next = { ...current, overrides, customFeeds: filtered };
  await persistPreferences(next);
  return next;
};

export const saveCustomFeedHealth = async (
  id: string,
  health: FeedHealth,
): Promise<SourcePreferences> => {
  const current = await loadSourcePreferences();
  const customFeeds = current.customFeeds.map((feed) =>
    feed.id === id ? { ...feed, health } : feed,
  );

  const next = { ...current, customFeeds };
  await persistPreferences(next);
  return next;
};

export const isSourceEnabled = (
  overrides: SourceOverrideMap,
  category: ArticleCategory,
  sourceName: string,
  defaultEnabled = true,
) => {
  const override = overrides[getSourceKey(category, sourceName)];
  if (override === undefined) return defaultEnabled;
  return override;
};
