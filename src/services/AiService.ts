
import { Article } from '../types/Article';
import { MOCK_ARTICLES } from '../data/mockArticles';

/**
 * Digest Service
 * Provides fact-based digest of articles published since user's last visit.
 * No AI-generated content - uses actual article summaries.
 */

export interface DigestItem {
    summary: string;
    article: Article;
}

export const summarizeArticle = async (content: string, headline: string): Promise<string | null> => {
    if (!content || content.length < 200) return null;

    try {
        console.log(`Summarizing: ${headline}`);
        
        // Simulating an API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // For now, we'll implement a VERY basic heuristic "summary" 
        // to show the UI working, while leaving room for a real API.
        
        // This is a placeholder! In a real app, you'd fetch from your backend.
        return `[AI Summary]: This article explores ${headline}. It covers the key events and context surrounding the topic, providing a condensed view of the full story. (In a production build, this would be replaced with a real LLM-generated summary from your backend).`;

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
    // If no last visit (first time), show articles from last 24 hours
    const cutoffTime = lastVisitTime || (Date.now() - (24 * 60 * 60 * 1000));
    
    const recentArticles = MOCK_ARTICLES
        .filter(article => article.publishedAt > cutoffTime)
        .sort((a, b) => b.publishedAt - a.publishedAt) // Most recent first
        .slice(0, 5); // Limit to top 5 articles
    
    console.log(`Found ${recentArticles.length} articles since last visit`);
    
    // Convert to digest items based on selected mode
    if (digestMode === 'headline-only') {
        return recentArticles.map(article => ({
            summary: article.headline,
            article: article
        }));
    } else if (digestMode === 'ai-summary') {
        // In production, this would call your AI service
        // For now, we'll add a prefix to indicate it's AI-generated
        return recentArticles.map(article => ({
            summary: `[AI] ${article.summary}`, // Placeholder - would be actual AI summary
            article: article
        }));
    } else {
        // fact-based: Use actual article summaries
        return recentArticles.map(article => ({
            summary: article.summary,
            article: article
        }));
    }
};
