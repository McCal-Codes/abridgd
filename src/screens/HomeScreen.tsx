import React from 'react';
import { View, FlatList, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArticleCard } from '../components/ArticleCard';
import { fetchArticlesByCategory } from '../services/RssService';
import { Article } from '../types/Article';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { spacing } from '../theme/spacing';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    
    const [articles, setArticles] = React.useState<Article[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            const data = await fetchArticlesByCategory('Top');
            setArticles(data);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
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
                        fetchArticlesByCategory('Top').then(data => {
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
    listContent: {
        paddingBottom: spacing.lg,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
