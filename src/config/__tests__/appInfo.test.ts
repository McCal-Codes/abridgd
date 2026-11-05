import {
  APP_BUILD,
  APP_RELEASE_LABEL,
  APP_VERSION,
  APP_VERSION_LABEL,
  BUG_EMAIL_SUBJECT,
} from "../appInfo";

describe("app version label", () => {
  it("is the version plus the release stage, and the stage never leaks into the version", () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/); // iOS only accepts numeric versions
    expect(APP_VERSION_LABEL).toBe(APP_RELEASE_LABEL ? `${APP_VERSION} ${APP_RELEASE_LABEL}` : APP_VERSION);
  });

  it("puts the stage in bug reports so a report says which beta it came from", () => {
    expect(BUG_EMAIL_SUBJECT).toContain(APP_VERSION_LABEL);
    expect(BUG_EMAIL_SUBJECT).toContain(`build ${APP_BUILD}`);
  });
});
