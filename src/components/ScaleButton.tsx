import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

interface ScaleButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
}

export const ScaleButton: React.FC<ScaleButtonProps> = ({ 
    onPress, 
    children, 
    style,
    scaleTo = 0.96 
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(scaleTo, {
            damping: 10,
            stiffness: 100,
        });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {
            damping: 10,
            stiffness: 100,
        });
    };

    return (
        <Pressable 
            onPress={onPress} 
            onPressIn={handlePressIn} 
            onPressOut={handlePressOut}
        >
            <Animated.View style={[style, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
};
