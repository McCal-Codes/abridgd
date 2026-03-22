export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: unknown;
  timeoutMs?: number;
};

function buildUrl(baseUrl: string, path: string, params?: RequestOptions["params"]) {
  const url = new URL(path, baseUrl);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

export class HttpError extends Error {
  status?: number;
  details?: unknown;
  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export async function request<T = unknown>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", headers = {}, params, body, timeoutMs = 15000 } = options;
  const url = buildUrl(baseUrl, path, params);

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    signal: controller.signal,
  };

  if (body !== undefined) {
    // allow FormData etc. to be passed through if not plain object
    fetchOptions.body =
      typeof body === "object" && !(body instanceof FormData)
        ? JSON.stringify(body)
        : (body as any);
  }

  try {
    const res = await fetch(url, fetchOptions);
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";
    const parsed = contentType.includes("application/json") && text ? JSON.parse(text) : text;

    if (!res.ok) {
      throw new HttpError(`HTTP Error ${res.status}`, res.status, parsed);
    }

    return parsed as T;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new HttpError("Request timed out", 0, err);
    }
    if (err instanceof HttpError) throw err;
    throw new HttpError(err.message || "Network error");
  } finally {
    clearTimeout(id);
  }
}
