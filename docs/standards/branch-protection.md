# Branch Protection Rules (GitHub)

Last Updated: 2026-01-16

Protect the `master` branch to ensure changes land via reviewed, validated pull requests.

---

## Required Settings (GitHub UI)

1. Go to your repository → Settings → Branches
2. Under "Branch protection rules" click "Add rule"
3. Configure:
   - Branch name pattern: `master`
   - Check "Require a pull request before merging"
     - Set required approvals: `1` (or more)
     - Optionally: "Require review from Code Owners"
   - Check "Require status checks to pass before merging"
     - Select required checks:
       - `Lint docs` (from `.github/workflows/lint-docs.yml`)
       - `ci.yml` (build/tests)
   - Optional: "Require branches to be up to date before merging"
   - Save changes

> Note: You must have admin privileges to configure these settings.

---

## Optional: GitHub CLI (`gh`) commands

```bash
# Log in (if needed)
gh auth login

# Protect master with required checks and reviews (example)
# NOTE: The exact flags vary; confirm with `gh help repo edit`
# Alternatively, set via the web UI as above.
```

---

## CODEOWNERS (optional)

Create a `.github/CODEOWNERS` file to automatically request reviews from specific users/teams:

```
# All files require review from @McCal-Codes (example)
* @McCal-Codes
```

To require Code Owner review, enable the checkbox in the branch protection rule.

---

## CI Workflows

- `Lint docs` — lints Markdown files via `npm run lint:docs`
- `ci.yml` — runs build and tests (ensure it is green before merging)

Make sure both workflows are in `.github/workflows/` and triggered on `pull_request`.

---

## Enforcement

- Avoid direct pushes to `master`
- Use feature branches and PRs
- Keep PRs small and focused; link `TODO-XXX` items
- Merge only when all checks pass and reviews are complete

---

See `agent-reference.md` for the living policy and `.agentinstructions.md` for repo workflow guidance.
