import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { ErrorBoundary } from "../ErrorBoundary";

jest.mock("@sentry/react-native", () => ({ captureException: jest.fn() }));

let shouldThrow = true;
const Bomb = () => {
  if (shouldThrow) throw new Error("internal parser failure at line 42");
  return <Text>recovered</Text>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    shouldThrow = true;
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("shows a calm message that reassures about saved data", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong.")).toBeTruthy();
    expect(screen.getByText(/saved articles and settings are safe/)).toBeTruthy();
  });

  it("recovers when Try again is pressed and the problem is gone", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    shouldThrow = false;
    fireEvent.press(screen.getByLabelText("Try again"));
    expect(screen.getByText("recovered")).toBeTruthy();
  });

  it("renders children untouched when nothing throws", () => {
    shouldThrow = false;
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText("recovered")).toBeTruthy();
  });
});
