import React, { createContext, useState, useEffect, useContext, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../theme/colors";
import { adaptSettingsBasedOnBehavior } from "../services/UserBehaviorLogger";
import { APP_VERSION } from "../config/appInfo";
import { allowedTabs, defaultTabs } from "../navigation/tabs";

export type AnchorStrategy = "early" | "standard" | "center";
export type DigestSummaryMode = "fact-based" | "ai-summary" | "headline-only";
export type GroundingAnimationStyle = "simple" | "waves" | "pulse";
export type SensitivePromptLevel = "full" | "minimal" | "off";
export type SensitiveActionPreference = "ground-first" | "decide" | "continue";
export type SensitiveTone = "gentle" | "direct";
export type ImageLoadingMode = "full" | "compressed" | "text-only";
export type HapticIntensity = "off" | "subtle" | "normal" | "strong";

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
  isContinueReadingEnabled: boolean;
  setIsContinueReadingEnabled: (enabled: boolean) => Promise<void>;
  subscriptionFeaturesLocked: boolean;
  setSubscriptionFeaturesLocked: (enabled: boolean) => Promise<void>;
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
  showGroundingPrompts: boolean;
  setShowGroundingPrompts: (show: boolean) => Promise<void>;
  readingSpeed: number; // Words per minute
  setReadingSpeed: (speed: number) => Promise<void>;
  fontSize: number; // Base font size multiplier (0.8 - 1.5)
  setFontSize: (size: number) => Promise<void>;
  autoSaveOnComplete: boolean; // Auto-save articles when read to completion
  setAutoSaveOnComplete: (enabled: boolean) => Promise<void>;
  defaultTab: string; // Tab to show on app launch
  setDefaultTab: (tab: string) => Promise<void>;
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
  tabBarFloatingHeight: number; // height when using floating capsule style
  setTabBarFloatingHeight: (height: number) => Promise<void>;
  tabBarHeight: number; // derived height based on current style
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
  // Modal presentation preference used by debug/settings UI: 'auto' lets screens decide
  modalPresentationStyle: "auto" | "center" | "bottom";
  setModalPresentationStyle: (style: "auto" | "center" | "bottom") => Promise<void>;
  // Experimental features
  experimentalIOS26NavBar: boolean;
  setExperimentalIOS26NavBar: (enabled: boolean) => Promise<void>;
  // Global animation controls
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => Promise<void>;
  reduceMotion: boolean; // honor system setting, allow override
  setReduceMotion: (enabled: boolean) => Promise<void>;
  animationScale: number; // 0.5 - 2.0
  setAnimationScale: (scale: number) => Promise<void>;
  sensitivePromptLevel: SensitivePromptLevel;
  setSensitivePromptLevel: (level: SensitivePromptLevel) => Promise<void>;
  sensitiveActionPreference: SensitiveActionPreference;
  setSensitiveActionPreference: (pref: SensitiveActionPreference) => Promise<void>;
  sensitiveTone: SensitiveTone;
  setSensitiveTone: (tone: SensitiveTone) => Promise<void>;
  lastSeenVersion: string | null;
  markVersionSeen: (version?: string) => Promise<void>;
  shouldShowWhatsNew: boolean;
  // QoL Settings
  lineHeight: number;
  setLineHeight: (height: number) => Promise<void>;
  imageLoadingMode: ImageLoadingMode;
  setImageLoadingMode: (mode: ImageLoadingMode) => Promise<void>;
  dataSaverMode: boolean;
  setDataSaverMode: (enabled: boolean) => Promise<void>;
  quietHoursEnabled: boolean;
  setQuietHoursEnabled: (enabled: boolean) => Promise<void>;
  quietHoursStart: string;
  setQuietHoursStart: (time: string) => Promise<void>;
  quietHoursEnd: string;
  setQuietHoursEnd: (time: string) => Promise<void>;
  hapticIntensity: HapticIntensity;
  setHapticIntensity: (intensity: HapticIntensity) => Promise<void>;
}

// Provide a safe default context so components can render in tests without a provider
const noopAsync = async () => {};

