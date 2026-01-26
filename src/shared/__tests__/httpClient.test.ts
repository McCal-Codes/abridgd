import { request, HttpError } from "../api/httpClient";

describe("httpClient", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("builds URL with params and parses JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ hello: "world" }),
      headers: { get: () => "application/json" },
    } as any);

    const data = await request<{ hello: string }>("https://api.example.com", "/test", {
      method: "GET",
      params: { q: "search", page: 2 },
    });

    expect(data).toEqual({ hello: "world" });
    expect(global.fetch).toHaveBeenCalled();
    const calledWith = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(calledWith).toContain("q=search");
    expect(calledWith).toContain("page=2");
  });

  it("throws HttpError on non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ message: "not found" }),
      headers: { get: () => "application/json" },
    } as any);

    await expect(request("https://api.example.com", "/missing")).rejects.toBeInstanceOf(HttpError);
  });

  it("times out requests", async () => {
    jest.useFakeTimers();
    // Mock fetch that rejects on abort signal so the timeout path is exercised.
    global.fetch = jest.fn().mockImplementation((_url: string, init: any) => {
      return new Promise((_resolve, reject) => {
        if (init && init.signal && typeof init.signal.addEventListener === 'function') {
          init.signal.addEventListener('abort', () => {
            // mimic native fetch AbortError
            const err: any = new Error('Aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });
    });

    const p = request("https://api.example.com", "/slow", { timeoutMs: 1 });
    jest.advanceTimersByTime(10);

    await expect(p).rejects.toBeInstanceOf(HttpError);
    jest.useRealTimers();
  });
});
