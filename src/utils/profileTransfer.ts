import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { Article } from "../types/Article";
import { AchievementState, Profile } from "../types/Profile";

/**
 * The "profile key" a person copies between devices.
 *
 * Format v2: `abr2:` followed by the profile JSON compressed with lz-string. Compressing matters:
 * the old key was plain base64 of the whole profile including every saved article's full HTML, so
 * a reader with a few dozen saved stories produced a multi-megabyte share message. It also fixes a
 * unicode bug: the old encoder fell back to `Buffer` for text `btoa` rejects (curly quotes and dashes
 * are everywhere in headlines), but the decoder used `atob`, which turns UTF-8 bytes into mojibake.
 *
 * Identity never travels. `appleUserId`, `email` and `displayName` are left out of exported keys and
 * ignored on import, so a key pasted into a chat cannot make another device think it is signed in
 * as you, and importing a stranger's key cannot claim your Apple account.
 */

export const TRANSFER_PREFIX = "abr2:";
export const MAX_IMPORTED_ARTICLES = 500;
const MAX_NAME_LENGTH = 80;
const MAX_ID_LENGTH = 100;

const isString = (v: unknown): v is string => typeof v === "string";
const isFiniteNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** The parts of a profile that are safe and useful to carry to another device. */
export const serializeProfileForTransfer = (profile: Profile): string => {
  const payload = {
    v: 2,
    profile: {
      id: profile.id,
      name: profile.name,
      codename: profile.codename,
      settingsTag: profile.settingsTag,
      transferKey: profile.transferKey,
      stats: profile.stats,
      achievements: profile.achievements,
      savedArticles: profile.savedArticles,
    },
  };
  return TRANSFER_PREFIX + compressToEncodedURIComponent(JSON.stringify(payload));
};

/** UTF-8 bytes held in a Latin-1 "binary string" (what `atob` returns) back to real text. */
const utf8FromBinary = (binary: string): string => {
  try {
    return decodeURIComponent(
      binary
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
  } catch {
    return binary; // not valid UTF-8: it was plain Latin-1 text
  }
};

const decodeLegacyBase64 = (key: string): string | null => {
  try {
    if (typeof atob === "function") return utf8FromBinary(atob(key));
  } catch {
    // fall through to Buffer
  }
  try {
    return Buffer.from(key, "base64").toString("utf8");
  } catch {
    return null;
  }
};

const sanitizeArticle = (raw: unknown): Article | null => {
  const a = raw as Partial<Article> | null;
  if (!a || !isString(a.id) || !a.id || a.id.length > 500 || !isString(a.headline)) return null;
  // Spread keeps every optional field the app stores; the required ones are checked or defaulted.
  return {
    ...(a as Article),
    id: a.id,
    headline: a.headline,
    summary: isString(a.summary) ? a.summary : "",
    body: isString(a.body) ? a.body : "",
    source: isString(a.source) ? a.source : "",
    timestamp: isString(a.timestamp) ? a.timestamp : "",
    publishedAt: isFiniteNumber(a.publishedAt) ? a.publishedAt : 0,
    category: a.category ?? "Top",
    readTimeMinutes: isFiniteNumber(a.readTimeMinutes) ? a.readTimeMinutes : 1,
  };
};

const sanitizeStats = (raw: unknown): Profile["stats"] => {
  const s = (raw ?? {}) as NonNullable<Profile["stats"]>;
  return {
    articlesRead: isFiniteNumber(s.articlesRead) ? Math.max(0, s.articlesRead) : 0,
    savedActions: isFiniteNumber(s.savedActions) ? Math.max(0, s.savedActions) : 0,
    lastReadAt: isFiniteNumber(s.lastReadAt) ? s.lastReadAt : null,
    lastSavedAt: isFiniteNumber(s.lastSavedAt) ? s.lastSavedAt : null,
    lastFetchedArticleIds: Array.isArray(s.lastFetchedArticleIds)
      ? s.lastFetchedArticleIds.filter(isString).slice(0, 200)
      : [],
    lastFetchedAt: isFiniteNumber(s.lastFetchedAt) ? s.lastFetchedAt : null,
  };
};

const sanitizeAchievements = (raw: unknown): AchievementState | undefined => {
  const a = raw as AchievementState | null;
  if (!a || !Array.isArray(a.earnedIds)) return undefined;
  return {
    earnedIds: a.earnedIds.filter(isString).slice(0, 100),
    earnedAt: a.earnedAt && typeof a.earnedAt === "object" ? a.earnedAt : undefined,
    version: isFiniteNumber(a.version) ? a.version : undefined,
  };
};

/** Builds a clean profile from untrusted input: known fields only, bounded, identity dropped. */
const sanitizeProfile = (raw: unknown): Profile | null => {
  const p = raw as Record<string, unknown> | null;
  if (!p || typeof p !== "object") return null;
  if (!isString(p.id) || !p.id.trim() || p.id.length > MAX_ID_LENGTH) return null;
  if (!isString(p.name) || !p.name.trim()) return null;

  const articles = (Array.isArray(p.savedArticles) ? p.savedArticles : [])
    .slice(0, MAX_IMPORTED_ARTICLES)
    .map(sanitizeArticle)
    .filter((a): a is Article => a !== null);

  return {
    id: p.id.trim(),
    name: p.name.trim().slice(0, MAX_NAME_LENGTH),
    codename: isString(p.codename) ? p.codename.slice(0, MAX_NAME_LENGTH) : undefined,
    settingsTag: isString(p.settingsTag) ? p.settingsTag.slice(0, MAX_NAME_LENGTH) : undefined,
    transferKey: isString(p.transferKey) ? p.transferKey.slice(0, MAX_ID_LENGTH) : undefined,
    stats: sanitizeStats(p.stats),
    achievements: sanitizeAchievements(p.achievements),
    savedArticles: articles,
  };
};

/** Parses a v2 key or a legacy base64 key into a clean profile, or null if it is not one. */
export const parseProfileTransfer = (rawKey: string): Profile | null => {
  const key = rawKey.trim();
  if (!key) return null;

  try {
    if (key.startsWith(TRANSFER_PREFIX)) {
      const json = decompressFromEncodedURIComponent(key.slice(TRANSFER_PREFIX.length));
      if (!json) return null;
      const payload = JSON.parse(json) as { v?: number; profile?: unknown };
      if (payload?.v !== 2) return null;
      return sanitizeProfile(payload.profile);
    }

    const json = decodeLegacyBase64(key);
    return json ? sanitizeProfile(JSON.parse(json)) : null;
  } catch {
    return null;
  }
};

/**
 * Saved articles from two sources, once each: everything in `primary`, then anything in `extra`
 * that `primary` does not have. Used to fold a profile's mirrored list (the imported articles)
 * into what is already stored, so neither side is lost.
 */
export const mergeSavedArticles = (primary: Article[], extra: Article[] | undefined): Article[] => {
  if (!extra || extra.length === 0) return primary;
  const seen = new Set(primary.map((a) => a.id));
  const additions = extra.filter((a) => a && !seen.has(a.id));
  return additions.length === 0 ? primary : [...primary, ...additions];
};
