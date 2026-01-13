import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { GripVertical, Check } from 'lucide-react-native';
import { ArticleCategory } from '../types/Article';
import { useSettings } from '../context/SettingsContext';

interface TabOption {
    id: string;
    label: string;
    icon: string;
    category?: ArticleCategory;
}

const AVAILABLE_TABS: TabOption[] = [
    { id: 'top', label: 'Top Stories', icon: '🔥', category: 'Top' },
    { id: 'local', label: 'Local', icon: '📍', category: 'Local' },
    { id: 'business', label: 'Business', icon: '💼', category: 'Business' },
    { id: 'sports', label: 'Sports', icon: '⚽', category: 'Sports' },
    { id: 'culture', label: 'Culture', icon: '🎭', category: 'Culture' },
    { id: 'digest', label: 'Digest', icon: '📰' },
    { id: 'saved', label: 'Saved', icon: '🔖' },
];

export const TabBarSettingsScreen: React.FC = () => {
    const { activeTabs, setActiveTabs } = useSettings();
    const [selectedTabs, setSelectedTabs] = useState<string[]>(activeTabs);

    // Sync with context when it changes
    useEffect(() => {
        setSelectedTabs(activeTabs);
    }, [activeTabs]);

    const toggleTab = (tabId: string) => {
        if (selectedTabs.includes(tabId)) {
            if (selectedTabs.length <= 2) {
                Alert.alert('Minimum Required', 'You must have at least 2 tabs enabled');
                return;
            }
            const newTabs = selectedTabs.filter(id => id !== tabId);
            setSelectedTabs(newTabs);
            setActiveTabs(newTabs); // Persist immediately
        } else {
            if (selectedTabs.length >= 5) {
                Alert.alert('Maximum Reached', 'You can only have up to 5 tabs in the navigation bar');
                return;
            }
            const newTabs = [...selectedTabs, tabId];
            setSelectedTabs(newTabs);
            setActiveTabs(newTabs); // Persist immediately
        }
    };

    const moveTab = (fromIndex: number, toIndex: number) => {
        const newTabs = [...selectedTabs];
        const [movedTab] = newTabs.splice(fromIndex, 1);
        newTabs.splice(toIndex, 0, movedTab);
        setSelectedTabs(newTabs);
        setActiveTabs(newTabs); // Persist immediately
    };

    const getTabInfo = (tabId: string) => AVAILABLE_TABS.find(t => t.id === tabId);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Tab Bar Layout</Text>
                <Text style={styles.description}>
                    Customize which tabs appear in your bottom navigation. Select up to 5 tabs and drag to reorder.
                </Text>

                {/* ACTIVE TABS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Active Tabs ({selectedTabs.length}/5)
                    </Text>
                    <Text style={styles.sectionDesc}>
                        Tap and hold to reorder • Tap to remove
                    </Text>
                    
                    <View style={styles.tabList}>
                        {selectedTabs.map((tabId, index) => {
                            const tab = getTabInfo(tabId);
                            if (!tab) return null;

                            return (
                                <View key={tabId} style={styles.activeTabRow}>
                                    <View style={styles.dragHandle}>
                                        <GripVertical size={20} color={colors.textSecondary} />
                                    </View>
                                    <View style={styles.tabInfo}>
                                        <Text style={styles.tabIcon}>{tab.icon}</Text>
                                        <Text style={styles.tabLabel}>{tab.label}</Text>
                                    </View>
                                    <View style={styles.tabPosition}>
                                        <Text style={styles.positionText}>{index + 1}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => toggleTab(tabId)}
                                    >
                                        <Text style={styles.removeButtonText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* AVAILABLE TABS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Tabs</Text>
                    <Text style={styles.sectionDesc}>
                        Tap to add to your navigation bar
                    </Text>
                    
                    <View style={styles.availableGrid}>
                        {AVAILABLE_TABS.filter(tab => !selectedTabs.includes(tab.id)).map(tab => (
                            <TouchableOpacity
                                key={tab.id}
                                style={styles.availableTab}
                                onPress={() => toggleTab(tab.id)}
                            >
                                <Text style={styles.availableTabIcon}>{tab.icon}</Text>
                                <Text style={styles.availableTabLabel}>{tab.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        💡 Changes will take effect after restarting the app
                    </Text>
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
    section: {
        marginBottom: spacing.xxl,
    },
    sectionTitle: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    sectionDesc: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    tabList: {
        gap: spacing.sm,
    },
    activeTabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dragHandle: {
        marginRight: spacing.sm,
    },
    tabInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    tabIcon: {
        fontSize: 20,
    },
    tabLabel: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    tabPosition: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    positionText: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        fontWeight: '700',
        color: colors.surface,
    },
    removeButton: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
    },
    removeButtonText: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        fontWeight: '600',
        color: '#D32F2F',
    },
    availableGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    availableTab: {
        width: '48%',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        gap: spacing.xs,
    },
    availableTabIcon: {
        fontSize: 24,
    },
    availableTabLabel: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    infoBox: {
        marginTop: spacing.lg,
        padding: spacing.md,
        backgroundColor: '#F0F4F8',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    infoText: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
});
