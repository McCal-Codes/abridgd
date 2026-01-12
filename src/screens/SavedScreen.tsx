import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { ArticleCard } from '../components/ArticleCard';
import { MOCK_ARTICLES } from '../data/mockArticles';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SavedScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    // Mock saved state: assume first article is saved
    const [savedArticleIds] = useState<string[]>(['1']);

    const savedArticles = MOCK_ARTICLES.filter(a => savedArticleIds.includes(a.id));

    return (
        <View style={styles.container}>
            {savedArticles.length > 0 ? (
                <FlatList
                    data={savedArticles}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ArticleCard 
                            article={item} 
                            onPress={(article) => navigation.navigate('Article', { articleId: article.id })} 
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No saved articles</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        paddingBottom: spacing.lg,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.size.md,
        color: colors.textSecondary,
    }
});
