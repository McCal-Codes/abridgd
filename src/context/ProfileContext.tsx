import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { AchievementDefinition, AchievementState, Profile } from "../types/Profile";
import { Article } from "../types/Article";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
// Ensure Buffer exists in React Native runtime
// @ts-expect-error - global may not have Buffer
if (!(global as any).Buffer) {
  // @ts-expect-error
  (global as any).Buffer = Buffer;
}

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  createProfile: (name: string) => void;
  switchProfile: (profileId: string) => void;
  updateActiveProfileName: (name: string) => void;
  updateSettingsTag: (tag: string) => void;
  signInWithAppleProfile: (user: { id: string; email?: string; displayName?: string }) => Profile;
  signOut: () => Profile;
  trackArticleRead: () => void;
  trackSavedAction: () => void;
  recordLastFetchedArticles: (articleIds: string[]) => void;
  exportProfileKey: () => string | null;
  importProfileKey: (key: string) => boolean;
  updateSavedArticles: (articles: Article[]) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const VERBS_OR_ADJECTIVES = [
  "Swift",
  "Curious",
  "Quiet",
  "Bold",
  "Bright",
  "Steady",
  "Brave",
  "Gentle",
  "Patient",
  "Nimble",
  "Kind",
  "Clever",
  "Guiding",
  "Running",
  "Gliding",
  "Drifting",
  "Soaring",
  "Listening",
  "Reading",
  "Focused",
  "Calm",
];

const ANIMALS = [
  "Otter",
  "Fox",
  "Heron",
  "Panda",
  "Falcon",
  "Dolphin",
  "Lynx",
  "Robin",
  "Badger",
  "Koala",
  "Wren",
  "Hawk",
  "Seal",
  "Sparrow",
  "Fawn",
  "Kestrel",
];
const sanitizeAnimalKey = (value?: string) => value?.toLowerCase().replace(/[^a-z]/g, "") ?? null;
const extractAnimalKey = (codename?: string) => {
  if (!codename) return null;
  const parts = codename.trim().split(" ");
  const last = parts[parts.length - 1];
  return sanitizeAnimalKey(last);
};

const buildAnimalKeysWithIcons = () =>
  new Set(ANIMALS.map((animal) => sanitizeAnimalKey(animal)).filter(Boolean) as string[]);

let animalKeysWithIconsCache: Set<string> | null = null;
const getAnimalKeysWithIcons = () => {
  if (!animalKeysWithIconsCache) {
    animalKeysWithIconsCache = buildAnimalKeysWithIcons();
  }
  return animalKeysWithIconsCache;
};

let animalsWithIconsCache: string[] | null = null;
const getAnimalsWithIcons = () => {
  if (!animalsWithIconsCache) {
    const keys = getAnimalKeysWithIcons();
    animalsWithIconsCache = ANIMALS.filter((animal) => keys.has(sanitizeAnimalKey(animal) || ""));
  }
  return animalsWithIconsCache;
};

const codenameHasIcon = (codename?: string) => {
  const key = extractAnimalKey(codename);
  if (!key) return false;
  return getAnimalKeysWithIcons().has(key);
};

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first_read",
    title: "First read",
    description: "Finish your first article.",
    icon: "sparkles",
    threshold: { articlesRead: 1 },
  },
  {
    id: "five_reads",
    title: "On a roll",
    description: "Read five articles.",
    icon: "trophy",
    threshold: { articlesRead: 5 },
  },
  {
    id: "first_save",
    title: "Saved one",
    description: "Save your first article.",
    icon: "medal",
    threshold: { savedActions: 1 },
  },
  {
    id: "five_saves",
    title: "Collector",
    description: "Save five articles.",
    icon: "target",
    threshold: { savedActions: 5 },
  },
];

