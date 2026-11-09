import {
  MAX_IMPORTED_ARTICLES,
  mergeSavedArticles,
  parseProfileTransfer,
  serializeProfileForTransfer,
  TRANSFER_PREFIX,
} from "../profileTransfer";
import { Article } from "../../types/Article";
import { Profile } from "../../types/Profile";

const article = (id: string, headline = `Story ${id}`): Article => ({
  id,
  headline,
  summary: "s",
  body: "<p>b</p>",
  source: "WESA",
  timestamp: "",
  publishedAt: 1,
  category: "Top",
  readTimeMinutes: 2,
});

const profile = (over: Partial<Profile> = {}): Profile => ({
  id: "p1",
  name: "Reader",
  codename: "Calm Otter",
  settingsTag: "Local profile",
  transferKey: "tk-1",
  stats: { articlesRead: 4, savedActions: 2, lastReadAt: 10, lastSavedAt: 20, lastFetchedArticleIds: ["x"], lastFetchedAt: 30 },
  achievements: { earnedIds: ["first"], earnedAt: { first: 5 }, version: 1 },
  savedArticles: [article("a"), article("b")],
  ...over,
});

describe("profile transfer keys", () => {
  it("round-trips a profile, including saved articles and stats", () => {
    const parsed = parseProfileTransfer(serializeProfileForTransfer(profile()))!;
    expect(parsed.id).toBe("p1");
    expect(parsed.name).toBe("Reader");
    expect(parsed.savedArticles.map((a) => a.id)).toEqual(["a", "b"]);
    expect(parsed.stats).toMatchObject({ articlesRead: 4, savedActions: 2 });
    expect(parsed.achievements?.earnedIds).toEqual(["first"]);
  });

  it("keeps curly quotes, dashes and emoji intact (the old encoder corrupted them)", () => {
    const tricky = "Council’s vote – “no” 🏛";
    const parsed = parseProfileTransfer(serializeProfileForTransfer(profile({ savedArticles: [article("u", tricky)] })))!;
    expect(parsed.savedArticles[0].headline).toBe(tricky);
  });

  it("never exports email, Apple id or display name", () => {
    const key = serializeProfileForTransfer(
      profile({ email: "a@b.com", appleUserId: "000123.abc", displayName: "Jane Q. Reader" }),
    );
    const parsed = parseProfileTransfer(key)! as Profile;
    expect(parsed.email).toBeUndefined();
    expect(parsed.appleUserId).toBeUndefined();
    expect(parsed.displayName).toBeUndefined();
    // Not just dropped on parse: the key itself carries none of it.
    expect(key).not.toContain("a@b.com");
  });

  it("is much smaller than plain base64 of the same profile", () => {
    const many = profile({
      savedArticles: Array.from({ length: 30 }, (_, i) => ({ ...article(String(i)), body: `<p>${"A paragraph of saved text. ".repeat(200)}</p>` })),
    });
    const legacy = Buffer.from(JSON.stringify(many), "utf8").toString("base64");
    expect(serializeProfileForTransfer(many).length).toBeLessThan(legacy.length / 5);
  });

  it("still reads a legacy base64 key, and drops identity from it", () => {
    const legacy = Buffer.from(
      JSON.stringify({ ...profile(), email: "a@b.com", appleUserId: "000123.abc" }),
      "utf8",
    ).toString("base64");
    const parsed = parseProfileTransfer(legacy)!;
    expect(parsed.id).toBe("p1");
    expect(parsed.savedArticles).toHaveLength(2);
    expect(parsed.email).toBeUndefined();
    expect(parsed.appleUserId).toBeUndefined();
  });

  it("reads non-ASCII text from a legacy key correctly", () => {
    const legacy = Buffer.from(JSON.stringify(profile({ name: "Zoë’s feed" })), "utf8").toString("base64");
    expect(parseProfileTransfer(legacy)!.name).toBe("Zoë’s feed");
  });

  it("rejects junk, empty and malformed keys", () => {
    expect(parseProfileTransfer("")).toBeNull();
    expect(parseProfileTransfer("   ")).toBeNull();
    expect(parseProfileTransfer("not a key")).toBeNull();
    expect(parseProfileTransfer(`${TRANSFER_PREFIX}garbage`)).toBeNull();
    expect(parseProfileTransfer(Buffer.from("{}", "utf8").toString("base64"))).toBeNull();
    expect(parseProfileTransfer(Buffer.from(JSON.stringify({ id: "x" }), "utf8").toString("base64"))).toBeNull();
  });

  it("drops malformed articles, unknown fields and oversized lists", () => {
    const messy = {
      id: "p1",
      name: "Reader",
      isAdmin: true,
      savedArticles: [article("ok"), { id: 5 }, null, { id: "no-headline" }, ...Array.from({ length: MAX_IMPORTED_ARTICLES + 50 }, (_, i) => article(`x${i}`))],
    };
    const parsed = parseProfileTransfer(Buffer.from(JSON.stringify(messy), "utf8").toString("base64"))!;
    // The list is cut to MAX_IMPORTED_ARTICLES first (4 head entries, 3 of them invalid, then 496
    // valid ones), then the invalid ones are dropped: 1 + 496.
    expect(parsed.savedArticles.length).toBe(1 + (MAX_IMPORTED_ARTICLES - 4));
    expect(parsed.savedArticles[0].id).toBe("ok");
    expect((parsed as any).isAdmin).toBeUndefined();
  });

  it("bounds the name and fills in missing stats", () => {
    const parsed = parseProfileTransfer(
      Buffer.from(JSON.stringify({ id: "p1", name: "N".repeat(500), savedArticles: [] }), "utf8").toString("base64"),
    )!;
    expect(parsed.name.length).toBeLessThanOrEqual(80);
    expect(parsed.stats).toMatchObject({ articlesRead: 0, savedActions: 0, lastFetchedArticleIds: [] });
  });
});

describe("mergeSavedArticles", () => {
  it("keeps the primary list and adds only what it lacks", () => {
    const merged = mergeSavedArticles([article("a"), article("b")], [article("b"), article("c")]);
    expect(merged.map((a) => a.id)).toEqual(["a", "b", "c"]);
  });

  it("returns the primary list itself when there is nothing to add", () => {
    const primary = [article("a")];
    expect(mergeSavedArticles(primary, [article("a")])).toBe(primary);
    expect(mergeSavedArticles(primary, undefined)).toBe(primary);
    expect(mergeSavedArticles(primary, [])).toBe(primary);
  });
});
