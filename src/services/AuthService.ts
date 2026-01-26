export type TokenPair = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // epoch ms
};

/**
 * Simple AuthService abstraction for token access and refresh.
 * In production this would be backed by secure storage and real refresh logic.
 */
export class AuthService {
  private token?: TokenPair;

  setToken(token: TokenPair | undefined) {
    this.token = token;
  }

  getAccessToken(): string | undefined {
    if (!this.token) return undefined;
    // optional expiration check
    if (this.token.expiresAt && Date.now() > this.token.expiresAt) {
      return undefined;
    }
    return this.token.accessToken;
  }

  async refreshToken(): Promise<string | undefined> {
    // Placeholder refresh logic - replace with real endpoint call.
    // Simulate async refresh delay
    await new Promise((res) => setTimeout(res, 50));

    if (!this.token?.refreshToken) return undefined;

    // For the PoC, create a new token by appending `-refreshed`
    const refreshed: TokenPair = {
      accessToken: `${this.token.accessToken}-refreshed`,
      refreshToken: this.token.refreshToken,
      expiresAt: Date.now() + 60 * 60 * 1000,
    };

    this.token = refreshed;
    return refreshed.accessToken;
  }
}

// Export a singleton for use in the app (can be swapped in tests)
export const authService = new AuthService();
