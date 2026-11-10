import React, { useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { ImageOff } from "lucide-react-native";
import { ZoomModal } from "./ZoomModal";
import { ZoomableImage } from "./ZoomableImage";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export interface GalleryPhoto {
  uri: string;
  caption?: string;
  /** Photo attribution, shown under the caption in a quieter style. */
  credit?: string;
}

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  /** Data-saver mode: smaller photos. */
  compressed?: boolean;
}

const CARD_GAP = spacing.sm + 2;
const MAX_CARD_WIDTH = 340;

/**
 * A horizontal strip of every photo in a story, each with its caption and credit. Photos snap
 * into place; tapping one opens the full-screen zoom viewer. Renders nothing for fewer than two
 * photos, so single-photo stories look exactly as they did.
 *
 * The strip bleeds to the screen edges (negative margin) and pads its own content by the
 * gutter, so the first photo lines up with the article text and the next one peeks in.
 */
export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, compressed }) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState<GalleryPhoto | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  if (photos.length < 2) return null;

  const cardWidth = Math.min(Math.round(windowWidth * 0.78), MAX_CARD_WIDTH);
  const step = cardWidth + CARD_GAP;
  const imageHeight = Math.round((cardWidth * 3) / 4) * (compressed ? 0.75 : 1);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / step);
    setIndex(Math.max(0, Math.min(photos.length - 1, next)));
  };

  return (
    <View style={styles.wrap} accessibilityLabel={`${photos.length} photos from this story`}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        contentContainerStyle={styles.strip}
        onMomentumScrollEnd={onScrollEnd}
        testID="photo-gallery-strip"
      >
        {photos.map((photo, i) => (
          <View key={`${photo.uri}-${i}`} style={{ width: cardWidth }}>
            {failed[photo.uri] ? (
              <View style={[styles.image, styles.fallback, { height: imageHeight }]}>
                <ImageOff size={24} color={colors.textSecondary} strokeWidth={1.5} />
                <Text style={styles.fallbackText}>Image unavailable</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => setZoomed(photo)}
                accessibilityRole="imagebutton"
                accessibilityLabel={`Photo ${i + 1} of ${photos.length}${
                  photo.caption ? `: ${photo.caption}` : ""
                }`}
                accessibilityHint="Opens the photo full screen"
              >
                <Image
                  source={{ uri: photo.uri }}
                  style={[styles.image, { height: imageHeight }]}
                  resizeMode="cover"
                  onError={() => setFailed((prev) => ({ ...prev, [photo.uri]: true }))}
                />
              </Pressable>
            )}
            {photo.caption ? (
              <Text style={styles.caption} numberOfLines={4}>
                {photo.caption}
              </Text>
            ) : null}
            {photo.credit ? (
              <Text style={styles.credit} accessibilityLabel={`Photo credit: ${photo.credit}`}>
                {photo.credit}
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no">
        {photos.map((photo, i) => (
          <View key={`${photo.uri}-dot-${i}`} style={[styles.dot, i === index && styles.dotOn]} />
        ))}
      </View>
      <Text style={styles.count} accessibilityLiveRegion="polite">
        {index + 1} of {photos.length} photos · tap to enlarge
      </Text>

      {/* Mounted only while open, like the single-photo component. */}
      {zoomed ? (
        <ZoomModal visible onClose={() => setZoomed(null)}>
          <ZoomableImage
            uri={zoomed.uri}
            accessibilityLabel={zoomed.caption || "Photo"}
            onDismiss={() => setZoomed(null)}
          />
        </ZoomModal>
      ) : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      marginHorizontal: -spacing.gutter,
      marginVertical: spacing.lg,
    },
    strip: {
      paddingHorizontal: spacing.gutter,
      gap: CARD_GAP,
    },
    image: {
      width: "100%",
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    fallback: {
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    fallbackText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      color: colors.textSecondary,
    },
    caption: {
      marginTop: spacing.sm,
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      lineHeight: 18,
      color: colors.text,
    },
    credit: {
      marginTop: 2,
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      color: colors.textSecondary,
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      marginTop: spacing.md,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.textSecondary,
      opacity: 0.35,
    },
    dotOn: {
      backgroundColor: colors.primary,
      opacity: 1,
    },
    count: {
      marginTop: spacing.sm,
      textAlign: "center",
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
