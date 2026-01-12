import React from 'react';
import { View, FlatList, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArticleCard } from '../components/ArticleCard';
import { MOCK_ARTICLES } from '../data/mockArticles';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { spacing } from '../theme/spacing';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    
    // Filter for 'Top' stories
    const articles = MOCK_ARTICLES.filter(a => a.category === 'Top');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
    listContent: {
        paddingBottom: spacing.lg,
    },
});
