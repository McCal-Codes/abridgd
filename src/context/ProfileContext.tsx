import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Profile } from '../types/Profile';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  createProfile: (name: string) => void;
  switchProfile: (profileId: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  const createProfile = (name: string) => {
    const newProfile: Profile = {
      id: uuidv4(),
      name,
      savedArticles: [],
    };
    setProfiles((prevProfiles) => [...prevProfiles, newProfile]);
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

  return (
    <ProfileContext.Provider value={{ profiles, activeProfile, createProfile, switchProfile }}>
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
