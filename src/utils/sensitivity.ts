import { Article, ContentWarning } from "../types/Article";

export type SensitivityTriggerSource = "none" | "editorial" | "heuristic";

export interface SensitivityAssessment {
  reasons: ContentWarning[];
  intensity: "low" | "medium" | "high";
  triggerSource: SensitivityTriggerSource;
  shouldOfferGrounding: boolean;
}

const WARNING_COPY: Record<ContentWarning, string> = {
  politics: "political conflict or election news",
  "violence-realistic": "violence or injury",
  "violence-graphic": "graphic or sadistic violence",
  "violence-fantasy": "fantasy or stylized violence",
  war: "war or military conflict",
  terrorism: "terrorism or extremist attacks",
  abuse: "abuse or assault",
  crime: "crime or legal proceedings",
  disaster: "disaster or accident",
  "self-harm": "self-harm or suicide",
  health: "health or pandemic impacts",
  medical: "medical treatment or procedures",
  "sexual-content": "sexual themes or intimacy",
  "sexual-content-graphic": "graphic sexual content or assault",
  "mature-themes": "mature or suggestive themes",
  "substance-use": "alcohol, tobacco, or drug use",
  gambling: "gambling references",
  "hate-speech": "hate speech or targeted harassment",
  graphic: "graphic descriptions",
};

const WARNING_GUIDANCE: Record<ContentWarning, string> = {
  politics:
    "This piece covers political conflict. Pause and steady your breath before taking it in.",
  "violence-realistic": "Mentions of violence ahead. Gentle breaths can help you stay grounded.",
  "violence-graphic": "Graphic violence is described. Keep inhales soft and let exhales run long.",
  "violence-fantasy": "Stylized or fantasy violence is referenced. Ease into the story when ready.",
  war: "War and conflict coverage can be heavy. Take a grounding breath first.",
  terrorism: "Terror-related events are discussed. Give yourself a calm moment before reading.",
  abuse: "Accounts of abuse appear in this article. Check in with your body before continuing.",
  crime: "Crime and legal details follow. Slow inhales can help keep you present.",
  disaster: "Disaster or accident coverage ahead. Let shoulders drop before you proceed.",
  "self-harm": "Self-harm or suicide is mentioned. Take the time you need before reading.",
  health: "Health or pandemic impacts are discussed. Take a centering breath first.",
  medical: "Medical procedures are described. Stay gentle with yourself as you read.",
  "sexual-content": "Sexual themes appear. Move forward only when you feel ready.",
  "sexual-content-graphic":
    "Graphic sexual content or assault is described. Pause and breathe before continuing.",
  "mature-themes": "Mature themes like grief or trauma arise. Check in with how you feel.",
  "substance-use": "Substance use is mentioned. Take a calm inhale and exhale.",
  gambling: "Gambling content appears. Restore your focus with a breath if needed.",
  "hate-speech":
    "Hate speech or targeted harassment is referenced. Let a steady breath keep you grounded.",
  graphic: "Graphic descriptions are included. Take your time before reading on.",
};

const WARNING_KEYWORDS: Record<ContentWarning, RegExp[]> = {
  politics: [
    /election/i,
    /senate/i,
    /house of representatives/i,
    /campaign/i,
    /politic/i,
    /council/i,
    /congress/i,
    /legislation/i,
    /policy/i,
    /trump/i,
    /republican/i,
    /democrat/i,
  ],
  "violence-realistic": [
    /shooting/i,
    /gunfire/i,
    /assault/i,
    /stab/i,
    /attack/i,
    /violent/i,
    /blood/i,
  ],
  "violence-graphic": [
    /graphic/i,
    /gory/i,
    /blood-spattered/i,
    /dismember/i,
    /decapitat/i,
    /gruesome/i,
    /disturbing detail/i,
  ],
  "violence-fantasy": [/monster/i, /zombie/i, /vampire/i, /supernatural battle/i],
  war: [/\bwar\b/i, /airstrike/i, /missile/i, /invasion/i, /frontline/i, /shelling/i],
  terrorism: [/terror/i, /bombing/i, /extremist/i, /radicalized/i],
  abuse: [/abuse/i, /domestic/i, /harassment/i, /traffick/i],
  crime: [/arrest/i, /charged/i, /trial/i, /investigation/i, /felony/i, /indictment/i],
  disaster: [
    /earthquake/i,
    /fire/i,
    /flood/i,
    /hurricane/i,
    /tornado/i,
    /accident/i,
    /crash/i,
    /collision/i,
  ],
  "self-harm": [/suicide/i, /self-harm/i, /took (?:their|his|her) own life/i],
  health: [/pandemic/i, /covid/i, /virus/i, /outbreak/i, /epidemic/i, /infection/i],
  medical: [/surgery/i, /transplant/i, /chemotherapy/i, /clinical trial/i],
  "sexual-content": [/sexual/i, /intimate scene/i, /nudity/i, /romantic scene/i],
  "sexual-content-graphic": [/rape/i, /sexual assault/i, /explicit sexual/i, /molest/i],
  "mature-themes": [/trauma/i, /grief/i, /addiction/i, /mental health/i],
  "substance-use": [/alcohol/i, /beer/i, /wine/i, /opioid/i, /overdose/i, /cannabis/i],
  gambling: [/casino/i, /betting/i, /sportsbook/i, /wager/i],
  "hate-speech": [/racial slur/i, /anti-\w+/i, /white supremacist/i, /hate speech/i],
  graphic: [/graphic detail/i, /viscera/i, /corpse/i],
};

