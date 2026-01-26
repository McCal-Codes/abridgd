jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

import * as Sentry from "@sentry/react-native";
import { apiRequest, telemetry } from "../api/apiClient";
import { authService } from "../../services/AuthService";

describe("apiClient Sentry integration", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
    authService.setToken(undefined);
  });

  it("adds breadcrumbs for retries and success", async () => {
    // first attempt: server error 500, second attempt: success
    let called = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      called += 1;
      if (called === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          text: async () => "",
          headers: { get: () => "" },
        } as any);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ ok: true }),
        headers: { get: () => "application/json" },
      } as any);
    });

    // Spy on telemetry used by the client
    const telemetryBreadcrumbSpy = jest.fn();
    (telemetry as any).addBreadcrumb = telemetryBreadcrumbSpy;

    const res = await apiRequest("https://api.example.com", "/retry", {}, { retries: 1 });
    expect(res).toEqual({ ok: true });

    // Expect telemetry breadcrumbs for error and eventual success
    const messages = telemetryBreadcrumbSpy.mock.calls.map((c) => (c[0] && c[0].message) || "");
    expect(messages.length).toBeGreaterThan(0);
    expect(
      messages.some((m: string) => m.includes("request:error") || m.includes("request:retry")),
    ).toBe(true);
    expect(messages.some((m: string) => m.includes("request:success"))).toBe(true);
  });

  it("adds breadcrumbs for auth refresh flow", async () => {
    authService.setToken({ accessToken: "old", refreshToken: "refresh" });

    let called = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      called += 1;
      if (called === 1)
        return Promise.resolve({
          ok: false,
          status: 401,
          text: async () => JSON.stringify({}),
          headers: { get: () => "application/json" },
        } as any);
      return Promise.resolve({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ ok: true }),
        headers: { get: () => "application/json" },
      } as any);
    });

    // Spy on telemetry used by the client
    const telemetryBreadcrumbSpy = jest.fn();
    (telemetry as any).addBreadcrumb = telemetryBreadcrumbSpy;

    const res = await apiRequest("https://api.example.com", "/refresh", {}, { includeAuth: true });
    expect(res).toEqual({ ok: true });

    const msgs = telemetryBreadcrumbSpy.mock.calls.map((c) => (c[0] && c[0].message) || "");
    // auth refresh should record attempt and success breadcrumbs (or at least auth:refresh strings)
    expect(msgs.length).toBeGreaterThan(0);
    expect(msgs.some((m: string) => m.includes("auth:refresh"))).toBe(true);
  });
});
