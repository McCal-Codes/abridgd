import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { ArticleCard } from '../components/ArticleCard';
import { MOCK_ARTICLES } from '../data/mockArticles';
import { colors } from '../theme/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { spacing } from '../theme/spacing';
import { ArticleCategory } from '../types/Article';
import { typography } from '../theme/typography';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SectionRouteProp = RouteProp<TabParamList, 'Local'>; 

export const SectionScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<SectionRouteProp>();
    const category = route.params?.category as ArticleCategory;

    const articles = MOCK_ARTICLES.filter(a => a.category === category);

    if (articles.length === 0) {
        return (
             <View style={[styles.container, styles.center]}>
                <Text style={styles.emptyText}>No articles in {category}</Text>
             </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={articles}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ArticleCard 
                        article={item} 
                        onPress={(article) => navigation.navigate('Article', { articleId: article.id })} 
                    />
                )}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: spacing.lg,
    },
    emptyText: {
        fontFamily: typography.fontFamily.sans,
        color: colors.textSecondary,
    }
});
