import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, Linking } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
// MOCK_ARTICLES import removed
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useSettings } from '../context/SettingsContext';
import { AbridgedReader } from '../components/AbridgedReader';
import { ScaleButton } from '../components/ScaleButton';
import { GroundingOverlay } from '../components/GroundingOverlay';
import { parseHtmlContent } from '../utils/contentParser';
import { Waypoints, Zap, Bookmark } from 'lucide-react-native';
import { useSavedArticles } from '../context/SavedArticlesContext';

type ArticleScreenRouteProp = RouteProp<RootStackParamList, 'Article'>;

import { fetchFullArticleBody } from '../services/FullStoryService';
import { summarizeArticle } from '../services/AiService';

export const ArticleScreen: React.FC = () => {
    const route = useRoute<ArticleScreenRouteProp>();
    const { article } = route.params;
    const { saveArticle, unsaveArticle, isArticleSaved } = useSavedArticles();
    const isSaved = isArticleSaved(article.id);

    // Use local state for body so we can update it
    const [bodyContent, setBodyContent] = useState(article.body);
    const [isLoadingFullStory, setIsLoadingFullStory] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const { isReaderEnabled, isGroundingEnabled, isSummarizationEnabled } = useSettings();

    // If article is sensitive, show warning by default.
    const [isGroundingActive, setIsGroundingActive] = useState(false);
    const [isReaderExpanded, setIsReaderExpanded] = useState(false);
    const [hasConsented, setHasConsented] = useState(!article?.isSensitive || !isGroundingEnabled);

    // Attempt to fetch full story if content is short (likely just a summary)
    // OR if the source is known to provide truncated RSS feeds (WTAE, WPXI, CBS)
    useEffect(() => {
        const fetchFull = async () => {
             const isTruncatedSource = ['WTAE', 'WPXI', 'CBS', 'City Paper'].some(s => article.source.includes(s));
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


    if (!article) {
        return (
            <View style={styles.container}>
                <Text>Article not found</Text>
            </View>
        );
    }

    if (isGroundingActive) {
        return <GroundingOverlay onClose={() => setIsGroundingActive(false)} />;
    }

    if (!hasConsented) {
        return (
            <View style={styles.warningContainer}>
                <Text style={styles.warningTitle}>Sensitive Content</Text>
                <Text style={styles.warningText}>
                    {article.sensitivityWarning || "This article contains sensitive material."}
                </Text>

                <ScaleButton style={styles.warningButton} onPress={() => setHasConsented(true)}>
                    <Text style={styles.warningButtonText}>View Article</Text>
                </ScaleButton>

                <ScaleButton style={styles.groundButton} onPress={() => setIsGroundingActive(true)}>
                    <Text style={styles.groundButtonText}>I need a moment (Grounding Mode)</Text>
                </ScaleButton>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
                        <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start' }} />
                    ) : (
                        <Text style={styles.summaryText}>{summary}</Text>
                    )}
                </View>
            )}

            {isReaderEnabled && (
                <View style={styles.abridgedSection}>
                    <ScaleButton 
                        style={[styles.abridgedToggleButton, isReaderExpanded && styles.abridgedActiveButton]} 
                        onPress={() => setIsReaderExpanded(!isReaderExpanded)}
                    >
                        <View style={styles.buttonContent}>
                            <Waypoints size={18} color={isReaderExpanded ? colors.surface : colors.primary} strokeWidth={2.5} />
                            <Text style={[styles.abridgedToggleButtonText, isReaderExpanded && styles.abridgedActiveButtonText]}>
                                {isReaderExpanded ? 'Hide Abridged Reader' : 'Abridged Reader'}
                            </Text>
                        </View>
                    </ScaleButton>
                    
                    {isReaderExpanded && <AbridgedReader content={bodyContent} />}
                </View>
            )}

            {parseHtmlContent(bodyContent).map((node, index) => {
                if (node.type === 'text' && node.text) {
                     // Check for credit pattern (Credits often start with "Photo:" or are short italicized lines at end)
                     // This is a naive heuristic but works for many feeds
                     const isCredit = node.text.startsWith('Photo:') || node.text.startsWith('Credit:') || (node.text.length < 50 && node.text.includes('Photo by'));
                     
                     if (isCredit) {
                         return <Text key={index} style={styles.credit}>{node.text}</Text>;
                     }

                     return (
                         <Text key={index} style={styles.paragraph}>
                             {node.text}
                         </Text>
                     );
                } else if (node.type === 'image' && node.src) {
                     return (
                         <View key={index} style={styles.imageContainer}>
                            <Image 
                                source={{ uri: node.src.startsWith('http') ? node.src : `https:${node.src}` }} 
                                style={styles.image} 
                                resizeMode="cover"
                            />
                            {node.caption && <Text style={styles.caption}>{node.caption}</Text>}
                         </View>
                     );
                } else if (node.type === 'header' && node.text) {
                    return (
                        <Text key={index} style={styles.subhead}>
                            {node.text}
                        </Text>
                    );
                }
                return null;
            })}
            
            <View style={styles.actionButtons}>
                 {article.link && (
                    <ScaleButton style={styles.sourceButton} onPress={() => Linking.openURL(article.link!)}>
                        <Text style={styles.sourceButtonText}>Read Full Story on Web</Text>
                    </ScaleButton>
                 )}

                <ScaleButton 
                    style={[styles.actionButton, isSaved && styles.actionButtonSaved]} 
                    onPress={() => isSaved ? unsaveArticle(article.id) : saveArticle(article)}
                >
                    <Bookmark size={18} color={isSaved ? colors.surface : colors.primary} />
                    <Text style={[styles.actionButtonText, isSaved && styles.actionButtonTextSaved]}>
                        {isSaved ? 'Saved' : 'Save for Later'}
                    </Text>
                </ScaleButton>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flexGrow: 1,
        padding: spacing.gutter,
        paddingBottom: spacing.xxl,
        maxWidth: 800, // Limit width for readability on large screens
        width: '100%',
        alignSelf: 'center',
    },
    headline: {
        fontFamily: typography.fontFamily.serif,
        fontSize: 32, // Larger, more newspaper-like
        fontWeight: '800',
        color: colors.text,
        marginBottom: spacing.md,
        lineHeight: 42,
        letterSpacing: -0.5,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.xs,
    },
    source: {
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.size.sm,
        fontWeight: '700',
        color: colors.primary, // Pop color
        textTransform: 'uppercase',
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
        fontWeight: '500',
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
        color: '#2c2c2c', // Slightly softer text
        marginBottom: spacing.lg,
    },
    imageContainer: {
        marginVertical: spacing.lg,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        backgroundColor: colors.surface,
        borderRadius: 12,
        overflow: 'hidden', // Clip caption if needed, mainly for shadow
    },
    image: {
        width: '100%',
        height: 300, // Taller default
        borderRadius: 12,
        backgroundColor: colors.border,
    },
    caption: {
        marginTop: spacing.sm,
        fontFamily: typography.fontFamily.sans,
        fontSize: 13,
        color: colors.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm, // Space inside container
    },
    credit: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 10,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: -spacing.md, // Pull up closer to image if it follows immediately
    },
    subhead: {
        fontFamily: typography.fontFamily.sans, // Contrast with body
        fontSize: 22,
        fontWeight: '700',
        marginBottom: spacing.md,
        marginTop: spacing.xl,
        color: colors.text,
        letterSpacing: -0.3,
    },
    sectionHeader: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
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
        backgroundColor: '#F7F7F0',
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
        fontStyle: 'italic',
    },
    abridgedToggleButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 50,
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: spacing.md,
    },
    abridgedActiveButton: {
        backgroundColor: colors.primary,
    },
    abridgedToggleButtonText: {
        color: colors.primary,
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    abridgedActiveButtonText: {
        color: colors.surface,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
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
        alignItems: 'center',
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
        fontWeight: '600',
    },
    warningContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    warningTitle: {
        fontFamily: typography.fontFamily.serif,
        fontSize: typography.size.xl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
    },
    warningText: {
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.size.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    warningButton: {
        backgroundColor: colors.text, // Stark/Bold
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 4,
        marginBottom: spacing.md,
        width: '100%',
        alignItems: 'center',
    },
    warningButtonText: {
        color: colors.surface,
        fontFamily: typography.fontFamily.sans,
        fontWeight: '600',
    },
    groundButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 4,
        width: '100%',
        alignItems: 'center',
    },
    groundButtonText: {
        color: colors.primary,
        fontFamily: typography.fontFamily.sans,
        fontWeight: '600',
    },
    loadingContainer: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        gap: spacing.sm,
        backgroundColor: 'rgba(249, 249, 247, 0.8)', // Match background with opacity
        marginHorizontal: spacing.gutter,
        borderRadius: 12,
    },
    loadingText: {
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.size.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    sourceButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 8,
        marginTop: spacing.lg,
        alignItems: 'center',
    },
    sourceButtonText: {
        color: colors.surface,
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.size.md,
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: 'transparent',
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
        fontWeight: '600',
    },
    actionButtonTextSaved: {
        color: colors.surface,
    }
});
