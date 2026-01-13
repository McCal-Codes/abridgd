import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useSettings } from '../context/SettingsContext';
import { BookOpen, Newspaper, Palette, Rss, Layout, Bug, ChevronRight } from 'lucide-react-native';

type SettingsNavigationProp = NativeStackNavigationProp<any>;

interface SettingsMenuItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    screen: string;
}

export const SettingsScreen: React.FC = () => {
    const navigation = useNavigation<SettingsNavigationProp>();
    const { resetOnboarding } = useSettings();

    const menuItems: SettingsMenuItem[] = [
        {
            title: 'Reading Features',
            description: 'Reader mode, AI summarization, grounding',
            icon: <BookOpen size={24} color={colors.primary} />,
            screen: 'ReadingSettings',
        },
        {
            title: 'Digest Settings',
            description: 'Welcome back, summary style',
            icon: <Newspaper size={24} color={colors.primary} />,
            screen: 'DigestSettings',
        },
        {
            title: 'Customization',
            description: 'Colors, animations, visual preferences',
            icon: <Palette size={24} color={colors.primary} />,
            screen: 'CustomizationSettings',
        },
        {
            title: 'News Sources',
            description: 'Manage RSS feeds and sources',
            icon: <Rss size={24} color={colors.primary} />,
            screen: 'SourcesSettings',
        },
        {
            title: 'Tab Bar Layout',
            description: 'Customize bottom navigation tabs',
            icon: <Layout size={24} color={colors.primary} />,
            screen: 'TabBarSettings',
        },
        {
            title: 'Debug & Advanced',
            description: 'Developer tools and diagnostics',
            icon: <Bug size={24} color={colors.primary} />,
            screen: 'DebugSettings',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Settings</Text>
                <Text style={styles.description}>
                    Customize your news reading experience
                </Text>

                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.screen}
                            style={[
                                styles.menuItem,
                                index === menuItems.length - 1 && styles.lastMenuItem
                            ]}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <View style={styles.iconContainer}>
                                {item.icon}
                            </View>
                            <View style={styles.menuTextContainer}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuDescription}>{item.description}</Text>
                            </View>
                            <ChevronRight size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Info</Text>
                    <TouchableOpacity 
                        style={styles.actionRow} 
                        onPress={async () => {
                            await resetOnboarding();
                        }}
                    >
                        <Text style={styles.actionText}>Redo Onboarding Welcome</Text>
                        <ChevronRight size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    
                    <View style={[styles.actionRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.versionText}>Version 1.0.2</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: 150,
    },
    header: {
        fontFamily: typography.fontFamily.serif,
        fontSize: 32,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    description: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    menuContainer: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: spacing.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F0F4F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    menuDescription: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 12,
        color: colors.textSecondary,
    },
    section: {
        marginTop: spacing.lg,
    },
    sectionTitle: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    actionText: {
        fontSize: 16,
        color: colors.text,
        fontFamily: typography.fontFamily.sans,
    },
    versionText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontFamily: typography.fontFamily.sans,
        marginTop: spacing.sm,
    },
});
