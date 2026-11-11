import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { ThemeColors, useThemeOptional } from '../theme/ThemeContext';
import type { LucideIcon } from 'lucide-react-native';
import {
  BookOpen,
  Building2,
  Clock,
  Clapperboard,
  Drama,
  Factory,
  Globe,
  Handshake,
  Landmark,
  Lightbulb,
  MessageSquare,
  Mic,
  Newspaper,
  PenLine,
  Radio,
  RadioTower,
  Smartphone,
  Trophy,
  Tv,
  Volume2
} from 'lucide-react-native';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

// Fun facts about news, journalism, and Pittsburgh
const FUN_FACTS: Array<{ Icon: LucideIcon; text: string }> = [
  { Icon: Newspaper, text: 'The first newspaper was published in 1605 in Germany' },
  { Icon: Building2, text: "Pittsburgh has won the 'Most Livable City' award multiple times" },
  { Icon: PenLine, text: "The term 'breaking news' originated from telegraph operators" },
  { Icon: Landmark, text: "Pittsburgh is known as the 'City of Bridges' with over 440 bridges" },
  { Icon: Newspaper, text: 'The New York Times has won 132 Pulitzer Prizes' },
  { Icon: Trophy, text: "Pittsburgh's baseball team has won 5 World Series titles" },
  { Icon: Radio, text: 'Radio news broadcasts began in the 1920s' },
  { Icon: Factory, text: "Pittsburgh was once called the 'Steel City' for its steel industry" },
  { Icon: Newspaper, text: 'The Wall Street Journal is the largest newspaper by circulation' },
  { Icon: Drama, text: "Pittsburgh hosts one of America's oldest theater festivals" },
  { Icon: Tv, text: 'Cable news networks began with CNN in 1980' },
  { Icon: Trophy, text: "Pittsburgh's football team has 6 Super Bowl victories" },
  { Icon: Newspaper, text: 'The first daily newspaper was published in 1702' },
  { Icon: Building2, text: "Pittsburgh's skyline inspired the layout of many modern cities" },
  { Icon: Smartphone, text: 'Social media changed news delivery forever in the 2000s' },
  { Icon: Volume2, text: 'The Associated Press was founded in 1846' },
  { Icon: RadioTower, text: 'The internet transformed how news is consumed globally' },
  { Icon: PenLine, text: 'Ernest Hemingway was a journalist before becoming a novelist' },
  { Icon: Clapperboard, text: 'The first televised news broadcast was in 1948' },
  {
    Icon: MessageSquare,
    text: 'Fact-checking became a major part of journalism in the 21st century'
  },
  { Icon: Globe, text: 'Reuters is the oldest news agency still operating' },
  { Icon: Lightbulb, text: 'Investigative journalism has exposed major corruption scandals' },
  { Icon: BookOpen, text: 'The first newspaper cartoon appeared in 1754' },
  { Icon: Mic, text: 'Podcast journalism is one of the fastest-growing news formats' },
  { Icon: Handshake, text: 'Community journalism helps local stories reach local audiences' },
  { Icon: Clock, text: 'News cycles are now measured in hours instead of days' }
];

interface FunLoadingIndicatorProps {
  size?: 'small' | 'large';
  message?: string;
}

export const FunLoadingIndicator: React.FC<FunLoadingIndicatorProps> = ({
  size = 'large',
  message = 'Loading fresh news...'
}) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useThemeOptional();
  const [currentFact, setCurrentFact] = React.useState(0);
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const fadeValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Start spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    spinAnimation.start();

    // Cycle through fun facts
    const factInterval = setInterval(() => {
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        setCurrentFact((prev) => (prev + 1) % FUN_FACTS.length);
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      });
    }, 3000);

    // Start with first fact
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();

    return () => {
      spinAnimation.stop();
      clearInterval(factInterval);
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <View style={styles.spinnerContainer}>
        <Animated.View
          style={[
            styles.spinner,
            {
              transform: [{ rotate: spin }],
              width: size === 'large' ? 60 : 40,
              height: size === 'large' ? 60 : 40,
              borderWidth: size === 'large' ? 4 : 3
            }
          ]}
        />
        <View
          style={[
            styles.centerDot,
            {
              width: size === 'large' ? 20 : 14,
              height: size === 'large' ? 20 : 14
            }
          ]}
        />
      </View>

      <Text
        style={[
          styles.message,
          {
            fontSize: size === 'large' ? typography.size.lg : typography.size.md
          }
        ]}
      >
        {message}
      </Text>

      <Animated.View style={[styles.factContainer, { opacity: fadeValue }]}>
        {(() => {
          const { Icon, text } = FUN_FACTS[currentFact];
          return (
            <>
              <Icon size={20} color={colors.tint} strokeWidth={1.75} style={styles.factIcon} />
              <Text style={styles.factText}>{text}</Text>
            </>
          );
        })()}
      </Animated.View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg
    },
    spinnerContainer: {
      position: 'relative',
      marginBottom: spacing.xl
    },
    spinner: {
      borderRadius: 50,
      borderColor: colors.primary,
      borderTopColor: 'transparent'
    },
    centerDot: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -10,
      marginLeft: -10,
      borderRadius: 50,
      backgroundColor: colors.primary
    },
    message: {
      fontFamily: typography.fontFamily.sans,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.lg
    },
    factContainer: {
      maxWidth: 300
    },
    factIcon: {
      alignSelf: 'center',
      marginBottom: spacing.xs
    },
    factText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20
    }
  });
