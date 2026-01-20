// Central tab configuration (ids only) to keep navigation/layout consistent
export const allowedTabs = {
  minimal: ["home", "discover", "saved", "digest", "profile"] as const,
  comprehensive: ["top", "local", "digest", "saved", "profile"] as const,
};

export const defaultTabs = {
  minimal: ["home", "discover", "saved", "digest", "profile"] as const,
  comprehensive: ["top", "local", "digest", "saved", "profile"] as const,
};
