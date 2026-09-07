/** Shared by every surface that shows a "last refreshed" label — Home, Section and Saved each
 * carried a byte-identical copy of this before. */
export const formatUpdatedAgo = (lastUpdated: Date | null): string | undefined => {
  if (!lastUpdated) return undefined;
  const diffMs = Date.now() - lastUpdated.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSeconds < 60) return "Updated just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Updated ${diffDays}d ago`;
};
