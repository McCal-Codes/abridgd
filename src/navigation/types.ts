import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: undefined;
  Article: { articleId: string };
};

export type TabParamList = {
  Top: undefined;
  Local: { category: string };
  Business: { category: string };
  Sports: { category: string };
  Culture: { category: string };
  Saved: undefined;
};