const generateCodename = (used: Set<string> = new Set()) => {
  const animalsWithIcons = getAnimalsWithIcons();
  const animalPool = animalsWithIcons.length > 0 ? animalsWithIcons : ANIMALS;
  const maxAttempts = VERBS_OR_ADJECTIVES.length * animalPool.length;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const verb = VERBS_OR_ADJECTIVES[Math.floor(Math.random() * VERBS_OR_ADJECTIVES.length)];
    const animal = animalPool[Math.floor(Math.random() * animalPool.length)];
    const codename = `${verb} ${animal}`;
    if (!used.has(codename) && codenameHasIcon(codename)) {
      return codename;
    }
  }

  // Fallback: all combinations used; append a short suffix
  const verb = VERBS_OR_ADJECTIVES[0];
  const animal = animalPool[0];
  return `${verb} ${animal} ${Math.floor(Math.random() * 1000)}`;
};

const meetsThreshold = (def: AchievementDefinition, profile: Profile) => {
  const stats = profile.stats || { articlesRead: 0, savedActions: 0 };
  const read = stats.articlesRead || 0;
  const saves = stats.savedActions || 0;
  const savedArticles = profile.savedArticles?.length || 0;

  if (def.threshold.articlesRead && read < def.threshold.articlesRead) return false;
  if (def.threshold.savedActions && saves < def.threshold.savedActions) return false;
  if (def.threshold.savedArticles && savedArticles < def.threshold.savedArticles) return false;
  return true;
};

const applyAchievements = (profile: Profile): Profile => {
  const earnedIds = new Set(profile.achievements?.earnedIds || []);
  const earnedAt: AchievementState["earnedAt"] = { ...(profile.achievements?.earnedAt || {}) };

  ACHIEVEMENT_DEFINITIONS.forEach((def) => {
    if (meetsThreshold(def, profile)) {
      if (!earnedIds.has(def.id)) {
        earnedIds.add(def.id);
        earnedAt[def.id] = Date.now();
      }
    }
  });

  return {
    ...profile,
    achievements: {
      earnedIds: Array.from(earnedIds),
      earnedAt,
      version: 1,
    },
  };
};

const withProfileDefaults = (profile: Profile, usedCodenames: Set<string> = new Set()): Profile => {
  const stats = profile.stats || {
    articlesRead: 0,
    savedActions: 0,
    lastReadAt: null,
    lastSavedAt: null,
    lastFetchedArticleIds: [],
    lastFetchedAt: null,
  };
  const achievements = profile.achievements || { earnedIds: [], earnedAt: {}, version: 1 };
  let chosenCodename =
    profile.codename && !usedCodenames.has(profile.codename) && codenameHasIcon(profile.codename)
      ? profile.codename
      : undefined;

  if (!chosenCodename) {
    chosenCodename = generateCodename(usedCodenames);
  }

  usedCodenames.add(chosenCodename);

  const normalized: Profile = {
    ...profile,
    stats,
    achievements,
    codename: chosenCodename,
    savedArticles: profile.savedArticles || [],
    transferKey: profile.transferKey || uuidv4(),
    settingsTag: profile.settingsTag || "Local profile",
  };

  return applyAchievements(normalized);
};

const toBase64 = (input: string) => {
  try {
    if (typeof btoa === "function") return btoa(input);
  } catch {}
  return Buffer.from(input, "utf8").toString("base64");
};

const fromBase64 = (input: string) => {
  try {
    if (typeof atob === "function") return atob(input);
  } catch {}
  return Buffer.from(input, "base64").toString("utf8");
};

