import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, isDarkMode } from "../theme/colors";
import * as Sentry from "@sentry/react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

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
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>We’ll get you back inside</Text>
            <Text style={styles.title}>We hit a small bump.</Text>
            <Text style={styles.body}>
              Your saved stories and settings stay put. Tap below to reload and pick up where you
              left off.
            </Text>
            {this.state.error?.message ? (
              <Text style={styles.error} accessibilityLabel="Technical details">
                {this.state.error.message}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reload the app"
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text style={styles.buttonText}>Back to the app</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  card: {
    width: "90%",
    maxWidth: 440,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  eyebrow: {
    color: colors.secondaryLabel,
    fontSize: 13,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.label,
    marginBottom: 8,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    marginTop: 12,
    marginBottom: 12,
    textAlign: "left",
  },
  body: {
    fontSize: 15,
    color: colors.secondaryLabel,
    lineHeight: 22,
  },
  button: {
    marginTop: 16,
    backgroundColor: colors.tint,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: isDarkMode ? "#00171a" : "#f7ffff",
    fontWeight: "600",
    fontSize: 16,
  },
});
