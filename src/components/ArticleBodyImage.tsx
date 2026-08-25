import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { ImageOff } from "lucide-react-native";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const LOADING_HEIGHT = 220;
const COMPRESSED_HEIGHT = 200;
const MIN_ASPECT_RATIO = 0.5; // very tall images are clamped so they don't dominate the layout
const MAX_ASPECT_RATIO = 3; // very wide/short images are clamped so they don't collapse to a sliver

interface ArticleBodyImageProps {
  uri: string;
  caption?: string;
  compressed?: boolean;
}

/**
 * Renders an in-article image at its true aspect ratio instead of hard-cropping it into a
 * fixed-height band, and falls back to a visible placeholder (instead of a blank box) when
 * the image fails to load — broken/hotlink-blocked/CORS-blocked images are common enough
 * across these RSS sources that silent failure reads as a bug.
 */
export const ArticleBodyImage: React.FC<ArticleBodyImageProps> = ({ uri, caption, compressed }) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setAspectRatio(null);

    if (compressed) return; // compressed mode intentionally keeps a fixed, smaller footprint

    let cancelled = false;
    Image.getSize(
      uri,
      (width, height) => {
        if (cancelled || !width || !height) return;
        const ratio = Math.min(MAX_ASPECT_RATIO, Math.max(MIN_ASPECT_RATIO, width / height));
        setAspectRatio(ratio);
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [uri, compressed]);

  if (failed) {
    return (
      <View style={[styles.imageFallback, compressed && styles.imageFallbackCompressed]}>
        <ImageOff size={28} color={colors.textSecondary} strokeWidth={1.5} />
        <Text style={styles.imageFallbackText}>Image unavailable</Text>
      </View>
    );
  }

  return (
    <View>
      <Image
        testID="article-body-image"
        source={{ uri }}
        style={
          compressed
            ? [styles.image, styles.imageCompressed]
            : [styles.image, aspectRatio ? { aspectRatio } : { height: LOADING_HEIGHT }]
        }
        resizeMode={compressed ? "center" : "cover"}
        onError={() => setFailed(true)}
      />
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    image: {
      width: "100%",
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    imageCompressed: {
      height: COMPRESSED_HEIGHT,
      opacity: 0.85,
    },
    imageFallback: {
      width: "100%",
      height: LOADING_HEIGHT,
      borderRadius: 12,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    imageFallbackCompressed: {
      height: COMPRESSED_HEIGHT,
    },
    imageFallbackText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      color: colors.textSecondary,
    },
    caption: {
      marginTop: spacing.sm,
      fontFamily: typography.fontFamily.sans,
      fontSize: 13,
      color: colors.textSecondary,
      fontStyle: "italic",
      textAlign: "center",
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
  });
