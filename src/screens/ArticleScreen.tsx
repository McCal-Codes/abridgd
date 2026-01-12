import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { MOCK_ARTICLES } from '../data/mockArticles';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { AbridgedReader } from '../components/AbridgedReader';
import { ScaleButton } from '../components/ScaleButton';

type ArticleScreenRouteProp = RouteProp<RootStackParamList, 'Article'>;

export const ArticleScreen: React.FC = () => {
    const route = useRoute<ArticleScreenRouteProp>();
    const { articleId } = route.params;
    const article = MOCK_ARTICLES.find(a => a.id === articleId);

    if (!article) {
        return (
            <View style={styles.container}>
                <Text>Article not found</Text>
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

            <Text style={styles.body}>{article.body}</Text>
            <Text style={styles.body}>{article.body}</Text>
            
            <View style={styles.abridgedSection}>
                <ScaleButton style={styles.abridgedButton} onPress={() => console.log('Abridged Pressed')}>
                    <Text style={styles.abridgedButtonText}>⚡ Read in Abridged Mode</Text>
                </ScaleButton>
                
                <AbridgedReader />
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
        padding: spacing.gutter,
        paddingBottom: spacing.xxl,
    },
    headline: {
        fontFamily: typography.fontFamily.serif,
        fontSize: typography.size.xxl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
        lineHeight: 38,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    source: {
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.size.sm,
        fontWeight: '700',
        color: colors.text,
    },
    dot: {
        marginHorizontal: spacing.xs,
        color: colors.textSecondary,
    },
    timestamp: {
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.size.sm,
        color: colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: spacing.lg,
    },
    body: {
        fontFamily: typography.fontFamily.serif,
        fontSize: typography.size.lg,
        lineHeight: 30, // Relaxed reading
        color: colors.text,
        marginBottom: spacing.md,
    },
    abridgedSection: {
        marginTop: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.lg,
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
});
