const AVATAR_PALETTE = [
  "#D9822B", // amber
  "#4A7C59", // moss
  "#3B6E91", // slate blue
  "#A6483B", // brick
  "#7A5C9E", // plum
  "#4C8C7A", // teal
];

export const getInitials = (name?: string): string => {
  const trimmed = (name || "").trim();
  if (!trimmed) return "";

  const words = trimmed.split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return initials.toUpperCase();
};

export const getAvatarColor = (seed?: string): string => {
  const value = seed || "";
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
};
