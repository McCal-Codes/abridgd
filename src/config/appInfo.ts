import Constants from "expo-constants";

// App-level constants used across the app
export const APP_NAME = "Abridgd";
export const APP_VERSION = "1.5.0";

/** Read from the built app rather than hand-maintained: this was pinned at "1" while
 * app.json shipped buildNumber 36, so every bug report named the wrong build. */
export const APP_BUILD =
  Constants.expoConfig?.ios?.buildNumber ??
  Constants.expoConfig?.android?.versionCode?.toString() ??
  "unknown";

// Update this to your real contact email before shipping
export const CONTACT_EMAIL = "contact@mcc-cal.com";

export const BUG_EMAIL_SUBJECT = `Bug report: ${APP_NAME} ${APP_VERSION} (build ${APP_BUILD})`;

export const BUG_EMAIL_BODY_TEMPLATE = `Title:\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected result:\n\nActual result:\n\nFrequency (always/sometimes/once):\n\nDevice / iOS:\n\nApp version / build: ${APP_NAME} ${APP_VERSION} (build ${APP_BUILD})\nNetwork (Wi‑Fi / Cellular / Offline):\n\nAttachments: (screenshots / video / console logs)\n`;

// Trust & policy links
export const PRIVACY_URL = "https://abridgd.app/privacy";
export const TERMS_URL = "https://abridgd.app/terms";