const STORAGE_KEY = "profiles_v1";
const ensureCodename = async () => {
  const stored = await AsyncStorage.getItem("activeCodename");
  if (stored) return stored;
  const code = generateCodename();
  await AsyncStorage.setItem("activeCodename", code);
  return code;
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const storedProfiles = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedProfiles) {
          const parsed: Profile[] = JSON.parse(storedProfiles);
          const used = new Set<string>();
          let mutated = false;
          const normalized = parsed.map((p) => {
            const next = withProfileDefaults(p, used);
            if (next.codename !== p.codename) mutated = true;
            if (next.codename) used.add(next.codename);
            return next;
          });
          setProfiles(normalized);
          setActiveProfile(normalized[0] || null);
          if (mutated) {
            try {
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            } catch (persistError) {
              console.error("Failed to persist normalized profiles", persistError);
            }
          }
          return;
        }
      } catch (e) {
        console.error("Failed to load profiles", e);
      }
      const fallbackCodename = await ensureCodename();
      const defaultProfile = withProfileDefaults({
        id: "anonymous",
        name: "Reader",
        codename: fallbackCodename,
        savedArticles: [],
        stats: { articlesRead: 0, savedActions: 0, lastReadAt: null, lastSavedAt: null },
      });
      setProfiles([defaultProfile]);
      setActiveProfile(defaultProfile);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([defaultProfile]));
    })();
  }, []);

  const persistProfiles = async (next: Profile[]) => {
    setProfiles(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Failed to persist profiles", e);
    }
  };

  const createProfile = (name: string) => {
    const used = new Set(profiles.map((p) => p.codename).filter(Boolean) as string[]);
    const newProfile = withProfileDefaults(
      {
        id: uuidv4(),
        name,
        codename: generateCodename(used),
        stats: { articlesRead: 0, savedActions: 0, lastReadAt: null, lastSavedAt: null },
        savedArticles: [],
      },
      used,
    );
    setProfiles((prevProfiles) => {
      const next = [...prevProfiles, newProfile];
      persistProfiles(next);
      return next;
    });
    if (!activeProfile) {
      setActiveProfile(newProfile);
    }
  };

  const switchProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setActiveProfile(profile);
    }
  };

  const updateActiveProfileName = (name: string) => {
    if (!activeProfile) return;
    const updated = applyAchievements({ ...activeProfile, name });
    const next = profiles.map((p) => (p.id === activeProfile.id ? updated : p));
    setActiveProfile(updated);
    persistProfiles(next);
  };

  const updateSettingsTag = (tag: string) => {
    if (!activeProfile) return;
    const cleaned = tag.trim() || "Local profile";
    const updated = applyAchievements({ ...activeProfile, settingsTag: cleaned });
    const next = profiles.map((p) => (p.id === activeProfile.id ? updated : p));
    setActiveProfile(updated);
    persistProfiles(next);
  };

  const updateActiveProfileStats = (changes: Partial<Profile["stats"]>) => {
    if (!activeProfile) return;
    const updated: Profile = applyAchievements({
      ...activeProfile,
      stats: { ...activeProfile.stats, ...changes },
    });
    const next = profiles.map((p) => (p.id === activeProfile.id ? updated : p));
    setActiveProfile(updated);
    persistProfiles(next);
  };

  const trackArticleRead = () => {
    const current = activeProfile?.stats?.articlesRead || 0;
    updateActiveProfileStats({ articlesRead: current + 1, lastReadAt: Date.now() });
  };

  const trackSavedAction = () => {
    const current = activeProfile?.stats?.savedActions || 0;
    updateActiveProfileStats({ savedActions: current + 1, lastSavedAt: Date.now() });
  };

  const recordLastFetchedArticles = (articleIds: string[]) => {
    if (!articleIds || articleIds.length === 0) return;
    updateActiveProfileStats({
      lastFetchedArticleIds: articleIds.slice(0, 50),
      lastFetchedAt: Date.now(),
    });
  };

  const updateSavedArticles = (articles: Article[]) => {
    if (!activeProfile) return;
    const updated: Profile = applyAchievements({
      ...activeProfile,
      savedArticles: articles,
    });
    const next = profiles.map((p) => (p.id === activeProfile.id ? updated : p));
    setActiveProfile(updated);
    persistProfiles(next);
  };

  const signOut = (): Profile => {
    const local = profiles.find((p) => !p.appleUserId) || profiles[0];
    if (local) {
      setActiveProfile(local);
      persistProfiles(profiles);
      return local;
    }

    const used = new Set(profiles.map((p) => p.codename).filter(Boolean) as string[]);
    const fallback: Profile = withProfileDefaults(
      {
        id: "anonymous",
        name: "Reader",
        codename: generateCodename(used),
        stats: { articlesRead: 0, savedActions: 0, lastReadAt: null },
        savedArticles: [],
      },
      used,
    );
    const next = [...profiles, fallback];
    setProfiles(next);
    setActiveProfile(fallback);
    persistProfiles(next);
    return fallback;
  };

  const signInWithAppleProfile = (user: {
    id: string;
    email?: string;
    displayName?: string;
  }): Profile => {
    // If we already have a profile for this Apple user, switch to it.
    const existing = profiles.find((p) => p.appleUserId === user.id || p.id === user.id);
    if (existing) {
      setActiveProfile(existing);
      return existing;
    }

    const derivedName =
      user.displayName || user.email?.split("@")[0] || activeProfile?.name || "Reader";

    const used = new Set(profiles.map((p) => p.codename).filter(Boolean) as string[]);

    const newProfile = withProfileDefaults(
      {
        id: user.id,
        appleUserId: user.id,
        email: user.email,
        displayName: user.displayName,
        name: derivedName,
        codename: generateCodename(used),
        stats: { articlesRead: 0, savedActions: 0, lastReadAt: null },
        savedArticles: [],
      },
      used,
    );

    const next = [...profiles, newProfile];
    setActiveProfile(newProfile);
    persistProfiles(next);
    return newProfile;
  };

  const exportProfileKey = () => {
    if (!activeProfile) return null;
    try {
      const normalized = applyAchievements(activeProfile);
      const payload = JSON.stringify(normalized);
      return toBase64(payload);
    } catch (e) {
      console.error("Failed to export profile key", e);
      return null;
    }
  };

  const importProfileKey = (key: string) => {
    try {
      const json = fromBase64(key);
      const parsed: Profile = JSON.parse(json);
      if (!parsed?.id || !parsed?.name) return false;
      const used = new Set(profiles.map((p) => p.codename).filter(Boolean) as string[]);
      const sanitized = withProfileDefaults(
        {
          ...parsed,
          stats: parsed.stats || {
            articlesRead: 0,
            savedActions: 0,
            lastReadAt: null,
            lastSavedAt: null,
          },
          savedArticles: parsed.savedArticles || [],
        },
        used,
      );
      const existingIdx = profiles.findIndex(
        (p) => p.id === sanitized.id || p.transferKey === sanitized.transferKey,
      );
      let next: Profile[];
      if (existingIdx >= 0) {
        next = [...profiles];
        next[existingIdx] = sanitized;
      } else {
        next = [...profiles, sanitized];
      }
      setActiveProfile(sanitized);
      persistProfiles(next);
      return true;
    } catch (e) {
      console.error("Failed to import profile key", e);
      return false;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        createProfile,
        switchProfile,
        updateActiveProfileName,
        updateSettingsTag,
        signInWithAppleProfile,
        signOut,
        trackArticleRead,
        trackSavedAction,
        recordLastFetchedArticles,
        exportProfileKey,
        importProfileKey,
        updateSavedArticles,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfiles must be used within a ProfileProvider");
  }
  return context;
};

