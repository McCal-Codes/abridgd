import { request, HttpError } from "./httpClient";
import { authService } from "../../services/AuthService";
import * as Sentry from "@sentry/react-native";

export const telemetry = {
  addBreadcrumb: (payload: Parameters<typeof Sentry.addBreadcrumb>[0]) => {
    try {
      if (Sentry && typeof Sentry.addBreadcrumb === "function") {
        Sentry.addBreadcrumb(payload);
      }
    } catch (e) {
      // telemetry errors must not break flows
      // eslint-disable-next-line no-console
      console.debug("Sentry breadcrumb failed - apiClient.ts:14", e);
    }
  },
  captureException: (err: unknown) => {
    try {
      if (Sentry && typeof Sentry.captureException === "function") {
        Sentry.captureException(err);
      }
    } catch (_e) {
      // ignore
    }
  },
};

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
  clientOpts: ApiClientOptions = {},
): Promise<T> {
  const { retries = 2, baseDelayMs = 200, maxDelayMs = 2000, includeAuth = false } = clientOpts;

  const startTime = Date.now();

  // Build headers and potentially attach auth
  const doRequest = async (attempt: number): Promise<T> => {
    const headers = { ...(opts.headers || {}) } as Record<string, string>;

    if (includeAuth) {
      const token = authService.getAccessToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    telemetry.addBreadcrumb({
      category: "api",
      message: `request:start ${path}`,
      data: { baseUrl, path, attempt },
    });

    try {
      const res = await request<T>(baseUrl, path, { ...opts, headers });
      telemetry.addBreadcrumb({
        category: "api",
        message: `request:success ${path}`,
        data: { durationMs: Date.now() - startTime, attempt },
      });
      return res;
    } catch (err: any) {
      telemetry.addBreadcrumb({
        category: "api",
        message: `request:error ${path}`,
        data: { message: err?.message, status: err?.status },
      });

      // If unauthorized and we have a refresh flow, try refresh once
      if (err instanceof HttpError && (err.status === 401 || err.status === 403) && includeAuth) {
        try {
          telemetry.addBreadcrumb({ category: "api", message: `auth:refresh:attempt ${path}` });
          const newToken = await authService.refreshToken();
          if (newToken) {
            telemetry.addBreadcrumb({ category: "api", message: `auth:refresh:success ${path}` });
            // Retry immediately once with refreshed token
            const headers2 = {
              ...(opts.headers || {}),
              Authorization: `Bearer ${newToken}`,
            } as Record<string, string>;
            const res2 = await request<T>(baseUrl, path, { ...opts, headers: headers2 });
            telemetry.addBreadcrumb({
              category: "api",
              message: `request:success-after-refresh ${path}`,
              data: { durationMs: Date.now() - startTime },
            });
            return res2;
          }
        } catch (refreshErr) {
          telemetry.addBreadcrumb({
            category: "api",
            message: `auth:refresh:failed ${path}`,
            data: { message: (refreshErr as any)?.message },
          });
          // fall through to error handling below
        }
      }

      // Retry on network errors or 5xx
      const shouldRetry =
        (err instanceof HttpError &&
          (err.status === 0 || (err.status && err.status >= 500 && err.status < 600))) ||
        !(err instanceof HttpError);

      if (attempt < retries && shouldRetry) {
        const delay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
        const jittered = jitter(delay);
        // Basic console logging for now; instrumented with breadcrumb
        console.warn(
          `Request failed (attempt ${attempt + 1}/${retries}). Retrying in ${jittered}ms. error=${err.message}`,
        );
        telemetry.addBreadcrumb({
          category: "api",
          message: `request:retry ${path}`,
          data: { attempt, delay: jittered },
        });
        await sleep(jittered);
        return doRequest(attempt + 1);
      }

      // Map to ApiError
      telemetry.addBreadcrumb({
        category: "api",
        message: `request:failed ${path}`,
        data: { durationMs: Date.now() - startTime, message: err?.message },
      });
      try {
        telemetry.captureException(err);
      } catch (captureErr) {
        // ignore
      }

      if (err instanceof HttpError) {
        throw new ApiError(err.message, err.status, err.details);
      }
      throw new ApiError(err?.message || "Unknown error");
    }
  };

  return doRequest(0);
}

export default { apiRequest };
