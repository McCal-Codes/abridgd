import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useSettings, AnchorStrategy, GroundingAnimationStyle } from '../context/SettingsContext';

const PRESET_COLORS = [
    '#D32F2F', '#1976D2', '#388E3C', '#FBC02D', '#E91E63', '#121212',
];

const GROUNDING_COLORS = ['#A8C3B3', '#D8BFD8', '#B0C4DE', '#F5DEB3', '#D3D3D3'];

const STRATEGIES: { label: string; value: AnchorStrategy; description: string }[] = [
    { label: 'Early Pivot', value: 'early', description: 'Focus point is 25% into the word.' },
    { label: 'Standard Pivot', value: 'standard', description: 'Focus point is ~35% (Optimal for speed reading).' },
    { label: 'Center Pivot', value: 'center', description: 'Focus point is exactly 50%.' },
];

const ANIMATION_STYLES: { label: string; value: GroundingAnimationStyle; description: string }[] = [
    { label: 'Simple', value: 'simple', description: 'Single breathing circle.' },
    { label: 'Waves', value: 'waves', description: 'Dual circles with wave effect.' },
    { label: 'Pulse', value: 'pulse', description: 'Pulsing with glow effect.' },
];

export const CustomizationSettingsScreen: React.FC = () => {
    const { 
        rsvpHighlightColor, 
        setRsvpHighlightColor, 
        rsvpAnchorStrategy, 
        setRsvpAnchorStrategy,
        groundingColor,
        setGroundingColor,
        groundingBreathDuration,
        setGroundingBreathDuration,
        groundingCycles,
        setGroundingCycles,
        groundingAnimationStyle,
        setGroundingAnimationStyle,
    } = useSettings();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Customization</Text>
                <Text style={styles.description}>
                    Personalize colors, animations, and visual preferences.
                </Text>

                {/* READER CUSTOMIZATION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reader Focus Color</Text>
                    <Text style={styles.sectionDesc}>Choose the color for the pivot letter.</Text>
                    <View style={styles.colorRow}>
                        {PRESET_COLORS.map(c => (
                            <TouchableOpacity 
                                key={c} 
                                style={[
                                    styles.colorOption, 
                                    { backgroundColor: c },
                                    rsvpHighlightColor === c && styles.selectedColor
                                ]}
                                onPress={() => setRsvpHighlightColor(c)}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reader Focus Position</Text>
                    <View style={styles.strategyContainer}>
                        {STRATEGIES.map(s => (
                            <TouchableOpacity 
                                key={s.value} 
                                style={[
                                    styles.strategyOption, 
                                    rsvpAnchorStrategy === s.value && styles.selectedStrategy
                                ]}
                                onPress={() => setRsvpAnchorStrategy(s.value)}
                            >
                                <Text style={[
                                    styles.strategyLabel,
                                    rsvpAnchorStrategy === s.value && styles.selectedStrategyText
                                ]}>{s.label}</Text>
                                <Text style={styles.strategyDesc}>{s.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* GROUNDING CUSTOMIZATION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Grounding Color</Text>
                    <Text style={styles.sectionDesc}>Customize the breathing exercise color.</Text>
                    <View style={styles.colorRow}>
                        {GROUNDING_COLORS.map(c => (
                            <TouchableOpacity 
                                key={c} 
                                style={[
                                    styles.colorOption, 
                                    { backgroundColor: c },
                                    groundingColor === c && styles.selectedColor
                                ]}
                                onPress={() => setGroundingColor(c)}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Breath Duration</Text>
                    <Text style={styles.sectionDesc}>How long each breath cycle takes (in seconds).</Text>
                    <View style={styles.durationRow}>
                        {[4, 5, 6, 7, 8].map(duration => (
                            <TouchableOpacity 
                                key={duration} 
                                style={[
                                    styles.durationOption, 
                                    groundingBreathDuration === duration && styles.selectedDuration
                                ]}
                                onPress={() => setGroundingBreathDuration(duration)}
                            >
                                <Text style={[
                                    styles.durationText,
                                    groundingBreathDuration === duration && styles.selectedDurationText
                                ]}>{duration}s</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Number of Breath Cycles</Text>
                    <Text style={styles.sectionDesc}>How many breathing cycles to complete.</Text>
                    <View style={styles.durationRow}>
                        {[3, 5, 7, 10].map(cycles => (
                            <TouchableOpacity 
                                key={cycles} 
                                style={[
                                    styles.durationOption, 
                                    groundingCycles === cycles && styles.selectedDuration
                                ]}
                                onPress={() => setGroundingCycles(cycles)}
                            >
                                <Text style={[
                                    styles.durationText,
                                    groundingCycles === cycles && styles.selectedDurationText
                                ]}>{cycles}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Animation Style</Text>
                    <View style={styles.strategyContainer}>
                        {ANIMATION_STYLES.map(style => (
                            <TouchableOpacity 
                                key={style.value} 
                                style={[
                                    styles.strategyOption, 
                                    groundingAnimationStyle === style.value && styles.selectedStrategy
                                ]}
                                onPress={() => setGroundingAnimationStyle(style.value)}
                            >
                                <Text style={[
                                    styles.strategyLabel,
                                    groundingAnimationStyle === style.value && styles.selectedStrategyText
                                ]}>{style.label}</Text>
                                <Text style={styles.strategyDesc}>{style.description}</Text>
                            </TouchableOpacity>
                        ))}
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
        marginBottom: spacing.xs,
    },
    sectionDesc: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    colorRow: {
        flexDirection: 'row',
        gap: spacing.md,
        flexWrap: 'wrap',
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColor: {
        borderColor: colors.text,
        transform: [{ scale: 1.1 }],
    },
    strategyContainer: {
        gap: spacing.sm,
    },
    strategyOption: {
        padding: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    selectedStrategy: {
        borderColor: colors.primary,
        backgroundColor: '#F0F4F8',
    },
    strategyLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    selectedStrategyText: {
        color: colors.primary,
    },
    strategyDesc: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    durationRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    durationOption: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        minWidth: 60,
        alignItems: 'center',
    },
    selectedDuration: {
        borderColor: colors.primary,
        backgroundColor: '#F0F4F8',
    },
    durationText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    selectedDurationText: {
        color: colors.primary,
    },
});
