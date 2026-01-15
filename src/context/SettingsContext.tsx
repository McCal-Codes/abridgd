import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../theme/colors";

export type AnchorStrategy = "early" | "standard" | "center";
export type DigestSummaryMode = "fact-based" | "ai-summary" | "headline-only";
export type GroundingAnimationStyle = "simple" | "waves" | "pulse";

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
  tabLayout: "minimal" | "comprehensive"; // Tab layout style
  setTabLayout: (layout: "minimal" | "comprehensive") => Promise<void>;
  // Tab bar appearance
  tabBarStyle: "floating" | "standard" | "compact";
  setTabBarStyle: (style: "floating" | "standard" | "compact") => Promise<void>;
  showTabLabels: boolean;
  setShowTabLabels: (show: boolean) => Promise<void>;
  tabIconSize: number;
  setTabIconSize: (size: number) => Promise<void>;
  tabBarHeight: number;
  setTabBarHeight: (height: number) => Promise<void>;
  tabBarFloatingHeight: number; // height when using floating capsule style
  setTabBarFloatingHeight: (height: number) => Promise<void>;
  // Developer/advanced controls for fine-grained increments
  enableAdvancedHeightControls: boolean;
  setEnableAdvancedHeightControls: (enabled: boolean) => Promise<void>;
  dockedHeightStep: number;
  setDockedHeightStep: (step: number) => Promise<void>;
  hiddenHeightStep: number;
  setHiddenHeightStep: (step: number) => Promise<void>;
  floatingHeightStep: number;
  setFloatingHeightStep: (step: number) => Promise<void>;
  // Heights for different tab bar states
  tabBarDockedHeight: number; // when the bar is docked / standard
  setTabBarDockedHeight: (height: number) => Promise<void>;
  tabBarHiddenHeight: number; // when the bar is hidden/collapsed (we may want it taller)
  setTabBarHiddenHeight: (height: number) => Promise<void>;
  tabBarBlur: boolean;
  setTabBarBlur: (enabled: boolean) => Promise<void>;
  allowContentUnderTabBar: boolean;
  setAllowContentUnderTabBar: (enabled: boolean) => Promise<void>;
  tabBadgeStyle: "dot" | "count" | "none";
  setTabBadgeStyle: (style: "dot" | "count" | "none") => Promise<void>;
  tabIndicatorStyle: "underline" | "bubble" | "none";
  setTabIndicatorStyle: (style: "underline" | "bubble" | "none") => Promise<void>;
}

// Provide a safe default context so components can render in tests without a provider
const noopAsync = async () => {};

