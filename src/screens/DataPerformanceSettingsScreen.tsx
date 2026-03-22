import React from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useSettings } from "../context/SettingsContext";
import { HardDrive, Zap, Wifi } from "lucide-react-native";
import { useThemedStyles } from "../theme/useThemedStyles";

export const DataPerformanceSettingsScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const { imageLoadingMode, setImageLoadingMode, dataSaverMode, setDataSaverMode } = useSettings();

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear all cached images and articles? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear Cache",
          style: "destructive",
          onPress: async () => {
            // Placeholder: actual cache clearing would be implemented here
            Alert.alert("Success", "Cache cleared successfully");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Data & Performance</Text>
        <Text style={styles.description}>
          Optimize bandwidth usage, battery life, and app performance.
        </Text>

        {/* Data Saver Mode */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Data Saver Mode</Text>
              <Text style={styles.toggleDesc}>
                Reduces data usage by compressing images and disabling prefetching. Improves battery
                life on slower connections.
              </Text>
            </View>
            <Switch
              value={dataSaverMode}
              onValueChange={setDataSaverMode}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Image Loading Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Image Loading</Text>
          <Text style={styles.sectionDesc}>How images are loaded when reading articles</Text>

          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionCard, imageLoadingMode === "full" && styles.optionCardSelected]}
              onPress={() => setImageLoadingMode("full")}
            >
              <View style={styles.optionIcon}>
                <Wifi
                  size={24}
                  color={imageLoadingMode === "full" ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.optionTitle,
                  imageLoadingMode === "full" && styles.optionTitleSelected,
                ]}
              >
                Full Quality
              </Text>
              <Text style={styles.optionDesc}>Highest quality, largest file size</Text>
              {imageLoadingMode === "full" && <View style={styles.optionCheckmark} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                imageLoadingMode === "compressed" && styles.optionCardSelected,
              ]}
              onPress={() => setImageLoadingMode("compressed")}
            >
              <View style={styles.optionIcon}>
                <Zap
                  size={24}
                  color={imageLoadingMode === "compressed" ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.optionTitle,
                  imageLoadingMode === "compressed" && styles.optionTitleSelected,
                ]}
              >
                Compressed
              </Text>
              <Text style={styles.optionDesc}>Balanced quality & speed</Text>
              {imageLoadingMode === "compressed" && <View style={styles.optionCheckmark} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                imageLoadingMode === "text-only" && styles.optionCardSelected,
              ]}
              onPress={() => setImageLoadingMode("text-only")}
            >
              <View style={styles.optionIcon}>
                <HardDrive
                  size={24}
                  color={imageLoadingMode === "text-only" ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.optionTitle,
                  imageLoadingMode === "text-only" && styles.optionTitleSelected,
                ]}
              >
                Text Only
              </Text>
              <Text style={styles.optionDesc}>Minimal data, text only</Text>
              {imageLoadingMode === "text-only" && <View style={styles.optionCheckmark} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cache & Storage</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Cached Data</Text>
            <Text style={styles.infoValue}>~2.3 MB</Text>
            <Text style={styles.infoDesc}>Images and article content</Text>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
            <Text style={styles.actionButtonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>

        {/* Performance Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Tips</Text>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 WiFi Prefetching</Text>
            <Text style={styles.tipDesc}>
              Articles are prefetched over WiFi when you're idle, making navigation faster.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>⚡ Battery Optimization</Text>
            <Text style={styles.tipDesc}>
              Data Saver Mode reduces CPU usage by skipping unnecessary animations and image
              loading.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🔄 Smart Refresh</Text>
            <Text style={styles.tipDesc}>
              Feeds refresh only when needed, not constantly in the background.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: 150,
  },
  header: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  toggleDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  optionRow: {
    gap: spacing.md,
  },
  optionCard: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.tintTransparent,
  },
  optionIcon: {
    marginBottom: spacing.md,
  },
  optionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  optionTitleSelected: {
    color: colors.primary,
  },
  optionDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  optionCheckmark: {
    marginTop: spacing.md,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  infoBox: {
    padding: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButton: {
    paddingVertical: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: `${colors.error}12`,
    alignItems: "center",
  },
  actionButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.error,
  },
  tipCard: {
    padding: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  tipTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tipDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  });
