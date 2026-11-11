/**
 * Launcher icons a reader can choose between. `id: null` is the default icon the app ships with;
 * the others are the names registered in app.json under the expo-alternate-app-icons plugin.
 */
export interface AppIconOption {
  id: string | null;
  label: string;
  description: string;
}

export const APP_ICON_OPTIONS: AppIconOption[] = [
  { id: null, label: "Slate", description: "Default" },
  { id: "Teal", label: "Teal", description: "Matches the app accent" },
  { id: "Berry", label: "Berry", description: "Muted and warm" },
  { id: "Paper", label: "Paper", description: "Light, slate mark" },
];

/** Label for the icon currently in use; unknown names fall back to the default. */
export const getAppIconLabel = (id: string | null): string =>
  (APP_ICON_OPTIONS.find((option) => option.id === id) ?? APP_ICON_OPTIONS[0]).label;
