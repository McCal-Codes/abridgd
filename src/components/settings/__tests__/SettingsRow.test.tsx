import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SettingsDisclosureRow, SettingsToggleRow } from "../SettingsRow";

describe("SettingsToggleRow", () => {
  it("announces as a switch carrying its label, description and checked state", () => {
    const { getByRole } = render(
      <SettingsToggleRow
        label="Reduce Motion"
        description="Limit animations for motion-sensitive users."
        value
        onValueChange={jest.fn()}
      />,
    );

    const row = getByRole("switch");
    expect(row.props.accessibilityLabel).toBe("Reduce Motion");
    expect(row.props.accessibilityHint).toBe("Limit animations for motion-sensitive users.");
    expect(row.props.accessibilityState).toMatchObject({ checked: true });
  });

  it("toggles from anywhere on the row, not just the switch thumb", () => {
    const onValueChange = jest.fn();

    const { getByRole } = render(
      <SettingsToggleRow label="Reduce Motion" value={false} onValueChange={onValueChange} />,
    );

    fireEvent.press(getByRole("switch"));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it("reports disabled state and ignores presses when disabled", () => {
    const onValueChange = jest.fn();

    const { getByRole } = render(
      <SettingsToggleRow label="Blur" value onValueChange={onValueChange} disabled />,
    );

    const row = getByRole("switch");
    expect(row.props.accessibilityState).toMatchObject({ disabled: true });

    fireEvent.press(row);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("SettingsDisclosureRow", () => {
  it("folds the current value into the label so it is announced with the row", () => {
    const { getByRole } = render(
      <SettingsDisclosureRow label="Default tab" value="Home" onPress={jest.fn()} />,
    );

    expect(getByRole("button").props.accessibilityLabel).toBe("Default tab, Home");
  });
});
