
import { Article } from '../types/Article';
import { MOCK_ARTICLES } from '../data/mockArticles';

/**
 * Digest Service with AI Summarization using Perplexity
 * Provides fact-based digest or AI-generated summaries of articles.
 */

export interface DigestItem {
    summary: string;
    article: Article;
}

// Perplexity API configuration
const PERPLEXITY_API_KEY = process.env.EXPO_PUBLIC_PERPLEXITY_API_KEY || '';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Generate AI summary using Perplexity
 */
const generateAISummary = async (article: Article): Promise<string> => {
    // If no API key, return extractive summary
    if (!PERPLEXITY_API_KEY) {
        const firstSentence = article.summary.split('.')[0];
        return firstSentence.length > 120 ? `${firstSentence.substring(0, 117)}...` : `${firstSentence}.`;
    }

    try {
        const response = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a news summarizer. Create a concise, one-sentence summary that captures the key point. Keep it under 100 characters. Be direct and factual.'
                    },
                    {
                        role: 'user',
                        content: `Summarize this in one sentence (max 100 chars):\n\nHeadline: ${article.headline}\n\n${article.summary}`
                    }
                ],
                max_tokens: 50,
                temperature: 0.2,
            }),
        });

        if (!response.ok) {
            console.error(`Perplexity API error: ${response.status}`);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const aiSummary = data.choices[0]?.message?.content?.trim();
        
        if (aiSummary && aiSummary.length > 0) {
            return aiSummary;
        }
        
        // Fallback to extractive summary
        const firstSentence = article.summary.split('.')[0];
        return firstSentence.length > 120 ? `${firstSentence.substring(0, 117)}...` : `${firstSentence}.`;
        
    } catch (error) {
        console.error('AI summarization error:', error);
        // Fallback to extractive summary (first sentence)
        const firstSentence = article.summary.split('.')[0];
        return firstSentence.length > 120 ? `${firstSentence.substring(0, 117)}...` : `${firstSentence}.`;
    }
};

export const summarizeArticle = async (content: string, headline: string): Promise<string | null> => {
    if (!content || content.length < 200) return null;

    try {
        console.log(`Summarizing: ${headline}`);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return `[AI Summary]: This article explores ${headline}. It covers the key events and context surrounding the topic, providing a condensed view of the full story.`;

    } catch (error) {
        console.error('Error during summarization:', error);
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
    lastVisitTime: number | null,
    digestMode: 'fact-based' | 'ai-summary' | 'headline-only' = 'fact-based'
): Promise<DigestItem[]> => {
    console.log('Fetching Daily Digest...');
    console.log('Last visit time:', lastVisitTime ? new Date(lastVisitTime).toLocaleString() : 'First visit');
    console.log('Digest mode:', digestMode);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter articles published since last visit
    const cutoffTime = lastVisitTime || (Date.now() - (24 * 60 * 60 * 1000));
    
    const recentArticles = MOCK_ARTICLES
        .filter(article => article.publishedAt > cutoffTime)
        .sort((a, b) => b.publishedAt - a.publishedAt)
        .slice(0, 5);
    
    console.log(`Found ${recentArticles.length} articles since last visit`);
    
    // Convert to digest items based on selected mode
    if (digestMode === 'headline-only') {
        return recentArticles.map(article => ({
            summary: article.headline,
            article: article
        }));
    } else if (digestMode === 'ai-summary') {
        console.log('Generating AI summaries with Perplexity...');
        // Generate AI summaries for each article
        const digestItems = await Promise.all(
            recentArticles.map(async (article) => {
                const aiSummary = await generateAISummary(article);
                return {
                    summary: aiSummary,
                    article: article
                };
            })
        );
        return digestItems;
    } else {
        // fact-based: Use actual article summaries
        return recentArticles.map(article => ({
            summary: article.summary,
            article: article
        }));
    }
};
