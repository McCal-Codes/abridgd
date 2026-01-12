# Deploying to TestFlight (iOS)

To send the app to Apple TestFlight, we use **EAS Build** (Expo Application Services). This allows the build to happen in the cloud, so you don't need Xcode installed locally.

## Prerequisites
1.  **Apple Developer Account**: You must have a paid Apple Developer account ($99/year).
2.  **Expo Account**: You need a free Expo account.

## Step 1: Login
In your terminal, run:

```bash
npx eas login
```
Follow the prompts to log in to your Expo account.

## Step 2: Build for TestFlight
Run the following command to start the build process:

```bash
npx eas build --platform ios --profile production --auto-submit
```

*   **--profile production**: Uses the production configuration defined in `eas.json`.
*   **--auto-submit**: Automatically uploads the binary to Apple App Store Connect after the build finishes.

## What Happens Next?
1.  **Credentials**: EAS will ask you to log in with your Apple ID to generate certificates and provisioning profiles automatically.
2.  **Queue**: The build will be queued in the cloud (this can take 15-30 minutes).
3.  **Upload**: Once done, it will appear in **App Store Connect** > **TestFlight**.
4.  **Invite**: Go to App Store Connect web interface to invite yourself or others as internal testers.

## Troubleshooting
*   **Bundle Identifier Error**: If `com.mccal.abridged` is already taken by someone else, change `"bundleIdentifier"` in `app.json` to something unique (e.g., `com.yourname.abridged.news`).
*   **Certificate Errors**: Ensure your Apple Developer membership is active.
