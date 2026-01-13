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
import { useSettings } from '../context/SettingsContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { ScaleButton } from './ScaleButton';

const { width } = Dimensions.get('window');

interface GroundingOverlayProps {
    onClose: () => void;
    message?: string;
}

export const GroundingOverlay: React.FC<GroundingOverlayProps> = ({ onClose, message = "Breathe." }) => {
    const { groundingColor, groundingBreathDuration, groundingCycles } = useSettings();
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.4);
    
    // Face animation values
    const eyeScaleY = useSharedValue(1);
    const [instruction, setInstruction] = React.useState("Breathe.");

    useEffect(() => {
        // Use user's breath duration setting (in seconds, converted to ms)
        const breathDuration = groundingBreathDuration * 1000;
        const holdDuration = Math.floor(breathDuration * 0.5);
        const totalCycleDuration = (breathDuration * 2) + holdDuration;

        scale.value = withRepeat(
            withSequence(
                withTiming(1.5, { duration: breathDuration, easing: Easing.inOut(Easing.ease) }),
                withTiming(1.6, { duration: holdDuration }),
                withTiming(1.0, { duration: breathDuration, easing: Easing.inOut(Easing.ease) })
            ),
            groundingCycles
        );
        
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: breathDuration }), 
                withTiming(0.8, { duration: holdDuration }), 
                withTiming(0.4, { duration: breathDuration })
            ),
            groundingCycles
        );

        eyeScaleY.value = withRepeat(
             withSequence(
                withTiming(1, { duration: breathDuration }), 
                withTiming(1, { duration: holdDuration }), 
                withTiming(0.1, { duration: breathDuration }) 
             ),
             groundingCycles
        );

        const interval = setInterval(() => {
            setInstruction("Inhale...");
            setTimeout(() => setInstruction("Hold..."), breathDuration);
            setTimeout(() => setInstruction("Exhale..."), breathDuration + holdDuration);
        }, totalCycleDuration);

        const autoCloseTimer = setTimeout(() => {
            onClose();
        }, totalCycleDuration * groundingCycles + 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(autoCloseTimer);
        };
    }, [groundingBreathDuration, groundingCycles]);

    const animatedCircleStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
            backgroundColor: groundingColor || '#A8C3B3',
        };
    });
    
    const animatedEyeStyle = useAnimatedStyle(() => ({
        transform: [{ scaleY: eyeScaleY.value }]
    }));

    const animatedOuterCircleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value * 1.2 }],
        opacity: opacity.value * 0.3,
        backgroundColor: groundingColor || '#A8C3B3',
    }));

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Animated.View style={[styles.breathingCircle, animatedOuterCircleStyle]} />
                <Animated.View style={[styles.breathingCircle, animatedCircleStyle]} />
                
                {/* Cute Face Layer */}
                <View style={styles.faceContainer}>
                    <View style={styles.eyesRow}>
                        <Animated.View style={[styles.eye, animatedEyeStyle]} />
                        <Animated.View style={[styles.eye, animatedEyeStyle]} />
                    </View>
                    <View style={styles.mouth} />
                </View>

                <Text style={styles.title}>Grounding Mode</Text>
                <Text style={styles.instruction}>{instruction}</Text>
                <Text style={styles.message}>{message}</Text>
            </View>

            <ScaleButton 
                style={styles.closeButton} 
                onPress={onClose}
            >
                <Text style={styles.closeButtonText}>I am ready to read</Text>
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
        backgroundColor: '#A8C3B3', // Default, overridden by anim style
        position: 'absolute',
    },
    faceContainer: {
        width: width * 0.5,
        height: width * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute', // Sit on top of circle
        zIndex: 1,
    },
    eyesRow: {
        flexDirection: 'row',
        gap: 40,
        marginBottom: 10,
    },
    eye: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFF',
        opacity: 0.9,
    },
    mouth: {
        width: 30,
        height: 15,
        borderBottomWidth: 3,
        borderBottomColor: '#FFF',
        borderRadius: 15, // Smile curve
        opacity: 0.9,
        marginTop: 5,
        transform: [{ scaleY: 0.8 }] // Specific curve shape
    },
    title: {
        fontFamily: typography.fontFamily.serif,
        fontSize: typography.size.xl,
        color: colors.text,
        marginBottom: spacing.xs,
        marginTop: width * 0.6,
    },
    instruction: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 24,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: spacing.md,
    },
    message: {
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
        lineHeight: 20,
    },
    closeButton: {
        marginTop: spacing.xl,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        backgroundColor: colors.text,
        borderWidth: 0,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    closeButtonText: {
        fontFamily: typography.fontFamily.sans,
        color: colors.surface,
        fontSize: typography.size.md,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
