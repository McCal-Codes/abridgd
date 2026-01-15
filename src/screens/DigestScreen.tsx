
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { fetchDailyDigest, DigestItem } from '../services/AiService';
import { FunLoadingIndicator } from '../components/FunLoadingIndicator';
import { ArrowRight, Newspaper } from 'lucide-react-native';
import { ScaleButton } from '../components/ScaleButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

interface DigestScreenProps {
    isWelcomeBack?: boolean;
    onContinue?: () => void;
}

export const DigestScreen: React.FC<DigestScreenProps> = ({ isWelcomeBack, onContinue }) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { lastAppVisit, updateLastAppVisit, digestSummaryMode } = useSettings();
    const [digest, setDigest] = useState<DigestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();
    const { tabBarHeight, tabBarBlur, allowContentUnderTabBar } = useSettings();

    useEffect(() => {
        const load = async () => {
            // Fetch digest based on last visit time and user's preferred summary mode
            const data = await fetchDailyDigest(lastAppVisit, digestSummaryMode);
            setDigest(data);
            setLoading(false);
            
            // Update last visit time after loading digest
            await updateLastAppVisit();
        };
        load();
        // Only run once on mount - don't add lastAppVisit to dependencies to avoid infinite loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleReadMore = (item: DigestItem) => {
        if (item.article) {
             // If we're on the welcome back screen, we need to signal completion first
             if (onContinue) onContinue();
             navigation.navigate('Article', { article: item.article });
        }
    };

    const subtitleText = useMemo(() => {
        if (isWelcomeBack) {
            return "Here's what happened while you were gone.";
        }
        
        if (!lastAppVisit) {
            return `Your briefing for ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`;
        }
        
        const hoursSinceLastVisit = Math.floor((Date.now() - lastAppVisit) / (1000 * 60 * 60));
        if (hoursSinceLastVisit < 1) {
            return "You're all caught up with the latest news.";
        } else if (hoursSinceLastVisit < 24) {
            return `News from the last ${hoursSinceLastVisit} hour${hoursSinceLastVisit > 1 ? 's' : ''}.`;
        } else {
            const daysSince = Math.floor(hoursSinceLastVisit / 24);
            return `News from the last ${daysSince} day${daysSince > 1 ? 's' : ''}.`;
        }
    }, [isWelcomeBack, lastAppVisit]);

    return (
        <View style={styles.container}>
            {loading ? (
                <FunLoadingIndicator message="Brewing your daily digest..." />
            ) : (
                <ScrollView contentContainerStyle={[
                    styles.content,
                    { paddingBottom: allowContentUnderTabBar ? spacing.lg + insets.bottom + 8 : spacing.lg + tabBarHeight + insets.bottom + 16 }
                ]}>
                    <View style={styles.headerRow}>
                        <Newspaper size={24} color={colors.primary} />
                        <Text style={styles.title}>{isWelcomeBack ? 'Welcome Back' : 'Daily Digest'}</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        {subtitleText}
                    </Text>
                    
                    {digest.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No new articles since your last visit.</Text>
                            <Text style={styles.emptySubtext}>Check back later for updates!</Text>
                        </View>
                    ) : (
                        <View style={styles.card}>
                            {digest.map((item, index) => (
                                <View key={index} style={styles.digestItem}>
                                    <View style={styles.digestContent}>
                                        <View style={styles.bulletRow}>
                                            <View style={styles.bullet} />
                                            <Text style={styles.digestText}>{item.summary}</Text>
                                        </View>
                                        {item.article && (
                                            <TouchableOpacity 
                                                style={styles.seeMore} 
                                                onPress={() => handleReadMore(item)}
                                            >
                                                <Text style={styles.seeMoreText}>Read Entire Article</Text>
                                                <ArrowRight size={14} color={colors.primary} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {isWelcomeBack && (
                        <ScaleButton style={styles.continueButton} onPress={onContinue || (() => navigation.navigate('Main'))}>
                            <Text style={styles.continueButtonText}>Continue to News</Text>
                        </ScaleButton>
                    )}

                    <Text style={styles.footer}>This digest is automatically generated from top local sources without bias.</Text>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    content: {
        padding: spacing.lg,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    title: {
        fontFamily: typography.fontFamily.serif,
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
    },
    subtitle: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    digestItem: {
        marginBottom: spacing.xl,
    },
    digestContent: {
        gap: spacing.xs,
    },
    bulletRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginTop: 6,
    },
    digestText: {
        flex: 1,
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        lineHeight: 24,
        color: colors.text,
    },
    seeMore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 24, // Align with text after bullet
        marginTop: 4,
    },
    seeMoreText: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 13,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    loadingText: {
        fontFamily: typography.fontFamily.sans,
        color: colors.primary,
        fontWeight: '600',
    },
    footer: {
        marginTop: spacing.xl,
        fontFamily: typography.fontFamily.sans,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
        paddingBottom: spacing.xxl,
    },
    continueButton: {
        backgroundColor: colors.text,
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    continueButtonText: {
        color: colors.surface,
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.xxl,
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    emptyText: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    emptySubtext: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
