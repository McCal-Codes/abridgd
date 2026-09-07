/**
 * Adds `smallestScreenSize` to MainActivity's android:configChanges.
 *
 * Expo's template omits it, and that is the value that changes when a foldable
 * unfolds. Without it Android destroys and recreates the Activity on unfold, so
 * the app restarts and the reader loses their place mid-article.
 *
 * Remove this plugin if a future Expo SDK adds the value to its own template —
 * the merge below is idempotent, so it is harmless until then.
 */

const { withAndroidManifest } = require("expo/config-plugins");

const REQUIRED = ["smallestScreenSize"];

module.exports = function withFoldableConfigChanges(config) {
  return withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application?.[0];
    const activity = application?.activity?.find(
      (entry) => entry.$?.["android:name"] === ".MainActivity"
    );

    if (!activity) {
      throw new Error(
        "withFoldableConfigChanges: could not find .MainActivity in AndroidManifest.xml"
      );
    }

    const existing = (activity.$["android:configChanges"] || "")
      .split("|")
      .filter(Boolean);
    const missing = REQUIRED.filter((value) => !existing.includes(value));

    activity.$["android:configChanges"] = [...existing, ...missing].join("|");

    return mod;
  });
};
