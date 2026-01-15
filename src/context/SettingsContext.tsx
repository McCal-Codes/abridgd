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
  tabLayout: 'minimal' | 'comprehensive'; // Tab layout style
  setTabLayout: (layout: 'minimal' | 'comprehensive') => Promise<void>;
  // Tab bar appearance
  tabBarStyle: 'floating' | 'standard';
  setTabBarStyle: (style: 'floating' | 'standard') => Promise<void>;
  showTabLabels: boolean;
  setShowTabLabels: (show: boolean) => Promise<void>;
  tabIconSize: number;
  setTabIconSize: (size: number) => Promise<void>;
  tabBarHeight: number;
  setTabBarHeight: (height: number) => Promise<void>;
  // Heights for different tab bar states
  tabBarDockedHeight: number; // when the bar is docked / standard
  setTabBarDockedHeight: (height: number) => Promise<void>;
  tabBarHiddenHeight: number; // when the bar is hidden/collapsed (we may want it taller)
  setTabBarHiddenHeight: (height: number) => Promise<void>;
  tabBarBlur: boolean;
  setTabBarBlur: (enabled: boolean) => Promise<void>;
  allowContentUnderTabBar: boolean;
  setAllowContentUnderTabBar: (enabled: boolean) => Promise<void>;
  tabBadgeStyle: 'dot' | 'count' | 'none';
  setTabBadgeStyle: (style: 'dot' | 'count' | 'none') => Promise<void>;
  tabIndicatorStyle: 'underline' | 'bubble' | 'none';
  setTabIndicatorStyle: (style: 'underline' | 'bubble' | 'none') => Promise<void>;
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
  const [activeTabs, setActiveTabsState] = useState<string[]>(['home', 'discover', 'saved', 'digest']); // NYT-style minimal tabs
  const [tabLayout, setTabLayoutState] = useState<'minimal' | 'comprehensive'>('minimal'); // Default to minimal
  // Tab bar appearance defaults
  const [tabBarStyle, setTabBarStyleState] = useState<'floating' | 'standard'>('floating');
  const [showTabLabels, setShowTabLabelsState] = useState(true);
  const [tabIconSize, setTabIconSizeState] = useState(25);
  const [tabBarHeight, setTabBarHeightState] = useState(49);
  const [tabBarDockedHeight, setTabBarDockedHeightState] = useState(56);
  const [tabBarHiddenHeight, setTabBarHiddenHeightState] = useState(64);
  const [tabBarBlur, setTabBarBlurState] = useState(true);
  const [allowContentUnderTabBar, setAllowContentUnderTabBarState] = useState(true);
  const [tabBadgeStyle, setTabBadgeStyleState] = useState<'dot' | 'count' | 'none'>('count');
  const [tabIndicatorStyle, setTabIndicatorStyleState] = useState<'underline' | 'bubble' | 'none'>('bubble');
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

      // Load tab bar appearance
      const savedTabBarStyle = await AsyncStorage.getItem('tabBarStyle');
      const savedShowLabels = await AsyncStorage.getItem('showTabLabels');
      const savedIconSize = await AsyncStorage.getItem('tabIconSize');
      const savedTabBarHeight = await AsyncStorage.getItem('tabBarHeight');
      const savedTabBarDockedHeight = await AsyncStorage.getItem('tabBarDockedHeight');
      const savedTabBarHiddenHeight = await AsyncStorage.getItem('tabBarHiddenHeight');
      const savedTabBarBlur = await AsyncStorage.getItem('tabBarBlur');
      const savedAllowUnder = await AsyncStorage.getItem('allowContentUnderTabBar');
      const savedBadgeStyle = await AsyncStorage.getItem('tabBadgeStyle');
      const savedIndicatorStyle = await AsyncStorage.getItem('tabIndicatorStyle');

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

      if (savedTabBarStyle && ['floating', 'standard'].includes(savedTabBarStyle)) {
        setTabBarStyleState(savedTabBarStyle as 'floating' | 'standard');
      }
      if (savedShowLabels !== null) setShowTabLabelsState(savedShowLabels === 'true');
      if (savedIconSize) setTabIconSizeState(parseInt(savedIconSize, 10));
      if (savedTabBarHeight) setTabBarHeightState(parseInt(savedTabBarHeight, 10));
      if (savedTabBarDockedHeight) setTabBarDockedHeightState(parseInt(savedTabBarDockedHeight, 10));
      if (savedTabBarHiddenHeight) setTabBarHiddenHeightState(parseInt(savedTabBarHiddenHeight, 10));
      if (savedTabBarBlur !== null) setTabBarBlurState(savedTabBarBlur === 'true');
      if (savedAllowUnder !== null) setAllowContentUnderTabBarState(savedAllowUnder === 'true');
      if (savedBadgeStyle && ['dot', 'count', 'none'].includes(savedBadgeStyle)) setTabBadgeStyleState(savedBadgeStyle as any);
      if (savedIndicatorStyle && ['underline', 'bubble', 'none'].includes(savedIndicatorStyle)) setTabIndicatorStyleState(savedIndicatorStyle as any);

      // Load tab layout preference
      const savedTabLayout = await AsyncStorage.getItem('tabLayout');
      if (savedTabLayout && ['minimal', 'comprehensive'].includes(savedTabLayout)) {
        setTabLayoutState(savedTabLayout as 'minimal' | 'comprehensive');
      }
    } catch (error) {
      console.error('Failed to load settings', error);
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

  const setTabBarStyle = async (style: 'floating' | 'standard') => {
    try {
      await AsyncStorage.setItem('tabBarStyle', style);
      setTabBarStyleState(style);
    } catch (e) {
      console.error('Failed to save tab bar style', e);
    }
  };

  const setShowTabLabels = async (show: boolean) => {
    try {
      await AsyncStorage.setItem('showTabLabels', show.toString());
      setShowTabLabelsState(show);
    } catch (e) {
      console.error('Failed to save show tab labels', e);
    }
  };

  const setTabIconSize = async (size: number) => {
    try {
      await AsyncStorage.setItem('tabIconSize', size.toString());
      setTabIconSizeState(size);
    } catch (e) {
      console.error('Failed to save tab icon size', e);
    }
  };

  const setTabBarHeight = async (height: number) => {
    try {
      await AsyncStorage.setItem('tabBarHeight', height.toString());
      setTabBarHeightState(height);
    } catch (e) {
      console.error('Failed to save tab bar height', e);
    }
  };

  const setTabBarDockedHeight = async (height: number) => {
    try {
      await AsyncStorage.setItem('tabBarDockedHeight', height.toString());
      setTabBarDockedHeightState(height);
    } catch (e) {
      console.error('Failed to save tab bar docked height', e);
    }
  };

  const setTabBarHiddenHeight = async (height: number) => {
    try {
      await AsyncStorage.setItem('tabBarHiddenHeight', height.toString());
      setTabBarHiddenHeightState(height);
    } catch (e) {
      console.error('Failed to save tab bar hidden height', e);
    }
  };

  const setTabBarBlur = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('tabBarBlur', enabled.toString());
      setTabBarBlurState(enabled);
    } catch (e) {
      console.error('Failed to save tab bar blur', e);
    }
  };

  const setAllowContentUnderTabBar = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('allowContentUnderTabBar', enabled.toString());
      setAllowContentUnderTabBarState(enabled);
    } catch (e) {
      console.error('Failed to save allowContentUnderTabBar', e);
    }
  };

  const setTabBadgeStyle = async (style: 'dot' | 'count' | 'none') => {
    try {
      await AsyncStorage.setItem('tabBadgeStyle', style);
      setTabBadgeStyleState(style);
    } catch (e) {
      console.error('Failed to save tab badge style', e);
    }
  };

  const setTabIndicatorStyle = async (style: 'underline' | 'bubble' | 'none') => {
    try {
      await AsyncStorage.setItem('tabIndicatorStyle', style);
      setTabIndicatorStyleState(style);
    } catch (e) {
      console.error('Failed to save tab indicator style', e);
    }
  };

  const setTabLayout = async (layout: 'minimal' | 'comprehensive') => {
    try {
        await AsyncStorage.setItem('tabLayout', layout);
        setTabLayoutState(layout);
        // Reset active tabs to defaults for the new layout
          const defaultTabs = layout === 'minimal'
              ? ['home', 'discover', 'saved', 'digest']
              : ['top', 'local', 'business', 'digest', 'saved'];
        setActiveTabsState(defaultTabs);
        await AsyncStorage.setItem('activeTabs', JSON.stringify(defaultTabs));
    } catch (e) {
        console.error("Failed to save tab layout", e);
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
        tabLayout,
        setTabLayout,
        tabBarStyle,
        setTabBarStyle,
        showTabLabels,
        setShowTabLabels,
        tabIconSize,
        setTabIconSize,
        tabBarHeight,
        tabBarDockedHeight,
        setTabBarDockedHeight,
        tabBarHiddenHeight,
        setTabBarHiddenHeight,
        setTabBarHeight,
        tabBarBlur,
        allowContentUnderTabBar,
        setTabBarBlur,
        setAllowContentUnderTabBar,
        tabBadgeStyle,
        setTabBadgeStyle,
        tabIndicatorStyle,
        setTabIndicatorStyle,
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
