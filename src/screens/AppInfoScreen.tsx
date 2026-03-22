import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useNavigation } from "@react-navigation/native";
import { useSettings } from "../context/SettingsContext";
import {
  CONTACT_EMAIL,
  BUG_EMAIL_SUBJECT,
  BUG_EMAIL_BODY_TEMPLATE,
  APP_VERSION,
  APP_BUILD,
  PRIVACY_URL,
  TERMS_URL,
} from "../config/appInfo";
import { ChevronRight, Mail, Star } from "lucide-react-native";
import { useThemedStyles } from "../theme/useThemedStyles";

export const AppInfoScreen: React.FC = () => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { resetOnboarding } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>App Info</Text>
        <Text style={styles.description}>Version details, policies, and quick support access.</Text>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={async () => {
              await resetOnboarding();
              try {
                (navigation as any).navigate("Onboarding", { startSlideId: "practice" });
              } catch {}
            }}
          >
            <Text style={styles.actionText}>Redo Onboarding Welcome</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => (navigation as any).navigate("Onboarding", { startSlideId: "whats-new-profile" })}
          >
            <View style={styles.inline}>
              <View style={styles.iconContainer}>
                <Star size={18} color={colors.primary} />
              </View>
              <Text style={[styles.actionText, { marginLeft: spacing.md }]}>What's New: Profile tab</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => (navigation as any).navigate("Onboarding", { startSlideId: "practice" })}
          >
            <Text style={styles.actionText}>Revisit RSVP Tutorial</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={async () => {
              try {
                const subject = BUG_EMAIL_SUBJECT;
                const body = BUG_EMAIL_BODY_TEMPLATE;
                const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                  subject,
                )}&body=${encodeURIComponent(body)}`;
                const supported = await Linking.canOpenURL(mailto);
                if (supported) {
                  await Linking.openURL(mailto);
                } else {
                  const formUrl = process.env.EXPO_PUBLIC_FEEDBACK_FORM_URL;
                  if (formUrl) {
                    await Linking.openURL(formUrl);
                  } else {
                    Alert.alert("No mail app", "No mail client is available on this device.");
                  }
                }
              } catch (e) {
                Alert.alert("Error", "Unable to open mail composer.");
              }
            }}
          >
            <View style={styles.inline}>
              <View style={styles.iconContainer}>
                <Mail size={18} color={colors.primary} />
              </View>
              <Text style={[styles.actionText, { marginLeft: spacing.md }]}>Send Feedback / Report a Bug</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.actionRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.versionText}>
              Version {APP_VERSION} (build {APP_BUILD})
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={async () => {
              try {
                await Linking.openURL(PRIVACY_URL);
              } catch {
                Alert.alert("Error", "Unable to open Privacy Policy.");
              }
            }}
          >
            <Text style={styles.actionText}>Privacy Policy</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomWidth: 0 }]}
            onPress={async () => {
              try {
                await Linking.openURL(TERMS_URL);
              } catch {
                Alert.alert("Error", "Unable to open Terms of Service.");
              }
            }}
          >
            <Text style={styles.actionText}>Terms of Service</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
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
    marginTop: spacing.lg,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: typography.fontFamily.sans,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.sans,
    marginTop: spacing.sm,
  },
  inline: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.tintTransparent,
    alignItems: "center",
    justifyContent: "center",
  },
  });
