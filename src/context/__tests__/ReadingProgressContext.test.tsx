import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReadingProgressProvider, useReadingProgress } from "../ReadingProgressContext";

let renders = 0;
const Consumer = React.memo(() => {
  renders += 1;
  const { isLoading, progressData } = useReadingProgress();
  return <Text testID="state">{isLoading ? "loading" : `loaded:${Object.keys(progressData).length}`}</Text>;
});

const Harness = ({ tick }: { tick: number }) => (
  <ReadingProgressProvider>
    <Consumer />
    <Text>{tick}</Text>
  </ReadingProgressProvider>
);

describe("ReadingProgressProvider", () => {
  beforeEach(async () => {
    renders = 0;
    await AsyncStorage.clear();
  });

  it("does not re-render consumers when its parent re-renders and nothing changed", async () => {
    const { rerender } = render(<Harness tick={0} />);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("loaded:0"));
    const settled = renders;

    for (let tick = 1; tick <= 5; tick += 1) {
      rerender(<Harness tick={tick} />);
    }
    await act(async () => {});

    // The provider re-rendered five times; the memoized value meant no consumer did.
    expect(renders).toBe(settled);
  });
});
