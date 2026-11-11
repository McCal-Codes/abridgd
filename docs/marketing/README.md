# Marketing

Last updated: 2026-11-11

Drafts and assets for promoting Abridgd. Drafts are for a human to review and post under their own account. Nothing here has been posted.

## Copy

| File | What it is |
|---|---|
| `reddit-pittsburgh-launch.md` | r/Pittsburgh post, pre-flight checklist, likely questions and answers |
| `beta-2-announcement-drafts.md` | Short social post, longer announcement, reporter pitch, comment replies |

## Images

Organized by release. Each release folder holds the finished images and a `source/` folder to regenerate them.

```
images/
  beta-2/
    abridgd-card.png      1600x1000, centered headline, three phones
    abridgd-split.png     1920x1080, text left, two phones right
    source/
      card.html           edit the copy or layout here
      split.html
      icon.png            app icon (copy of assets/icon.png)
      screens/            cropped phone screenshots (status bar removed)
```

Headline in both: "Cross over to calmer news". Screens come from a real Android phone running 0.2.0 beta 2 in dark mode.

### Regenerate

Edit the HTML, then render with headless Chrome from `images/beta-2/source/`:

```bash
chrome --headless=new --hide-scrollbars --window-size=1600,1000 --screenshot=../abridgd-card.png card.html
chrome --headless=new --hide-scrollbars --window-size=1920,1080 --screenshot=../abridgd-split.png split.html
```

### Adding a new release

Copy `images/beta-2/` to `images/<release>/`, swap the screens, update the caption text in the HTML, and render again.

## Notes

- Keep claims to what ships. The app sends anonymous crash reports to Sentry, so avoid "no tracking" and say "no ads, no account" instead.
- Raw phone screenshots show the status bar and notification icons, so they are not stored here. Crop before adding.
- Nothing flashes or strobes, and all assets are static.
