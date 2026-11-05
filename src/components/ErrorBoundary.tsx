import React, { Component, ErrorInfo, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Sentry from "@sentry/react-native";
import { spacing } from "../theme/spacing";
import { fontScaleLimit, typography } from "../theme/typography";
import { ThemeColors } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * The screen shown after an uncaught render error. It is a function component so it can use the
 * theme (the previous version was hard-coded white with red text, a bright flash in dark mode),
 * and it does not show `error.message` to readers: that is an internal string, not something a
 * reader can act on. In development the message is still shown, since that is where it helps.
 */
const ErrorFallback: React.FC<{ error: Error | null; onRetry: () => void }> = ({ error, onRetry }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title} accessibilityRole="header">
        Something went wrong.
      </Text>
      <Text style={styles.body} maxFontSizeMultiplier={fontScaleLimit.control}>
        The app hit a problem. Your saved articles and settings are safe on this device.
      </Text>
      {__DEV__ && error?.message ? <Text style={styles.devError}>{error.message}</Text> : null}
      <Pressable
        onPress={onRetry}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Try again"
      >
        <Text style={styles.buttonText} maxFontSizeMultiplier={fontScaleLimit.action}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    try {
      if (Sentry && typeof Sentry.captureException === "function") {
        Sentry.captureException(error);
      }
    } catch {}
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
      backgroundColor: colors.background,
    },
    title: {
      fontFamily: typography.fontFamily.serifBold,
      fontSize: typography.size.xl,
      color: colors.label,
      textAlign: "center",
    },
    body: {
      marginTop: spacing.sm + 2,
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.md,
      lineHeight: 24,
      color: colors.textSecondary,
      textAlign: "center",
    },
    devError: {
      marginTop: spacing.md,
      fontFamily: typography.fontFamily.mono,
      fontSize: 12,
      color: colors.error,
      textAlign: "center",
    },
    button: {
      marginTop: spacing.lg,
      minHeight: 48,
      paddingHorizontal: spacing.lg,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.tintStrong,
    },
    buttonText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.md,
      fontWeight: "600",
      color: colors.onTintStrong,
    },
  });