export const useProfilesOptional = () => {
  return useContext(ProfileContext);
};

export const getAchievementStatuses = (profile?: Profile) => {
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const stats = profile?.stats || { articlesRead: 0, savedActions: 0 };
    const savedCount = profile?.savedArticles?.length || 0;
    const earned = profile ? meetsThreshold(def, profile) : false;
    const earnedAt = profile?.achievements?.earnedAt?.[def.id];

    let progressText = "";
    let current = 0;
    let target = 0;
    if (def.threshold.articlesRead) {
      current = stats.articlesRead;
      target = def.threshold.articlesRead;
      progressText = `${stats.articlesRead}/${def.threshold.articlesRead} reads`;
    } else if (def.threshold.savedActions) {
      current = stats.savedActions;
      target = def.threshold.savedActions;
      progressText = `${stats.savedActions}/${def.threshold.savedActions} saves`;
    } else if (def.threshold.savedArticles) {
      current = savedCount;
      target = def.threshold.savedArticles;
      progressText = `${savedCount}/${def.threshold.savedArticles} saved`;
    }

    const progressPercent = target ? Math.min(100, Math.round((current / target) * 100)) : 0;

    if (earned) {
      progressText = earnedAt
        ? `Unlocked • ${new Date(earnedAt).toLocaleDateString()}`
        : "Unlocked";
    }

    return {
      ...def,
      earned,
      earnedAt,
      progressText,
      progressPercent,
    };
  });
};

export { ACHIEVEMENT_DEFINITIONS };
