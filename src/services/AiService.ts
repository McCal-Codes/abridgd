import AsyncStorage from "@react-native-async-storage/async-storage";
import { RSS_FEEDS } from "../data/feedConfig";
import { SETTINGS_STORAGE_KEYS } from "../shared/settings/storageKeys";
import { Article, ArticleCategory } from "../types/Article";
import { fetchArticlesByCategory } from "./RssService";

/**
 * Digest Service with optional Perplexity-backed summarization.
 * Falls back to extractive summaries when no API key is stored.
 */

export interface DigestItem {
  summary: string;
  article: Article;
}

export type DigestMode = "fact-based" | "ai-summary" | "headline-only";

type PerplexityResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
const DIGEST_LIMIT = 5;
const DIGEST_FALLBACK_WINDOW_MS = 2 * 60 * 60 * 1000;

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const stripHtml = (value: string) =>
  normalizeWhitespace(value.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " "));

const clipText = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 3).trimEnd()}...` : value;

const splitSentences = (value: string) =>
  normalizeWhitespace(value)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const buildExtractiveSummary = (
  input: string,
  options: { maxLength: number; maxSentences: number },
): string | null => {
  const cleaned = stripHtml(input);
  if (!cleaned) return null;

  const sentences = splitSentences(cleaned).slice(0, options.maxSentences);
  if (sentences.length > 0) {
    return clipText(sentences.join(" "), options.maxLength);
  }

  return clipText(cleaned, options.maxLength);
};

const getDigestFallbackSummary = (article: Article) =>
  buildExtractiveSummary(article.summary || article.body || article.headline, {
    maxLength: 120,
    maxSentences: 1,
  }) || article.headline;

const getArticleFallbackSummary = (content: string, headline: string) =>
  buildExtractiveSummary(content || headline, {
    maxLength: 260,
    maxSentences: 2,
  });

const getStoredPerplexityApiKey = async (): Promise<string> => {
  try {
    return (await AsyncStorage.getItem(SETTINGS_STORAGE_KEYS.perplexityApiKey))?.trim() || "";
  } catch (error) {
    console.error("Failed to read Perplexity API key", error);
    return "";
  }
};

const requestPerplexitySummary = async (
  apiKey: string,
  prompt: { system: string; user: string; maxTokens: number },
): Promise<string | null> => {
  const response = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: prompt.system,
        },
        {
          role: "user",
          content: prompt.user,
        },
      ],
      max_tokens: prompt.maxTokens,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = (await response.json()) as PerplexityResponse;
  return normalizeWhitespace(data.choices?.[0]?.message?.content?.trim() || "") || null;
};

const getPublishedAt = (article: Article) =>
  Number.isFinite(article.publishedAt) ? article.publishedAt : 0;

const dedupeArticles = (articles: Article[]) => {
  const seen = new Set<string>();

  return articles.filter((article) => {
    const key = article.link || `${article.source}:${article.headline}:${getPublishedAt(article)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const fetchDigestArticles = async (): Promise<Article[]> => {
  const categories = Object.keys(RSS_FEEDS) as ArticleCategory[];
  const results = await Promise.allSettled(
    categories.map((category) => fetchArticlesByCategory(category)),
  );

  const articles = dedupeArticles(
    results.flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
  ).sort((a, b) => getPublishedAt(b) - getPublishedAt(a));

  if (articles.length > 0) {
    return articles;
  }

  const firstRejected = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  if (firstRejected) {
    throw firstRejected.reason;
  }

  return [];
};

const selectDigestArticles = (articles: Article[], lastVisitTime: number | null) => {
  const isFreshVisit =
    typeof lastVisitTime === "number" &&
    Number.isFinite(lastVisitTime) &&
    Date.now() - lastVisitTime <= DIGEST_FALLBACK_WINDOW_MS;
  const cutoffTime = isFreshVisit ? lastVisitTime : Date.now() - DIGEST_FALLBACK_WINDOW_MS;
  const recentArticles = articles.filter((article) => getPublishedAt(article) > cutoffTime);

  if (recentArticles.length > 0) {
    return recentArticles.slice(0, DIGEST_LIMIT);
  }

  return isFreshVisit ? [] : articles.slice(0, DIGEST_LIMIT);
};

const generateDigestSummary = async (article: Article, apiKey: string) => {
  const fallbackSummary = getDigestFallbackSummary(article);
  if (!apiKey) {
    return fallbackSummary;
  }

  try {
    const aiSummary = await requestPerplexitySummary(apiKey, {
      system:
        "You summarize news articles. Return one factual sentence under 100 characters with no hype.",
      user: `Headline: ${article.headline}\n\nSummary: ${article.summary || fallbackSummary}`,
      maxTokens: 50,
    });

    return aiSummary || fallbackSummary;
  } catch (error) {
    console.error("Failed to generate digest AI summary", error);
    return fallbackSummary;
  }
};

export const summarizeArticle = async (
  content: string,
  headline: string,
): Promise<string | null> => {
  const fallbackSummary = getArticleFallbackSummary(content, headline);
  if (!fallbackSummary) return null;

  const apiKey = await getStoredPerplexityApiKey();
  if (!apiKey) {
    return fallbackSummary;
  }

  try {
    const aiSummary = await requestPerplexitySummary(apiKey, {
      system:
        "You summarize news articles. Write two concise factual sentences under 70 words total.",
      user: `Headline: ${headline}\n\nArticle:\n${stripHtml(content).slice(0, 6000)}`,
      maxTokens: 120,
    });

    return aiSummary || fallbackSummary;
  } catch (error) {
    console.error("Error during summarization", error);
    return fallbackSummary;
  }
};

export const fetchDailyDigest = async (
  lastVisitTime: number | null,
  digestMode: DigestMode = "fact-based",
): Promise<DigestItem[]> => {
  const articles = await fetchDigestArticles();
  const digestArticles = selectDigestArticles(articles, lastVisitTime);

  if (digestMode === "headline-only") {
    return digestArticles.map((article) => ({
      summary: article.headline,
      article,
    }));
  }

  if (digestMode === "ai-summary") {
    const apiKey = await getStoredPerplexityApiKey();
    return Promise.all(
      digestArticles.map(async (article) => ({
        summary: await generateDigestSummary(article, apiKey),
        article,
      })),
    );
  }

  return digestArticles.map((article) => ({
    summary: article.summary || getDigestFallbackSummary(article),
    article,
  }));
};
