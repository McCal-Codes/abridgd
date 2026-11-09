import React from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { CalendarDays, CalendarPlus, ExternalLink, MapPin, Share2, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing } from "../../../theme/spacing";
import { fontScaleLimit, typography } from "../../../theme/typography";
import { ThemeColors, useThemeOptional } from "../../../theme/ThemeContext";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { useSettings } from "../../../context/SettingsContext";
import { announceForAccessibility } from "../../../utils/announce";
import { openExternalUrl } from "../../../utils/openExternalUrl";
import { addEventToCalendar, AddToCalendarResult } from "../calendar";
import { formatEventPlace, formatEventWhen } from "../format";
import { useSavedEventsOptional } from "../SavedEventsContext";
import { AppEvent } from "../types";
import { SaveEventButton } from "./SaveEventButton";

interface Props {
  event: AppEvent | null;
  onClose: () => void;
}

const calendarMessage = (result: AddToCalendarResult): string | null => {
  switch (result) {
    case "saved":
      return "Added to your calendar.";
    case "link":
      return "Opened a calendar link in your browser.";
    case "failed":
      return "Couldn't open a calendar. Try the organizer's page instead.";
    default:
      return null; // canceled / shown: the OS screen already said it
  }
};

export const EventDetailSheet: React.FC<Props> = ({ event, onClose }) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const { isEventSaved, toggleSavedEvent } = useSavedEventsOptional();
  const { imageLoadingMode } = useSettings();
  const { height: windowHeight } = useWindowDimensions();
  const [status, setStatus] = React.useState<string | null>(null);
  const [photoFailed, setPhotoFailed] = React.useState(false);

  // A different event should not inherit the last one's status line.
  React.useEffect(() => {
    setStatus(null);
    setPhotoFailed(false);
  }, [event?.id]);

  if (!event) return null;
  const saved = isEventSaved(event.id);
  // Honour the Data & Performance setting: "text-only" means no photos anywhere.
  const showPhoto = !!event.imageUrl && imageLoadingMode !== "text-only" && !photoFailed;

  const onCalendar = async () => {
    const message = calendarMessage(await addEventToCalendar(event));
    setStatus(message);
    if (message) announceForAccessibility(message);
  };

  const onShare = async () => {
    try {
      await Share.share({ message: `${event.title}\n${event.url}` });
    } catch {
      // The share sheet failing is not worth an alert.
    }
  };

  const onToggleSave = () => {
    const nowSaved = toggleSavedEvent(event);
    announceForAccessibility(nowSaved ? "Event saved" : "Event removed from saved");
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root} accessibilityViewIsModal>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close event details"
        />
        {/* The sheet never grows past the screen: in landscape or at large text sizes the
            content scrolls instead of pushing the buttons off screen. */}
        <SafeAreaView edges={["bottom"]} style={[styles.sheet, { maxHeight: windowHeight * 0.92 }]}>
          <View style={styles.handle} />
          <ScrollView
            testID="event-detail-scroll"
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {showPhoto ? (
              <Image
                testID="event-photo"
                source={{ uri: event.imageUrl }}
                style={styles.photo}
                resizeMode="cover"
                // Decorative: the title, time and place carry the meaning.
                accessible={false}
                onError={() => setPhotoFailed(true)}
              />
            ) : null}
            <View style={styles.headerRow}>
              <Text style={styles.title} accessibilityRole="header">
                {event.title}
              </Text>
              <Pressable
                onPress={onClose}
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.facts}>
              <View style={styles.factRow}>
                <CalendarDays size={20} color={colors.tintStrong} />
                <Text style={styles.factText}>{formatEventWhen(event)}</Text>
              </View>
              <View style={styles.factRow}>
                <MapPin size={20} color={colors.tintStrong} />
                <Text style={styles.factText}>
                  {[
                    formatEventPlace(event),
                    event.address && !formatEventPlace(event).includes(event.address)
                      ? event.address
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
            </View>

            {event.summary ? <Text style={styles.summary}>{event.summary}</Text> : null}
            <Text style={styles.source} maxFontSizeMultiplier={fontScaleLimit.meta}>
              Listed by {event.sourceName}
              {event.cost ? ` · ${event.cost}` : ""}. Times and places can change; check the
              organizer.
            </Text>

            <Pressable
              onPress={() => void openExternalUrl(event.url)}
              style={styles.primary}
              accessibilityRole="link"
              accessibilityLabel={`Open on ${event.sourceName}`}
            >
              <Text style={styles.primaryText} maxFontSizeMultiplier={fontScaleLimit.action}>
                Open on {event.sourceName}
              </Text>
              <ExternalLink size={18} color={colors.onTintStrong} />
            </Pressable>

            <View style={styles.actions}>
              <View style={styles.action}>
                <SaveEventButton saved={saved} title={event.title} onPress={onToggleSave} />
                <Text style={styles.actionLabel} maxFontSizeMultiplier={fontScaleLimit.meta}>
                  {saved ? "Saved" : "Save"}
                </Text>
              </View>
              <Pressable
                onPress={() => void onCalendar()}
                style={styles.action}
                accessibilityRole="button"
                accessibilityLabel="Add to calendar"
                accessibilityHint="Opens your calendar's new event screen. Abridgd does not read your calendar."
              >
                <View style={styles.iconButton}>
                  <CalendarPlus size={22} color={colors.label} />
                </View>
                <Text style={styles.actionLabel} maxFontSizeMultiplier={fontScaleLimit.meta}>
                  Calendar
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void onShare()}
                style={styles.action}
                accessibilityRole="button"
                accessibilityLabel="Share event"
              >
                <View style={styles.iconButton}>
                  <Share2 size={22} color={colors.label} />
                </View>
                <Text style={styles.actionLabel} maxFontSizeMultiplier={fontScaleLimit.meta}>
                  Share
                </Text>
              </Pressable>
            </View>

            <Text
              style={styles.status}
              accessibilityLiveRegion="polite"
              maxFontSizeMultiplier={fontScaleLimit.meta}
            >
              {status ??
                "Calendar opens your own calendar app's new-event screen. Abridgd never reads your calendar."}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: "flex-end" },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacing.lg - 4,
      paddingTop: spacing.sm + 4,
      paddingBottom: spacing.md,
    },
    scroll: { flexShrink: 1 },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.opaqueSeparator,
      marginBottom: spacing.md,
    },
    photo: {
      width: "100%",
      aspectRatio: 16 / 9,
      maxHeight: 220,
      borderRadius: 14,
      marginBottom: spacing.md,
      backgroundColor: colors.secondaryBackground,
    },
    headerRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
    title: {
      flex: 1,
      fontFamily: typography.fontFamily.serifBold,
      fontSize: 26,
      lineHeight: 31,
      color: colors.label,
    },
    iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    facts: { marginTop: spacing.sm + 6, gap: 12 },
    factRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    factText: {
      flex: 1,
      fontFamily: typography.fontFamily.sans,
      fontSize: 15,
      color: colors.label,
    },
    summary: {
      marginTop: spacing.md,
      fontFamily: typography.fontFamily.sans,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    source: {
      marginTop: spacing.sm + 4,
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textTertiary,
    },
    primary: {
      marginTop: spacing.md + 4,
      minHeight: 52,
      borderRadius: 14,
      backgroundColor: colors.tintStrong,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    primaryText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 16,
      fontWeight: "600",
      color: colors.onTintStrong,
    },
    actions: { marginTop: spacing.sm + 4, flexDirection: "row", justifyContent: "space-around" },
    action: { alignItems: "center", minWidth: 72, minHeight: 64 },
    actionLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      color: colors.textSecondary,
    },
    status: {
      marginTop: spacing.sm,
      textAlign: "center",
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textTertiary,
    },
  });
