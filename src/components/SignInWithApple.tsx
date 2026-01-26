/**
 * Sign in with Apple Component (Temporarily Disabled)
 *
 * Apple sign-in is paused while entitlements are finalized. Shows a friendly
 * “coming soon” prompt and keeps users on their local profile.
 */

import React, { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
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
export const SignInWithApple: React.FC<SignInWithAppleProps> = ({ onError, onSuccess }) => {
  const formatFullName = (fullName?: AppleAuthentication.AppleAuthenticationFullName | null) => {
    if (!fullName) return undefined;
    const parts = [fullName.givenName, fullName.familyName].filter(Boolean);
    if (parts.length === 0) return undefined;
    return parts.join(" ");
  };

  const handleSignIn = useCallback(async () => {
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        const appError = ErrorHandler.createError(
          ErrorCode.APPLE_SIGNIN_UNAVAILABLE,
          "Sign in with Apple is not available on this device",
        );
        onError?.(appError);
        Alert.alert("Not available", appError.userMessage);
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const user = {
        id: credential.user,
        email: credential.email ?? undefined,
        displayName: formatFullName(credential.fullName),
      };

      onSuccess?.(user);
    } catch (error: any) {
      if (error?.code === "ERR_CANCELED") {
        const appError = ErrorHandler.createError(
          ErrorCode.AUTH_CANCELLED,
          "Sign in was cancelled",
        );
        onError?.(appError);
        return;
      }

      const appError = ErrorHandler.createError(
        ErrorCode.APPLE_SIGNIN_FAILED,
        error?.message || "Sign in with Apple failed",
        error?.stack || JSON.stringify(error),
      );

      onError?.(appError);
      Alert.alert("Sign in failed", appError.userMessage);
    }
  }, [onError, onSuccess]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignIn}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Sign in with Apple"
        accessibilityHint="Sign in to sync your preferences and saved articles."
      >
        <Text style={styles.buttonText}>Sign in with Apple</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Use your Apple ID to sync preferences, history, and saved articles across your devices.
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
});
