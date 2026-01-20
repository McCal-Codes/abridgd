import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Profile } from "../types/Profile";
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
  trackArticleRead: () => void;
  trackSavedAction: () => void;
  exportProfileKey: () => string | null;
  importProfileKey: (key: string) => boolean;
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

const generateCodename = () => {
  const verb = VERBS_OR_ADJECTIVES[Math.floor(Math.random() * VERBS_OR_ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${verb} ${animal}`;
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
          setProfiles(parsed);
          setActiveProfile(parsed[0] || null);
          return;
        }
      } catch (e) {
        console.error("Failed to load profiles", e);
      }
      const fallbackCodename = await ensureCodename();
      const defaultProfile: Profile = {
        id: "anonymous",
        name: "Reader",
        codename: fallbackCodename,
        savedArticles: [],
      };
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
    const newProfile: Profile = {
      id: uuidv4(),
      name,
      codename: generateCodename(),
      stats: { articlesRead: 0, savedActions: 0, lastReadAt: null },
      savedArticles: [],
    };
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
    const updated = { ...activeProfile, name };
    const next = profiles.map((p) => (p.id === activeProfile.id ? updated : p));
    setActiveProfile(updated);
    persistProfiles(next);
  };

  const updateActiveProfileStats = (changes: Partial<Profile["stats"]>) => {
    if (!activeProfile) return;
    const updated: Profile = {
      ...activeProfile,
      stats: { ...activeProfile.stats, ...changes },
    };
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
    updateActiveProfileStats({ savedActions: current + 1 });
  };

  const exportProfileKey = () => {
    if (!activeProfile) return null;
    try {
      const payload = JSON.stringify(activeProfile);
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
      const sanitized: Profile = {
        ...parsed,
        stats: parsed.stats || { articlesRead: 0, savedActions: 0, lastReadAt: null },
        codename: parsed.codename || generateCodename(),
        savedArticles: parsed.savedArticles || [],
      };
      const existingIdx = profiles.findIndex((p) => p.id === sanitized.id);
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
        trackArticleRead,
        trackSavedAction,
        exportProfileKey,
        importProfileKey,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};
