import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

// Fun facts about news, journalism, and Pittsburgh
const FUN_FACTS = [
  "📰 The first newspaper was published in 1605 in Germany",
  "🏙️ Pittsburgh has won the 'Most Livable City' award multiple times",
  "📝 The term 'breaking news' originated from telegraph operators",
  "🌉 Pittsburgh is known as the 'City of Bridges' with over 440 bridges",
  "🗞️ The New York Times has won 132 Pulitzer Prizes",
  "⚾ Pittsburgh's baseball team has won 5 World Series titles",
  "📻 Radio news broadcasts began in the 1920s",
  "🏭 Pittsburgh was once called the 'Steel City' for its steel industry",
  "📰 The Wall Street Journal is the largest newspaper by circulation",
  "🎭 Pittsburgh hosts one of America's oldest theater festivals",
  "📺 Cable news networks began with CNN in 1980",
  "🏈 Pittsburgh's football team has 6 Super Bowl victories",
  "📰 The first daily newspaper was published in 1702",
  "🌆 Pittsburgh's skyline inspired the layout of many modern cities",
  "📱 Social media changed news delivery forever in the 2000s"
];

interface FunLoadingIndicatorProps {
  size?: 'small' | 'large';
  message?: string;
}

export const FunLoadingIndicator: React.FC<FunLoadingIndicatorProps> = ({
  size = 'large',
  message = 'Loading fresh news...'
}) => {
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
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    // Cycle through fun facts
    const factInterval = setInterval(() => {
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentFact((prev) => (prev + 1) % FUN_FACTS.length);
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    // Start with first fact
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      spinAnimation.stop();
      clearInterval(factInterval);
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
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
              borderWidth: size === 'large' ? 4 : 3,
            }
          ]}
        />
        <View style={[styles.centerDot, {
          width: size === 'large' ? 20 : 14,
          height: size === 'large' ? 20 : 14,
        }]} />
      </View>

      <Text style={[styles.message, {
        fontSize: size === 'large' ? typography.size.lg : typography.size.md
      }]}>
        {message}
      </Text>

      <Animated.View style={[styles.factContainer, { opacity: fadeValue }]}>
        <Text style={styles.factText}>
          {FUN_FACTS[currentFact]}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  spinnerContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  spinner: {
    borderRadius: 50,
    borderColor: colors.primary,
    borderTopColor: 'transparent',
  },
  centerDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
    borderRadius: 50,
    backgroundColor: colors.primary,
  },
  message: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  factContainer: {
    maxWidth: 300,
  },
  factText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});