/**
 * User Profile Types
 *
 * Basic profile structure ready for future authentication implementation.
 * Currently supports anonymous usage with optional Sign in with Apple.
 */

export interface UserProfile {
  id: string; // Unique identifier (UUID or Apple user ID)
  displayName?: string; // User's display name
  email?: string; // Email (only if shared via Sign in with Apple)
  appleUserId?: string; // Apple user identifier if signed in with Apple
  createdAt: number; // Timestamp of account creation
  lastSignIn: number; // Timestamp of last sign in
  isAnonymous: boolean; // Whether user is anonymous or authenticated
  readingStreak?: number; // Days in a row user has read articles
  lastReadDate?: number; // Last date user read an article
  preferences?: {
    // Future: personalized preferences beyond settings
    favoriteCategories?: string[];
    readingGoal?: number; // Articles per day/week
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}

export type AuthProvider = "apple" | "anonymous";

export interface SignInResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}
