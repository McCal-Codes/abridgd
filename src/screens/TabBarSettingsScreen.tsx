import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { GripVertical, Check } from 'lucide-react-native';
import { Switch } from 'react-native';
import { ArticleCategory } from '../types/Article';
import { useSettings } from '../context/SettingsContext';

interface TabOption {
    id: string;
    label: string;
    icon: string;
    category?: ArticleCategory;
}

const getAvailableTabs = (layout: 'minimal' | 'comprehensive'): TabOption[] => {
    if (layout === 'minimal') {
        return [
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'discover', label: 'Discover', icon: '🔍' },
            { id: 'saved', label: 'Saved', icon: '🔖' },
            { id: 'digest', label: 'Digest', icon: '⭐' },
        ];
    } else {
        return [
            { id: 'top', label: 'Top', icon: '🔥', category: 'Top' },
            { id: 'local', label: 'Local', icon: '📍', category: 'Local' },
            { id: 'business', label: 'Business', icon: '💼', category: 'Business' },
            { id: 'sports', label: 'Sports', icon: '🏆', category: 'Sports' },
            { id: 'culture', label: 'Culture', icon: '🎨', category: 'Culture' },
            { id: 'digest', label: 'Digest', icon: '📰' },
            { id: 'saved', label: 'Saved', icon: '🔖' },
        ];
    }
};

