import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AppIconSettingsScreen } from "../AppIconSettingsScreen";

const mockSet = jest.fn();
const mockGet = jest.fn();
jest.mock("expo-alternate-app-icons", () => ({
  supportsAlternateIcons: true,
  getAppIconName: () => mockGet(),
  setAlternateAppIcon: (name: string | null) => mockSet(name),
}));

describe("AppIconSettingsScreen", () => {
  beforeEach(() => {
    mockSet.mockReset().mockResolvedValue(null);
    mockGet.mockReset().mockReturnValue(null);
  });

  it("marks the current icon as selected", () => {
    mockGet.mockReturnValue("Berry");
    const { getByTestId } = render(<AppIconSettingsScreen />);
    expect(getByTestId("app-icon-berry").props.accessibilityState.selected).toBe(true);
    expect(getByTestId("app-icon-slate").props.accessibilityState.selected).toBe(false);
  });

  it("applies the chosen icon and moves the selection", async () => {
    const { getByTestId } = render(<AppIconSettingsScreen />);
    fireEvent.press(getByTestId("app-icon-teal"));
    await waitFor(() => expect(mockSet).toHaveBeenCalledWith("Teal"));
    await waitFor(() =>
      expect(getByTestId("app-icon-teal").props.accessibilityState.selected).toBe(true),
    );
  });

  it("resets to the default icon with null", async () => {
    mockGet.mockReturnValue("Paper");
    const { getByTestId } = render(<AppIconSettingsScreen />);
    fireEvent.press(getByTestId("app-icon-slate"));
    await waitFor(() => expect(mockSet).toHaveBeenCalledWith(null));
  });

  it("does nothing when the current icon is pressed again", () => {
    const { getByTestId } = render(<AppIconSettingsScreen />);
    fireEvent.press(getByTestId("app-icon-slate"));
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("keeps the old selection and shows an error when the change fails", async () => {
    mockSet.mockRejectedValue(new Error("nope"));
    const { getByTestId, findByText } = render(<AppIconSettingsScreen />);
    fireEvent.press(getByTestId("app-icon-berry"));
    expect(await findByText("Couldn't change the icon. Try again.")).toBeTruthy();
    expect(getByTestId("app-icon-slate").props.accessibilityState.selected).toBe(true);
  });
});