const defaultSettingsContext: SettingsContextType = {
  hasCompletedOnboarding: false,
  completeOnboarding: async () => {},
  resetOnboarding: async () => {},
  rsvpHighlightColor: colors.error,
  setRsvpHighlightColor: async (c: string) => {},
  rsvpAnchorStrategy: "standard",
  setRsvpAnchorStrategy: async (_s: AnchorStrategy) => {},
  groundingColor: "#A8C3B3",
  setGroundingColor: async (_c: string) => {},
  isReaderEnabled: true,
  setIsReaderEnabled: async (_b: boolean) => {},
  isGroundingEnabled: true,
  setIsGroundingEnabled: async (_b: boolean) => {},
  isSummarizationEnabled: false,
  setIsSummarizationEnabled: async (_b: boolean) => {},
  isWelcomeBackEnabled: true,
  setIsWelcomeBackEnabled: async (_b: boolean) => {},
  isLoadingSettings: false,
  lastAppVisit: null,
  updateLastAppVisit: async () => {},
  digestSummaryMode: "fact-based",
  setDigestSummaryMode: async (_m: DigestSummaryMode) => {},
  groundingBreathDuration: 4,
  setGroundingBreathDuration: async (_n: number) => {},
  groundingCycles: 5,
  setGroundingCycles: async (_n: number) => {},
  groundingAnimationStyle: "waves",
  setGroundingAnimationStyle: async (_s: GroundingAnimationStyle) => {},
  readingSpeed: 300,
  setReadingSpeed: async (_n: number) => {},
  fontSize: 1.0,
  setFontSize: async (_n: number) => {},
  activeTabs: ["home", "discover", "saved", "digest"],
  setActiveTabs: async (_t: string[]) => {},
  tabLayout: "minimal",
  setTabLayout: async (_l: "minimal" | "comprehensive") => {},
  tabBarStyle: "floating",
  setTabBarStyle: async (_s: "floating" | "standard" | "compact") => {},
  showTabLabels: true,
  setShowTabLabels: async (_b: boolean) => {},
  tabIconSize: 25,
  setTabIconSize: async (_n: number) => {},
  tabBarHeight: 49,
  setTabBarHeight: async (_n: number) => {},
  tabBarFloatingHeight: 64,
  setTabBarFloatingHeight: async (_n: number) => {},
  enableAdvancedHeightControls: false,
  setEnableAdvancedHeightControls: async (_b: boolean) => {},
  dockedHeightStep: 2,
  setDockedHeightStep: async (_n: number) => {},
  hiddenHeightStep: 2,
  setHiddenHeightStep: async (_n: number) => {},
  floatingHeightStep: 2,
  setFloatingHeightStep: async (_n: number) => {},
  tabBarDockedHeight: 56,
  setTabBarDockedHeight: async (_n: number) => {},
  tabBarHiddenHeight: 64,
  setTabBarHiddenHeight: async (_n: number) => {},
  tabBarBlur: true,
  setTabBarBlur: async (_b: boolean) => {},
  allowContentUnderTabBar: true,
  setAllowContentUnderTabBar: async (_b: boolean) => {},
  tabBadgeStyle: "count",
  setTabBadgeStyle: async (_s: "dot" | "count" | "none") => {},
  tabIndicatorStyle: "bubble",
  setTabIndicatorStyle: async (_s: "underline" | "bubble" | "none") => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultSettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [rsvpHighlightColor, setRsvpHighlightColorState] = useState(colors.error);
  const [rsvpAnchorStrategy, setRsvpAnchorStrategyState] = useState<AnchorStrategy>("standard");
  const [groundingColor, setGroundingColorState] = useState("#A8C3B3"); // Sage default
  const [isReaderEnabled, setIsReaderEnabledState] = useState(true);
  const [isGroundingEnabled, setIsGroundingEnabledState] = useState(true);
  const [isSummarizationEnabled, setIsSummarizationEnabledState] = useState(false);
  const [isWelcomeBackEnabled, setIsWelcomeBackEnabledState] = useState(true);
  const [lastAppVisit, setLastAppVisit] = useState<number | null>(null);
  const [digestSummaryMode, setDigestSummaryModeState] = useState<DigestSummaryMode>("fact-based");
  const [groundingBreathDuration, setGroundingBreathDurationState] = useState(4); // 4 seconds default
  const [groundingCycles, setGroundingCyclesState] = useState(5); // 5 cycles default
  const [groundingAnimationStyle, setGroundingAnimationStyleState] =
    useState<GroundingAnimationStyle>("waves");
  const [readingSpeed, setReadingSpeedState] = useState(300); // 300 WPM default
  const [fontSize, setFontSizeState] = useState(1.0); // 1.0x default
  const [activeTabs, setActiveTabsState] = useState<string[]>([
    "home",
    "discover",
    "saved",
    "digest",
  ]); // NYT-style minimal tabs
  const [tabLayout, setTabLayoutState] = useState<"minimal" | "comprehensive">("minimal"); // Default to minimal
  // Tab bar appearance defaults
  const [tabBarStyle, setTabBarStyleState] = useState<"floating" | "standard" | "compact">(
    "floating"
  );
  const [showTabLabels, setShowTabLabelsState] = useState(true);
  const [tabIconSize, setTabIconSizeState] = useState(25);
  const [tabBarHeight, setTabBarHeightState] = useState(49);
  // Minimum docked height enforced at 92 per design
  const [tabBarDockedHeight, setTabBarDockedHeightState] = useState(92);
  // floating capsule height (thinner than docked by default)
  const [tabBarFloatingHeight, setTabBarFloatingHeightState] = useState(64);
  const [enableAdvancedHeightControls, setEnableAdvancedHeightControlsState] = useState(false);
  const [dockedHeightStep, setDockedHeightStepState] = useState(2);
  const [hiddenHeightStep, setHiddenHeightStepState] = useState(2);
  const [floatingHeightStep, setFloatingHeightStepState] = useState(2);
  const [tabBarHiddenHeight, setTabBarHiddenHeightState] = useState(100);
  const [tabBarBlur, setTabBarBlurState] = useState(true);
  const [allowContentUnderTabBar, setAllowContentUnderTabBarState] = useState(true);
  const [tabBadgeStyle, setTabBadgeStyleState] = useState<"dot" | "count" | "none">("count");
  const [tabIndicatorStyle, setTabIndicatorStyleState] = useState<"underline" | "bubble" | "none">(
    "bubble"
  );
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const onboarding = await AsyncStorage.getItem("hasCompletedOnboarding");
      const highlightColor = await AsyncStorage.getItem("rsvpHighlightColor");
      const anchorStrategy = await AsyncStorage.getItem("rsvpAnchorStrategy");
      const savedGroundingColor = await AsyncStorage.getItem("groundingColor");
      const readerEnabled = await AsyncStorage.getItem("isReaderEnabled");
      const groundingEnabled = await AsyncStorage.getItem("isGroundingEnabled");
      const summarizationEnabled = await AsyncStorage.getItem("isSummarizationEnabled");
      const welcomeBackEnabled = await AsyncStorage.getItem("isWelcomeBackEnabled");
      const lastVisit = await AsyncStorage.getItem("lastAppVisit");
      const savedDigestMode = await AsyncStorage.getItem("digestSummaryMode");
      const savedBreathDuration = await AsyncStorage.getItem("groundingBreathDuration");
      const savedCycles = await AsyncStorage.getItem("groundingCycles");
      const savedAnimationStyle = await AsyncStorage.getItem("groundingAnimationStyle");
      const savedReadingSpeed = await AsyncStorage.getItem("readingSpeed");
      const savedFontSize = await AsyncStorage.getItem("fontSize");
      const savedActiveTabs = await AsyncStorage.getItem("activeTabs");

      // Load tab bar appearance
      const savedTabBarStyle = await AsyncStorage.getItem("tabBarStyle");
      const savedShowLabels = await AsyncStorage.getItem("showTabLabels");
      const savedIconSize = await AsyncStorage.getItem("tabIconSize");
      const savedTabBarHeight = await AsyncStorage.getItem("tabBarHeight");
      const savedTabBarDockedHeight = await AsyncStorage.getItem("tabBarDockedHeight");
      const savedTabBarHiddenHeight = await AsyncStorage.getItem("tabBarHiddenHeight");
      const savedTabBarBlur = await AsyncStorage.getItem("tabBarBlur");
      const savedTabBarFloatingHeight = await AsyncStorage.getItem("tabBarFloatingHeight");
      const savedEnableAdvanced = await AsyncStorage.getItem("enableAdvancedHeightControls");
      const savedDockedStep = await AsyncStorage.getItem("dockedHeightStep");
      const savedHiddenStep = await AsyncStorage.getItem("hiddenHeightStep");
      const savedFloatingStep = await AsyncStorage.getItem("floatingHeightStep");
      const savedAllowUnder = await AsyncStorage.getItem("allowContentUnderTabBar");
      const savedBadgeStyle = await AsyncStorage.getItem("tabBadgeStyle");
      const savedIndicatorStyle = await AsyncStorage.getItem("tabIndicatorStyle");

      if (onboarding === "true") setHasCompletedOnboarding(true);
      if (highlightColor) setRsvpHighlightColorState(highlightColor);
      if (savedGroundingColor) setGroundingColorState(savedGroundingColor);
      if (readerEnabled !== null) setIsReaderEnabledState(readerEnabled === "true");
      if (groundingEnabled !== null) setIsGroundingEnabledState(groundingEnabled === "true");
      if (summarizationEnabled !== null)
        setIsSummarizationEnabledState(summarizationEnabled === "true");
      if (welcomeBackEnabled !== null) setIsWelcomeBackEnabledState(welcomeBackEnabled === "true");
      if (anchorStrategy && ["early", "standard", "center"].includes(anchorStrategy)) {
        setRsvpAnchorStrategyState(anchorStrategy as AnchorStrategy);
      }
      if (lastVisit) {
        setLastAppVisit(parseInt(lastVisit, 10));
      }
      if (
        savedDigestMode &&
        ["fact-based", "ai-summary", "headline-only"].includes(savedDigestMode)
      ) {
        setDigestSummaryModeState(savedDigestMode as DigestSummaryMode);
      }
      if (savedBreathDuration) {
        setGroundingBreathDurationState(parseInt(savedBreathDuration, 10));
      }
      if (savedCycles) {
        setGroundingCyclesState(parseInt(savedCycles, 10));
      }
      if (savedAnimationStyle && ["simple", "waves", "pulse"].includes(savedAnimationStyle)) {
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
          console.error("Failed to parse active tabs", e);
        }
      }

      if (savedTabBarStyle && ["floating", "standard", "compact"].includes(savedTabBarStyle)) {
        setTabBarStyleState(savedTabBarStyle as "floating" | "standard" | "compact");
      }
      if (savedShowLabels !== null) setShowTabLabelsState(savedShowLabels === "true");
      if (savedIconSize) setTabIconSizeState(parseInt(savedIconSize, 10));
      if (savedTabBarHeight) setTabBarHeightState(parseInt(savedTabBarHeight, 10));
      if (savedTabBarFloatingHeight)
        setTabBarFloatingHeightState(parseInt(savedTabBarFloatingHeight, 10));
      if (savedEnableAdvanced !== null)
        setEnableAdvancedHeightControlsState(savedEnableAdvanced === "true");
      if (savedDockedStep) setDockedHeightStepState(parseInt(savedDockedStep, 10));
      if (savedHiddenStep) setHiddenHeightStepState(parseInt(savedHiddenStep, 10));
      if (savedFloatingStep) setFloatingHeightStepState(parseInt(savedFloatingStep, 10));
      // enforce minimum dock height of 92
      const parsedDock = savedTabBarDockedHeight ? parseInt(savedTabBarDockedHeight, 10) : 92;
      const dockVal = Math.max(92, parsedDock);
      const parsedHidden = savedTabBarHiddenHeight
        ? parseInt(savedTabBarHiddenHeight, 10)
        : dockVal + 8;
      const hiddenVal = Math.max(dockVal, parsedHidden);
      setTabBarDockedHeightState(dockVal);
      setTabBarHiddenHeightState(hiddenVal);
      if (savedTabBarBlur !== null) setTabBarBlurState(savedTabBarBlur === "true");
      if (savedAllowUnder !== null) setAllowContentUnderTabBarState(savedAllowUnder === "true");
      if (savedBadgeStyle && ["dot", "count", "none"].includes(savedBadgeStyle))
        setTabBadgeStyleState(savedBadgeStyle as any);
      if (savedIndicatorStyle && ["underline", "bubble", "none"].includes(savedIndicatorStyle))
        setTabIndicatorStyleState(savedIndicatorStyle as any);

      // Load tab layout preference
      const savedTabLayout = await AsyncStorage.getItem("tabLayout");
      if (savedTabLayout && ["minimal", "comprehensive"].includes(savedTabLayout)) {
        setTabLayoutState(savedTabLayout as "minimal" | "comprehensive");
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      setHasCompletedOnboarding(true);
    } catch (e) {
      console.error("Failed to save onboarding", e);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem("hasCompletedOnboarding");
      setHasCompletedOnboarding(false);
    } catch (e) {
      console.error("Failed to reset onboarding", e);
    }
  };

  const setRsvpHighlightColor = async (color: string) => {
    try {
      await AsyncStorage.setItem("rsvpHighlightColor", color);
      setRsvpHighlightColorState(color);
    } catch (e) {
      console.error("Failed to save color", e);
    }
  };

  const setRsvpAnchorStrategy = async (strategy: AnchorStrategy) => {
    try {
      await AsyncStorage.setItem("rsvpAnchorStrategy", strategy);
      setRsvpAnchorStrategyState(strategy);
    } catch (e) {
      console.error("Failed to save anchor strategy", e);
    }
  };

  const setGroundingColor = async (color: string) => {
    try {
      await AsyncStorage.setItem("groundingColor", color);
      setGroundingColorState(color);
    } catch (e) {
      console.error("Failed to save grounding color", e);
    }
  };

  const setIsReaderEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("isReaderEnabled", enabled.toString());
      setIsReaderEnabledState(enabled);
    } catch (e) {
      console.error("Failed to save reader enabled state", e);
    }
  };

  const setIsGroundingEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("isGroundingEnabled", enabled.toString());
      setIsGroundingEnabledState(enabled);
    } catch (e) {
      console.error("Failed to save grounding enabled state", e);
    }
  };

  const setIsSummarizationEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("isSummarizationEnabled", enabled.toString());
      setIsSummarizationEnabledState(enabled);
    } catch (e) {
      console.error("Failed to save summarization enabled state", e);
    }
  };

  const setIsWelcomeBackEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("isWelcomeBackEnabled", enabled.toString());
      setIsWelcomeBackEnabledState(enabled);
    } catch (e) {
      console.error("Failed to save welcome back enabled state", e);
    }
  };

  const updateLastAppVisit = async () => {
    try {
      const now = Date.now();
      await AsyncStorage.setItem("lastAppVisit", now.toString());
      setLastAppVisit(now);
    } catch (e) {
      console.error("Failed to save last app visit", e);
    }
  };

  const setDigestSummaryMode = async (mode: DigestSummaryMode) => {
    try {
      await AsyncStorage.setItem("digestSummaryMode", mode);
      setDigestSummaryModeState(mode);
    } catch (e) {
      console.error("Failed to save digest summary mode", e);
    }
  };

  const setGroundingBreathDuration = async (duration: number) => {
    try {
      await AsyncStorage.setItem("groundingBreathDuration", duration.toString());
      setGroundingBreathDurationState(duration);
    } catch (e) {
      console.error("Failed to save grounding breath duration", e);
    }
  };

  const setGroundingCycles = async (cycles: number) => {
    try {
      await AsyncStorage.setItem("groundingCycles", cycles.toString());
      setGroundingCyclesState(cycles);
    } catch (e) {
      console.error("Failed to save grounding cycles", e);
    }
  };

  const setGroundingAnimationStyle = async (style: GroundingAnimationStyle) => {
    try {
      await AsyncStorage.setItem("groundingAnimationStyle", style);
      setGroundingAnimationStyleState(style);
    } catch (e) {
      console.error("Failed to save grounding animation style", e);
    }
  };

  const setReadingSpeed = async (speed: number) => {
    try {
      await AsyncStorage.setItem("readingSpeed", speed.toString());
      setReadingSpeedState(speed);
    } catch (e) {
      console.error("Failed to save reading speed", e);
    }
  };

  const setFontSize = async (size: number) => {
    try {
      await AsyncStorage.setItem("fontSize", size.toString());
      setFontSizeState(size);
    } catch (e) {
      console.error("Failed to save font size", e);
    }
  };

  const setActiveTabs = async (tabs: string[]) => {
    try {
      await AsyncStorage.setItem("activeTabs", JSON.stringify(tabs));
      setActiveTabsState(tabs);
    } catch (e) {
      console.error("Failed to save active tabs", e);
    }
  };

  const setTabBarStyle = async (style: "floating" | "standard" | "compact") => {
    try {
      await AsyncStorage.setItem("tabBarStyle", style);
      setTabBarStyleState(style);
    } catch (e) {
      console.error("Failed to save tab bar style", e);
    }
  };

  const setShowTabLabels = async (show: boolean) => {
    try {
      await AsyncStorage.setItem("showTabLabels", show.toString());
      setShowTabLabelsState(show);
    } catch (e) {
      console.error("Failed to save show tab labels", e);
    }
  };

  const setTabIconSize = async (size: number) => {
    try {
      await AsyncStorage.setItem("tabIconSize", size.toString());
      setTabIconSizeState(size);
    } catch (e) {
      console.error("Failed to save tab icon size", e);
    }
  };

  const setTabBarHeight = async (height: number) => {
    try {
      await AsyncStorage.setItem("tabBarHeight", height.toString());
      setTabBarHeightState(height);
    } catch (e) {
      console.error("Failed to save tab bar height", e);
    }
  };

  const setTabBarFloatingHeight = async (height: number) => {
    try {
      // floating capsule should be thinner but not too small
      const clamped = Math.max(48, Math.round(height));
      await AsyncStorage.setItem("tabBarFloatingHeight", clamped.toString());
      setTabBarFloatingHeightState(clamped);
    } catch (e) {
      console.error("Failed to save tab bar floating height", e);
    }
  };

  const setEnableAdvancedHeightControls = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("enableAdvancedHeightControls", enabled.toString());
      setEnableAdvancedHeightControlsState(enabled);
    } catch (e) {
      console.error("Failed to save enableAdvancedHeightControls", e);
    }
  };

  const setDockedHeightStep = async (step: number) => {
    try {
      const clamped = Math.max(1, Math.round(step));
      await AsyncStorage.setItem("dockedHeightStep", clamped.toString());
      setDockedHeightStepState(clamped);
    } catch (e) {
      console.error("Failed to save dockedHeightStep", e);
    }
  };

  const setHiddenHeightStep = async (step: number) => {
    try {
      const clamped = Math.max(1, Math.round(step));
      await AsyncStorage.setItem("hiddenHeightStep", clamped.toString());
      setHiddenHeightStepState(clamped);
    } catch (e) {
      console.error("Failed to save hiddenHeightStep", e);
    }
  };

  const setFloatingHeightStep = async (step: number) => {
    try {
      const clamped = Math.max(1, Math.round(step));
      await AsyncStorage.setItem("floatingHeightStep", clamped.toString());
      setFloatingHeightStepState(clamped);
    } catch (e) {
      console.error("Failed to save floatingHeightStep", e);
    }
  };

  const setTabBarDockedHeight = async (height: number) => {
    try {
      const clamped = Math.max(92, Math.round(height));
      await AsyncStorage.setItem("tabBarDockedHeight", clamped.toString());
      setTabBarDockedHeightState(clamped);
      // Ensure hidden height is at least docked
      setTabBarHiddenHeightState((prev) => Math.max(prev, clamped));
      await AsyncStorage.setItem(
        "tabBarHiddenHeight",
        Math.max(tabBarHiddenHeight, clamped).toString()
      );
    } catch (e) {
      console.error("Failed to save tab bar docked height", e);
    }
  };

  const setTabBarHiddenHeight = async (height: number) => {
    try {
      const min = tabBarDockedHeight || 92;
      const clamped = Math.max(min, Math.round(height));
      await AsyncStorage.setItem("tabBarHiddenHeight", clamped.toString());
      setTabBarHiddenHeightState(clamped);
    } catch (e) {
      console.error("Failed to save tab bar hidden height", e);
    }
  };

  const setTabBarBlur = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("tabBarBlur", enabled.toString());
      setTabBarBlurState(enabled);
    } catch (e) {
      console.error("Failed to save tab bar blur", e);
    }
  };

  const setAllowContentUnderTabBar = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("allowContentUnderTabBar", enabled.toString());
      setAllowContentUnderTabBarState(enabled);
    } catch (e) {
      console.error("Failed to save allowContentUnderTabBar", e);
    }
  };

  const setTabBadgeStyle = async (style: "dot" | "count" | "none") => {
    try {
      await AsyncStorage.setItem("tabBadgeStyle", style);
      setTabBadgeStyleState(style);
    } catch (e) {
      console.error("Failed to save tab badge style", e);
    }
  };

  const setTabIndicatorStyle = async (style: "underline" | "bubble" | "none") => {
    try {
      await AsyncStorage.setItem("tabIndicatorStyle", style);
      setTabIndicatorStyleState(style);
    } catch (e) {
      console.error("Failed to save tab indicator style", e);
    }
  };

  const setTabLayout = async (layout: "minimal" | "comprehensive") => {
    try {
      await AsyncStorage.setItem("tabLayout", layout);
      setTabLayoutState(layout);
      // Reset active tabs to defaults for the new layout
      const defaultTabs =
        layout === "minimal"
          ? ["home", "discover", "saved", "digest"]
          : ["top", "local", "business", "digest", "saved"];
      setActiveTabsState(defaultTabs);
      await AsyncStorage.setItem("activeTabs", JSON.stringify(defaultTabs));
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
        // Tab bar appearance
        tabBarStyle,
        setTabBarStyle,
        showTabLabels,
        setShowTabLabels,
        tabIconSize,
        setTabIconSize,
        tabBarHeight,
        setTabBarHeight,
        tabBarFloatingHeight,
        setTabBarFloatingHeight,
        enableAdvancedHeightControls,
        setEnableAdvancedHeightControls,
        dockedHeightStep,
        setDockedHeightStep,
        hiddenHeightStep,
        setHiddenHeightStep,
        floatingHeightStep,
        setFloatingHeightStep,
        tabBarDockedHeight,
        setTabBarDockedHeight,
        tabBarHiddenHeight,
        setTabBarHiddenHeight,
        tabBarBlur,
        setTabBarBlur,
        allowContentUnderTabBar,
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
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
