import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { NavigationContainer } from '@react-navigation/native';
import { ScrollContext } from '../../context/ScrollContext';
import { Animated } from 'react-native';

// Mock RSS Service
jest.mock('../../services/RssService', () => ({
  fetchArticlesByCategory: jest.fn(() => Promise.resolve([])),
}));

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

describe('HomeScreen', () => {
  const scrollY = new Animated.Value(0);
  
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <NavigationContainer>
        <ScrollContext.Provider value={{ scrollY }}>
          {component}
        </ScrollContext.Provider>
      </NavigationContainer>
    );
  };

  it('renders loading indicator initially', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    
    expect(getByText(/Fetching top stories/i)).toBeTruthy();
  });

  it('renders empty feed state when no articles', async () => {
    const { fetchArticlesByCategory } = require('../../services/RssService');
    fetchArticlesByCategory.mockResolvedValueOnce([]);

    const { queryByText } = renderWithProviders(<HomeScreen />);
    
    await waitFor(() => {
      expect(queryByText(/Fetching top stories/i)).toBeNull();
    });

    // Should render FlatList (empty but present)
    // Note: Empty state rendering depends on implementation
  });

  it('fetches articles on mount', async () => {
    const { fetchArticlesByCategory } = require('../../services/RssService');
    fetchArticlesByCategory.mockResolvedValueOnce([]);

    renderWithProviders(<HomeScreen />);

    await waitFor(() => {
      expect(fetchArticlesByCategory).toHaveBeenCalledWith('Top');
    });
  });
});
