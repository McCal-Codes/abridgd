import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  AccessibilityInfo,
  useWindowDimensions,
} from "react-native";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useTheme, Colors } from "../theme/ThemeContext";

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
  "📱 Social media changed news delivery forever in the 2000s",
  "🔊 The Associated Press was founded in 1846",
  "📡 The internet transformed how news is consumed globally",
  "✍️ Ernest Hemingway was a journalist before becoming a novelist",
  "🎬 The first televised news broadcast was in 1948",
  "🗣️ Fact-checking became a major part of journalism in the 21st century",
  "🌍 Reuters is the oldest news agency still operating",
  "💡 Investigative journalism has exposed major corruption scandals",
  "📚 The first newspaper cartoon appeared in 1754",
  "🎙️ Podcast journalism is one of the fastest-growing news formats",
  "🤝 Community journalism helps local stories reach local audiences",
  "⏰ News cycles are now measured in hours instead of days",
];

interface FunLoadingIndicatorProps {
  size?: "small" | "large";
  message?: string;
}

export const FunLoadingIndicator: React.FC<FunLoadingIndicatorProps> = ({
  size = "large",
  message = "Loading fresh news...",
}) => {
  const { colors } = useTheme();
  const { fontScale } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const styles = React.useMemo(() => createStyles(colors, fontScale), [colors, fontScale]);
  const [currentFact, setCurrentFact] = React.useState(0);
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const fadeValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => mounted && setReduceMotion(value));
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      setReduceMotion(value);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  React.useEffect(() => {
    if (reduceMotion) {
      fadeValue.setValue(1);
      return undefined;
    }

    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spinAnimation.start();

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

    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      spinAnimation.stop();
      clearInterval(factInterval);
    };
  }, [reduceMotion, fadeValue, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.spinnerContainer}>
        <Animated.View
          style={[
            styles.spinner,
            {
              transform: reduceMotion ? undefined : [{ rotate: spin }],
              width: size === "large" ? 60 : 40,
              height: size === "large" ? 60 : 40,
              borderWidth: size === "large" ? 4 : 3,
            },
          ]}
        />
        <View
          style={[
            styles.centerDot,
            {
              width: size === "large" ? 20 : 14,
              height: size === "large" ? 20 : 14,
            },
          ]}
        />
      </View>

      <Text
        style={[
          styles.message,
          {
            fontSize: size === "large" ? typography.size.lg : typography.size.md,
          },
        ]}
        allowFontScaling
      >
        {message}
      </Text>

      <Animated.View style={[styles.factContainer, { opacity: fadeValue }]}>
        <Text style={styles.factText} allowFontScaling>
          {FUN_FACTS[currentFact]}
        </Text>
      </Animated.View>
    </View>
  );
};

const createStyles = (colors: Colors, fontScale: number) => {
  const scale = (size: number) => size * Math.min(fontScale || 1, 1.6);
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },
    spinnerContainer: {
      position: "relative",
      marginBottom: spacing.xl,
    },
    spinner: {
      borderRadius: 50,
      borderColor: colors.primary,
      borderTopColor: "transparent",
    },
    centerDot: {
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -10,
      marginLeft: -10,
      borderRadius: 50,
      backgroundColor: colors.primary,
    },
    message: {
      fontFamily: typography.fontFamily.sans,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.lg,
      fontSize: scale(17),
    },
    factContainer: {
      maxWidth: 300,
      paddingHorizontal: spacing.sm,
    },
    factText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: scale(13),
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: scale(19),
    },
  });
};
