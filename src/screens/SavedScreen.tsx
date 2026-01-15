import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { ArticleCard } from '../components/ArticleCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSavedArticles } from '../context/SavedArticlesContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SavedScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { savedArticles } = useSavedArticles();
    const insets = useSafeAreaInsets();
    const { tabBarHeight, tabBarBlur, allowContentUnderTabBar, tabBarStyle, tabBarDockedHeight, tabBarFloatingHeight } = useSettings();

    return (
        <View style={styles.container}>
            {savedArticles.length > 0 ? (
                <FlatList
                    data={savedArticles}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ArticleCard 
                            article={item} 
                            onPress={(article) => navigation.navigate('Article', { article: article })} 
                        />
                    )}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: allowContentUnderTabBar ? spacing.lg + insets.bottom + 8 : spacing.lg + (tabBarStyle === 'floating' ? (tabBarFloatingHeight || 64) : (tabBarDockedHeight || tabBarHeight)) + insets.bottom + 16 }
                    ]}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No saved articles</Text>
                    <Text style={styles.emptySubText}>You can save articles from the article view.</Text>
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
    },
    emptySubText: {
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    }
});
