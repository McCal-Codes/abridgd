import { AppState, Platform } from "react-native";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { credentialMeansSignOut, useAppleCredentialCheck } from "../useAppleCredentialCheck";

const mockGetState = jest.fn();
jest.mock("expo-apple-authentication", () => ({
  getCredentialStateAsync: (...args: unknown[]) => mockGetState(...args),
}));

describe("credentialMeansSignOut", () => {
  it("signs out only for revoked or not-found credentials", () => {
    expect(credentialMeansSignOut(0)).toBe(true); // REVOKED
    expect(credentialMeansSignOut(2)).toBe(true); // NOT_FOUND
    expect(credentialMeansSignOut(1)).toBe(false); // AUTHORIZED
    expect(credentialMeansSignOut(3)).toBe(false); // TRANSFERRED
  });
});

describe("useAppleCredentialCheck", () => {
  const originalOS = Platform.OS;
  let appStateHandler: ((state: string) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = "ios";
    appStateHandler = undefined;
    jest.spyOn(AppState, "addEventListener").mockImplementation(((_: string, handler: any) => {
      appStateHandler = handler;
      return { remove: jest.fn() };
    }) as any);
  });
  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  it("signs out when Apple reports the credential revoked", async () => {
    mockGetState.mockResolvedValue(0);
    const signOut = jest.fn();
    renderHook(() => useAppleCredentialCheck("000123.abc", signOut));
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(mockGetState).toHaveBeenCalledWith("000123.abc");
  });

  it("leaves an authorized profile alone", async () => {
    mockGetState.mockResolvedValue(1);
    const signOut = jest.fn();
    renderHook(() => useAppleCredentialCheck("000123.abc", signOut));
    await waitFor(() => expect(mockGetState).toHaveBeenCalled());
    expect(signOut).not.toHaveBeenCalled();
  });

  it("does not sign anyone out when the state cannot be read", async () => {
    mockGetState.mockRejectedValue(new Error("unavailable"));
    const signOut = jest.fn();
    renderHook(() => useAppleCredentialCheck("000123.abc", signOut));
    await waitFor(() => expect(mockGetState).toHaveBeenCalled());
    expect(signOut).not.toHaveBeenCalled();
  });

  it("checks again when the app returns to the foreground", async () => {
    mockGetState.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    const signOut = jest.fn();
    renderHook(() => useAppleCredentialCheck("000123.abc", signOut));
    await waitFor(() => expect(mockGetState).toHaveBeenCalledTimes(1));

    await act(async () => {
      appStateHandler?.("active");
    });
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
  });

  it("does nothing without an Apple id, or off iOS", async () => {
    const signOut = jest.fn();
    renderHook(() => useAppleCredentialCheck(undefined, signOut));
    Platform.OS = "android";
    renderHook(() => useAppleCredentialCheck("000123.abc", signOut));
    expect(mockGetState).not.toHaveBeenCalled();
  });
});
