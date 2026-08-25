/**
 * Sign in with Apple Component
 *
 * Wraps Apple's own AppleAuthenticationButton, which the App Store Guidelines
 * require for starting the sign-in flow (a custom button is not permitted).
 */

import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useThemeOptional } from "../theme/ThemeContext";

interface SignInWithAppleUser {
  id: string;
  email?: string;
  displayName?: string;
}

interface SignInWithAppleProps {
  onSuccess?: (user: SignInWithAppleUser) => void;
  onError?: (error: unknown) => void;
}

export const SignInWithApple: React.FC<SignInWithAppleProps> = ({ onSuccess, onError }) => {
  const { isDark } = useThemeOptional();
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    AppleAuthentication.isAvailableAsync().then((available) => {
      if (mounted) setIsAvailable(available);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handlePress = useCallback(async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const displayName = credential.fullName
        ? AppleAuthentication.formatFullName(credential.fullName).trim()
        : "";

      onSuccess?.({
        id: credential.user,
        email: credential.email || undefined,
        displayName: displayName || undefined,
      });
    } catch (error: any) {
      // The user backed out of the native sheet - not a failure worth surfacing.
      if (error?.code === "ERR_REQUEST_CANCELED") return;
      onError?.(error);
    }
  }, [onSuccess, onError]);

  if (!isAvailable) return null;

  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={
          isDark
            ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
            : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
        }
        cornerRadius={10}
        style={styles.button}
        onPress={handlePress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    width: "100%",
    height: 48,
  },
});
