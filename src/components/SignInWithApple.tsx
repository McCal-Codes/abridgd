/**
 * Sign in with Apple Component (Stub)
 *
 * Ready for implementation when Apple Developer account and entitlements are configured.
 * Requires: expo-apple-authentication package and proper Apple Developer setup.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
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
export const SignInWithApple: React.FC<SignInWithAppleProps> = ({ onSuccess, onError }) => {
  const handleSignIn = async () => {
    if (Platform.OS !== "ios") {
      const error = ErrorHandler.createError(
        ErrorCode.APPLE_SIGNIN_UNAVAILABLE,
        "Sign in with Apple is only available on iOS devices",
        undefined,
        false,
      );
      Alert.alert("Not Available", error.userMessage);
      onError?.(error);
      return;
    }

    // TODO: Implement actual Sign in with Apple flow
    // Example implementation:
    /*
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Extract user info
      const user = {
        id: credential.user,
        email: credential.email,
        displayName: credential.fullName
          ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
          : undefined,
        appleUserId: credential.user,
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
      };

      onSuccess?.(user);
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        const error = ErrorHandler.createError(
          ErrorCode.AUTH_CANCELLED,
          'User cancelled sign in',
        );
        onError?.(error);
      } else {
        const error = ErrorHandler.createError(
          ErrorCode.APPLE_SIGNIN_FAILED,
          'Apple Sign In failed',
          e.message
        );
        ErrorHandler.logError(error, 'SignInWithApple');
        Alert.alert('Sign In Failed', error.userMessage);
        onError?.(error);
      }
    }
    */

    // Stub implementation
    const error = ErrorHandler.createError(
      ErrorCode.FEATURE_NOT_IMPLEMENTED,
      "Sign in with Apple not yet configured",
      "Install expo-apple-authentication and configure entitlements",
      true,
    );
    Alert.alert("Coming Soon", error.userMessage);
    onError?.(error);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleSignIn} activeOpacity={0.8}>
        <Text style={styles.appleIcon}></Text>
        <Text style={styles.buttonText}>Sign in with Apple</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Sign in to sync your preferences and reading history across devices.
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
  appleIcon: {
    fontSize: 20,
    color: "#FFF",
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
