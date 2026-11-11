// App-level constants used across the app
export const APP_NAME = "Abridgd";
export const APP_VERSION = "0.2.0";
export const APP_BUILD = "42";
/** Pre-release stage shown next to the version in App Info and bug reports. Empty for a release
 * that is no longer a beta. Not part of `version` itself, because iOS only accepts numeric
 * version strings. */
export const APP_RELEASE_LABEL = "beta 2";
/** "0.2.0 beta 2", or just the version when there is no stage. */
export const APP_VERSION_LABEL = APP_RELEASE_LABEL ? `${APP_VERSION} ${APP_RELEASE_LABEL}` : APP_VERSION;

// Update this to your real contact email before shipping
export const CONTACT_EMAIL = "contact@mcc-cal.com";

export const BUG_EMAIL_SUBJECT = `Bug report: ${APP_NAME} ${APP_VERSION_LABEL} (build ${APP_BUILD})`;

export const BUG_EMAIL_BODY_TEMPLATE = `Title:\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected result:\n\nActual result:\n\nFrequency (always/sometimes/once):\n\nDevice / iOS:\n\nApp version / build: ${APP_NAME} ${APP_VERSION_LABEL} (build ${APP_BUILD})\nNetwork (Wi‑Fi / Cellular / Offline):\n\nAttachments: (screenshots / video / console logs)\n`;

// Trust & policy links
export const PRIVACY_URL = "https://abridgd.app/privacy";
export const TERMS_URL = "https://abridgd.app/terms";