const HIGH_SEVERITY: ContentWarning[] = [
  "violence-realistic",
  "violence-graphic",
  "war",
  "terrorism",
  "disaster",
  "self-harm",
  "abuse",
  "sexual-content-graphic",
  "hate-speech",
  "graphic",
];

const COMBINED_WARNING_TEMPLATES: Record<string, string> = {
  "politics|war":
    "This piece links political decisions with active conflict, so expect policy and battlefield updates to overlap.",
  "politics|terrorism":
    "Politics and terrorism intersect here, connecting leadership decisions with security fallout.",
  "war|terrorism":
    "Coverage blends war reporting with terror activity, making the stakes feel especially urgent.",
  "abuse|sexual-content-graphic":
    "The article recounts abuse alongside graphic sexual details to explain what happened.",
  "violence-realistic|crime":
    "It weaves violent incidents with the criminal investigation that follows them.",
  "disaster|health":
    "Disaster coverage is paired with public-health impact, so human stories and data intertwine.",
};

const COMBO_KEY_SEPARATOR = "|";

const severityRank = (warning: ContentWarning): number => (HIGH_SEVERITY.includes(warning) ? 0 : 1);

const createComboKey = (a: ContentWarning, b: ContentWarning): string =>
  [a, b].sort().join(COMBO_KEY_SEPARATOR);

const buildCombinedWarningMessage = (reasons: ContentWarning[]): string | null => {
  if (reasons.length < 2) return null;
  const uniqueReasons = Array.from(new Set(reasons));
  uniqueReasons.sort((a, b) => severityRank(a) - severityRank(b));
  const [primary, secondary] = uniqueReasons;
  if (!secondary) return null;
  const templateKey = createComboKey(primary, secondary);
  if (COMBINED_WARNING_TEMPLATES[templateKey]) {
    return COMBINED_WARNING_TEMPLATES[templateKey];
  }
  const primaryCopy = WARNING_COPY[primary];
  const secondaryCopy = WARNING_COPY[secondary];
  return `This story connects ${primaryCopy} with ${secondaryCopy}, so expect those themes to overlap.`;
};

export const warningCopy = WARNING_COPY;
export const warningGuidance = WARNING_GUIDANCE;

export function assessArticleSensitivity(article: Article): SensitivityAssessment {
  const reasons = new Set<ContentWarning>(article.contentWarnings ?? []);
  let triggerSource: SensitivityTriggerSource = reasons.size ? "editorial" : "none";
  let intensity: "low" | "medium" | "high" = article.emotionalIntensity || "low";

  if (article.isSensitive && intensity === "low") {
    intensity = "medium";
  }

  const normalized = `${article.headline} ${article.summary} ${article.body}`.toLowerCase();

  Object.entries(WARNING_KEYWORDS).forEach(([warning, patterns]) => {
    const matched = patterns.some((pattern) => pattern.test(normalized));
    if (matched) {
      if (!reasons.has(warning as ContentWarning) && triggerSource === "none") {
        triggerSource = "heuristic";
      }
      reasons.add(warning as ContentWarning);
    }
  });

  if (reasons.size && intensity === "low") {
    intensity = "medium";
  }

  if (Array.from(reasons).some((reason) => HIGH_SEVERITY.includes(reason))) {
    intensity = "high";
  }

  const shouldOfferGrounding = reasons.size > 0 && intensity !== "low";

  return {
    reasons: Array.from(reasons),
    intensity,
    triggerSource,
    shouldOfferGrounding,
  };
}

export function formatWarningReasons(reasons: ContentWarning[]): string {
  if (!reasons.length) return "sensitive topics";
  const descriptiveReasons = reasons.map((reason) => WARNING_COPY[reason]);
  if (descriptiveReasons.length === 1) return descriptiveReasons[0];
  if (descriptiveReasons.length === 2) {
    return `${descriptiveReasons[0]} and ${descriptiveReasons[1]}`;
  }
  const last = descriptiveReasons.pop();
  return `${descriptiveReasons.join(", ")}, and ${last}`;
}

export function guidanceMessages(reasons: ContentWarning[]): string[] {
  if (!reasons.length) {
    return ["This story may be emotionally heavy. Take a breath before you continue."];
  }
  const comboMessage = buildCombinedWarningMessage(reasons);
  const guidance = reasons.map((reason) => WARNING_GUIDANCE[reason]);
  return comboMessage ? [comboMessage, ...guidance] : guidance;
}
