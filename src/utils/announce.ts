import { AccessibilityInfo } from "react-native";

/**
 * Speaks a status update to VoiceOver.
 *
 * Pull-to-refresh is a purely visual event: the spinner appears and the list changes underneath.
 * A screen-reader user who triggers a refresh otherwise gets no confirmation that anything
 * happened, or that it failed.
 */
export const announceForAccessibility = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

/** Standard refresh outcome phrasing, so every surface says the same thing. */
export const announceRefreshResult = (count: number, failed: boolean) => {
  if (failed) {
    announceForAccessibility("Couldn't refresh. Showing the stories already loaded.");
    return;
  }
  announceForAccessibility(count === 1 ? "1 story loaded" : `${count} stories loaded`);
};
