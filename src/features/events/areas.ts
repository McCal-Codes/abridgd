/**
 * Where in Pittsburgh an event is, as a small set of readable areas.
 *
 * This is deliberately coarse and derived from the venue's ZIP code. A ZIP is not a neighborhood
 * (15206 covers East Liberty and Highland Park; 15203 is the whole South Side), so the labels
 * name the part of town rather than pretend to a precision the data does not have. A ZIP only
 * counts when the venue's city is Pittsburgh; "Pittsburgh" mailing addresses outside the city
 * limits and every other municipality fall under `OUTSIDE_CITY`.
 */

export const ONLINE_AREA = "Online";
export const OUTSIDE_CITY_AREA = "Outside the city";
export const CITYWIDE_AREA = "Pittsburgh";

const AREA_BY_ZIP: Record<string, string> = {
  // Downtown, the Strip, the Hill
  "15219": "Downtown & Strip",
  "15222": "Downtown & Strip",
  // North of the rivers
  "15212": "North Side",
  "15214": "North Side",
  "15233": "North Side",
  // Lawrenceville, Bloomfield, Garfield, Friendship
  "15201": "Lawrenceville & Bloomfield",
  "15224": "Lawrenceville & Bloomfield",
  // East End: East Liberty, Shadyside, Oakland, Squirrel Hill, Point Breeze, Hazelwood
  "15206": "East End",
  "15207": "East End",
  "15208": "East End",
  "15213": "East End",
  "15217": "East End",
  "15232": "East End",
  // South Side and the hilltop neighborhoods
  "15203": "South Side & Hilltop",
  "15210": "South Side & Hilltop",
  "15211": "South Side & Hilltop",
  // South Hills inside the city (Beechview, Brookline)
  "15216": "South Hills",
  "15226": "South Hills",
  "15234": "South Hills",
  // West End and the west side
  "15204": "West End",
  "15205": "West End",
  "15220": "West End",
};

/** Every area a city ZIP can resolve to, in the order the filter chips prefer. */
export const AREA_ORDER: readonly string[] = [
  "Downtown & Strip",
  "North Side",
  "Lawrenceville & Bloomfield",
  "East End",
  "South Side & Hilltop",
  "South Hills",
  "West End",
  CITYWIDE_AREA,
  OUTSIDE_CITY_AREA,
  ONLINE_AREA,
];

const ONLINE_PATTERN = /\b(virtual|online|webinar|zoom|livestream|live stream)\b/i;

export interface AreaInput {
  zip?: string | null;
  city?: string | null;
  venue?: string | null;
  address?: string | null;
  title?: string | null;
  /** A source that always meets in one area. Used only when the event itself says nothing. */
  defaultArea?: string;
}

const isPittsburgh = (city?: string | null) => (city ?? "").trim().toLowerCase() === "pittsburgh";

const cleanZip = (zip?: string | null): string | null => {
  const match = /^\s*(\d{5})(?:-\d{4})?\s*$/.exec(zip ?? "");
  return match ? match[1] : null;
};

export const resolveArea = (input: AreaInput): string => {
  const zip = cleanZip(input.zip);
  const city = input.city?.trim();
  const hasPlace = Boolean(zip || city || input.venue?.trim() || input.address?.trim());
  const saysOnline = ONLINE_PATTERN.test(input.title ?? "") || ONLINE_PATTERN.test(input.venue ?? "");

  // Says it is virtual and gives no street-level place: online.
  if (!zip && !city && saysOnline) return ONLINE_AREA;
  // No place information at all: the source's home area, else just "Pittsburgh".
  if (!hasPlace) return input.defaultArea ?? CITYWIDE_AREA;

  if (city && !isPittsburgh(city)) return OUTSIDE_CITY_AREA;
  if (zip && AREA_BY_ZIP[zip]) return AREA_BY_ZIP[zip];

  // A Pittsburgh address we cannot place more finely than the city.
  if (!zip && input.defaultArea) return input.defaultArea;
  return CITYWIDE_AREA;
};

/** Sort areas for display: known order first, anything unexpected after, alphabetically. */
export const compareAreas = (a: string, b: string): number => {
  const ia = AREA_ORDER.indexOf(a);
  const ib = AREA_ORDER.indexOf(b);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  return a.localeCompare(b);
};
