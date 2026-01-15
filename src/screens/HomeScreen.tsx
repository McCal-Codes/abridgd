import React from 'react';
import { View, FlatList, StyleSheet, StatusBar, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { ScrollContext } from '../context/ScrollContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArticleCard } from '../components/ArticleCard';
import { FunLoadingIndicator } from '../components/FunLoadingIndicator';
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

    const { scrollY } = React.useContext(ScrollContext);
    const insets = useSafeAreaInsets();
    const { tabBarHeight, tabBarBlur, allowContentUnderTabBar, tabBarStyle, tabBarDockedHeight, tabBarFloatingHeight } = useSettings();

    // Define onScroll callback unconditionally to preserve hook order between renders
    const onScroll = React.useCallback(
        Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
        ),
        [scrollY]
    );

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
                <FunLoadingIndicator message="Fetching top stories..." />
            ) : (
                <Animated.FlatList
                    data={articles}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ArticleCard 
                            article={item} 
                            onPress={(article) => navigation.navigate('Article', { article: article })} 
                        />
                    )}
                    contentContainerStyle={[
                        styles.listContent,
                        {
                            paddingBottom: allowContentUnderTabBar
                                ? spacing.lg + insets.bottom + 8
                                : spacing.lg + (tabBarStyle === 'floating' ? (tabBarFloatingHeight || 64) : (tabBarDockedHeight || tabBarHeight)) + insets.bottom + 16,
                        },
                    ]}
                    refreshing={loading}
                    // wire scroll to the shared scrollY value so tab bar can animate
                    onScroll={onScroll}
                    scrollEventThrottle={16}
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
