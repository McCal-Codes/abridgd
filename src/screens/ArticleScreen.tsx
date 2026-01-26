import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { fetchFullArticleBody } from "../services/FullStoryService";
import { summarizeArticle } from "../services/AiService";
// MOCK_ARTICLES import removed
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useSettings } from "../context/SettingsContext";
import { AbridgedReader } from "../components/AbridgedReader";
import { ScaleButton } from "../components/ScaleButton";
import { GroundingOverlay } from "../components/GroundingOverlay";
import { parseHtmlContent } from "../utils/contentParser";
import { Waypoints, Zap, Bookmark, Wind, ArrowRightCircle } from "lucide-react-native";
import { useSavedArticles } from "../context/SavedArticlesContext";
import { useReadingProgress, useReadingProgressOptional } from "../context/ReadingProgressContext";
import {
  assessArticleSensitivity,
  formatWarningReasons,
  warningCopy,
  guidanceMessages,
} from "../utils/sensitivity";
import { logSensitiveArticleResponse, logArticleEmotion } from "../services/UserBehaviorLogger";
import { EmotionPicker } from "../components/EmotionPicker";

type ArticleScreenRouteProp = RouteProp<RootStackParamList, "Article">;

export const ArticleScreen: React.FC = () => {
  const route = useRoute<ArticleScreenRouteProp>();
  const navigation = useNavigation();
  const { article } = route.params;
  const { saveArticle, unsaveArticle, isArticleSaved } = useSavedArticles();
  // Use optional hook in case tests render ArticleScreen without provider
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { updateProgress, getProgress } = useReadingProgressOptional
    ? useReadingProgressOptional()
    : useReadingProgress();
  const isSaved = isArticleSaved(article.id);
  const isTestEnvironment =
    typeof process !== "undefined" && process.env.JEST_WORKER_ID !== undefined;

  // Gesture state
  const translateX = useSharedValue(0);
  const [gestureActive, setGestureActive] = useState(false);

  // Reading progress state
  const [readStartTime] = useState(Date.now());
  const readingTimeIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [pendingRestoreOffset, setPendingRestoreOffset] = useState<number | null>(null);
  const [initialScrollRestored, setInitialScrollRestored] = useState(false);

  // Use local state for body so we can update it
  const [bodyContent, setBodyContent] = useState(article.body);
  const [isLoadingFullStory, setIsLoadingFullStory] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const {
    isReaderEnabled,
    isGroundingEnabled,
    isSummarizationEnabled,
    autoSaveOnComplete,
    fontSize,
    lineHeight,
    imageLoadingMode,
    sensitivePromptLevel,
    sensitiveActionPreference,
    sensitiveTone,
  } = useSettings();
  const insets = useSafeAreaInsets();
  const {
    tabBarHeight,
    tabBarBlur,
    allowContentUnderTabBar,
    tabBarStyle,
    tabBarDockedHeight,
    tabBarFloatingHeight,
  } = useSettings();

  const sensitivity = useMemo(() => assessArticleSensitivity(article), [article]);
  const gatingEnabled = isGroundingEnabled && sensitivePromptLevel !== "off";
  const shouldGate = gatingEnabled && sensitivity.shouldOfferGrounding;

  // Get top 1-2 warnings, prioritizing high-severity ones
  const topWarnings = useMemo(() => {
    const sorted = [...sensitivity.reasons].sort((a, b) => {
      const highSeverity = [
        "violence-realistic",
        "violence-graphic",
        "war",
        "terrorism",
        "disaster",
        "self-harm",
        "abuse",
        "sexual-content-graphic",
        "hate-speech",
        "graphic",
      ];
      const aIsHigh = highSeverity.includes(a);
      const bIsHigh = highSeverity.includes(b);
      if (aIsHigh && !bIsHigh) return -1;
      if (!aIsHigh && bIsHigh) return 1;
      return 0;
    });
    return sorted.slice(0, 2);
  }, [sensitivity.reasons]);

  // If article is sensitive, show warning by default.
  const [isGroundingActive, setIsGroundingActive] = useState(false);
  const [isReaderExpanded, setIsReaderExpanded] = useState(false);
  const [hasConsented, setHasConsented] = useState(!shouldGate);
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [finishedReading, setFinishedReading] = useState(false);

  useEffect(() => {
    setHasConsented(!shouldGate);
  }, [shouldGate, article.id]);

  // Restore prior reading position once content is measured
  useEffect(() => {
    const progress = getProgress?.(article.id);
    if (progress?.scrollPixels != null && !initialScrollRestored) {
      setPendingRestoreOffset(progress.scrollPixels);
    }
  }, [article.id, getProgress, initialScrollRestored]);

  const warningSummaryBase = useMemo(() => {
    if (article.sensitivityWarning) {
      return article.sensitivityWarning;
    }
    if (!topWarnings.length) {
      return "This article may include sensitive material.";
    }
    return `This story touches on ${formatWarningReasons(topWarnings)}.`;
  }, [article.sensitivityWarning, topWarnings]);

  const warningGuidanceList = guidanceMessages(sensitivity.reasons);

  const tonePreset = useMemo(() => {
    if (sensitiveTone === "direct") {
      return {
        heading: "Sensitive topic ahead",
        helper: "Skip grounding if you're ready to keep reading.",
        closer: "You're in control of the pace.",
      };
    }
    return {
      heading: "Sensitive Content",
      helper: "Take a short grounding pause or continue when you feel ready.",
      closer: "We’ll move through this together.",
    };
  }, [sensitiveTone]);

  const warningSummaryCopy = useMemo(() => {
    if (sensitivePromptLevel === "minimal" && sensitivity.reasons.length) {
      const reasons = formatWarningReasons(sensitivity.reasons);
      return sensitiveTone === "direct" ? `Heads up: ${reasons}.` : `Gentle heads-up: ${reasons}.`;
    }
    return warningSummaryBase;
  }, [sensitivePromptLevel, sensitiveTone, warningSummaryBase, sensitivity.reasons]);

  const displayedGuidance = useMemo(() => {
    if (sensitivePromptLevel === "full") {
      return warningGuidanceList;
    }
    return [];
  }, [sensitivePromptLevel, warningGuidanceList]);

  const helperCopy = useMemo(() => {
    if (sensitivePromptLevel === "minimal") {
      return sensitiveTone === "direct"
        ? "Continue whenever you’re set."
        : "Tap continue whenever you feel ready.";
    }
    return tonePreset.helper;
  }, [sensitivePromptLevel, sensitiveTone, tonePreset]);

  const showToneLine = sensitivePromptLevel === "full";

  const VideoModule = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require("expo-av");
    } catch (err) {
      console.warn("expo-av not available; video playback disabled", err);
      return null;
    }
  }, []);

  const VideoComponent = VideoModule?.Video ?? null;

  const normalizeUri = (uri?: string) => {
    if (!uri) return uri;
    if (uri.startsWith("http:")) return uri.replace("http:", "https:");
    if (!uri.startsWith("http")) return `https:${uri}`;
    return uri;
  };

  const parsedContent = useMemo(() => {
    const nodes = parseHtmlContent(bodyContent);
    const existingSources = new Set(
      nodes
        .filter((n) => (n.type === "image" || n.type === "video") && n.src)
        .map((n) => n.src as string),
    );

    const extraVideos = (article.mediaVideos || [])
      .filter((src) => src && !existingSources.has(src))
      .map((src) => ({ type: "video" as const, src }));

    const extraImages = (article.mediaImages || [])
      .filter((src) => src && !existingSources.has(src))
      .map((src) => ({ type: "image" as const, src }));

    return [...nodes, ...extraVideos, ...extraImages];
  }, [article.mediaImages, article.mediaVideos, bodyContent]);

  // Auto-save article when reading completes (if enabled)
  const handleReaderComplete = async () => {
    if (autoSaveOnComplete && !isSaved) {
      try {
        await saveArticle(article);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.error("Failed to auto-save article:", e);
      }
    }
  };

  // Attempt to fetch full story if content is short (likely just a summary)
  // OR if the source is known to provide truncated RSS feeds (WTAE, WPXI, CBS)
  useEffect(() => {
    const fetchFull = async () => {
      const isTruncatedSource = ["WTAE", "WPXI", "CBS", "City Paper"].some((s) =>
        article.source.includes(s),
      );
      const isShort = bodyContent.length < 800; // Increased threshold

      if (article.link && (isShort || isTruncatedSource)) {
        // Avoid re-fetching if we already have a long body and it wasn't a short one
        if (!isTruncatedSource && !isShort) return;

        setIsLoadingFullStory(true);
        const fullHtml = await fetchFullArticleBody(article.link);
        if (fullHtml && fullHtml.length > bodyContent.length) {
          setBodyContent(fullHtml);
        }
        setIsLoadingFullStory(false);
      }
    };

    // Add a small delay to not block transition
    const timer = setTimeout(fetchFull, 500);
    return () => clearTimeout(timer);
  }, [article.link]);

  useEffect(() => {
    if (isSummarizationEnabled && bodyContent && !summary) {
      const getSummary = async () => {
        setIsLoadingSummary(true);
        const aiSummary = await summarizeArticle(bodyContent, article.headline);
        setSummary(aiSummary);
        setIsLoadingSummary(false);
      };
      getSummary();
    }
  }, [isSummarizationEnabled, bodyContent]);

  // Track reading time: increment every 10 seconds while article is being viewed
  useEffect(() => {
    readingTimeIntervalRef.current = setInterval(async () => {
      try {
        const progress = getProgress(article.id);
        const totalReadTimeSeconds = (progress?.totalReadTimeSeconds ?? 0) + 10;

        await updateProgress(article.id, {
          totalReadTimeSeconds,
          lastReadAt: Date.now(),
          status: "in-progress",
        });
      } catch (error) {
        console.error("Failed to update reading time:", error);
      }
    }, 10000); // Update every 10 seconds

    return () => {
      if (readingTimeIntervalRef.current) {
        clearInterval(readingTimeIntervalRef.current);
      }
    };
  }, [article.id, updateProgress, getProgress]);

  // Swipe gestures for article actions
  const handleSave = async () => {
    if (isSaved) {
      await unsaveArticle(article.id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      await saveArticle(article);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleGoBack = () => {
    // If article was sensitive and user read it, show emotion picker
    if (shouldGate && hasConsented && finishedReading) {
      setShowEmotionPicker(true);
    } else {
      navigation.goBack();
    }
  };

  const handleEmotionSelect = async (emotion: "positive" | "neutral" | "negative") => {
    await logArticleEmotion(article.id, emotion);
    navigation.goBack();
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow swipe from left edge for back navigation
      if (event.translationX > 0 && event.translationX < 200) {
        translateX.value = event.translationX;
      }
      // Swipe right from anywhere to save/unsave
      else if (event.translationX < 0 && event.translationX > -200) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const threshold = 100;
      const velocity = event.velocityX;

      // Swipe right from left edge = go back
      if (event.translationX > threshold || velocity > 800) {
        translateX.value = withSpring(400, { damping: 20, stiffness: 300 });
        runOnJS(handleGoBack)();
      }
      // Swipe left = save/unsave
      else if (event.translationX < -threshold || velocity < -800) {
        runOnJS(handleSave)();
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      }
      // Reset
      else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: interpolate(translateX.value, [-200, 0, 200], [0.7, 1, 0.7]),
  }));

  if (!article) {
    return (
      <View style={styles.container}>
        <Text>Article not found</Text>
      </View>
    );
  }

  if (isGroundingActive) {
    return (
      <GroundingOverlay
        onClose={async () => {
          // Log that user completed the breathing
          await logSensitiveArticleResponse(
            article.id,
            sensitivity.reasons,
            "breath-first",
            true, // completed breath
          );
          setIsGroundingActive(false);
          setHasConsented(true); // proceed to article after grounding
        }}
        message="You've got this. Take your time."
      />
    );
  }

  if (!hasConsented) {
    const groundButtonNode = (
      <ScaleButton
        style={[
          styles.groundButton,
          sensitiveActionPreference === "ground-first" && styles.groundButtonHero,
        ]}
        onPress={async () => {
          try {
            await Haptics.selectionAsync();
          } catch {}
          // Log that user chose to take a breath
          await logSensitiveArticleResponse(
            article.id,
            sensitivity.reasons,
            "breath-first",
            false, // hasn't completed breath yet
          );
          setIsGroundingActive(true);
        }}
      >
        <View style={styles.warningActionContent}>
          <Wind
            size={20}
            color={sensitiveActionPreference === "ground-first" ? colors.surface : colors.primary}
          />
          <Text
            style={[
              styles.groundButtonText,
              sensitiveActionPreference === "ground-first" && styles.groundButtonTextHero,
            ]}
          >
            Take a breath first
          </Text>
        </View>
      </ScaleButton>
    );

    const continueButtonNode = (
      <ScaleButton
        style={[
          styles.warningButton,
          sensitiveActionPreference === "continue" && styles.warningButtonHero,
        ]}
        onPress={async () => {
          try {
            await Haptics.selectionAsync();
          } catch {}
          // Log that user chose to skip breathing
          await logSensitiveArticleResponse(
            article.id,
            sensitivity.reasons,
            "continue-direct",
            false, // skipped breathing
          );
          setHasConsented(true);
        }}
      >
        <View style={styles.warningActionContent}>
          <ArrowRightCircle
            size={20}
            color={sensitiveActionPreference === "continue" ? colors.surface : colors.text}
          />
          <Text
            style={[
              styles.warningButtonText,
              sensitiveActionPreference === "continue" && styles.warningButtonTextHero,
            ]}
          >
            Continue without grounding
          </Text>
        </View>
      </ScaleButton>
    );

    return (
      <View style={styles.warningContainer}>
        <View style={styles.warningContent}>
          <Text style={styles.warningTitle}>{tonePreset.heading}</Text>
          <Text style={styles.warningText}>{warningSummaryCopy}</Text>
          <Text style={styles.warningHelper}>{helperCopy}</Text>
        </View>

        <View style={styles.warningActions}>
          {sensitiveActionPreference === "continue" ? (
            <>
              {continueButtonNode}
              {groundButtonNode}
            </>
          ) : (
            <>
              {groundButtonNode}
              {continueButtonNode}
            </>
          )}
        </View>
      </View>
    );
  }

  let articleContent: React.ReactNode;
  try {
    articleContent = (
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: allowContentUnderTabBar
                ? spacing.xxl + insets.bottom + 8
                : spacing.xxl +
                  (tabBarStyle === "floating"
                    ? tabBarFloatingHeight || 64
                    : tabBarDockedHeight || tabBarHeight) +
                  insets.bottom +
                  16,
            },
          ]}
          onContentSizeChange={() => {
            if (pendingRestoreOffset != null && !initialScrollRestored) {
              requestAnimationFrame(() => {
                scrollViewRef.current?.scrollTo({ y: pendingRestoreOffset, animated: false });
                setInitialScrollRestored(true);
                setPendingRestoreOffset(null);
              });
            }
          }}
          onScroll={(event) => {
            const contentHeight = event.nativeEvent.contentSize.height;
            const scrollPosition = event.nativeEvent.contentOffset.y;
            const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;

            // Calculate scroll percentage and update progress
            const scrollPercentage =
              contentHeight > 0 ? scrollPosition / (contentHeight - scrollViewHeight) : 0;
            const completionPercentage = Math.min(100, Math.round(scrollPercentage * 100));

            // Update reading progress
            updateProgress(article.id, {
              scrollPosition: scrollPercentage,
              scrollPixels: scrollPosition,
              completionPercentage,
              lastReadAt: Date.now(),
              startedAt: readStartTime,
              status: completionPercentage >= 95 ? "completed" : "in-progress",
            }).catch((error) => console.error("Failed to update scroll progress:", error));

            // Mark as finished when user scrolls near the bottom
            if (scrollPosition + scrollViewHeight >= contentHeight - 100) {
              setFinishedReading(true);
              // Update status to completed
              updateProgress(article.id, {
                status: "completed",
                completionPercentage: 100,
              }).catch((error) => console.error("Failed to mark as completed:", error));
            }
          }}
          scrollEventThrottle={16}
        >
          <View style={styles.topActions}>
            <ScaleButton
              accessibilityRole="button"
              accessibilityLabel={isSaved ? "Remove bookmark" : "Save article"}
              style={[styles.iconButton, isSaved && styles.iconButtonSaved]}
              onPress={async () => {
                const wasSaved = isSaved;
                if (wasSaved) {
                  try {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  unsaveArticle(article.id);
                } else {
                  try {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  } catch {}
                  saveArticle(article);
                }
              }}
            >
              <Bookmark size={22} color={isSaved ? colors.surface : colors.primary} />
            </ScaleButton>
          </View>

          <Text style={styles.headline}>{article.headline}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.source}>{article.source}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.timestamp}>{article.timestamp}</Text>
          </View>

          <View style={styles.divider} />

          {isLoadingFullStory && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Fetching full story...</Text>
            </View>
          )}

          {isSummarizationEnabled && (summary || isLoadingSummary) && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionHeader}>AI Summary</Text>
              {isLoadingSummary ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ alignSelf: "flex-start" }}
                />
              ) : (
                <Text style={styles.summaryText}>{summary}</Text>
              )}
            </View>
          )}

          {isReaderEnabled && (
            <View style={styles.abridgedSection}>
              <ScaleButton
                style={[
                  styles.abridgedToggleButton,
                  isReaderExpanded && styles.abridgedActiveButton,
                ]}
                onPress={async () => {
                  try {
                    await Haptics.selectionAsync();
                  } catch {}
                  setIsReaderExpanded(!isReaderExpanded);
                }}
              >
                <View style={styles.buttonContent}>
                  <Waypoints
                    size={18}
                    color={isReaderExpanded ? colors.surface : colors.primary}
                    strokeWidth={2.5}
                  />
                  <Text
                    style={[
                      styles.abridgedToggleButtonText,
                      isReaderExpanded && styles.abridgedActiveButtonText,
                    ]}
                  >
                    {isReaderExpanded ? "Hide Abridged Reader" : "Abridged Reader"}
                  </Text>
                </View>
              </ScaleButton>

              {isReaderExpanded && (
                <AbridgedReader content={bodyContent} onComplete={handleReaderComplete} />
              )}
            </View>
          )}

          {parsedContent.map((node, index) => {
            if (node.type === "text" && node.text) {
              // Check for credit pattern (Credits often start with "Photo:" or are short italicized lines at end)
              // This is a naive heuristic but works for many feeds
              const isCredit =
                node.text.startsWith("Photo:") ||
                node.text.startsWith("Credit:") ||
                (node.text.length < 50 && node.text.includes("Photo by"));

              if (isCredit) {
                return (
                  <Text key={index} style={styles.credit}>
                    {node.text}
                  </Text>
                );
              }

              return (
                <Text
                  key={index}
                  style={[
                    styles.paragraph,
                    { fontSize: 18 * fontSize, lineHeight: 18 * fontSize * lineHeight },
                  ]}
                >
                  {node.text}
                </Text>
              );
            } else if (node.type === "image" && node.src) {
              // Respect image loading preference
              if (imageLoadingMode === "text-only") {
                return null; // Skip images entirely in text-only mode
              }

              return (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    source={{ uri: normalizeUri(node.src)! }}
                    style={[
                      styles.image,
                      imageLoadingMode === "compressed" && styles.imageCompressed,
                    ]}
                    resizeMode={imageLoadingMode === "compressed" ? "center" : "cover"}
                  />
                  {node.caption && <Text style={styles.caption}>{node.caption}</Text>}
                </View>
              );
            } else if (node.type === "video" && node.src) {
              if (imageLoadingMode === "text-only") return null;

              const uri = normalizeUri(node.src)!;
              const canInline = !!VideoComponent;
              return (
                <View key={index} style={styles.videoContainer}>
                  {canInline ? (
                    <VideoComponent
                      source={{ uri }}
                      style={styles.video}
                      useNativeControls
                      resizeMode={"contain"}
                      isLooping={false}
                    />
                  ) : (
                    <Text style={styles.caption}>
                      Inline video not available in this build. Open in browser instead.
                    </Text>
                  )}
                  {node.caption && <Text style={styles.caption}>{node.caption}</Text>}
                  <ScaleButton style={styles.videoOpenButton} onPress={() => Linking.openURL(uri)}>
                    <Text style={styles.videoOpenText}>Open video in browser</Text>
                  </ScaleButton>
                </View>
              );
            } else if (node.type === "header" && node.text) {
              return (
                <Text
                  key={index}
                  style={[
                    styles.subhead,
                    { fontSize: 22 * fontSize, lineHeight: 22 * fontSize * lineHeight },
                  ]}
                >
                  {node.text}
                </Text>
              );
            }
            return null;
          })}

          <View style={styles.actionButtons}>
            {article.link && (
              <ScaleButton
                style={styles.sourceButton}
                onPress={async () => {
                  try {
                    await Haptics.selectionAsync();
                  } catch {}
                  Linking.openURL(article.link!);
                }}
              >
                <Text style={styles.sourceButtonText}>Read Full Story on Web</Text>
              </ScaleButton>
            )}

            <ScaleButton
              style={[styles.actionButton, isSaved && styles.actionButtonSaved]}
              onPress={async () => {
                const wasSaved = isSaved;
                if (wasSaved) {
                  try {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  unsaveArticle(article.id);
                } else {
                  try {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  } catch {}
                  saveArticle(article);
                }
              }}
            >
              <Bookmark size={18} color={isSaved ? colors.surface : colors.primary} />
              <Text style={[styles.actionButtonText, isSaved && styles.actionButtonTextSaved]}>
                {isSaved ? "Saved" : "Save for Later"}
              </Text>
            </ScaleButton>
          </View>
        </ScrollView>
      </Animated.View>
    );
  } catch (error) {
    console.error("ArticleScreen content render error", error);
    throw error;
  }

  if (isTestEnvironment) {
    return articleContent;
  }

  return (
    <>
      <GestureDetector gesture={swipeGesture}>{articleContent}</GestureDetector>
      <EmotionPicker
        visible={showEmotionPicker}
        onSelect={handleEmotionSelect}
        onDismiss={() => {
          setShowEmotionPicker(false);
          navigation.goBack();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topActions: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: spacing.sm,
  },
  iconButton: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  iconButtonSaved: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  content: {
    flexGrow: 1,
    padding: spacing.gutter,
    paddingBottom: spacing.xxl,
    maxWidth: 800, // Limit width for readability on large screens
    width: "100%",
    alignSelf: "center",
  },
  headline: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 32, // Larger, more newspaper-like
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  source: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    fontWeight: "700",
    color: colors.primary, // Pop color
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dot: {
    marginHorizontal: spacing.sm, // More space
    color: colors.border,
    fontSize: 10,
  },
  timestamp: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xl, // More space before content
    opacity: 0.5,
  },
  paragraph: {
    fontFamily: typography.fontFamily.serif, // "Georgia" or similar
    fontSize: 18, // Comfortable reading size
    lineHeight: 30, // 1.6 ratio often ideal
    color: "#2c2c2c", // Slightly softer text
    marginBottom: spacing.lg,
  },
  imageContainer: {
    marginVertical: spacing.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden", // Clip caption if needed, mainly for shadow
  },
  image: {
    width: "100%",
    height: 300, // Taller default
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  imageCompressed: {
    height: 200, // Reduce height for compressed mode to save data
    opacity: 0.85, // Subtle visual feedback that image is compressed
  },
  caption: {
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm, // Space inside container
  },
  videoContainer: {
    marginVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  videoOpenButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  videoOpenText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  credit: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: -spacing.md, // Pull up closer to image if it follows immediately
  },
  subhead: {
    fontFamily: typography.fontFamily.sans, // Contrast with body
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.md,
    marginTop: spacing.xl,
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionHeader: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  abridgedSection: {
    marginBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.lg,
  },
  summarySection: {
    backgroundColor: "#F7F7F0",
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summaryText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    fontStyle: "italic",
  },
  abridgedToggleButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 50,
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: spacing.md,
  },
  abridgedActiveButton: {
    backgroundColor: colors.primary,
  },
  abridgedToggleButtonText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  abridgedActiveButtonText: {
    color: colors.surface,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  actionButtons: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  abridgedButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  abridgedButtonText: {
    color: colors.surface,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.md,
    fontWeight: "600",
  },
  warningContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: "column",
  },
  warningContent: {
    alignItems: "center",
    gap: 0,
    marginBottom: spacing.xl,
  },
  warningTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  warningText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 18,
    lineHeight: 28,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
  warningList: {
    width: "100%",
    marginBottom: spacing.sm,
    gap: spacing.xs,
    alignItems: "center",
  },
  warningListItem: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    textAlign: "center",
    opacity: 0.85,
    maxWidth: 320,
  },
  warningHelper: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: "center",
    maxWidth: 320,
  },
  warningTone: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
    letterSpacing: 0.5,
    maxWidth: 320,
  },
  warningActions: {
    width: "100%",
    gap: spacing.md,
    alignSelf: "center",
    marginTop: spacing.md,
  },
  warningActionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  warningButton: {
    backgroundColor: "rgba(15, 23, 42, 0.08)",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  warningButtonHero: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  warningButtonText: {
    color: colors.text,
    fontFamily: typography.fontFamily.sans,
    fontWeight: "600",
    fontSize: typography.size.lg,
  },
  warningButtonTextHero: {
    color: colors.surface,
  },
  groundButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  groundButtonHero: {
    backgroundColor: colors.primary,
  },
  groundButtonText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.sans,
    fontWeight: "600",
    fontSize: typography.size.lg,
  },
  groundButtonTextHero: {
    color: colors.surface,
  },
  loadingContainer: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: "rgba(249, 249, 247, 0.8)", // Match background with opacity
    marginHorizontal: spacing.gutter,
    borderRadius: 12,
  },
  loadingText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.primary,
    fontWeight: "600",
  },
  sourceButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.lg,
    alignItems: "center",
  },
  sourceButtonText: {
    color: colors.surface,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.md,
    fontWeight: "600",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  actionButtonSaved: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.md,
    fontWeight: "600",
  },
  actionButtonTextSaved: {
    color: colors.surface,
  },
});