const defaultSettingsContext: SettingsContextType = {
  hasCompletedOnboarding: false,
  completeOnboarding: async () => {},
  resetOnboarding: async () => {},
  rsvpHighlightColor: "#0097A7", // Colorblind-friendly cyan
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
  isContinueReadingEnabled: false,
  setIsContinueReadingEnabled: async (_b: boolean) => {},
  subscriptionFeaturesLocked: false,
  setSubscriptionFeaturesLocked: async (_b: boolean) => {},
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
  showGroundingPrompts: false,
  setShowGroundingPrompts: async (_b: boolean) => {},
  readingSpeed: 300,
  setReadingSpeed: async (_n: number) => {},
  fontSize: 1.0,
  setFontSize: async (_n: number) => {},
  autoSaveOnComplete: false,
  setAutoSaveOnComplete: async (_b: boolean) => {},
  defaultTab: "home",
  setDefaultTab: async (_t: string) => {},
  activeTabs: ["home", "discover", "saved", "digest", "profile"],
  setActiveTabs: async (_t: string[]) => {},
  tabLayout: "minimal",
  setTabLayout: async (_l: "minimal" | "comprehensive") => {},
  tabBarStyle: "floating",
  setTabBarStyle: async (_s: "floating" | "standard" | "compact") => {},
  showTabLabels: true,
  setShowTabLabels: async (_b: boolean) => {},
  tabIconSize: 25,
  setTabIconSize: async (_n: number) => {},
  tabBarFloatingHeight: 64,
  setTabBarFloatingHeight: async (_n: number) => {},
  tabBarHeight: 64,
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
  tabIndicatorStyle: "underline",
  setTabIndicatorStyle: async (_s: "underline" | "bubble" | "none") => {},
  modalPresentationStyle: "auto",
  setModalPresentationStyle: async (_s: "auto" | "center" | "bottom") => {},
  experimentalIOS26NavBar: false,
  setExperimentalIOS26NavBar: async (_b: boolean) => {},
  animationsEnabled: true,
  setAnimationsEnabled: async (_b: boolean) => {},
  reduceMotion: false,
  setReduceMotion: async (_b: boolean) => {},
  animationScale: 1.0,
  setAnimationScale: async (_n: number) => {},
  sensitivePromptLevel: "full",
  setSensitivePromptLevel: async (_l: SensitivePromptLevel) => {},
  sensitiveActionPreference: "decide",
  setSensitiveActionPreference: async (_p: SensitiveActionPreference) => {},
  sensitiveTone: "gentle",
  setSensitiveTone: async (_t: SensitiveTone) => {},
  lastSeenVersion: null,
  markVersionSeen: async (_v?: string) => {},
  shouldShowWhatsNew: false,
  lineHeight: 1.5,
  setLineHeight: async (_n: number) => {},
  imageLoadingMode: "full",
  setImageLoadingMode: async (_m: ImageLoadingMode) => {},
  dataSaverMode: false,
  setDataSaverMode: async (_b: boolean) => {},
  quietHoursEnabled: false,
  setQuietHoursEnabled: async (_b: boolean) => {},
  quietHoursStart: "22:00",
  setQuietHoursStart: async (_t: string) => {},
  quietHoursEnd: "08:00",
  setQuietHoursEnd: async (_t: string) => {},
  hapticIntensity: "normal",
  setHapticIntensity: async (_i: HapticIntensity) => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultSettingsContext);

