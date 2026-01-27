import React from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useSettings } from "../context/SettingsContext";
import { HardDrive, Zap, Wifi } from "lucide-react-native";

export const DataPerformanceSettingsScreen: React.FC = () => {
  const { imageLoadingMode, setImageLoadingMode, dataSaverMode, setDataSaverMode } = useSettings();

  const applyPreset = (preset: "balanced" | "saver") => {
    if (preset === "balanced") {
      setDataSaverMode(false);
      setImageLoadingMode("compressed");
    } else {
      setDataSaverMode(true);
      setImageLoadingMode("compressed");
    }
  };

  const restoreDefaults = () => {
    setDataSaverMode(false);
    setImageLoadingMode("full");
  };

  const handleClearCache = () => {
    Alert.alert(
      "Cache clearing is coming soon",
      "This button is disabled until the cache module is wired.",
      [{ text: "OK" }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Data & Performance</Text>
        <Text style={styles.description}>
          Optimize bandwidth usage, battery life, and app performance.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presets</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity style={styles.pillButton} onPress={() => applyPreset("balanced")}>
              <Text style={styles.pillButtonText}>Balanced (compressed, saver off)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pillButton} onPress={() => applyPreset("saver")}>
              <Text style={styles.pillButtonText}>Saver (compressed + Data Saver)</Text>
            </TouchableOpacity>
          </View>
        </View>

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
              onValueChange={(value) => {
                setDataSaverMode(value);
                if (value && imageLoadingMode === "full") {
                  setImageLoadingMode("compressed");
                }
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          {dataSaverMode ? (
            <Text style={styles.helperText}>
              Data Saver limits images to compressed and may pause prefetching until you turn it off.
            </Text>
          ) : null}
        </View>

        {/* Image Loading Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Image Loading</Text>
          <Text style={styles.sectionDesc}>How images are loaded when reading articles</Text>

          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                imageLoadingMode === "full" && styles.optionCardSelected,
                dataSaverMode && styles.optionCardDisabled,
              ]}
              onPress={() => {
                if (dataSaverMode) return;
                setImageLoadingMode("full");
              }}
              disabled={dataSaverMode}
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
            <Text style={styles.actionButtonText}>Clear Cache (disabled)</Text>
          </TouchableOpacity>
        </View>

        {/* Performance Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Tips</Text>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>WiFi Prefetching</Text>
            <Text style={styles.tipDesc}>
              Articles are prefetched over WiFi when you're idle, making navigation faster.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Battery Optimization</Text>
            <Text style={styles.tipDesc}>
              Data Saver Mode reduces CPU usage by skipping unnecessary animations and image
              loading.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Smart Refresh</Text>
            <Text style={styles.tipDesc}>
              Feeds refresh only when needed, not constantly in the background.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.restoreButton} onPress={restoreDefaults}>
          <Text style={styles.restoreButtonText}>Restore data defaults</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F0F4F8",
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
    borderColor: "#D32F2F",
    backgroundColor: "rgba(211, 47, 47, 0.05)",
    alignItems: "center",
  },
  actionButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: "#D32F2F",
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
  helperText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  pillButton: {
    flex: 1,
    minWidth: 160,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  restoreButton: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.surface,
    marginTop: spacing.lg,
  },
  restoreButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
});
