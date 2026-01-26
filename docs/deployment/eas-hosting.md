# EAS Hosting (Expo Router Web Deployments)

Version: 1.0

Last Updated: 2026-01-20

Use this guide to deploy the Expo Router web build to EAS Hosting for previews or production.

## Overview
- **What it does:** Hosts the exported web bundle (dist) on Expo infrastructure with preview + production URLs.
- **When to use:** You want a fast, Expo-native way to ship web builds that align with your native app lifecycle.
- **Outputs:**
  - Preview URL (subdomain + random suffix)
  - Production URL (your chosen subdomain, custom domain on paid plans)

## Prerequisites
- Expo account (`expo.dev/signup`) and EAS CLI installed:
  ```bash
  npm install --global eas-cli
  eas --version
  ```
- Logged in: `eas login`
- Node 20.x (see `.nvmrc`) and project deps installed: `npm install`
- App uses Expo Router and has `web` enabled in app config (`app.json` or `app.config.*`).
- Decide `expo.web.output`:
  - `single` (default SPA; required for React Server Functions preview)
  - `static` (statically rendered HTML per route; better SEO)
  - `server` (enables API Routes / server functions; generates server bundle)

## Quick start (preview deploy)
1) **Set web output (optional but recommended)**
   - In `app.json`:
     ```json
     {
       "expo": {
         "web": { "output": "static" }
       }
     }
     ```
   - Use `static` for SEO/static export, `server` if you need API Routes, or leave `single` for SPA.

2) **Export the web build**
   ```bash
   npx expo export --platform web
   ```
   - Re-run this before every deploy to ensure `dist/` is fresh.

3) **Deploy to EAS Hosting**
   ```bash
   eas deploy
   ```
   - First run: choose a preview subdomain and connect the project if prompted.
   - Output includes preview URL and dashboard link.

4) **Share / promote**
   - Share the preview URL for QA.
   - Promote to production from the EAS Dashboard when ready (or deploy again with the production channel).

## Choosing an output mode
| web.output | Best for | Notes |
| --- | --- | --- |
| `static` | Marketing/SEO, predictable routes | Generates HTML per route; use `generateStaticParams` for dynamic paths. |
| `single` | SPA-style, React Server Functions preview | One `index.html`; relies on client routing. |
| `server` | API Routes, server functions | Produces client + server bundles; needs a server runtime (EAS Hosting supports). |

## Environment variables
- Public values: prefix with `EXPO_PUBLIC_` (available in client + server bundles).
- Secrets: keep unprefixed, access only in server code (API Routes / server functions). Do **not** commit `.env`.

## Common commands
```bash
# Install / update EAS CLI
eas --version
npm install --global eas-cli

# Build and deploy web
npx expo export --platform web
eas deploy
```

## Troubleshooting
- **Old build showing:** Re-run `npx expo export --platform web` before `eas deploy`.
- **Broken routes on static:** Ensure `web.output` is `static` and use `generateStaticParams` for dynamic segments.
- **Need server logic:** Switch to `web.output: "server"` and add `+api.ts` routes; re-export and deploy.
- **Missing assets:** Place static files in `public/` so they copy into `dist/` during export.

## References
- Expo Hosting docs: https://docs.expo.dev/eas/hosting/get-started
- App config `web.output`: https://docs.expo.dev/versions/latest/config/app/#output
- Static rendering guide: https://docs.expo.dev/router/web/static-rendering/
- API Routes: https://docs.expo.dev/router/web/api-routes/