export const sanitizeTabs = (tabs: string[], layout: "minimal" | "comprehensive") => {
  const allowed = allowedTabs[layout] as readonly string[];
  const unique = tabs.filter((t, index) => allowed.includes(t) && tabs.indexOf(t) === index);
  let normalized = unique.slice(0, 5);
  if (normalized.length < 3) {
    normalized = layout === "minimal" ? ["home", "discover", "saved"] : ["top", "local", "digest"];
  }
  if (!normalized.includes("profile")) {
    if (normalized.length < 5) {
      normalized.push("profile");
    } else {
      normalized[normalized.length - 1] = "profile";
    }
  }
  return normalized;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [rsvpHighlightColor, setRsvpHighlightColorState] = useState("#0097A7"); // Colorblind-friendly cyan
  const [rsvpAnchorStrategy, setRsvpAnchorStrategyState] = useState<AnchorStrategy>("standard");
  const [groundingColor, setGroundingColorState] = useState("#A8C3B3"); // Sage default
  const [isReaderEnabled, setIsReaderEnabledState] = useState(true);
  const [isGroundingEnabled, setIsGroundingEnabledState] = useState(true);
  const [isSummarizationEnabled, setIsSummarizationEnabledState] = useState(false);
  const [isWelcomeBackEnabled, setIsWelcomeBackEnabledState] = useState(true);
  const [isContinueReadingEnabled, setIsContinueReadingEnabledState] = useState(false);
  const [subscriptionFeaturesLocked, setSubscriptionFeaturesLockedState] = useState(false);
  const [lastAppVisit, setLastAppVisit] = useState<number | null>(null);
  const [digestSummaryMode, setDigestSummaryModeState] = useState<DigestSummaryMode>("fact-based");
  const [groundingBreathDuration, setGroundingBreathDurationState] = useState(4); // 4 seconds default
  const [groundingCycles, setGroundingCyclesState] = useState(5); // 5 cycles default
  const [groundingAnimationStyle, setGroundingAnimationStyleState] =
    useState<GroundingAnimationStyle>("waves");
  const [showGroundingPrompts, setShowGroundingPromptsState] = useState(false); // Disabled by default
  const [readingSpeed, setReadingSpeedState] = useState(300); // 300 WPM default
  const [fontSize, setFontSizeState] = useState(1.0); // 1.0x default
  const [autoSaveOnComplete, setAutoSaveOnCompleteState] = useState(false); // Don't auto-save by default
  const [defaultTab, setDefaultTabState] = useState("home"); // Home tab as default landing
  const [activeTabs, setActiveTabsState] = useState<string[]>(
    sanitizeTabs([...defaultTabs.minimal], "minimal"),
  ); // NYT-style minimal tabs with profile
  const [tabLayout, setTabLayoutState] = useState<"minimal" | "comprehensive">("minimal"); // Default to minimal
  // Tab bar appearance defaults
  const [tabBarStyle, setTabBarStyleState] = useState<"floating" | "standard" | "compact">(
    "floating",
  );
  const [showTabLabels, setShowTabLabelsState] = useState(true);
  const [tabIconSize, setTabIconSizeState] = useState(25);
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
    "bubble",
  );
  const [modalPresentationStyle, setModalPresentationStyleState] = useState<
    "auto" | "center" | "bottom"
  >("auto");
  const [experimentalIOS26NavBar, setExperimentalIOS26NavBarState] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  // Global animation controls
  const [animationsEnabled, setAnimationsEnabledState] = useState(true);
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [animationScale, setAnimationScaleState] = useState(1.0);
  const [sensitivePromptLevel, setSensitivePromptLevelState] =
    useState<SensitivePromptLevel>("full");
  const [sensitiveActionPreference, setSensitiveActionPreferenceState] =
    useState<SensitiveActionPreference>("decide");
  const [sensitiveTone, setSensitiveToneState] = useState<SensitiveTone>("gentle");
  const [lastSeenVersion, setLastSeenVersion] = useState<string | null>(null);
  // QoL Settings
  const [lineHeight, setLineHeightState] = useState(1.5);
  const [imageLoadingMode, setImageLoadingModeState] = useState<ImageLoadingMode>("full");
  const [dataSaverMode, setDataSaverModeState] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabledState] = useState(false);
  const [quietHoursStart, setQuietHoursStartState] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEndState] = useState("08:00");
  const [hapticIntensity, setHapticIntensityState] = useState<HapticIntensity>("normal");

  const tabBarHeight = useMemo(() => {
    if (tabBarStyle === "floating") {
      return Math.max(48, tabBarFloatingHeight);
    }

    if (tabBarStyle === "compact") {
      // Compact keeps the docked frame but trims padding for a tighter feel
      return Math.max(72, tabBarDockedHeight - 12);
    }

    // Standard (docked) enforces the full height for usability
    return Math.max(92, tabBarDockedHeight);
  }, [tabBarStyle, tabBarDockedHeight, tabBarFloatingHeight]);

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
      const continueReadingEnabled = await AsyncStorage.getItem("isContinueReadingEnabled");
      const lastVisit = await AsyncStorage.getItem("lastAppVisit");
      const savedDigestMode = await AsyncStorage.getItem("digestSummaryMode");
      const savedBreathDuration = await AsyncStorage.getItem("groundingBreathDuration");
      const savedCycles = await AsyncStorage.getItem("groundingCycles");
      const savedAnimationStyle = await AsyncStorage.getItem("groundingAnimationStyle");
      const savedShowPrompts = await AsyncStorage.getItem("showGroundingPrompts");
      const savedReadingSpeed = await AsyncStorage.getItem("readingSpeed");
      const savedFontSize = await AsyncStorage.getItem("fontSize");
      const savedAutoSave = await AsyncStorage.getItem("autoSaveOnComplete");
      const savedDefaultTab = await AsyncStorage.getItem("defaultTab");
      const savedActiveTabs = await AsyncStorage.getItem("activeTabs");
      const savedSubscriptionFeaturesLocked = await AsyncStorage.getItem(
        "subscriptionFeaturesLocked",
      );

      // Load tab bar appearance
      const savedTabBarStyle = await AsyncStorage.getItem("tabBarStyle");
      const savedShowLabels = await AsyncStorage.getItem("showTabLabels");
      const savedIconSize = await AsyncStorage.getItem("tabIconSize");
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
      const savedModalPresentation = await AsyncStorage.getItem("modalPresentationStyle");
      // Global animation controls
      const savedAnimationsEnabled = await AsyncStorage.getItem("animationsEnabled");
      const savedReduceMotion = await AsyncStorage.getItem("reduceMotion");
      const savedAnimationScale = await AsyncStorage.getItem("animationScale");
      const savedSensitivePromptLevel = await AsyncStorage.getItem("sensitivePromptLevel");
      const savedSensitiveActionPreference = await AsyncStorage.getItem(
        "sensitiveActionPreference",
      );
      const savedSensitiveTone = await AsyncStorage.getItem("sensitiveTone");
      const savedVersion = await AsyncStorage.getItem("lastSeenVersion");

      if (onboarding === "true") setHasCompletedOnboarding(true);
      if (highlightColor) setRsvpHighlightColorState(highlightColor);
      if (savedGroundingColor) setGroundingColorState(savedGroundingColor);
      if (readerEnabled !== null) setIsReaderEnabledState(readerEnabled === "true");
      if (groundingEnabled !== null) setIsGroundingEnabledState(groundingEnabled === "true");
      if (summarizationEnabled !== null)
        setIsSummarizationEnabledState(summarizationEnabled === "true");
      if (welcomeBackEnabled !== null) setIsWelcomeBackEnabledState(welcomeBackEnabled === "true");
      if (continueReadingEnabled !== null)
        setIsContinueReadingEnabledState(continueReadingEnabled === "true");
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
      if (savedShowPrompts !== null) {
        setShowGroundingPromptsState(savedShowPrompts === "true");
      }
      if (savedSubscriptionFeaturesLocked !== null) {
        setSubscriptionFeaturesLockedState(savedSubscriptionFeaturesLocked === "true");
      }
      if (savedReadingSpeed) {
        setReadingSpeedState(parseInt(savedReadingSpeed, 10));
      }
      if (savedFontSize) {
        setFontSizeState(parseFloat(savedFontSize));
      }
      if (savedAutoSave !== null) {
        setAutoSaveOnCompleteState(savedAutoSave === "true");
      }
      if (savedDefaultTab) {
        const allowed = allowedTabs[tabLayout] as readonly string[];
        const resolved = allowed.includes(savedDefaultTab) ? savedDefaultTab : allowed[0];
        setDefaultTabState(resolved);
      }
      if (savedActiveTabs) {
        try {
          const tabs = JSON.parse(savedActiveTabs);
          if (Array.isArray(tabs)) {
            const normalized = sanitizeTabs(tabs, tabLayout);
            setActiveTabsState(normalized);
            await AsyncStorage.setItem("activeTabs", JSON.stringify(normalized));
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
      if (savedModalPresentation && ["auto", "center", "bottom"].includes(savedModalPresentation))
        setModalPresentationStyleState(savedModalPresentation as any);

      // Load experimental settings
      const savedExperimentalIOS26 = await AsyncStorage.getItem("experimentalIOS26NavBar");
      if (savedExperimentalIOS26 !== null)
        setExperimentalIOS26NavBarState(savedExperimentalIOS26 === "true");

      // Load global animation settings
      if (savedAnimationsEnabled !== null)
        setAnimationsEnabledState(savedAnimationsEnabled === "true");
      if (savedReduceMotion !== null) setReduceMotionState(savedReduceMotion === "true");
      if (savedAnimationScale) {
        const scale = Math.min(2.0, Math.max(0.5, parseFloat(savedAnimationScale)));
        setAnimationScaleState(scale);
      }

      if (
        savedSensitivePromptLevel &&
        ["full", "minimal", "off"].includes(savedSensitivePromptLevel)
      ) {
        setSensitivePromptLevelState(savedSensitivePromptLevel as SensitivePromptLevel);
      }
      if (
        savedSensitiveActionPreference &&
        ["ground-first", "decide", "continue"].includes(savedSensitiveActionPreference)
      ) {
        setSensitiveActionPreferenceState(
          savedSensitiveActionPreference as SensitiveActionPreference,
        );
      }
      if (savedSensitiveTone && ["gentle", "direct"].includes(savedSensitiveTone)) {
        setSensitiveToneState(savedSensitiveTone as SensitiveTone);
      }
      if (savedVersion) setLastSeenVersion(savedVersion);

      // Load tab layout preference
      const savedTabLayout = await AsyncStorage.getItem("tabLayout");
      if (savedTabLayout && ["minimal", "comprehensive"].includes(savedTabLayout)) {
        setTabLayoutState(savedTabLayout as "minimal" | "comprehensive");
      }

      // Load QoL settings
      const savedLineHeight = await AsyncStorage.getItem("lineHeight");
      if (savedLineHeight) {
        const height = Math.min(2.0, Math.max(1.0, parseFloat(savedLineHeight)));
        setLineHeightState(height);
      }

      const savedImageLoadingMode = await AsyncStorage.getItem("imageLoadingMode");
      if (
        savedImageLoadingMode &&
        ["full", "compressed", "text-only"].includes(savedImageLoadingMode)
      ) {
        setImageLoadingModeState(savedImageLoadingMode as ImageLoadingMode);
      }

      const savedDataSaverMode = await AsyncStorage.getItem("dataSaverMode");
      if (savedDataSaverMode !== null) {
        setDataSaverModeState(savedDataSaverMode === "true");
      }

      const savedQuietHoursEnabled = await AsyncStorage.getItem("quietHoursEnabled");
      if (savedQuietHoursEnabled !== null) {
        setQuietHoursEnabledState(savedQuietHoursEnabled === "true");
      }

      const savedQuietHoursStart = await AsyncStorage.getItem("quietHoursStart");
      if (savedQuietHoursStart) {
        setQuietHoursStartState(savedQuietHoursStart);
      }

      const savedQuietHoursEnd = await AsyncStorage.getItem("quietHoursEnd");
      if (savedQuietHoursEnd) {
        setQuietHoursEndState(savedQuietHoursEnd);
      }

      const savedHapticIntensity = await AsyncStorage.getItem("hapticIntensity");
      if (
        savedHapticIntensity &&
        ["off", "subtle", "normal", "strong"].includes(savedHapticIntensity)
      ) {
        setHapticIntensityState(savedHapticIntensity as HapticIntensity);
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    } finally {
      setIsLoadingSettings(false);
      // Adapt settings based on learned user behavior
      setTimeout(() => {
        adaptSettingsBasedOnBehavior(
          sensitiveActionPreference,
          setSensitiveActionPreference,
          setShowGroundingPrompts,
        );
      }, 1000);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.multiSet([
        ["hasCompletedOnboarding", "true"],
        ["lastSeenVersion", APP_VERSION],
      ]);
      setHasCompletedOnboarding(true);
      setLastSeenVersion(APP_VERSION);
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

  const setIsContinueReadingEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("isContinueReadingEnabled", enabled.toString());
      setIsContinueReadingEnabledState(enabled);
    } catch (e) {
      console.error("Failed to save continue reading enabled state", e);
    }
  };

  const setSubscriptionFeaturesLocked = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("subscriptionFeaturesLocked", enabled.toString());
      setSubscriptionFeaturesLockedState(enabled);
    } catch (e) {
      console.error("Failed to save subscription features locked state", e);
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

  const setShowGroundingPrompts = async (show: boolean) => {
    try {
      await AsyncStorage.setItem("showGroundingPrompts", show.toString());
      setShowGroundingPromptsState(show);
    } catch (e) {
      console.error("Failed to save grounding prompts setting", e);
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

  const setAutoSaveOnComplete = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("autoSaveOnComplete", enabled.toString());
      setAutoSaveOnCompleteState(enabled);
    } catch (e) {
      console.error("Failed to save auto-save preference", e);
    }
  };

  const setDefaultTab = async (tab: string) => {
    try {
      const allowed = allowedTabs[tabLayout] as readonly string[];
      const resolved = allowed.includes(tab) ? tab : allowed[0];
      await AsyncStorage.setItem("defaultTab", resolved);
      setDefaultTabState(resolved);
    } catch (e) {
      console.error("Failed to save default tab", e);
    }
  };

  const setActiveTabs = async (tabs: string[]) => {
    try {
      const normalized = sanitizeTabs(tabs, tabLayout);
      await AsyncStorage.setItem("activeTabs", JSON.stringify(normalized));
      setActiveTabsState(normalized);
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
        Math.max(tabBarHiddenHeight, clamped).toString(),
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

  const setModalPresentationStyle = async (style: "auto" | "center" | "bottom") => {
    try {
      await AsyncStorage.setItem("modalPresentationStyle", style);
      setModalPresentationStyleState(style);
    } catch (e) {
      console.error("Failed to save modal presentation style", e);
    }
  };

  const setTabLayout = async (layout: "minimal" | "comprehensive") => {
    try {
      await AsyncStorage.setItem("tabLayout", layout);
      setTabLayoutState(layout);
      // Reset active tabs to defaults for the new layout
      const defaultTabsForLayout =
        layout === "minimal" ? [...defaultTabs.minimal] : [...defaultTabs.comprehensive];
      const normalized = sanitizeTabs(defaultTabsForLayout, layout);
      setActiveTabsState(normalized);
      await AsyncStorage.setItem("activeTabs", JSON.stringify(normalized));
    } catch (e) {
      console.error("Failed to save tab layout", e);
    }
  };

  const setExperimentalIOS26NavBar = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("experimentalIOS26NavBar", enabled.toString());
      setExperimentalIOS26NavBarState(enabled);
    } catch (e) {
      console.error("Failed to save experimental iOS 26 navbar setting", e);
    }
  };

  // Global animation controls
  const setAnimationsEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("animationsEnabled", enabled.toString());
      setAnimationsEnabledState(enabled);
    } catch (e) {
      console.error("Failed to save animations enabled setting", e);
    }
  };

  const setReduceMotion = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("reduceMotion", enabled.toString());
      setReduceMotionState(enabled);
    } catch (e) {
      console.error("Failed to save reduce motion setting", e);
    }
  };

  const setAnimationScale = async (scale: number) => {
    try {
      const clamped = Math.min(2.0, Math.max(0.5, Number(scale)));
      await AsyncStorage.setItem("animationScale", clamped.toString());
      setAnimationScaleState(clamped);
    } catch (e) {
      console.error("Failed to save animation scale", e);
    }
  };

  const setSensitivePromptLevel = async (level: SensitivePromptLevel) => {
    try {
      await AsyncStorage.setItem("sensitivePromptLevel", level);
      setSensitivePromptLevelState(level);
    } catch (e) {
      console.error("Failed to save sensitive prompt level", e);
    }
  };

  const setSensitiveActionPreference = async (preference: SensitiveActionPreference) => {
    try {
      await AsyncStorage.setItem("sensitiveActionPreference", preference);
      setSensitiveActionPreferenceState(preference);
    } catch (e) {
      console.error("Failed to save sensitive action preference", e);
    }
  };

  const setSensitiveTone = async (tone: SensitiveTone) => {
    try {
      await AsyncStorage.setItem("sensitiveTone", tone);
      setSensitiveToneState(tone);
    } catch (e) {
      console.error("Failed to save sensitive tone", e);
    }
  };

  const setLineHeight = async (height: number) => {
    try {
      const clamped = Math.min(2.0, Math.max(1.0, Number(height)));
      await AsyncStorage.setItem("lineHeight", clamped.toString());
      setLineHeightState(clamped);
    } catch (e) {
      console.error("Failed to save line height", e);
    }
  };

  const setImageLoadingMode = async (mode: ImageLoadingMode) => {
    try {
      await AsyncStorage.setItem("imageLoadingMode", mode);
      setImageLoadingModeState(mode);
    } catch (e) {
      console.error("Failed to save image loading mode", e);
    }
  };

  const setDataSaverMode = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("dataSaverMode", enabled.toString());
      setDataSaverModeState(enabled);
    } catch (e) {
      console.error("Failed to save data saver mode", e);
    }
  };

  const setQuietHoursEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("quietHoursEnabled", enabled.toString());
      setQuietHoursEnabledState(enabled);
    } catch (e) {
      console.error("Failed to save quiet hours enabled", e);
    }
  };

  const setQuietHoursStart = async (time: string) => {
    try {
      await AsyncStorage.setItem("quietHoursStart", time);
      setQuietHoursStartState(time);
    } catch (e) {
      console.error("Failed to save quiet hours start", e);
    }
  };

  const setQuietHoursEnd = async (time: string) => {
    try {
      await AsyncStorage.setItem("quietHoursEnd", time);
      setQuietHoursEndState(time);
    } catch (e) {
      console.error("Failed to save quiet hours end", e);
    }
  };

  const setHapticIntensity = async (intensity: HapticIntensity) => {
    try {
      await AsyncStorage.setItem("hapticIntensity", intensity);
      setHapticIntensityState(intensity);
    } catch (e) {
      console.error("Failed to save haptic intensity", e);
    }
  };

  const markVersionSeen = async (version?: string) => {
    const v = version || APP_VERSION;
    try {
      await AsyncStorage.setItem("lastSeenVersion", v);
      setLastSeenVersion(v);
    } catch (e) {
      console.error("Failed to save last seen version", e);
    }
  };

  const shouldShowWhatsNew = hasCompletedOnboarding && lastSeenVersion !== APP_VERSION;

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
        isContinueReadingEnabled,
        setIsContinueReadingEnabled,
        subscriptionFeaturesLocked,
        setSubscriptionFeaturesLocked,
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
        showGroundingPrompts,
        setShowGroundingPrompts,
        readingSpeed,
        setReadingSpeed,
        fontSize,
        setFontSize,
        autoSaveOnComplete,
        setAutoSaveOnComplete,
        defaultTab,
        setDefaultTab,
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
        tabBarFloatingHeight,
        setTabBarFloatingHeight,
        tabBarHeight,
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
        modalPresentationStyle,
        setModalPresentationStyle,
        setTabIndicatorStyle,
        experimentalIOS26NavBar,
        setExperimentalIOS26NavBar,
        // Global animation controls
        animationsEnabled,
        setAnimationsEnabled,
        reduceMotion,
        setReduceMotion,
        animationScale,
        setAnimationScale,
        sensitivePromptLevel,
        setSensitivePromptLevel,
        sensitiveActionPreference,
        setSensitiveActionPreference,
        sensitiveTone,
        setSensitiveTone,
        lastSeenVersion,
        markVersionSeen,
        shouldShowWhatsNew,
        lineHeight,
        setLineHeight,
        imageLoadingMode,
        setImageLoadingMode,
        dataSaverMode,
        setDataSaverMode,
        quietHoursEnabled,
        setQuietHoursEnabled,
        quietHoursStart,
        setQuietHoursStart,
        quietHoursEnd,
        setQuietHoursEnd,
        hapticIntensity,
        setHapticIntensity,
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
