import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArticleCategory } from "../types/Article";

export const SOURCE_PREFS_STORAGE_KEY = "newsSourcePreferences";

export type SourceOverrideMap = Record<string, boolean>;

export interface CustomFeed {
  id: string;
  name: string;
  url: string;
  category: ArticleCategory;
  addedAt: number;
}

export interface SourcePreferences {
  overrides: SourceOverrideMap;
  customFeeds: CustomFeed[];
}

const DEFAULT_PREFS: SourcePreferences = {
  overrides: {},
  customFeeds: [],
};

// A synchronous mirror of the last-loaded preferences, for callers (like the cache-only
// read path in feed/repository.ts) that can't await AsyncStorage - e.g. a useState
// initializer. Populated as a side effect of loadSourcePreferences/persistPreferences, so
// it only reflects reality once something has loaded or saved prefs at least once this
// session; before that, sync readers still see DEFAULT_PREFS.
let syncPrefsCache: SourcePreferences = DEFAULT_PREFS;

export const getSourcePreferencesSync = (): SourcePreferences => syncPrefsCache;

const persistPreferences = async (prefs: SourcePreferences) => {
  syncPrefsCache = prefs;
  await AsyncStorage.setItem(SOURCE_PREFS_STORAGE_KEY, JSON.stringify(prefs));
};

export const getSourceKey = (category: ArticleCategory, sourceName: string) =>
  `${category}::${sourceName}`;

export const loadSourcePreferences = async (): Promise<SourcePreferences> => {
  try {
    const stored = await AsyncStorage.getItem(SOURCE_PREFS_STORAGE_KEY);
    if (!stored) {
      syncPrefsCache = DEFAULT_PREFS;
      return DEFAULT_PREFS;
    }
    const parsed = JSON.parse(stored);
    const prefs: SourcePreferences = {
      overrides: parsed.overrides || {},
      customFeeds: parsed.customFeeds || [],
    };
    syncPrefsCache = prefs;
    return prefs;
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
