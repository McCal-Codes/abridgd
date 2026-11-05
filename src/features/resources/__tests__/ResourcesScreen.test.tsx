import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Linking } from "react-native";
import { ResourcesScreen } from "../ResourcesScreen";
import { SettingsScreen } from "../../../screens/SettingsScreen";
import { openExternalUrl } from "../../../utils/openExternalUrl";

jest.mock("../../../utils/openExternalUrl", () => ({ openExternalUrl: jest.fn() }));

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe("ResourcesScreen", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
  });

  it("puts the emergency line first and lists both groups", () => {
    render(<ResourcesScreen />);
    expect(screen.getByText(/In an emergency, call 911/)).toBeTruthy();
    expect(screen.getByText("TALK TO SOMEONE NOW")).toBeTruthy();
    expect(screen.getByText("EVERYDAY NEEDS")).toBeTruthy();
    expect(screen.getByText("988 Suicide & Crisis Lifeline")).toBeTruthy();
    expect(screen.getByText("Allegheny Link")).toBeTruthy();
  });

  it("calls and texts through the phone, with a label that names the service", async () => {
    const open = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    render(<ResourcesScreen />);

    fireEvent.press(screen.getByLabelText("Call 988 Suicide & Crisis Lifeline"));
    await waitFor(() => expect(open).toHaveBeenCalledWith("tel:988"));

    fireEvent.press(screen.getByLabelText("Text 988 Suicide & Crisis Lifeline"));
    await waitFor(() => expect(open).toHaveBeenCalledWith("sms:988"));

    fireEvent.press(screen.getByLabelText("Call Re:solve Crisis Network"));
    await waitFor(() => expect(open).toHaveBeenCalledWith("tel:18887968226"));
  });

  it("opens an organization's website through the safe link opener", () => {
    render(<ResourcesScreen />);
    fireEvent.press(screen.getByLabelText("988 Suicide & Crisis Lifeline website"));
    expect(openExternalUrl).toHaveBeenCalledWith("https://988lifeline.org");
  });

  it("says when the numbers were last checked", () => {
    render(<ResourcesScreen />);
    expect(screen.getByText(/Numbers last checked Nov 5, 2026/)).toBeTruthy();
  });
});

describe("Settings entry", () => {
  it("has a Resources row that opens the screen", () => {
    mockNavigate.mockClear();
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText("Resources"));
    expect(mockNavigate).toHaveBeenCalledWith("Resources");
  });
});
