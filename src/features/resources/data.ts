/**
 * Local help and services, bundled with the app.
 *
 * This is deliberately static: no network request, no account, nothing recorded about what
 * anyone looks at. Because a wrong number in a crisis list does real harm, every entry carries
 * the date it was last checked, and `data.test.ts` fails if an entry is malformed or stale.
 *
 * To change a number: confirm it against the organization's own site, update the entry and
 * `LAST_VERIFIED`, and see docs/product/resources.md.
 */

export type ResourceAction =
  | { kind: "call"; number: string; label?: string }
  | { kind: "text"; number: string; body?: string; label?: string };

export interface ResourceEntry {
  id: string;
  name: string;
  /** One short line: who it is for and when it answers. */
  description: string;
  /** What to show as the number when the entry has one worth reading aloud. */
  displayNumber?: string;
  actions: ResourceAction[];
  /** The organization's own page, if it has a stable one. https only. */
  url?: string;
}

export interface ResourceGroup {
  id: string;
  title: string;
  entries: ResourceEntry[];
}

/** `YYYY-MM-DD`. Update whenever the numbers are re-checked against their sources. */
export const LAST_VERIFIED = "2026-11-05";

/** A listing older than this is flagged by the test suite so it gets re-checked. */
export const MAX_AGE_DAYS = 365;

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: "now",
    title: "Talk to someone now",
    entries: [
      {
        id: "988",
        name: "988 Suicide & Crisis Lifeline",
        description: "Call or text 988. Free, 24/7.",
        displayNumber: "988",
        actions: [
          { kind: "call", number: "988" },
          { kind: "text", number: "988" },
        ],
        url: "https://988lifeline.org",
      },
      {
        id: "resolve",
        name: "Re:solve Crisis Network",
        description: "Allegheny County, 24/7. Mobile crisis teams and walk-in help.",
        displayNumber: "1-888-796-8226",
        actions: [{ kind: "call", number: "18887968226" }],
        url: "https://connect.alleghenycounty.us/get-help-now/",
      },
      {
        id: "crisis-text-line",
        name: "Crisis Text Line",
        description: "Text HOME to 741741. Free, 24/7.",
        displayNumber: "741741",
        actions: [{ kind: "text", number: "741741", body: "HOME" }],
        url: "https://www.crisistextline.org",
      },
    ],
  },
  {
    id: "everyday",
    title: "Everyday needs",
    entries: [
      {
        id: "211",
        name: "211 Southwest PA",
        description: "Food, housing, bills and care. Dial 2-1-1, 24/7.",
        displayNumber: "2-1-1",
        actions: [{ kind: "call", number: "211" }],
        url: "https://pa211sw.org",
      },
      {
        id: "food-bank",
        name: "Greater Pittsburgh Community Food Bank",
        description: "Find food help near you.",
        displayNumber: "412-460-3663",
        actions: [{ kind: "call", number: "4124603663" }],
        url: "https://pittsburghfoodbank.org",
      },
      {
        id: "allegheny-link",
        name: "Allegheny Link",
        description: "Housing and county services. Monday to Friday, 8 to 5.",
        displayNumber: "866-730-2368",
        actions: [{ kind: "call", number: "8667302368" }],
        url: "https://connect.alleghenycounty.us/get-help-now/",
      },
    ],
  },
];

export const getAllEntries = (): ResourceEntry[] =>
  RESOURCE_GROUPS.flatMap((group) => group.entries);
