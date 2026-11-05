import type { Breadcrumb } from "@sentry/react-native";

/**
 * Breadcrumb scrubbing for crash reports. Console and network breadcrumbs are recorded
 * automatically and carry article and feed URLs, which would tell us what someone read. The
 * product promise is "no analytics watching how you read", so crash reports keep the host
 * (useful for debugging a failing source) and drop paths, queries and console text.
 */

const hostOnly = (url: string): string => {
  const match = /^(https?:\/\/[^/?#\s]+)/i.exec(url);
  return match ? match[1] : "[url]";
};

const URL_IN_TEXT = /https?:\/\/[^\s"'<>)]+/gi;

export const scrubBreadcrumb = (breadcrumb: Breadcrumb): Breadcrumb | null => {
  const scrubbed: Breadcrumb = { ...breadcrumb };

  // Console output is free text that may contain article titles or URLs.
  if (scrubbed.category === "console") {
    return { ...scrubbed, message: "[console message removed]", data: undefined };
  }

  if (typeof scrubbed.message === "string") {
    scrubbed.message = scrubbed.message.replace(URL_IN_TEXT, (match) => hostOnly(match));
  }

  if (scrubbed.data && typeof scrubbed.data === "object") {
    const data: Record<string, unknown> = { ...scrubbed.data };
    for (const key of ["url", "from", "to"]) {
      if (typeof data[key] === "string") {
        data[key] = hostOnly(data[key] as string);
      }
    }
    scrubbed.data = data;
  }

  return scrubbed;
};
