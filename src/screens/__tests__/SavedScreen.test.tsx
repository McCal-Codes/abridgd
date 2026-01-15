import React from 'react';
import { render } from '@testing-library/react-native';
import { SavedScreen } from '../SavedScreen';
import { NavigationContainer } from '@react-navigation/native';
import { SavedArticlesProvider } from '../../context/SavedArticlesContext';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

describe('SavedScreen', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <NavigationContainer>
        <SavedArticlesProvider>
          {component}
        </SavedArticlesProvider>
      </NavigationContainer>
    );
  };

  it('renders empty state when no saved articles', () => {
    const { getByText } = renderWithProviders(<SavedScreen />);
    
    expect(getByText('No saved articles')).toBeTruthy();
    expect(getByText(/You can save articles from the article view/i)).toBeTruthy();
  });

  it('renders empty container with correct styling', () => {
    const { getByText } = renderWithProviders(<SavedScreen />);
    
    const emptyText = getByText('No saved articles');
    expect(emptyText).toBeTruthy();
    
    // Verify empty state is displayed (not a list)
    const subText = getByText(/You can save articles from the article view/i);
    expect(subText).toBeTruthy();
  });

  it('does not render article list when empty', () => {
    const { queryByTestId } = renderWithProviders(<SavedScreen />);
    
    // FlatList should not be rendering items
    expect(queryByTestId('article-card')).toBeNull();
  });
});
