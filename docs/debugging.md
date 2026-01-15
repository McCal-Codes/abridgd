# Debugging Guide

This guide provides instructions on how to debug the Abridged application during development.

## Expo Dev Menu

The easiest way to start debugging is by using the Expo Dev Menu, which is available in your app during development.

**To open the Dev Menu:**

*   **iOS Simulator:** Press `Cmd + D`
*   **Android Emulator:** Press `Cmd + M` (or `Ctrl + M` on Windows/Linux)
*   **Physical Device:** Shake your device to open the menu.

**From the Dev Menu, you can:**

*   **Reload:** Reloads the app's JavaScript.
*   **Debug Remote JS:** Opens a debugging session in your web browser (Chrome).
*   **Toggle Performance Monitor:** Shows a real-time performance graph on your app.
*   **Toggle Element Inspector:** Allows you to inspect UI elements and their properties.

## Remote Debugging with Chrome

For more powerful JavaScript debugging, you can use the Chrome Developer Tools.

1.  Open the **Dev Menu** in your app.
2.  Select **"Debug Remote JS"**.
3.  This will open a new tab in your Chrome browser at `http://localhost:8081/debugger-ui/`.
4.  Open the Chrome DevTools by pressing `Cmd + Opt + I` (Mac) or `Ctrl + Shift + I` (Windows/Linux).
5.  You can now use the `Sources` tab to set breakpoints, inspect variables, and step through your code. The `Console` tab will show any `console.log` statements from your app.

## React Native Debugger

For an all-in-one debugging solution, you can use the React Native Debugger, which combines Redux DevTools, React Inspector, and a JavaScript debugger.

1.  **Install React Native Debugger:**
    ```bash
    # On macOS
    brew install --cask react-native-debugger
    ```
2.  **Launch React Native Debugger.**
3.  **Enable "Debug Remote JS"** from the Expo Dev Menu in your app. The debugger should automatically connect.

## Flipper (Advanced)

Flipper is a platform for debugging iOS, Android, and React Native apps. It provides a rich set of tools for inspecting your app.

1.  **Install Flipper:** Download and install the Flipper desktop app from the [official website](https://fbflipper.com/).
2.  **Install Flipper-related dependencies** in your project:
    ```bash
    npm install --save-dev redux-flipper flipper-plugin-react-native-performance
    ```
3.  **Configure your project** to connect to Flipper. Follow the official React Native integration guide on the Flipper website.

## Running the Application

To run the application in a simulator for debugging, you can use the following commands from your project's root directory.

### Running on iOS Simulator

To start the app on the iOS Simulator, run:

```bash
npm run ios
```

This command will:
1.  Build the native iOS app if it hasn't been built already.
2.  Start the Metro bundler.
3.  Launch the app in the iOS Simulator.

Alternatively, you can start the Metro bundler first:
```bash
npm start
```
Then, once the bundler is running, press `i` in the terminal to launch the iOS Simulator.

### Running on Android Emulator

To start the app on an Android Emulator, run:

```bash
npm run android
```

This command will:
1.  Build the native Android app if it hasn't been built already.
2.  Start the Metro bundler.
3.  Launch the app in the Android Emulator.

Alternatively, you can start the Metro bundler first:
```bash
npm start
```
Then, once the bundler is running, press `a` in the terminal to launch the Android Emulator.

## General Tips

*   **Use `console.log()`:** Sprinkle `console.log()` statements in your code to trace the execution and inspect the values of variables.
*   **Check the Metro Bundler terminal:** Look for any errors or warnings that appear in the terminal where you ran `npm start`.
*   **Read Error Messages Carefully:** React Native's red screen errors are often very descriptive and can point you directly to the source of the problem.
