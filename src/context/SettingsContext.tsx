import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

export type AnchorStrategy = 'early' | 'standard' | 'center';
export type DigestSummaryMode = 'fact-based' | 'ai-summary' | 'headline-only';
export type GroundingAnimationStyle = 'simple' | 'waves' | 'pulse';

interface SettingsContextType {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  rsvpHighlightColor: string;
  setRsvpHighlightColor: (color: string) => Promise<void>;
  rsvpAnchorStrategy: AnchorStrategy;
  setRsvpAnchorStrategy: (strategy: AnchorStrategy) => Promise<void>;
  groundingColor: string;
  setGroundingColor: (color: string) => Promise<void>;
  isReaderEnabled: boolean;
  setIsReaderEnabled: (enabled: boolean) => Promise<void>;
  isGroundingEnabled: boolean;
  setIsGroundingEnabled: (enabled: boolean) => Promise<void>;
  isSummarizationEnabled: boolean;
  setIsSummarizationEnabled: (enabled: boolean) => Promise<void>;
  isWelcomeBackEnabled: boolean;
  setIsWelcomeBackEnabled: (enabled: boolean) => Promise<void>;
  isLoadingSettings: boolean;
  lastAppVisit: number | null;
  updateLastAppVisit: () => Promise<void>;
  digestSummaryMode: DigestSummaryMode;
  setDigestSummaryMode: (mode: DigestSummaryMode) => Promise<void>;
  groundingBreathDuration: number;
  setGroundingBreathDuration: (duration: number) => Promise<void>;
  groundingCycles: number;
  setGroundingCycles: (cycles: number) => Promise<void>;
  groundingAnimationStyle: GroundingAnimationStyle;
  setGroundingAnimationStyle: (style: GroundingAnimationStyle) => Promise<void>;
  readingSpeed: number; // Words per minute
  setReadingSpeed: (speed: number) => Promise<void>;
  fontSize: number; // Base font size multiplier (0.8 - 1.5)
  setFontSize: (size: number) => Promise<void>;
  activeTabs: string[]; // Array of active tab IDs
  setActiveTabs: (tabs: string[]) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [rsvpHighlightColor, setRsvpHighlightColorState] = useState(colors.error);
  const [rsvpAnchorStrategy, setRsvpAnchorStrategyState] = useState<AnchorStrategy>('standard');
  const [groundingColor, setGroundingColorState] = useState('#A8C3B3'); // Sage default
  const [isReaderEnabled, setIsReaderEnabledState] = useState(true);
  const [isGroundingEnabled, setIsGroundingEnabledState] = useState(true);
  const [isSummarizationEnabled, setIsSummarizationEnabledState] = useState(false);
  const [isWelcomeBackEnabled, setIsWelcomeBackEnabledState] = useState(true);
  const [lastAppVisit, setLastAppVisit] = useState<number | null>(null);
  const [digestSummaryMode, setDigestSummaryModeState] = useState<DigestSummaryMode>('fact-based');
  const [groundingBreathDuration, setGroundingBreathDurationState] = useState(4); // 4 seconds default
  const [groundingCycles, setGroundingCyclesState] = useState(5); // 5 cycles default
  const [groundingAnimationStyle, setGroundingAnimationStyleState] = useState<GroundingAnimationStyle>('waves');
  const [readingSpeed, setReadingSpeedState] = useState(300); // 300 WPM default
  const [fontSize, setFontSizeState] = useState(1.0); // 1.0x default
  const [activeTabs, setActiveTabsState] = useState<string[]>(['top', 'local', 'business', 'sports', 'digest']); // Default tabs
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const onboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      const highlightColor = await AsyncStorage.getItem('rsvpHighlightColor');
      const anchorStrategy = await AsyncStorage.getItem('rsvpAnchorStrategy');
      const savedGroundingColor = await AsyncStorage.getItem('groundingColor');
      const readerEnabled = await AsyncStorage.getItem('isReaderEnabled');
      const groundingEnabled = await AsyncStorage.getItem('isGroundingEnabled');
      const summarizationEnabled = await AsyncStorage.getItem('isSummarizationEnabled');
      const welcomeBackEnabled = await AsyncStorage.getItem('isWelcomeBackEnabled');
      const lastVisit = await AsyncStorage.getItem('lastAppVisit');
      const savedDigestMode = await AsyncStorage.getItem('digestSummaryMode');
      const savedBreathDuration = await AsyncStorage.getItem('groundingBreathDuration');
      const savedCycles = await AsyncStorage.getItem('groundingCycles');
      const savedAnimationStyle = await AsyncStorage.getItem('groundingAnimationStyle');
      const savedReadingSpeed = await AsyncStorage.getItem('readingSpeed');
      const savedFontSize = await AsyncStorage.getItem('fontSize');
      const savedActiveTabs = await AsyncStorage.getItem('activeTabs');

