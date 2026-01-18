import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  titleAlign?: 'left' | 'center';
  large?: boolean;
}

/**
 * iOS 26-inspired navigation header with subtitle support.
 * Similar to SwiftUI .navigationSubtitle() modifier.
 * Subtitle appears below the main title, aligned to the leading edge.
 */
export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  subtitle,
  titleAlign = 'center',
  large = false,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.container,
      titleAlign === 'left' && styles.containerLeft,
    ]}>
      <Text
        style={[
          styles.title,
          large && styles.titleLarge,
          titleAlign === 'left' && styles.titleLeft,
          { color: colors.text },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            large && styles.subtitleLarge,
            { color: colors.textSecondary },
          ]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  containerLeft: {
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  titleLarge: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  titleLeft: {
    textAlign: 'left',
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  subtitleLarge: {
    fontSize: 15,
    marginTop: 4,
  },
});
