import AsyncStorage from "@react-native-async-storage/async-storage";
import { ContentWarning } from "../types/Article";

export interface SensitiveArticleResponse {
  articleId: string;
  timestamp: number;
  warnings: ContentWarning[];
  userChose: "breath-first" | "continue-direct";
  tookBreath: boolean; // whether they actually completed the breathing
  emotion?: "positive" | "neutral" | "negative"; // optional emotion reaction
}

const BEHAVIOR_LOG_KEY = "sensitiveArticleResponses";

export const logSensitiveArticleResponse = async (
  articleId: string,
  warnings: ContentWarning[],
  userChose: "breath-first" | "continue-direct",
  tookBreath: boolean,
  emotion?: "positive" | "neutral" | "negative",
) => {
  try {
    const existing = await AsyncStorage.getItem(BEHAVIOR_LOG_KEY);
    const logs: SensitiveArticleResponse[] = existing ? JSON.parse(existing) : [];

    logs.push({
      articleId,
      timestamp: Date.now(),
      warnings,
      userChose,
      tookBreath,
      emotion,
    });

    // Keep only last 100 interactions
    const trimmed = logs.slice(-100);
    await AsyncStorage.setItem(BEHAVIOR_LOG_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("Failed to log sensitive article response - UserBehaviorLogger.ts:39", e);
  }
};

export const getRecentResponses = async (): Promise<SensitiveArticleResponse[]> => {
  try {
    const data = await AsyncStorage.getItem(BEHAVIOR_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to get response logs - UserBehaviorLogger.ts:48", e);
    return [];
  }
};

// Analyze user patterns to learn preferences
export const analyzeUserPatterns = async () => {
  try {
    const responses = await getRecentResponses();
    if (responses.length === 0) return null;

    const breathFirstCount = responses.filter((r) => r.userChose === "breath-first").length;
    const continueDirectCount = responses.filter((r) => r.userChose === "continue-direct").length;
    const actuallyTookBreath = responses.filter((r) => r.tookBreath).length;

    // Emotion analysis
    const emotionsLogged = responses.filter((r) => r.emotion);
    const emotionCounts = {
      positive: emotionsLogged.filter((r) => r.emotion === "positive").length,
      neutral: emotionsLogged.filter((r) => r.emotion === "neutral").length,
      negative: emotionsLogged.filter((r) => r.emotion === "negative").length,
    };

    return {
      totalInteractions: responses.length,
      prefersBreathFirst: breathFirstCount > continueDirectCount,
      breathFirstPercentage: (breathFirstCount / responses.length) * 100,
      actualBreathCompletionRate: (actuallyTookBreath / responses.length) * 100,
      emotionCounts,
      emotionLoggingRate:
        emotionsLogged.length > 0 ? (emotionsLogged.length / responses.length) * 100 : 0,
      lastUpdated: Date.now(),
    };
  } catch (e) {
    console.error("Failed to analyze user patterns - UserBehaviorLogger.ts:82", e);
    return null;
  }
};

// Adapt settings based on user behavior
export const adaptSettingsBasedOnBehavior = async (
  currentActionPreference: "ground-first" | "decide" | "continue",
  setSensitiveActionPreference: (pref: "ground-first" | "decide" | "continue") => Promise<void>,
  setShowGroundingPrompts: (show: boolean) => Promise<void>,
) => {
  try {
    const patterns = await analyzeUserPatterns();
    if (!patterns || patterns.totalInteractions < 5) return; // Need at least 5 interactions

    // Adapt primary action based on actual behavior
    if (patterns.breathFirstPercentage > 70) {
      // User strongly prefers breathing
      if (currentActionPreference !== "ground-first") {
        await setSensitiveActionPreference("ground-first");
      }
    } else if (patterns.breathFirstPercentage < 30) {
      // User strongly prefers skipping breath
      if (currentActionPreference !== "continue") {
        await setSensitiveActionPreference("continue");
      }
    }

    // Disable breathing prompts if user never completes breathing (less than 20% completion)
    if (patterns.actualBreathCompletionRate < 20) {
      await setShowGroundingPrompts(false);
    }
    // Enable prompts if user always completes breathing
    else if (patterns.actualBreathCompletionRate > 80) {
      await setShowGroundingPrompts(true);
    }
  } catch (e) {
    console.error("Failed to adapt settings - UserBehaviorLogger.ts:119", e);
  }
};

// Log emotion about article after reading
export const logArticleEmotion = async (
  articleId: string,
  emotion: "positive" | "neutral" | "negative",
) => {
  try {
    const existing = await AsyncStorage.getItem(BEHAVIOR_LOG_KEY);
    const logs: SensitiveArticleResponse[] = existing ? JSON.parse(existing) : [];

    // Find the most recent entry for this article and add emotion
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].articleId === articleId && !logs[i].emotion) {
        logs[i].emotion = emotion;
        await AsyncStorage.setItem(BEHAVIOR_LOG_KEY, JSON.stringify(logs));
        return;
      }
    }
  } catch (e) {
    console.error("Failed to log article emotion - UserBehaviorLogger.ts:141", e);
  }
};
