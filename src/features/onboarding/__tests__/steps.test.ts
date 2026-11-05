import { choiceFromSettings, getOnboardingSources, resolveStartStep, STEP_IDS } from "../steps";

describe("resolveStartStep", () => {
  it("opens on the first step by default", () => {
    expect(resolveStartStep()).toBe(0);
    expect(resolveStartStep(null)).toBe(0);
    expect(resolveStartStep("")).toBe(0);
  });

  it("finds a step by id", () => {
    expect(resolveStartStep("reader")).toBe(STEP_IDS.indexOf("reader"));
    expect(resolveStartStep("ready")).toBe(STEP_IDS.length - 1);
  });

  it("maps the ids the old flow and App Info used onto the steps that now cover them", () => {
    expect(resolveStartStep("practice")).toBe(STEP_IDS.indexOf("reader"));
    expect(resolveStartStep("rsvp-demo")).toBe(STEP_IDS.indexOf("reader"));
    expect(resolveStartStep("grounding")).toBe(STEP_IDS.indexOf("heavy-stories"));
    expect(resolveStartStep("sections")).toBe(STEP_IDS.indexOf("newsrooms"));
  });

  it("falls back to the first step for an unknown id", () => {
    expect(resolveStartStep("not-a-step")).toBe(0);
  });
});

describe("getOnboardingSources", () => {
  it("offers the working, default-on general-news outlets only", () => {
    const sources = getOnboardingSources();
    const names = sources.map((s) => s.name);
    expect(names).toEqual(expect.arrayContaining(["WTAE", "WESA", "TribLive", "Post-Gazette"]));
    // Disabled or broken feeds are never offered.
    expect(names).not.toContain("CBS Pittsburgh");
    expect(names).not.toContain("New Pittsburgh Courier");
    expect(sources.every((s) => s.category === "Top" || s.category === "Local")).toBe(true);
    expect(sources.every((s) => s.defaultEnabled)).toBe(true);
  });
});

describe("choiceFromSettings", () => {
  const base = { isGroundingEnabled: true, sensitivePromptLevel: "full" as const, sensitiveActionPreference: "decide" as const };

  it("reads the three choices back from the settings they set", () => {
    expect(choiceFromSettings(base)).toBe("notes");
    expect(choiceFromSettings({ ...base, sensitiveActionPreference: "ground-first" })).toBe("pause");
    expect(choiceFromSettings({ ...base, sensitivePromptLevel: "off" })).toBe("off");
    expect(choiceFromSettings({ ...base, isGroundingEnabled: false })).toBe("off");
  });

  it("treats the app's existing defaults as 'content notes only'", () => {
    expect(choiceFromSettings({ ...base, sensitivePromptLevel: "minimal", sensitiveActionPreference: "continue" })).toBe("notes");
  });
});
