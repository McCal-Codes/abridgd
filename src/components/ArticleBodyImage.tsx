import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ImageOff } from "lucide-react-native";
import { ZoomModal } from "./ZoomModal";
import { ZoomableImage } from "./ZoomableImage";
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
  /** Photo attribution, rendered under the caption in a quieter style. */
  credit?: string;
  compressed?: boolean;
}

/**
 * Renders an in-article image at its true aspect ratio instead of hard-cropping it into a
 * fixed-height band, and falls back to a visible placeholder (instead of a blank box) when
 * the image fails to load — broken/hotlink-blocked/CORS-blocked images are common enough
 * across these RSS sources that silent failure reads as a bug.
 */
export const ArticleBodyImage: React.FC<ArticleBodyImageProps> = ({
  uri,
  caption,
  credit,
  compressed,
}) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setAspectRatio(null);
  }, [uri]);

  /** Clamped so a very tall image can't dominate the article and a very wide one can't
   * collapse to a sliver. */
  const applyDimensions = (width: number, height: number) => {
    if (!width || !height) return;
    setAspectRatio(Math.min(MAX_ASPECT_RATIO, Math.max(MIN_ASPECT_RATIO, width / height)));
  };

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
      <Pressable
        onPress={() => setZoomed(true)}
        accessibilityRole="imagebutton"
        accessibilityLabel={caption ? `Photo: ${caption}` : "Photo"}
        accessibilityHint="Opens the photo full screen"
      >
        <Image
          testID="article-body-image"
          source={{ uri }}
          style={
            compressed
              ? [styles.image, styles.imageCompressed]
              : [styles.image, aspectRatio ? { aspectRatio } : { height: LOADING_HEIGHT }]
          }
          resizeMode={compressed ? "center" : "cover"}
          // Sized from the image that is already loading. Image.getSize used to run first,
          // which meant every in-article photo was fetched twice — once to measure, once to
          // render — on an article that can carry a dozen of them.
          onLoad={(event) => {
            if (compressed) return; // compressed mode keeps a fixed, smaller footprint
            const { width, height } = event.nativeEvent.source;
            applyDimensions(width, height);
          }}
          onError={() => setFailed(true)}
        />
      </Pressable>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {credit ? (
        <Text style={[styles.caption, styles.credit]} accessibilityLabel={`Photo credit: ${credit}`}>
          {credit}
        </Text>
      ) : null}

      {/* Mounted only while open: an article can hold a dozen images, and a dozen always-mounted
          Modals is a dozen render trees kept alive for a view nobody has asked for yet. */}
      {zoomed ? (
        <ZoomModal visible onClose={() => setZoomed(false)}>
          <ZoomableImage
            uri={uri}
            accessibilityLabel={caption || "Photo"}
            onDismiss={() => setZoomed(false)}
          />
        </ZoomModal>
      ) : null}
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
    credit: {
      marginTop: 2,
      fontSize: 12,
      fontStyle: "normal",
      opacity: 0.8,
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
