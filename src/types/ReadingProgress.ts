/**
 * Tracks reading progress for individual articles
 */
export interface ReadingProgress {
  articleId: string;
  scrollPosition: number; // 0-1 representing scroll percentage
  scrollPixels?: number; // Absolute scroll position in pixels
  currentWordIndex?: number; // For RSVP tracking: which word the user stopped at
  completionPercentage: number; // 0-100
  startedAt: number; // Timestamp when reading started
  lastReadAt: number; // Timestamp of last activity
  totalReadTimeSeconds: number; // Cumulative time spent reading
  status: "unread" | "in-progress" | "completed"; // Reading status
}

/**
 * Collection of reading progress data
 */
export interface ReadingProgressState {
  [articleId: string]: ReadingProgress;
}
