import { compareAreas, resolveArea } from "../areas";

describe("resolveArea", () => {
  it("maps a Pittsburgh ZIP to a part of town", () => {
    expect(resolveArea({ zip: "15201", city: "Pittsburgh" })).toBe("Lawrenceville & Bloomfield");
    expect(resolveArea({ zip: "15213", city: "Pittsburgh" })).toBe("East End");
    expect(resolveArea({ zip: "15212", city: "Pittsburgh" })).toBe("North Side");
    expect(resolveArea({ zip: "15203-1234", city: "Pittsburgh" })).toBe("South Side & Hilltop");
  });

  it("puts other municipalities outside the city, even when the ZIP is a city one", () => {
    expect(resolveArea({ zip: "15090", city: "Wexford" })).toBe("Outside the city");
    expect(resolveArea({ zip: "15206", city: "Wilkinsburg" })).toBe("Outside the city");
  });

  it("treats a virtual event with no street place as online", () => {
    expect(resolveArea({ title: "VIRTUAL FEC Campus Accessibility Upgrades Public Meeting" })).toBe("Online");
    expect(resolveArea({ title: "Virtual Star Party", venue: "Kamin Science Center" })).toBe("Online");
  });

  it("falls back to the source's home area, then to the city", () => {
    expect(resolveArea({ defaultArea: "Downtown & Strip" })).toBe("Downtown & Strip");
    expect(resolveArea({})).toBe("Pittsburgh");
    expect(resolveArea({ city: "Pittsburgh", venue: "Somewhere" })).toBe("Pittsburgh");
  });

  it("does not let a source default override a real street address", () => {
    expect(resolveArea({ zip: "15217", city: "Pittsburgh", defaultArea: "Downtown & Strip" })).toBe("East End");
  });

  it("orders known areas first", () => {
    const sorted = ["Online", "East End", "Zebra", "Downtown & Strip"].sort(compareAreas);
    expect(sorted).toEqual(["Downtown & Strip", "East End", "Online", "Zebra"]);
  });
});
