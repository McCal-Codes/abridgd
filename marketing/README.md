# Site

The public site for Abridgd: the launch page, the privacy policy, and the terms.
Plain HTML with no build step, deployed to GitHub Pages by
`.github/workflows/deploy-site.yml` on any push to `master` that touches this
directory.

```
marketing/
  index.html    launch page
  privacy.html  required by Google Play, and linked from App Info in the app
  terms.html    linked from App Info in the app
```

## One-time setup

**Settings → Pages → Source: GitHub Actions.** Without this the workflow runs and
the deploy step fails; there is no `gh-pages` branch to fall back on, by design —
the source lives on `master` beside the app it describes.

The site then publishes to `https://mccal-codes.github.io/abridgd/`.

## Custom domain

`src/config/appInfo.ts` links to `https://abridgd.app/privacy` and
`https://abridgd.app/terms`, and Google Play requires a reachable privacy policy
URL, so the domain matters beyond appearances.

To point it here: add a `CNAME` file to this directory containing `abridgd.app`,
then create a DNS `ALIAS`/`ANAME` record at the apex pointing to
`mccal-codes.github.io` (or four `A` records to GitHub's Pages IPs, if the
registrar has no apex alias support). GitHub provisions the certificate.

Until that exists, either the links in App Info are broken or they need pointing
at the `github.io` URL. Do not ship a store listing with a privacy URL that does
not resolve.

## Editing

Open `index.html` in a browser — there is nothing to install or run.

The phone mockups in the hero are built in CSS as placeholders. They are laid out
so real screenshots drop in as `<img>` without restructuring the section.

Two constraints worth keeping:

- **The tone is editorial but not solemn.** Fraunces is the app's real identity;
  keep it. Prefer fewer, punchier sections over exhaustive lists.
- **No "AI", "smart", "powered by", "intelligent", or similar.** Summarising is
  an optional feature the reader supplies their own key for. It is not the pitch,
  and this language stays off the site entirely.
