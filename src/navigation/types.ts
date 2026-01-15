import { NavigatorScreenParams } from '@react-navigation/native';
import { Article } from '../types/Article';

export type RootStackParamList = {
  Main: undefined;
  Article: { article: Article };
  Settings: undefined;
  ReadingSettings: undefined;
  DigestSettings: undefined;
  CustomizationSettings: undefined;
  SourcesSettings: undefined;
  TabBarSettings: undefined;
  DebugSettings: undefined;
  Onboarding: undefined;
  Digest: undefined;
};

export type TabParamList = {
  Home: undefined;
  Discover: { category: string };
  Saved: undefined;
  Digest: undefined;
  Top?: { category: string };
  Local?: { category: string };
  Business?: { category: string };
  Technology?: { category: string };
  Sports?: { category: string };
  Science?: { category: string };
  Health?: { category: string };
  Entertainment?: { category: string };
  Culture?: { category: string };
  Opinion?: { category: string };
};
