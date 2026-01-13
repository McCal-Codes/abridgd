import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { ScaleButton } from '../components/ScaleButton';
import { useSettings } from '../context/SettingsContext';
import { RootStackParamList } from '../navigation/types';

import { GroundingOverlay } from '../components/GroundingOverlay';
import { AbridgedReader } from '../components/AbridgedReader';
import { BookOpen, PauseCircle, Wind, Sliders, CheckCircle } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SLIDES = [
    {
        id: '1',
        title: 'Finally, a Good News App',
        description: "We know the struggle. You downloaded this because you could not find a news app that felt right. You are in luck, you found it.",
        demo: false,
        Icon: BookOpen,
    },
    {
        id: '2',
        title: 'Give Your Eyes a Break',
        description: "Doomscrolling is exhausting. Our RSVP reader shows you one word at a time, locked in place. It is surprisingly calm, like a massage for your brain.",
        demo: true,
        demoText: "We hope you find this reading experience to be incredibly peaceful and kind to your eyes, and if you are ever feeling hungry, remember that almost everything is better as chicken on a stick.",
        Icon: PauseCircle, 
    },
    {
        id: 'grounding',
        title: 'Breathe',
        description: "News can be heavy. If you encounter sensitive topics, we offer a 'Grounding Mode', a gentle, guided breathing exercise to help you reset.",
        demo: false,
        grounding: true,
        Icon: Wind,
    },
    {
        id: '3',
        title: 'Make It Yours',
        description: "We don't do 'one size fits all.' Change the colors, adjust the speed, or tweak the focus point. This is your quiet corner of the internet.",
        demo: false,
        Icon: Sliders,
    },
    {
        id: '4',
        title: 'Welcome Home',
        description: "No accounts, no tracking, no noise. Just the news, on your terms. We're glad you found us.",
        demo: false,
        Icon: CheckCircle,
    }
];

const { width } = Dimensions.get('window');

export const OnboardingScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { completeOnboarding } = useSettings();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleFinish = async () => {
        await completeOnboarding();
        // Since we are likely in a stack where Onboarding replaces Main initially, we might need to reset or navigate
        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
    };

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
        return (
            <View style={styles.slide}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
                
                {/* Live Demos */}
                {item.demo && item.demoText && (
                    <View style={styles.demoContainer}>
                         <AbridgedReader content={item.demoText} />
                    </View>
                )}

                {/* Grounding Demo */}
                {item.grounding && (
                    <View style={styles.demoContainer}>
                         {/* Pass a prop or style to force GroundingOverlay to fit nicely if needed, 
                             but our container logic below has flex:1 so it should work. 
                             Note: GroundingOverlay uses StyleSheet.absoluteFillObject by default. 
                             We need to wrap it in a relative container.
                         */}
                        <View style={{ flex: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.surface }}>
                            <GroundingOverlay onClose={() => {}} message="Sample Mode" />
                        </View>
                    </View>
                )}

                {/* Static Icon Placeholder */}
                {!item.demo && !item.grounding && (
                    <View style={styles.placeholder}>
                        {/* Render Icon safely if it exists */}
                        {item.Icon && <item.Icon size={80} color={colors.text} strokeWidth={1.5} />}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(newIndex);
                }}
                keyExtractor={item => item.id}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View 
                            key={index} 
                            style={[
                                styles.dot, 
                                currentIndex === index && styles.dotActive
                            ]} 
                        />
                    ))}
                </View>

                <ScaleButton 
                    style={styles.button} 
                    onPress={() => {
                        if (currentIndex < SLIDES.length - 1) {
                            // Ideally invalid scroll ref here, but for MVP just let user swipe or use logic
                            // For simplicity, just text change:
                        } else {
                            handleFinish();
                        }
                    }}
                >
                    {currentIndex === SLIDES.length - 1 ? (
                        <View style={styles.finishBtn}>
                           <Text style={styles.buttonText}>Get Started</Text>
                        </View>
                    ) : (
                         <View style={{ width: '100%', alignItems: 'center'}}>
                            <Text style={styles.swipeText}>Swipe to continue</Text>
                         </View>
                    )}
                </ScaleButton>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    slide: {
        width,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        marginBottom: spacing.xxl,
        alignItems: 'center',
    },
    title: {
        fontFamily: typography.fontFamily.serif,
        fontSize: 32,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    description: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 18,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: spacing.lg,
    },
    demoContainer: {
        width: '100%',
        height: 350,
        marginBottom: spacing.md,
    },
    groundingDemoContainer: {
        width: '100%',
        height: 400,
        marginBottom: spacing.xl,
    },
    groundingTextContainer: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    groundingTitle: {
        fontFamily: typography.fontFamily.serif,
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    groundingDescription: {
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    placeholder: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: spacing.xl,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: spacing.xl,
        gap: spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
    },
    dotActive: {
        backgroundColor: colors.primary,
        width: 24,
    },
    button: {
        width: '100%',
    },
    finishBtn: {
        backgroundColor: colors.text,
        paddingVertical: spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: colors.surface,
        fontSize: 18,
        fontWeight: '600',
    },
    swipeText: {
        color: colors.textSecondary,
        marginBottom: 20,
    }
});
