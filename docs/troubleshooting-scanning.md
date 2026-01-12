# Troubleshooting: specific QR Code Issues on iOS

If the default **iOS Camera App** says "No usable data found", it means it cannot verify the `exp://` link format or the QR code in the terminal is distorted.

## The Fix: Use the Expo Go Scanner

1.  Open the **Expo Go** app on your iPhone.
2.  **Do not** use the phone's main camera.
3.  Tap the **"Scan QR Code"** button **inside the Expo Go app** (usually on the "Home" tab).
4.  Scan the code from the terminal.

## Alternative: Type the URL
If scanning is difficult due to terminal resizing:
1.  Look at the terminal output for the line starting with `exp://`.
    *   Example: `exp://192.168.1.5:8081`
2.  In **Expo Go**, tap **"Enter URL Manually"**.
3.  Type the address exactly as appeared.

## Alternative: Tunnel Mode
If `192.168...` doesn't work (network firewall):
1.  Stop the server.
2.  Select **"Expo: Tunnel"** configuration.
3.  Run it.
4.  Scan the new code with **Expo Go**.
