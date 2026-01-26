/**
 * Sign in with Apple Component (Temporarily Disabled)
 *
 * Apple sign-in is paused while entitlements are finalized. Shows a friendly
 * “coming soon” prompt and keeps users on their local profile.
 */

import React, { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { ErrorCode, ErrorHandler } from "../utils/errorCodes";

interface SignInWithAppleProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
}

/**
 * Sign in with Apple Button
 *
 * TODO: Install expo-apple-authentication
 * $ npx expo install expo-apple-authentication
 *
 * TODO: Configure entitlements in app.json:
 * "ios": {
 *   "entitlements": {
 *     "com.apple.developer.applesignin": ["Default"]
 *   }
 * }
 *
 * TODO: Add Apple Sign In capability in Xcode project
 */
export const SignInWithApple: React.FC<SignInWithAppleProps> = ({ onError }) => {
  const handleComingSoon = useCallback(() => {
    const error = ErrorHandler.createError(
      ErrorCode.FEATURE_NOT_IMPLEMENTED,
      "Sign in with Apple is temporarily disabled",
    );

    onError?.(error);

    Alert.alert(
      "Coming soon",
      "Sign in with Apple is disabled while we finish setup. Your local profile stays active for now.",
    );
  }, [onError]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.buttonDisabled]}
        onPress={handleComingSoon}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Sign in with Apple coming soon"
        accessibilityHint="Feature is temporarily disabled; your local profile remains active."
      >
        <Text style={styles.buttonText}>Sign in with Apple</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>Coming soon</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Sync and backup will be enabled when Sign in with Apple launches. You’re using your local
        profile for now.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    width: "100%",
    gap: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  disclaimer: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  tag: {
    backgroundColor: `${colors.surface}60`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.textSecondary}25`,
  },
  tagText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
