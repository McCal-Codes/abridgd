# Troubleshooting: Worklet Mismatch Error

## The Error
`[Worklets] Mismatch between JavaScript part and native part of Worklets...`

## The Cause
This error happens when the version of the animation library (`react-native-reanimated`) in your code is **newer** than the version supported by the **Expo Go** app installed on your phone.

*   **Your Code**: Newer (e.g., v4.x)
*   **Your Phone**: Older (e.g., v3.x support)

## The Fix
1.  **Update Expo Go**: Go to the iOS App Store or Google Play Store and update the **Expo Go** app to the latest version.
2.  **Restart Bundler**:
    ```bash
    npx expo start --clear
    ```
3.  **Reload App**: Close and reopen Expo Go on your phone.

## Alternative: Downgrade (Not Recommended)
If you cannot update the app, you must downgrade the project to an older SDK, which carries significant compatibility risks.