      if (onboarding === 'true') setHasCompletedOnboarding(true);
      if (highlightColor) setRsvpHighlightColorState(highlightColor);
      if (savedGroundingColor) setGroundingColorState(savedGroundingColor);
      if (readerEnabled !== null) setIsReaderEnabledState(readerEnabled === 'true');
      if (groundingEnabled !== null) setIsGroundingEnabledState(groundingEnabled === 'true');
      if (summarizationEnabled !== null) setIsSummarizationEnabledState(summarizationEnabled === 'true');
      if (welcomeBackEnabled !== null) setIsWelcomeBackEnabledState(welcomeBackEnabled === 'true');
      if (anchorStrategy && ['early', 'standard', 'center'].includes(anchorStrategy)) {
        setRsvpAnchorStrategyState(anchorStrategy as AnchorStrategy);
      }
      if (lastVisit) {
        setLastAppVisit(parseInt(lastVisit, 10));
      }
      if (savedDigestMode && ['fact-based', 'ai-summary', 'headline-only'].includes(savedDigestMode)) {
        setDigestSummaryModeState(savedDigestMode as DigestSummaryMode);
      }
      if (savedBreathDuration) {
        setGroundingBreathDurationState(parseInt(savedBreathDuration, 10));
      }
      if (savedCycles) {
        setGroundingCyclesState(parseInt(savedCycles, 10));
      }
      if (savedAnimationStyle && ['simple', 'waves', 'pulse'].includes(savedAnimationStyle)) {
        setGroundingAnimationStyleState(savedAnimationStyle as GroundingAnimationStyle);
      }
      if (savedReadingSpeed) {
        setReadingSpeedState(parseInt(savedReadingSpeed, 10));
      }
      if (savedFontSize) {
        setFontSizeState(parseFloat(savedFontSize));
      }
      if (savedActiveTabs) {
        try {
          const tabs = JSON.parse(savedActiveTabs);
          if (Array.isArray(tabs) && tabs.length >= 2 && tabs.length <= 5) {
            setActiveTabsState(tabs);
          }
        } catch (e) {
          console.error('Failed to parse active tabs', e);
        }
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setHasCompletedOnboarding(true);
    } catch (e) {
      console.error('Failed to save onboarding', e);
    }
  };

  const resetOnboarding = async () => {
      try {
          await AsyncStorage.removeItem('hasCompletedOnboarding');
          setHasCompletedOnboarding(false);
      } catch (e) {
          console.error("Failed to reset onboarding", e);
      }
  };

  const setRsvpHighlightColor = async (color: string) => {
    try {
      await AsyncStorage.setItem('rsvpHighlightColor', color);
      setRsvpHighlightColorState(color);
    } catch (e) {
      console.error('Failed to save color', e);
    }
  };

  const setRsvpAnchorStrategy = async (strategy: AnchorStrategy) => {
    try {
      await AsyncStorage.setItem('rsvpAnchorStrategy', strategy);
      setRsvpAnchorStrategyState(strategy);
    } catch (e) {
      console.error('Failed to save anchor strategy', e);
    }
  };

  const setGroundingColor = async (color: string) => {
      try {
          await AsyncStorage.setItem('groundingColor', color);
          setGroundingColorState(color);
      } catch (e) {
          console.error("Failed to save grounding color", e);
      }
  };

  const setIsReaderEnabled = async (enabled: boolean) => {
    try {
        await AsyncStorage.setItem('isReaderEnabled', enabled.toString());
        setIsReaderEnabledState(enabled);
    } catch (e) {
        console.error("Failed to save reader enabled state", e);
    }
  };

  const setIsGroundingEnabled = async (enabled: boolean) => {
    try {
        await AsyncStorage.setItem('isGroundingEnabled', enabled.toString());
        setIsGroundingEnabledState(enabled);
    } catch (e) {
        console.error("Failed to save grounding enabled state", e);
    }
  };

  const setIsSummarizationEnabled = async (enabled: boolean) => {
    try {
        await AsyncStorage.setItem('isSummarizationEnabled', enabled.toString());
        setIsSummarizationEnabledState(enabled);
    } catch (e) {
        console.error("Failed to save summarization enabled state", e);
    }
  };

  const setIsWelcomeBackEnabled = async (enabled: boolean) => {
    try {
        await AsyncStorage.setItem('isWelcomeBackEnabled', enabled.toString());
        setIsWelcomeBackEnabledState(enabled);
    } catch (e) {
        console.error("Failed to save welcome back enabled state", e);
    }
  };

  const updateLastAppVisit = async () => {
    try {
        const now = Date.now();
        await AsyncStorage.setItem('lastAppVisit', now.toString());
        setLastAppVisit(now);
    } catch (e) {
        console.error("Failed to save last app visit", e);
    }
  };

  const setDigestSummaryMode = async (mode: DigestSummaryMode) => {
    try {
        await AsyncStorage.setItem('digestSummaryMode', mode);
        setDigestSummaryModeState(mode);
    } catch (e) {
        console.error("Failed to save digest summary mode", e);
    }
  };

  const setGroundingBreathDuration = async (duration: number) => {
    try {
        await AsyncStorage.setItem('groundingBreathDuration', duration.toString());
        setGroundingBreathDurationState(duration);
    } catch (e) {
        console.error("Failed to save grounding breath duration", e);
    }
  };

  const setGroundingCycles = async (cycles: number) => {
    try {
        await AsyncStorage.setItem('groundingCycles', cycles.toString());
        setGroundingCyclesState(cycles);
    } catch (e) {
        console.error("Failed to save grounding cycles", e);
    }
  };

  const setGroundingAnimationStyle = async (style: GroundingAnimationStyle) => {
    try {
        await AsyncStorage.setItem('groundingAnimationStyle', style);
        setGroundingAnimationStyleState(style);
    } catch (e) {
        console.error("Failed to save grounding animation style", e);
    }
  };

  const setReadingSpeed = async (speed: number) => {
    try {
        await AsyncStorage.setItem('readingSpeed', speed.toString());
        setReadingSpeedState(speed);
    } catch (e) {
        console.error("Failed to save reading speed", e);
    }
  };

  const setFontSize = async (size: number) => {
    try {
        await AsyncStorage.setItem('fontSize', size.toString());
        setFontSizeState(size);
    } catch (e) {
        console.error("Failed to save font size", e);
    }
  };

  const setActiveTabs = async (tabs: string[]) => {
    try {
        await AsyncStorage.setItem('activeTabs', JSON.stringify(tabs));
        setActiveTabsState(tabs);
    } catch (e) {
        console.error("Failed to save active tabs", e);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboarding,
        rsvpHighlightColor,
        setRsvpHighlightColor,
        rsvpAnchorStrategy,
        setRsvpAnchorStrategy,
        groundingColor,
        setGroundingColor,
        isReaderEnabled,
        setIsReaderEnabled,
        isGroundingEnabled,
        setIsGroundingEnabled,
        isSummarizationEnabled,
        setIsSummarizationEnabled,
        isWelcomeBackEnabled,
        setIsWelcomeBackEnabled,
        isLoadingSettings,
        lastAppVisit,
        updateLastAppVisit,
        digestSummaryMode,
        setDigestSummaryMode,
        groundingBreathDuration,
        setGroundingBreathDuration,
        groundingCycles,
        setGroundingCycles,
        groundingAnimationStyle,
        setGroundingAnimationStyle,
        readingSpeed,
        setReadingSpeed,
        fontSize,
        setFontSize,
        activeTabs,
        setActiveTabs,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
