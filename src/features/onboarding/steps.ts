import { RSS_FEEDS } from "../../data/feedConfig";
import { ArticleCategory } from "../../types/Article";

/** The six steps of first-run onboarding, in order. */
export const STEP_IDS = ["welcome", "newsrooms", "reader", "heavy-stories", "around", "ready"] as const;
export type StepId = (typeof STEP_IDS)[number];

/**
 * Slide ids the previous onboarding used, and ids that other screens passed (App Info sent
 * "practice", which no slide ever had, so the button dropped readers on slide one). Anything that
 * maps here lands on the step that now covers it.
 */
const LEGACY_STEP_IDS: Record<string, StepId> = {
  practice: "reader",
  "rsvp-demo": "reader",
  sections: "newsrooms",
  "make-it-yours": "newsrooms",
  grounding: "heavy-stories",
};

/** Index of the step to open on, or 0 for a missing or unknown id. */
export const resolveStartStep = (id?: string | null): number => {
  if (!id) return 0;
  const direct = STEP_IDS.indexOf(id as StepId);
  if (direct >= 0) return direct;
  const legacy = LEGACY_STEP_IDS[id];
  return legacy ? STEP_IDS.indexOf(legacy) : 0;
};

export interface OnboardingSource {
  category: ArticleCategory;
  name: string;
  /** What the source does when the reader has made no choice. */
  defaultEnabled: boolean;
}

/**
 * The outlets offered on the newsrooms step: the general-news ones (Top and Local) that are
 * working and on by default. Sports, business and culture feeds are one tap away in Settings; the
 * welcome should not read like a settings dump.
 */
export const getOnboardingSources = (): OnboardingSource[] =>
  (["Top", "Local"] as ArticleCategory[]).flatMap((category) =>
    (RSS_FEEDS[category] ?? [])
      .filter((source) => source.health === "healthy" && source.defaultEnabled !== false)
      .map((source) => ({ category, name: source.name, defaultEnabled: true })),
  );

/** What the heavy-stories step offers, mapped onto the existing content-note settings. */
export type HeavyStoriesChoice = "notes" | "pause" | "off";

export interface HeavyStoriesSettings {
  isGroundingEnabled: boolean;
  sensitivePromptLevel: "full" | "minimal" | "off";
  sensitiveActionPreference: "ground-first" | "decide" | "continue";
}

export const choiceFromSettings = (s: HeavyStoriesSettings): HeavyStoriesChoice => {
  if (!s.isGroundingEnabled || s.sensitivePromptLevel === "off") return "off";
  return s.sensitiveActionPreference === "ground-first" ? "pause" : "notes";
};
