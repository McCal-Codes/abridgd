import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export type ToolbarSpacing = 'fixed' | 'flexible';

interface ToolbarItemProps {
  children: React.ReactNode;
}

interface ToolbarSpacerProps {
  spacing?: ToolbarSpacing;
  size?: number;
}

interface BottomToolbarProps {
  children: React.ReactNode;
  visible?: boolean;
  blur?: boolean;
  blurIntensity?: number;
}

/**
 * iOS 26-inspired bottom toolbar with glass effect.
 * Similar to SwiftUI .bottomBar placement with toolbar items.
 * Supports fixed and flexible spacers for arranging buttons.
 */
export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  children,
  visible = true,
  blur = true,
  blurIntensity = 30,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const content = (
    <View style={[
      styles.content,
      { paddingBottom: Math.max(insets.bottom, 8) },
    ]}>
      {children}
    </View>
  );

  if (blur && Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.container,
          {
            backgroundColor: isDark 
              ? 'rgba(28, 28, 30, 0.85)'
              : 'rgba(255, 255, 255, 0.85)',
            borderTopColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
          },
        ]}
      >
        {content}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.separator,
        },
      ]}
    >
      {content}
    </View>
  );
};

/**
 * Wrapper for toolbar buttons or groups.
 * Use for semantic positioning of toolbar items.
 */
export const ToolbarItem: React.FC<ToolbarItemProps> = ({ children }) => {
  return <View style={styles.item}>{children}</View>;
};

/**
 * Toolbar spacer for fixed or flexible spacing.
 * Fixed: adds specific spacing between items.
 * Flexible: pushes items apart (like SwiftUI Spacer()).
 */
export const ToolbarSpacer: React.FC<ToolbarSpacerProps> = ({
  spacing = 'fixed',
  size = 12,
}) => {
  return (
    <View
      style={[
        spacing === 'flexible' ? styles.flexibleSpacer : styles.fixedSpacer,
        spacing === 'fixed' && { width: size },
      ]}
    />
  );
};

/**
 * Groups toolbar items together (similar to SwiftUI ToolbarItemGroup).
 * Items in a group are placed adjacent to each other.
 */
export const ToolbarItemGroup: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 8,
}) => {
  return <View style={[styles.group, { gap }]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    minHeight: 56,
  },
  item: {
    // Individual item wrapper
  },
  fixedSpacer: {
    // Fixed width spacer
  },
  flexibleSpacer: {
    flex: 1,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
