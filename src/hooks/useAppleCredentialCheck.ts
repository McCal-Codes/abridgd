import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

/** `AppleAuthenticationCredentialState`: REVOKED = 0, AUTHORIZED = 1, NOT_FOUND = 2, TRANSFERRED = 3. */
const REVOKED = 0;
const NOT_FOUND = 2;

/** Apple says to sign the person out when the credential is revoked or no longer exists. */
export const credentialMeansSignOut = (state: number): boolean =>
  state === REVOKED || state === NOT_FOUND;

/**
 * Sign in with Apple is local-only here (the Apple user id labels a profile and goes nowhere),
 * but Apple's guidelines still expect an app to react when the person revokes access in
 * Settings > Apple ID. Without a check, the profile stayed "signed in" forever.
 *
 * The state is read at launch and each time the app returns to the foreground, which is when a
 * revocation made in Settings becomes visible. iOS only: the API does not exist elsewhere.
 * `signOut` is called with no arguments and only when Apple says REVOKED or NOT_FOUND; any error
 * reading the state leaves the profile as it is.
 */
export const useAppleCredentialCheck = (appleUserId: string | undefined, signOut: () => void): void => {
  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;

  useEffect(() => {
    if (Platform.OS !== "ios" || !appleUserId) return;
    let cancelled = false;

    const check = async () => {
      try {
        // Loaded lazily so tests and other platforms never touch the native module.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const AppleAuthentication = require("expo-apple-authentication");
        const state: number = await AppleAuthentication.getCredentialStateAsync(appleUserId);
        if (!cancelled && credentialMeansSignOut(state)) signOutRef.current();
      } catch {
        // Cannot tell: do not sign anyone out on an error.
      }
    };

    void check();
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") void check();
    });
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [appleUserId]);
};
