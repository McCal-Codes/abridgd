import { Article } from "../types/Article";
import { fetchAllArticles } from "./RssService";

/**
 * Digest Service with AI Summarization using Perplexity
 * Provides fact-based digest or AI-generated summaries of articles.
 */

export interface DigestItem {
  summary: string;
  article: Article;
}

// Perplexity API configuration
const PERPLEXITY_API_KEY = process.env.EXPO_PUBLIC_PERPLEXITY_API_KEY || "";
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * Generate AI summary using Perplexity
 */
const generateAISummary = async (article: Article): Promise<string> => {
  // If no API key, return extractive summary
  if (!PERPLEXITY_API_KEY) {
    const firstSentence = article.summary.split(".")[0];
    return firstSentence.length > 120
      ? `${firstSentence.substring(0, 117)}...`
      : `${firstSentence}.`;
  }

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content:
              "You are a news summarizer. Create a concise, one-sentence summary that captures the key point. Keep it under 100 characters. Be direct and factual.",
          },
          {
            role: "user",
            content: `Summarize this in one sentence (max 100 chars):\n\nHeadline: ${article.headline}\n\n${article.summary}`,
          },
        ],
        max_tokens: 50,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.error(`Perplexity API error: ${response.status} - AiService.ts:54`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiSummary = data.choices[0]?.message?.content?.trim();

    if (aiSummary && aiSummary.length > 0) {
      return aiSummary;
    }

    // Fallback to extractive summary
    const firstSentence = article.summary.split(".")[0];
    return firstSentence.length > 120
      ? `${firstSentence.substring(0, 117)}...`
      : `${firstSentence}.`;
  } catch (error) {
    console.error("AI summarization error: - AiService.ts:70", error);
    // Fallback to extractive summary (first sentence)
    const firstSentence = article.summary.split(".")[0];
    return firstSentence.length > 120
      ? `${firstSentence.substring(0, 117)}...`
      : `${firstSentence}.`;
  }
};

export const summarizeArticle = async (
  content: string,
  headline: string,
): Promise<string | null> => {
  if (!content || content.length < 200) return null;

  try {
    console.log(`Summarizing: ${headline} - AiService.ts:81`);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    return `[AI Summary]: This article explores ${headline}. It covers the key events and context surrounding the topic, providing a condensed view of the full story.`;
  } catch (error) {
    console.error("Error during summarization: - AiService.ts:88", error);
    return null;
  }
};

/**
 * Fetches digest of articles published since the user's last visit.
 *
 * @param lastVisitTime - Unix timestamp of when user last opened the app (null if first time)
 * @param digestMode - Type of summary to show: 'fact-based', 'ai-summary', or 'headline-only'
 * @returns Array of digest items with summaries based on selected mode
 */
export const fetchDailyDigest = async (
  arg1?: number | DigestMode | null,
  arg2?: DigestMode,
): Promise<DigestItem[]> => {
  // Support both (lastVisitTime, digestMode) and (digestMode) call styles.
  let lastVisitTime: number | null = null;
  let digestMode: DigestMode = "fact-based";

  if (typeof arg1 === "number" && Number.isFinite(arg1)) {
    lastVisitTime = arg1;
  } else if (typeof arg1 === "string") {
    digestMode = arg1 as DigestMode;
  }

  if (typeof arg2 === "string") {
    digestMode = arg2 as DigestMode;
  }

  console.log("Fetching Daily Digest... - AiService.ts:104");
  const isValidLastVisit = typeof lastVisitTime === "number" && Number.isFinite(lastVisitTime);
  const lastVisitDisplay = isValidLastVisit
    ? new Date(lastVisitTime as number).toLocaleString()
    : "Unknown (defaulting to 2h ago)";
  console.log("Last visit time: - AiService.ts:109", lastVisitDisplay);
  console.log("Digest mode: - AiService.ts:110", digestMode);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Filter articles published since last visit. If lastVisitTime is invalid, fallback to past 2h.
  const cutoffTime = isValidLastVisit ? (lastVisitTime as number) : Date.now() - 2 * 60 * 60 * 1000;

  const allArticles = await fetchAllArticles();
  const recentArticles = allArticles
    .map((article) => {
      const published =
        article.publishedAt || Date.parse((article as any).timestamp || "") || Date.now();
      return { ...article, publishedAt: published } as Article;
    })
    .filter((article) => article.publishedAt > cutoffTime)
    .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
    .slice(0, 5);

  console.log(`Found ${recentArticles.length} articles since last visit - AiService.ts:124`);

  // Convert to digest items based on selected mode
  if (digestMode === "headline-only") {
    return recentArticles.map((article) => ({
      summary: article.headline,
      article: article,
    }));
  } else if (digestMode === "ai-summary") {
    console.log("Generating AI summaries with Perplexity... - AiService.ts:133");
    // Generate AI summaries for each article
    const digestItems = await Promise.all(
      recentArticles.map(async (article) => {
        const aiSummary = await generateAISummary(article);
        return {
          summary: aiSummary,
          article: article,
        };
      }),
    );
    return digestItems;
  } else {
    // fact-based: Use actual article summaries
    return recentArticles.map((article) => ({
      summary: article.summary,
      article: article,
    }));
  }
};
