# Launch page

`launch-page.html` is the source for Abridgd's TestFlight launch page. It's a single self-contained file (inline CSS, Google Fonts CDN link for Fraunces/Source Sans 3/IBM Plex Mono) with no build step.

Live at:
- https://abridgd-launch.vercel.app (Vercel, production)
- https://claude.ai/code/artifact/dea74758-bfeb-4461-ba5e-803147c84a92 (Claude Artifact copy, private)

## Editing

Edit `launch-page.html` directly - it's plain HTML/CSS, no templating.

## Deploying to Vercel

The file has no `<!doctype html>`/`<html>`/`<body>` wrapper (the Claude Artifact tool adds that automatically). To deploy to Vercel, wrap it in a standalone document and push from a directory with the project already linked (`.vercel/project.json` pointing at `abridgd-launch` under the `mccal` team):

```bash
cp launch-page.html /path/to/linked/dir/index.html
# add <!doctype html><html><head>...<style>...</style></head><body>...</body></html> around it
cd /path/to/linked/dir
npx vercel --prod --yes
```

The Vercel MCP integration's deploy tool has previously failed with a 403 permission error on this project; the CLI path above (using your own logged-in session) is the reliable fallback.

## Screenshots

The two phone mockups in the hero are HTML/CSS recreations of the real onboarding and Home screens (built from the app's actual theme colors and copy), not literal screenshots - there was no reliable way to export real device screenshots in the environment this was built in. Swap in real screenshots by replacing the `.phone-screen` div contents with an `<img>` tag when available.