export const TabBarSettingsScreen: React.FC = () => {
    const { activeTabs, setActiveTabs, tabLayout, setTabLayout, tabBarStyle, setTabBarStyle, showTabLabels, setShowTabLabels, tabIconSize, setTabIconSize, tabBarBlur, setTabBarBlur, allowContentUnderTabBar, setAllowContentUnderTabBar, tabBadgeStyle, setTabBadgeStyle, tabIndicatorStyle, setTabIndicatorStyle, tabBarDockedHeight, setTabBarDockedHeight, tabBarHiddenHeight, setTabBarHiddenHeight, tabBarFloatingHeight, setTabBarFloatingHeight, enableAdvancedHeightControls, dockedHeightStep, hiddenHeightStep, floatingHeightStep, setDockedHeightStep, setHiddenHeightStep, setFloatingHeightStep } = useSettings();
    const [selectedTabs, setSelectedTabs] = useState<string[]>(activeTabs);

    const AVAILABLE_TABS = getAvailableTabs(tabLayout);

    const PreviewBar: React.FC = () => {
        const { tabBarStyle, showTabLabels, tabIconSize, tabBadgeStyle, tabIndicatorStyle, tabBarDockedHeight } = useSettings();
        const isStandardPreview = tabBarStyle === 'standard';
        const height = isStandardPreview ? (tabBarDockedHeight || 92) : (tabBarFloatingHeight || 64);

        const previewTabs = AVAILABLE_TABS.slice(0, 4);

        return (
            <View style={styles.previewWrapper}>
                <Text style={styles.previewLabel}>Preview</Text>
                <View
                    style={[
                        styles.previewCapsule,
                        isStandardPreview ? styles.previewStandard : styles.previewFloating,
                        { height },
                    ]}
                >
                    <View style={styles.previewRow}>
                        {previewTabs.map((t, i) => (
                            <View key={t.id} style={styles.previewItem}>
                                <View style={[styles.previewIcon, { width: tabIconSize, height: tabIconSize, borderRadius: tabIconSize / 2 }]}>
                                    <Text style={styles.previewIconText}>{t.icon}</Text>
                                </View>
                                {showTabLabels ? <Text style={styles.previewItemLabel}>{t.label}</Text> : null}
                                {tabBadgeStyle === 'count' && i === 1 ? <View style={styles.previewBadge}><Text style={styles.previewBadgeText}>3</Text></View> : null}
                            </View>
                        ))}
                    </View>
                    {tabIndicatorStyle !== 'none' ? <View style={[styles.previewIndicator, tabIndicatorStyle === 'underline' ? styles.previewIndicatorUnderline : styles.previewIndicatorBubble]} /> : null}
                </View>
            </View>
        );
    };

    // Sync with context when it changes
    useEffect(() => {
        setSelectedTabs(activeTabs);
    }, [activeTabs, tabLayout]);

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

                {/* LAYOUT STYLE SELECTOR */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tab Style</Text>
                    <Text style={styles.sectionDesc}>
                        Choose between a clean, minimal layout or comprehensive category tabs
                    </Text>
                    
                    <View style={styles.layoutOptions}>
                        <TouchableOpacity
                            style={[
                                styles.layoutOption,
                                tabLayout === 'minimal' && styles.layoutOptionSelected
                            ]}
                            onPress={() => setTabLayout('minimal')}
                        >
                            <Text style={[
                                styles.layoutOptionText,
                                tabLayout === 'minimal' && styles.layoutOptionTextSelected
                            ]}>
                                📰 Minimal
                            </Text>
                            <Text style={styles.layoutOptionDesc}>
                                Clean, NYT-style with 4 essential tabs
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[
                                styles.layoutOption,
                                tabLayout === 'comprehensive' && styles.layoutOptionSelected
                            ]}
                            onPress={() => setTabLayout('comprehensive')}
                        >
                            <Text style={[
                                styles.layoutOptionText,
                                tabLayout === 'comprehensive' && styles.layoutOptionTextSelected
                            ]}>
                                📱 Comprehensive
                            </Text>
                            <Text style={styles.layoutOptionDesc}>
                                Full category coverage with 7 tabs
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* TAB BAR APPEARANCE */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tab Bar Appearance</Text>
                    <Text style={styles.sectionDesc}>Fine-tune the look and behavior of the bottom tab bar.</Text>

                    {/* Preview */}
                    <PreviewBar />

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Style</Text>
                        <View style={styles.optionRow}>
                            <TouchableOpacity style={[styles.smallOption, tabBarStyle === 'floating' && styles.smallOptionSelected]} onPress={() => setTabBarStyle('floating')}>
                                <Text style={[styles.smallOptionText, tabBarStyle === 'floating' && styles.smallOptionTextSelected]}>Floating</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.smallOption, tabBarStyle === 'compact' && styles.smallOptionSelected]} onPress={() => setTabBarStyle('compact')}>
                                <Text style={[styles.smallOptionText, tabBarStyle === 'compact' && styles.smallOptionTextSelected]}>Compact</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.smallOption, tabBarStyle === 'standard' && styles.smallOptionSelected]} onPress={() => setTabBarStyle('standard')}>
                                <Text style={[styles.smallOptionText, tabBarStyle === 'standard' && styles.smallOptionTextSelected]}>Standard</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Show Labels</Text>
                        <Switch value={showTabLabels} onValueChange={v => setShowTabLabels(v)} />
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Icon Size</Text>
                        <View style={styles.optionRow}>
                            <TouchableOpacity style={[styles.smallOption, tabIconSize === 20 && styles.smallOptionSelected]} onPress={() => setTabIconSize(20)}>
                                <Text style={[styles.smallOptionText, tabIconSize === 20 && styles.smallOptionTextSelected]}>Small</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.smallOption, tabIconSize === 25 && styles.smallOptionSelected]} onPress={() => setTabIconSize(25)}>
                                <Text style={[styles.smallOptionText, tabIconSize === 25 && styles.smallOptionTextSelected]}>Medium</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.smallOption, tabIconSize === 30 && styles.smallOptionSelected]} onPress={() => setTabIconSize(30)}>
                                <Text style={[styles.smallOptionText, tabIconSize === 30 && styles.smallOptionTextSelected]}>Large</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Background Blur</Text>
                        <Switch value={tabBarBlur} onValueChange={v => setTabBarBlur(v)} />
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Docked Height</Text>
                        <View style={styles.heightControlRow}>
                            <TouchableOpacity style={styles.heightBtn} onPress={() => setTabBarDockedHeight(Math.max(92, (tabBarDockedHeight || 92) - (dockedHeightStep || 2)))}>
                                <Text style={styles.heightBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.heightValue}>{tabBarDockedHeight || 92}px</Text>
                            <TouchableOpacity style={styles.heightBtn} onPress={() => setTabBarDockedHeight((tabBarDockedHeight || 92) + (dockedHeightStep || 2))}>
                                <Text style={styles.heightBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {enableAdvancedHeightControls && (
                        <View style={[styles.settingRow, { marginTop: spacing.xs }]}> 
                            <Text style={styles.settingLabel}>Docked step</Text>
                            <View style={styles.optionRow}>
                                {[1,2,4].map(s => (
                                    <TouchableOpacity key={`dock-step-${s}`} style={[styles.smallOption, dockedHeightStep === s && styles.smallOptionSelected]} onPress={() => setDockedHeightStep(s)}>
                                        <Text style={[styles.smallOptionText, dockedHeightStep === s && styles.smallOptionTextSelected]}>{s}px</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Hidden/Collapsed Height</Text>
                        <View style={styles.heightControlRow}>
                            <TouchableOpacity style={styles.heightBtn} onPress={() => setTabBarHiddenHeight(Math.max((tabBarDockedHeight || 92), (tabBarHiddenHeight || (tabBarDockedHeight || 92) + 8) - (hiddenHeightStep || 2)))}>
                                <Text style={styles.heightBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.heightValue}>{tabBarHiddenHeight || ((tabBarDockedHeight || 92) + 8)}px</Text>
                            <TouchableOpacity style={styles.heightBtn} onPress={() => setTabBarHiddenHeight((tabBarHiddenHeight || (tabBarDockedHeight || 92) + 8) + (hiddenHeightStep || 2))}>
                                <Text style={styles.heightBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {enableAdvancedHeightControls && (
                        <View style={[styles.settingRow, { marginTop: spacing.xs }]}> 
                            <Text style={styles.settingLabel}>Hidden step</Text>
                            <View style={styles.optionRow}>
                                {[1,2,4].map(s => (
                                    <TouchableOpacity key={`hidden-step-${s}`} style={[styles.smallOption, hiddenHeightStep === s && styles.smallOptionSelected]} onPress={() => setHiddenHeightStep(s)}>
                                        <Text style={[styles.smallOptionText, hiddenHeightStep === s && styles.smallOptionTextSelected]}>{s}px</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Floating Height</Text>
                        <View style={styles.heightControlRow}>
                            <TouchableOpacity style={styles.heightBtn} onPress={() => setTabBarFloatingHeight(Math.max(48, (tabBarFloatingHeight || 64) - (floatingHeightStep || 2)))}>
                                <Text style={styles.heightBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.heightValue}>{tabBarFloatingHeight || 64}px</Text>
                            <TouchableOpacity style={styles.heightBtn} onPress={() => setTabBarFloatingHeight((tabBarFloatingHeight || 64) + (floatingHeightStep || 2))}>
                                <Text style={styles.heightBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {enableAdvancedHeightControls && (
                        <View style={[styles.settingRow, { marginTop: spacing.xs }]}> 
                            <Text style={styles.settingLabel}>Floating step</Text>
                            <View style={styles.optionRow}>
                                {[1,2,4].map(s => (
                                    <TouchableOpacity key={`float-step-${s}`} style={[styles.smallOption, floatingHeightStep === s && styles.smallOptionSelected]} onPress={() => setFloatingHeightStep(s)}>
                                        <Text style={[styles.smallOptionText, floatingHeightStep === s && styles.smallOptionTextSelected]}>{s}px</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Allow content under tab bar</Text>
                        <Switch value={allowContentUnderTabBar} onValueChange={v => setAllowContentUnderTabBar(v)} />
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Badge Style</Text>
                        <View style={styles.optionRow}>
                            <TouchableOpacity style={[styles.smallOption, tabBadgeStyle === 'count' && styles.smallOptionSelected]} onPress={() => setTabBadgeStyle('count')}>
                                <Text style={[styles.smallOptionText, tabBadgeStyle === 'count' && styles.smallOptionTextSelected]}>Count</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.smallOption, tabBadgeStyle === 'dot' && styles.smallOptionSelected]} onPress={() => setTabBadgeStyle('dot')}>
                                <Text style={[styles.smallOptionText, tabBadgeStyle === 'dot' && styles.smallOptionTextSelected]}>Dot</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.smallOption, tabBadgeStyle === 'none' && styles.smallOptionSelected]} onPress={() => setTabBadgeStyle('none')}>
                                <Text style={[styles.smallOptionText, tabBadgeStyle === 'none' && styles.smallOptionTextSelected]}>None</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Indicator</Text>
                        <View style={styles.optionRow}>
                            <TouchableOpacity style={[styles.smallOption, tabIndicatorStyle === 'bubble' && styles.smallOptionSelected]} onPress={() => setTabIndicatorStyle('bubble')}>
                                <Text style={[styles.smallOptionText, tabIndicatorStyle === 'bubble' && styles.smallOptionTextSelected]}>Bubble</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.smallOption, tabIndicatorStyle === 'underline' && styles.smallOptionSelected]} onPress={() => setTabIndicatorStyle('underline')}>
                                <Text style={[styles.smallOptionText, tabIndicatorStyle === 'underline' && styles.smallOptionTextSelected]}>Underline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.smallOption, tabIndicatorStyle === 'none' && styles.smallOptionSelected]} onPress={() => setTabIndicatorStyle('none')}>
                                <Text style={[styles.smallOptionText, tabIndicatorStyle === 'none' && styles.smallOptionTextSelected]}>None</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

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
                        💡 Changes apply immediately — the tab bar will update as soon as you toggle or reorder tabs.
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
    layoutOptions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    layoutOption: {
        flex: 1,
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
    },
    layoutOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10', // 10% opacity
    },
    layoutOptionText: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    layoutOptionTextSelected: {
        color: colors.primary,
    },
    layoutOptionDesc: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.md,
    },
    settingLabel: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        color: colors.text,
    },
    optionRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'center',
    },
    smallOption: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    smallOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    smallOptionText: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        color: colors.textSecondary,
    },
    smallOptionTextSelected: {
        color: colors.primary,
    },
    heightControlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    heightBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    heightBtnText: {
        fontSize: 20,
        color: colors.text,
    },
    heightValue: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        color: colors.text,
        minWidth: 64,
        textAlign: 'center',
    },
    previewWrapper: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
        alignItems: 'stretch',
    },
    previewLabel: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    previewCapsule: {
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
    },
    previewFloating: {
        marginHorizontal: 16,
    },
    previewStandard: {
        marginHorizontal: 0,
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
    },
    previewItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
    },
    previewIcon: {
        backgroundColor: '#f2f4f7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewIconText: {
        fontSize: 12,
    },
    previewItemLabel: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    previewBadge: {
        position: 'absolute',
        top: 6,
        right: -6,
        backgroundColor: '#ff3b30',
        borderRadius: 8,
        paddingHorizontal: 5,
    },
    previewBadgeText: {
        color: '#fff',
        fontSize: 10,
    },
    previewIndicator: {
        position: 'absolute',
        bottom: 6,
        height: 4,
        width: '30%',
        borderRadius: 2,
    },
    previewIndicatorUnderline: {
        backgroundColor: '#0a84ff',
    },
    previewIndicatorBubble: {
        backgroundColor: '#e6f0ff',
    },
});
