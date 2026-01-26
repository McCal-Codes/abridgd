import { request, HttpError } from "./httpClient";
import { authService } from "../../services/AuthService";

export type ApiClientOptions = {
  retries?: number; // network retry attempts
  baseDelayMs?: number;
  maxDelayMs?: number;
  includeAuth?: boolean;
};

function jitter(ms: number) {
  return Math.floor(ms * (0.5 + Math.random() * 0.5));
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export class ApiError extends Error {
  status?: number;
  details?: unknown;
  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T = unknown>(
  baseUrl: string,
  path: string,
  opts: Parameters<typeof request>[2] = {},
  clientOpts: ApiClientOptions = {}
): Promise<T> {
  const { retries = 2, baseDelayMs = 200, maxDelayMs = 2000, includeAuth = false } = clientOpts;

  // Build headers and potentially attach auth
  const doRequest = async (attempt: number): Promise<T> => {
    const headers = { ...(opts.headers || {}) } as Record<string, string>;

    if (includeAuth) {
      const token = authService.getAccessToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      return await request<T>(baseUrl, path, { ...opts, headers });
    } catch (err: any) {
      // If unauthorized and we have a refresh flow, try refresh once
      if (err instanceof HttpError && (err.status === 401 || err.status === 403) && includeAuth) {
        try {
          const newToken = await authService.refreshToken();
          if (newToken) {
            // Retry immediately once with refreshed token
            const headers2 = { ...(opts.headers || {}), Authorization: `Bearer ${newToken}` } as Record<string, string>;
            return await request<T>(baseUrl, path, { ...opts, headers: headers2 });
          }
        } catch (refreshErr) {
          // fall through to error handling below
        }
      }

      // Retry on network errors or 5xx
      const shouldRetry = (err instanceof HttpError && (err.status === 0 || (err.status && err.status >= 500 && err.status < 600))) || !(err instanceof HttpError);

      if (attempt < retries && shouldRetry) {
        const delay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
        const jittered = jitter(delay);
        // Basic console logging for now; can be replaced with Sentry breadcrumbs
        console.warn(`Request failed (attempt ${attempt + 1}/${retries}). Retrying in ${jittered}ms. error=${err.message}`);
        await sleep(jittered);
        return doRequest(attempt + 1);
      }

      // Map to ApiError
      if (err instanceof HttpError) {
        throw new ApiError(err.message, err.status, err.details);
      }
      throw new ApiError(err?.message || "Unknown error");
    }
  };

  return doRequest(0);
}

export default { apiRequest };
