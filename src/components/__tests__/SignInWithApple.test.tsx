import React from "react";
import { act, render, waitFor, fireEvent } from "@testing-library/react-native";
import { SignInWithApple } from "../SignInWithApple";

const mockIsAvailableAsync = jest.fn();
const mockSignInAsync = jest.fn();

jest.mock("expo-apple-authentication", () => {
  const ReactLocal = require("react");
  const { Pressable: RNPressable, Text: RNText } = require("react-native");

  return {
    isAvailableAsync: (...args: unknown[]) => mockIsAvailableAsync(...args),
    signInAsync: (...args: unknown[]) => mockSignInAsync(...args),
    formatFullName: (fullName: { givenName?: string; familyName?: string }) =>
      [fullName?.givenName, fullName?.familyName].filter(Boolean).join(" "),
    AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
    AppleAuthenticationButtonType: { SIGN_IN: 0 },
    AppleAuthenticationButtonStyle: { WHITE: 0, BLACK: 2 },
    AppleAuthenticationButton: ({ onPress }: { onPress: () => void }) =>
      ReactLocal.createElement(
        RNPressable,
        { onPress, testID: "apple-auth-button" },
        ReactLocal.createElement(RNText, {}, "Sign in with Apple"),
      ),
  };
});

describe("SignInWithApple", () => {
  beforeEach(() => {
    mockIsAvailableAsync.mockReset();
    mockSignInAsync.mockReset();
  });

  it("renders nothing when Apple authentication is unavailable", async () => {
    mockIsAvailableAsync.mockResolvedValue(false);
    const { queryByTestId } = render(<SignInWithApple />);

    await waitFor(() => {
      expect(mockIsAvailableAsync).toHaveBeenCalled();
    });

    expect(queryByTestId("apple-auth-button")).toBeNull();
  });

  it("calls onSuccess with the mapped credential after a successful sign-in", async () => {
    mockIsAvailableAsync.mockResolvedValue(true);
    mockSignInAsync.mockResolvedValue({
      user: "apple-user-1",
      email: "reader@example.com",
      fullName: { givenName: "Ada", familyName: "Lovelace" },
    });
    const onSuccess = jest.fn();

    const { findByTestId } = render(<SignInWithApple onSuccess={onSuccess} />);
    const button = await findByTestId("apple-auth-button");

    await act(async () => {
      fireEvent.press(button);
    });

    expect(onSuccess).toHaveBeenCalledWith({
      id: "apple-user-1",
      email: "reader@example.com",
      displayName: "Ada Lovelace",
    });
  });

  it("calls onError for a real failure", async () => {
    mockIsAvailableAsync.mockResolvedValue(true);
    mockSignInAsync.mockRejectedValue(new Error("network down"));
    const onError = jest.fn();

    const { findByTestId } = render(<SignInWithApple onError={onError} />);
    const button = await findByTestId("apple-auth-button");

    await act(async () => {
      fireEvent.press(button);
    });

    expect(onError).toHaveBeenCalled();
  });

  it("stays silent when the user cancels the native sheet", async () => {
    mockIsAvailableAsync.mockResolvedValue(true);
    const cancelError: any = new Error("canceled");
    cancelError.code = "ERR_REQUEST_CANCELED";
    mockSignInAsync.mockRejectedValue(cancelError);
    const onError = jest.fn();
    const onSuccess = jest.fn();

    const { findByTestId } = render(<SignInWithApple onSuccess={onSuccess} onError={onError} />);
    const button = await findByTestId("apple-auth-button");

    await act(async () => {
      fireEvent.press(button);
    });

    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
