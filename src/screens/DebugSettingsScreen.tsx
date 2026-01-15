import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Platform, DevSettings, NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useSettings } from '../context/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2, RefreshCw, Database, FileText } from 'lucide-react-native';

export const DebugSettingsScreen: React.FC = () => {
    const settings = useSettings();
    const [verboseLogging, setVerboseLogging] = React.useState(false);

    const clearAllData = async () => {
        Alert.alert(
            'Clear All Data',
            'This will reset all settings and clear all saved data. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            Alert.alert('Success', 'All data cleared. Please restart the app.');
                        } catch (e) {
                            Alert.alert('Error', 'Failed to clear data');
                        }
                    },
                },
            ]
        );
    };

    const viewStoredSettings = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const items = await AsyncStorage.multiGet(keys);
            const settingsData = items.map(([key, value]) => `${key}: ${value}`).join('\n\n');
            Alert.alert('Stored Settings', settingsData || 'No data stored');
        } catch (e) {
            Alert.alert('Error', 'Failed to retrieve settings');
        }
    };

    const shareStoredSettings = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const items = await AsyncStorage.multiGet(keys);
            const settingsData = items.map(([key, value]) => `${key}: ${value}`).join('\n\n') || 'No data stored';
            await Share.share({ message: settingsData, title: 'Stored Settings' });
        } catch (e) {
            Alert.alert('Error', 'Failed to share settings');
        }
    };

    const logSettingsToConsole = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const items = await AsyncStorage.multiGet(keys);
            const obj: Record<string, any> = {};
            items.forEach(([k, v]) => { obj[k] = v; });
            console.log('[DebugSettings] Settings snapshot:', obj);
            console.log('[DebugSettings] Settings context:', settings);
            Alert.alert('Logged', 'Settings dumped to console');
        } catch (e) {
            Alert.alert('Error', 'Failed to log settings');
        }
    };

    const openDevMenu = () => {
        try {
            const ds: any = DevSettings;
            if (ds && typeof ds.show === 'function') ds.show();
            else Alert.alert('Dev Menu', 'Dev menu unavailable on this build');
        } catch (e) {
            Alert.alert('Error', 'Failed to open dev menu');
        }
    };

    const triggerTestException = () => {
        Alert.alert(
            'Trigger Test Exception',
            'This will throw a JS error to test crash reporting. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Throw', style: 'destructive', onPress: () => { throw new Error('Test exception from DebugSettingsScreen'); } }
            ]
        );
    };

    const getDeviceInfo = () => {
        const platform = Platform.OS;
        const version = Platform.Version;
        // PlatformConstants may provide more details on some platforms
        const constants = (NativeModules.PlatformConstants || NativeModules.RNCConfig || {});
        return { platform, version, constants };
    };

    const resetToDefaults = async () => {
        Alert.alert(
            'Reset to Defaults',
            'This will reset all settings to their default values.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        // Reset each setting to default
                        await settings.setRsvpHighlightColor('#D32F2F');
                        await settings.setRsvpAnchorStrategy('standard');
                        await settings.setGroundingColor('#A8C3B3');
                        await settings.setIsReaderEnabled(true);
                        await settings.setIsGroundingEnabled(true);
                        await settings.setIsSummarizationEnabled(false);
                        await settings.setIsWelcomeBackEnabled(true);
                        await settings.setDigestSummaryMode('fact-based');
                        await settings.setGroundingBreathDuration(4);
                        await settings.setGroundingCycles(5);
                        await settings.setGroundingAnimationStyle('waves');
                        Alert.alert('Success', 'Settings reset to defaults');
                    },
                },
            ]
        );
    };

    const deviceInfo = getDeviceInfo();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Debug & Advanced</Text>
                <Text style={styles.description}>
                    Developer tools and diagnostic options
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Management</Text>
                    
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={viewStoredSettings}
                    >
                        <View style={styles.actionIconContainer}>
                            <FileText size={20} color={colors.primary} />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>View Stored Settings</Text>
                            <Text style={styles.actionDesc}>See all saved preferences</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={resetToDefaults}
                    >
                        <View style={styles.actionIconContainer}>
                            <RefreshCw size={20} color={colors.primary} />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>Reset to Defaults</Text>
                            <Text style={styles.actionDesc}>Restore factory settings</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, styles.dangerButton]}
                        onPress={clearAllData}
                    >
                        <View style={[styles.actionIconContainer, styles.dangerIconContainer]}>
                            <Trash2 size={20} color="#D32F2F" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.actionTitle, styles.dangerText]}>Clear All Data</Text>
                            <Text style={styles.actionDesc}>Delete all settings and cache</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Information</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Version</Text>
                        <Text style={styles.infoValue}>1.0.2</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Build</Text>
                        <Text style={styles.infoValue}>2026.01.13</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Environment</Text>
                        <Text style={styles.infoValue}>Development</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Platform</Text>
                        <Text style={styles.infoValue}>{deviceInfo.platform} {deviceInfo.version}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Settings</Text>
                    <View style={styles.settingsGrid}>
                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>Reader Enabled</Text>
                            <Text style={styles.settingValue}>{settings.isReaderEnabled ? '✓' : '✗'}</Text>
                        </View>
                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>Grounding Enabled</Text>
                            <Text style={styles.settingValue}>{settings.isGroundingEnabled ? '✓' : '✗'}</Text>
                        </View>
                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>AI Summary</Text>
                            <Text style={styles.settingValue}>{settings.isSummarizationEnabled ? '✓' : '✗'}</Text>
                        </View>
                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>Digest Mode</Text>
                            <Text style={styles.settingValue}>{settings.digestSummaryMode}</Text>
                        </View>
                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>Breath Duration</Text>
                            <Text style={styles.settingValue}>{settings.groundingBreathDuration}s</Text>
                        </View>
                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>Breath Cycles</Text>
                            <Text style={styles.settingValue}>{settings.groundingCycles}</Text>
                        </View>
                        <TouchableOpacity style={styles.settingItem} onPress={() => { setVerboseLogging(v => !v); Alert.alert('Verbose Logging', `Verbose logging ${!verboseLogging ? 'enabled' : 'disabled'}`); }}>
                            <Text style={styles.settingLabel}>Verbose Logging</Text>
                            <Text style={[styles.settingValue, { color: verboseLogging ? colors.primary : colors.textSecondary }]}>{verboseLogging ? 'On' : 'Off'}</Text>
                        </TouchableOpacity>
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
    section: {
        marginBottom: spacing.xxl,
    },
    sectionTitle: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 8,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dangerButton: {
        borderColor: '#FFCDD2',
        backgroundColor: '#FFEBEE',
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F0F4F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    dangerIconContainer: {
        backgroundColor: '#FFCDD2',
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    dangerText: {
        color: '#D32F2F',
    },
    actionDesc: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 12,
        color: colors.textSecondary,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoLabel: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        color: colors.textSecondary,
    },
    infoValue: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    settingsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    settingItem: {
        width: '48%',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    settingLabel: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    settingValue: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
});
