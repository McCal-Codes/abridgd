import React, { useRef } from 'react';
import { Modal, View, StyleSheet, Pressable, ViewProps, findNodeHandle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  measure,
  useAnimatedRef,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';

interface ZoomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  sourceRef?: React.RefObject<View>;
  blur?: boolean;
  blurIntensity?: number;
}

/**
 * iOS 26-inspired modal with zoom transition from source element.
 * Similar to SwiftUI .navigationTransition(.zoom) with .matchTransitionSource.
 * Modal zooms out from the button/element that triggered it.
 */
export const ZoomModal: React.FC<ZoomModalProps> = ({
  visible,
  onClose,
  children,
  sourceRef,
  blur = true,
  blurIntensity = 30,
}) => {
  const { colors, isDark } = useTheme();
  const containerRef = useAnimatedRef<Animated.View>();
  
  // Animation values
  const scale = useSharedValue(0.1);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Start animation when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      // Get source position if available
      if (sourceRef?.current) {
        sourceRef.current.measureInWindow((x, y, width, height) => {
          // Calculate center of source element relative to screen
          const sourceCenterX = x + width / 2;
          const sourceCenterY = y + height / 2;
          
          // Get screen dimensions (approximate from window)
          const screenCenterX = 200; // Will be adjusted by actual measurements
          const screenCenterY = 400;
          
          // Set initial offset from source to screen center
          translateX.value = sourceCenterX - screenCenterX;
          translateY.value = sourceCenterY - screenCenterY;
          
          // Animate to center
          scale.value = withSpring(1, {
            damping: 20,
            stiffness: 300,
          });
          opacity.value = withTiming(1, { duration: 300 });
          translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
          translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
        });
      } else {
        // No source, just zoom from center
        scale.value = withSpring(1, {
          damping: 20,
          stiffness: 300,
        });
        opacity.value = withTiming(1, { duration: 300 });
      }
    } else {
      // Animate out
      scale.value = withSpring(0.1, {
        damping: 20,
        stiffness: 300,
      });
      opacity.value = withTiming(0, { duration: 250 });
      
      if (sourceRef?.current) {
        sourceRef.current.measureInWindow((x, y, width, height) => {
          const sourceCenterX = x + width / 2;
          const sourceCenterY = y + height / 2;
          const screenCenterX = 200;
          const screenCenterY = 400;
          
          translateX.value = withSpring(sourceCenterX - screenCenterX, {
            damping: 20,
            stiffness: 300,
          });
          translateY.value = withSpring(sourceCenterY - screenCenterY, {
            damping: 20,
            stiffness: 300,
          });
        });
      }
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
            {blur ? (
              <BlurView
                intensity={blurIntensity}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)' },
                ]}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                ]}
              />
            )}
          </Animated.View>
        </Pressable>

        {/* Content */}
        <Animated.View
          ref={containerRef}
          style={[
            styles.content,
            { backgroundColor: colors.background },
            animatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
});
