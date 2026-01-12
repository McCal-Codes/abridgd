import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    Easing,
    withSequence
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { ScaleButton } from './ScaleButton';

interface GroundingOverlayProps {
    onClose: () => void;
    message?: string;
}

const { width } = Dimensions.get('window');

export const GroundingOverlay: React.FC<GroundingOverlayProps> = ({ onClose, message = "Breathe." }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        // 4-7-8 Breathing Simulation (approximate/spacially geared)
        // Inhale (4s) -> Hold (2s) -> Exhale (4s)
        scale.value = withRepeat(
            withSequence(
                withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }), // Inhale
                withTiming(1.6, { duration: 2000 }), // Hold slightly
                withTiming(1.0, { duration: 4000, easing: Easing.inOut(Easing.ease) }) // Exhale
            ),
            -1, // Infinite Loop
            true // Reverse? No, sequence handles it.
        );
        
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 4000 }), 
                withTiming(0.8, { duration: 2000 }), 
                withTiming(0.4, { duration: 4000 })
            ),
            -1
        );
    }, []);

    const animatedCircleStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Animated.View style={[styles.breathingCircle, animatedCircleStyle]} />
                <Text style={styles.title}>Grounding Mode</Text>
                <Text style={styles.message}>{message}</Text>
                <Text style={styles.instruction}>Inhale as the circle expands. Exhale as it shrinks.</Text>
            </View>

            <ScaleButton style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>I'm ready to read</Text>
            </ScaleButton>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        padding: spacing.xl,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    breathingCircle: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: width * 0.25,
        backgroundColor: '#A8C3B3', // Calming sage green
        position: 'absolute',
    },
    title: {
        fontFamily: typography.fontFamily.serif,
        fontSize: typography.size.xl,
        color: colors.text,
        marginBottom: spacing.md,
        marginTop: width * 0.6, // clear the circle
    },
    message: {
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.size.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    instruction: {
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
        opacity: 0.7,
    },
    closeButton: {
        marginTop: spacing.xl,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.textSecondary,
        borderRadius: 20,
    },
    closeButtonText: {
        fontFamily: typography.fontFamily.sans,
        color: colors.text,
        fontSize: typography.size.sm,
    },
});
