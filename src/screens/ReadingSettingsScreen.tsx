import React from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useSettings, AnchorStrategy } from "../context/SettingsContext";
import { Sliders } from "lucide-react-native";
import { AbridgedReader } from "../components/AbridgedReader";
import { useNavigation } from "@react-navigation/native";

export const ReadingSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    isReaderEnabled,
    setIsReaderEnabled,
    isSummarizationEnabled,
    setIsSummarizationEnabled,
    readingSpeed,
    setReadingSpeed,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    autoSaveOnComplete,
    setAutoSaveOnComplete,
    isContinueReadingEnabled,
    setIsContinueReadingEnabled,
    rsvpHighlightColor,
    setRsvpHighlightColor,
    rsvpAnchorStrategy,
    setRsvpAnchorStrategy,
  } = useSettings();

  const PRESET_COLORS: { color: string; name: string; accessible: boolean }[] = [
    { color: "#D32F2F", name: "Red", accessible: true },
    { color: "#1976D2", name: "Blue", accessible: true },
    { color: "#388E3C", name: "Green", accessible: true },
    { color: "#FF6F00", name: "Orange", accessible: true },
    { color: "#7B1FA2", name: "Purple", accessible: true },
    { color: "#121212", name: "Black", accessible: true },
    { color: "#0097A7", name: "Cyan", accessible: true },
    { color: "#C2185B", name: "Magenta", accessible: true },
  ];

  const STRATEGIES: { label: string; value: AnchorStrategy; description: string }[] = [
    { label: "Early", value: "early", description: "Pivot ~25% into the word." },
    { label: "Standard", value: "standard", description: "Pivot ~35% (default, fastest)." },
    { label: "Center", value: "center", description: "Pivot at 50% for balance." },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Reading Experience</Text>
        <Text style={styles.description}>
          Everything about how you read — RSVP, speed, focus, and sources.
        </Text>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Abridged Reader</Text>
              <Text style={styles.toggleDesc}>
                Rapid Serial Visual Presentation mode for faster reading.
              </Text>
            </View>
            <Switch
              value={isReaderEnabled}
              onValueChange={setIsReaderEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>AI Summarization</Text>
              <Text style={styles.toggleDesc}>
                Automatically generate concise summaries of articles.
              </Text>
            </View>
            <Switch
              value={isSummarizationEnabled}
              onValueChange={setIsSummarizationEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Continue Reading on Home</Text>
              <Text style={styles.toggleDesc}>
                Show in-progress articles at the top of Home. Off by default.
              </Text>
            </View>
            <Switch
              value={isContinueReadingEnabled}
              onValueChange={setIsContinueReadingEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Auto-Save on Completion</Text>
              <Text style={styles.toggleDesc}>
                Automatically save articles when read to the end in RSVP mode.
              </Text>
            </View>
            <Switch
              value={autoSaveOnComplete}
              onValueChange={setAutoSaveOnComplete}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reader Focus Color</Text>
          <Text style={styles.sectionDesc}>
            Color for the RSVP pivot letter. Colorblind-friendly options.
          </Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity
                key={c.color}
                style={[
                  styles.colorOption,
                  { backgroundColor: c.color },
                  rsvpHighlightColor === c.color && styles.selectedColor,
                ]}
                onPress={() => setRsvpHighlightColor(c.color)}
                accessible
                accessibilityLabel={`${c.name} color`}
                accessibilityRole="button"
              >
                {rsvpHighlightColor === c.color && <View style={styles.colorCheckmark} />}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.colorLabelText}>
            Selected: {PRESET_COLORS.find((c) => c.color === rsvpHighlightColor)?.name || "Custom"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reader Focus Position</Text>
          <View style={styles.strategyContainer}>
            {STRATEGIES.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[styles.chip, rsvpAnchorStrategy === s.value && styles.chipSelected]}
                onPress={() => setRsvpAnchorStrategy(s.value)}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    rsvpAnchorStrategy === s.value && styles.chipLabelSelected,
                  ]}
                >
                  {s.label}
                </Text>
                <Text style={styles.chipDescription}>{s.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Speed</Text>
          <Text style={styles.sectionDesc}>Words per minute for RSVP reader</Text>
          <View style={styles.speedRow}>
            {[200, 250, 300, 350, 400, 450, 500].map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[styles.speedOption, readingSpeed === speed && styles.selectedSpeed]}
                onPress={() => setReadingSpeed(speed)}
              >
                <Text
                  style={[styles.speedText, readingSpeed === speed && styles.selectedSpeedText]}
                >
                  {speed}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Font Size</Text>
          <Text style={styles.sectionDesc}>Adjust article text size</Text>
          <View style={styles.fontRow}>
            {[
              { label: "Small", value: 0.85 },
              { label: "Normal", value: 1.0 },
              { label: "Large", value: 1.15 },
              { label: "X-Large", value: 1.3 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.fontOption, fontSize === option.value && styles.selectedFont]}
                onPress={() => setFontSize(option.value)}
              >
                <Text
                  style={[styles.fontText, fontSize === option.value && styles.selectedFontText]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line Spacing</Text>
          <Text style={styles.sectionDesc}>
            Increase space between lines for comfortable reading
          </Text>
          <View style={styles.lineHeightRow}>
            {[1.0, 1.25, 1.5, 1.75, 2.0].map((height) => (
              <TouchableOpacity
                key={height}
                style={[
                  styles.lineHeightOption,
                  lineHeight === height && styles.selectedLineHeight,
                ]}
                onPress={() => setLineHeight(height)}
              >
                <Text
                  style={[
                    styles.lineHeightText,
                    lineHeight === height && styles.selectedLineHeightText,
                  ]}
                >
                  {height}×
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Preview */}
          <View style={styles.lineHeightPreview}>
            <Text style={[styles.previewText, { lineHeight: 16 * lineHeight }]}>
              This is how your articles will look with the selected line spacing. More space makes
              reading easier on the eyes.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Previews</Text>

          <Text style={styles.subsectionLabel}>Abridged Reader Preview</Text>
          <AbridgedReader content="I hope you are having a wonderful day, and by the way, I truly believe that almost anything tastes better when it is served as chicken on a stick." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sources</Text>
          <Text style={styles.sectionDesc}>Manage feeds used by the reader.</Text>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => (navigation as any).navigate("SourcesSettings")}
          >
            <Text style={styles.linkCardText}>Open News Sources</Text>
          </TouchableOpacity>
        </View>
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
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  toggleLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  toggleDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionDesc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  speedRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  speedOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 50,
    alignItems: "center",
  },
  selectedSpeed: {
    borderColor: colors.primary,
    backgroundColor: "#F0F4F8",
  },
  speedText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  selectedSpeedText: {
    color: colors.primary,
  },
  fontRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  fontOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    minWidth: 70,
  },
  selectedFont: {
    borderColor: colors.primary,
    backgroundColor: "#F0F4F8",
  },
  fontText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  selectedFontText: {
    color: colors.primary,
  },
  subsectionLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  chip: {
    flex: 1,
    minWidth: 140,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F2F7FB",
  },
  chipLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chipLabelSelected: {
    color: colors.primary,
  },
  chipDescription: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  colorGrid: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
    marginBottom: spacing.sm,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedColor: {
    borderColor: colors.text,
    borderWidth: 4,
    transform: [{ scale: 1.05 }],
  },
  colorCheckmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.3)",
  },
  colorLabelText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  strategyContainer: {
    gap: spacing.sm,
  },
  linkCard: {
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  linkCardText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  lineHeightRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  lineHeightOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedLineHeight: {
    borderColor: colors.primary,
    backgroundColor: "#F0F4F8",
  },
  lineHeightText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  selectedLineHeightText: {
    color: colors.primary,
  },
  lineHeightPreview: {
    padding: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.text,
  },
});
