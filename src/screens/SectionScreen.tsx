import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { ArticleCard } from '../components/ArticleCard';
import { FunLoadingIndicator } from '../components/FunLoadingIndicator';
import { fetchArticlesByCategory } from '../services/RssService';
import { colors } from '../theme/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { spacing } from '../theme/spacing';
import { Article, ArticleCategory } from '../types/Article';
import { typography } from '../theme/typography';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SectionRouteProp = RouteProp<TabParamList, 'Discover'>; 

export const SectionScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<SectionRouteProp>();
    const category = route.params?.category as ArticleCategory;
    
    const [articles, setArticles] = React.useState<Article[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        const load = async () => {
             const data = await fetchArticlesByCategory(category);
             setArticles(data);
             setLoading(false);
        };
        load();
    }, [category]);

    if (!loading && articles.length === 0) {
        return (
             <View style={[styles.container, styles.center]}>
                <Text style={styles.emptyText}>No articles in {category}</Text>
             </View>
        )
    }

    return (
        <View style={styles.container}>
            {loading ? (
                <FunLoadingIndicator message={`Loading ${category} news...`} />
            ) : (
                <FlatList
                    data={articles}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ArticleCard 
                            article={item} 
                            onPress={(article) => navigation.navigate('Article', { article: article })} 
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshing={loading}
                    onRefresh={() => {
                        setLoading(true);
                        fetchArticlesByCategory(category).then(data => {
                            setArticles(data);
                            setLoading(false);
                        });
                    }}
                />
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
