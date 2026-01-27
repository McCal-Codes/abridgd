// Central tab configuration (ids only) to keep navigation/layout consistent
export type TabLayoutMode = "simple" | "standard" | "power";

export const allowedTabs: Record<TabLayoutMode, readonly string[]> = {
  simple: ["home", "settings"] as const,
  standard: ["home", "discover", "saved", "digest", "profile"] as const,
  power: ["top", "local", "digest", "saved", "profile"] as const,
};

export const defaultTabs: Record<TabLayoutMode, readonly string[]> = {
  simple: ["home", "settings"] as const,
  standard: ["home", "discover", "saved", "digest", "profile"] as const,
  power: ["top", "local", "digest", "saved", "profile"] as const,
};
