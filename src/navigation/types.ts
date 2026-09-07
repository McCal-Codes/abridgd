import { NavigatorScreenParams } from "@react-navigation/native";
import { Article } from "../types/Article";

export type RootStackParamList = {
  Main: undefined;
  Article: { article: Article };
  Settings: undefined;
  ReadingSettings: undefined;
  DataPerformanceSettings: undefined;
  DigestSettings: undefined;
  GroundingFocusSettings: undefined;
  AccessibilitySettings: undefined;
  NavigationSettings: undefined;
  AppInfo: undefined;
  SourcesSettings: undefined;
  TabBarSettings: undefined;
  DebugSettings: undefined;
  Achievements: undefined;
  Onboarding: { mode?: "firstRun" | "whatsNew"; startSlideId?: string } | undefined;
  Digest: undefined;
  iOS26Demo: undefined;
};

export type TabParamList = {
  Home: undefined;
  Discover: { category: string };
  Saved: undefined;
  Digest: undefined;
  Profile: undefined;
  Top?: { category: string };
  Local?: { category: string };
};
