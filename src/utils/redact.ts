/**
 * Redaction for anything that leaves the app's own storage: debug dumps, share sheets and
 * console output (which Sentry records as breadcrumbs). AsyncStorage and settings hold an
 * API key, a profile email and an Apple user id, none of which belong in a shared log.
 */

const REDACTED = "[redacted]";

/** Key names whose values must never be dumped. Matched case-insensitively as substrings. */
const SENSITIVE_KEY_PATTERN = /(api[-_]?key|token|secret|password|passcode|apple[-_]?user|email)/i;

export const isSensitiveKey = (key: string): boolean => SENSITIVE_KEY_PATTERN.test(key);

/**
 * Serialized profile blobs (`profiles_v1`, exported keys) embed the email and Apple id inside
 * a JSON string, so a key-name check alone would miss them. Redact them by JSON field name too.
 */
const redactJsonString = (value: string): string =>
  value.replace(
    /("(?:[^"\\]*?(?:api[-_]?key|token|secret|password|passcode|apple[-_]?user[-_]?id|email)[^"\\]*?)"\s*:\s*)"(?:[^"\\]|\\.)*"/gi,
    `$1"${REDACTED}"`,
  );

export const redactValue = (key: string, value: unknown): unknown => {
  if (isSensitiveKey(key)) {
    return value === null || value === undefined || value === "" ? value : REDACTED;
  }
  return typeof value === "string" ? redactJsonString(value) : value;
};

/** Redact a flat record of settings (the settings context, for example). */
export const redactRecord = <T extends Record<string, unknown>>(record: T): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = redactValue(key, value);
  }
  return out;
};

/** Redact AsyncStorage `[key, value]` pairs, as returned by `multiGet`. */
export const redactStorageEntries = (
  entries: ReadonlyArray<readonly [string, string | null]>,
): Array<[string, string | null]> =>
  entries.map(([key, value]) => [key, redactValue(key, value) as string | null]);
