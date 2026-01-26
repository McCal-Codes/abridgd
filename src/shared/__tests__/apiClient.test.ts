import { apiRequest, ApiError } from "../api/apiClient";
import { authService } from "../../services/AuthService";

describe("apiClient", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
    authService.setToken(undefined);
  });

  it("attaches Authorization header when token present", async () => {
    authService.setToken({ accessToken: "abc123", refreshToken: "r" });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true }),
      headers: { get: () => "application/json" },
    } as any);

    const res = await apiRequest("https://api.example.com", "/whoami", {}, { includeAuth: true });
    expect(res).toEqual({ ok: true });
    const calledOpts = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(calledOpts.headers.Authorization).toContain("abc123");
  });

  it("refreshes token on 401 and retries", async () => {
    // seed token
    authService.setToken({ accessToken: "old", refreshToken: "refresh-me" });

    // first response: 401
    const first = jest.fn().mockResolvedValue({ ok: false, status: 401, text: async () => JSON.stringify({ msg: 'unauth' }), headers: { get: () => 'application/json' } } as any);
    // second response: success
    const second = jest.fn().mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ ok: true }), headers: { get: () => 'application/json' } } as any);

    let called = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      called += 1;
      return called === 1 ? first() : second();
    });

    const res = await apiRequest("https://api.example.com", "/refresh", {}, { includeAuth: true });
    expect(res).toEqual({ ok: true });
    expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("retries on network failures with backoff and eventually throws ApiError", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down"));

    await expect(apiRequest("https://api.example.com", "/fail", {}, { retries: 2, baseDelayMs: 1 })).rejects.toBeInstanceOf(ApiError);
    expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});
