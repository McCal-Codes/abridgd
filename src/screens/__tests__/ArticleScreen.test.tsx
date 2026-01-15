import React from 'react';
import { render } from '@testing-library/react-native';
import { ArticleScreen } from '../ArticleScreen';
import { NavigationContainer } from '@react-navigation/native';
import { SavedArticlesProvider } from '../../context/SavedArticlesContext';
import { SettingsProvider } from '../../context/SettingsContext';
import { Article } from '../../types/Article';

// Mock SafeAreaContext
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock services
jest.mock('../../services/FullStoryService', () => ({
  fetchFullArticleBody: jest.fn(() => Promise.resolve('')),
}));

jest.mock('../../services/AiService', () => ({
  summarizeArticle: jest.fn(() => Promise.resolve('Mock summary')),
}));

// Mock navigation route params
const mockArticle: Article = {
  id: 'test-article-1',
  headline: 'Test Headline',
  summary: 'Short summary for testing',
  body: 'This is a test article body with enough content to display properly.',
  source: 'Test Source',
  timestamp: 'Jan 15, 2026',
  publishedAt: Date.now(),
  category: 'Top',
  readTimeMinutes: 3,
  isSensitive: false,
  link: 'https://example.com/article',
};

const mockRoute = {
  params: {
    article: mockArticle,
  },
  key: 'test-key',
  name: 'Article' as const,
};

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useRoute: () => mockRoute,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

// Stub heavy UI components used in ArticleScreen
// Return React components that render their props, not string components
jest.mock('../../components/ScaleButton', () => {
  return function MockScaleButton(props: any) {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(View, props, props.children);
  };
});

jest.mock('../../components/AbridgedReader', () => {
  return function MockAbridgedReader(props: any) {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(View, props, [
      React.createElement(Text, { key: 'label' }, 'Abridged Reader'),
      props.children,
    ]);
  };
});

describe('ArticleScreen', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <NavigationContainer>
        <SettingsProvider>
          <SavedArticlesProvider>
            {component}
          </SavedArticlesProvider>
        </SettingsProvider>
      </NavigationContainer>
    );
  };

  it('renders article headline', () => {
    const { getByText } = renderWithProviders(<ArticleScreen />);
    
    expect(getByText('Test Headline')).toBeTruthy();
  });

  it('renders article source', () => {
    const { getByText } = renderWithProviders(<ArticleScreen />);
    
    expect(getByText(/Test Source/i)).toBeTruthy();
  });

  it('renders article body content', () => {
    const { getByText } = renderWithProviders(<ArticleScreen />);
    
    expect(getByText(/This is a test article body/i)).toBeTruthy();
  });

  it('does not show grounding overlay for non-sensitive articles', () => {
    const { queryByText } = renderWithProviders(<ArticleScreen />);
    
    // Grounding overlay should not be visible for non-sensitive content
    expect(queryByText(/Sensitive Content/i)).toBeNull();
  });
});
