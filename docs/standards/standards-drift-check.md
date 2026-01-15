# Standards Drift Check — Automation & PR Labels

Version 1.0  
Last Updated: January 15, 2026

## Purpose

Standards are only valuable if they're enforced. This document describes lightweight automation to keep standards compliance routine and prevent drift into the codebase.

---

## Strategy 1: Changelog Presence (Recommended for CI)

**Goal**: Ensure every feature/fix/change is documented in `CHANGELOG.md`.

### Implementation (CI script)

```bash
#!/bin/bash
# .github/workflows/check-changelog.sh

if git diff --name-only origin/master..HEAD | grep -E "src/|docs/standards/" > /dev/null; then
  if ! git diff HEAD~1..HEAD | grep -q "## \[Unreleased\]"; then
    echo "❌ Changes detected but CHANGELOG.md not updated under [Unreleased]"
    exit 1
  fi
fi

echo "✅ CHANGELOG.md is up-to-date"
exit 0
```

**Trigger**: On every PR against `master`.

**Outcome**: Prevents untracked changes from merging; forces changelog discipline.

---

## Strategy 2: Documentation Link Check (Optional, Future)

**Goal**: If `docs/standards/` files are edited, ensure `docs/standards/README.md` is updated.

### Implementation (CI script)

```bash
#!/bin/bash
# .github/workflows/check-docs-links.sh

CHANGED_STANDARDS=$(git diff --name-only origin/master..HEAD | grep "docs/standards/" | grep -v "README.md")

if [ -n "$CHANGED_STANDARDS" ]; then
  if ! git diff HEAD~1..HEAD | grep -q "docs/standards/README.md"; then
    echo "⚠️  Standards docs changed but README.md not updated"
    echo "Changed files: $CHANGED_STANDARDS"
    echo "Please update docs/standards/README.md to reflect these changes"
    # Note: This is a warning, not a hard failure (set to exit 0 if you want soft enforcement)
    exit 1
  fi
fi

exit 0
```

**Trigger**: On every PR against `master`.

**Outcome**: Reduces "orphaned docs" where a file exists but isn't linked from the index.

---

## Strategy 3: PR Label Enforcement (Recommended for UX/Accessibility)

**Goal**: Flag UI changes and require accessibility review.

### Implementation (GitHub Actions)

```yaml
# .github/workflows/check-ui-changes.yml
name: UI Change Check

on:
  pull_request:
    branches: [master]

jobs:
  check-ui-labels:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Check for UI changes
        id: check_ui
        run: |
          UI_FILES=$(git diff --name-only origin/master..HEAD | grep -E "src/(components|screens)/|src/theme/" || true)
          if [ -n "$UI_FILES" ]; then
            echo "ui_changed=true" >> $GITHUB_OUTPUT
            echo "UI Files Changed: $UI_FILES"
          else
            echo "ui_changed=false" >> $GITHUB_OUTPUT
          fi

      - name: Verify accessibility label
        if: steps.check_ui.outputs.ui_changed == 'true'
        run: |
          LABELS="${{ join(github.event.pull_request.labels.*.name) }}"
          if echo "$LABELS" | grep -q "needs:accessibility-check"; then
            echo "✅ Accessibility review label found"
            exit 0
          else
            echo "❌ UI changes detected but 'needs:accessibility-check' label missing"
            echo "Please add the label or confirm no accessibility changes"
            exit 1
          fi
```

**Trigger**: On every PR with UI changes.

**Labels to define**:
- `needs:accessibility-check` — PR has UI changes, needs VoiceOver + Dynamic Type review
- `standards:ui` — PR affects design standards or components
- `no-changelog-needed` — For docs-only or chore PRs (opt-out from changelog check)

**Outcome**: Accessibility reviews become routine, not after-thoughts.

---

## Strategy 4: Version Bump Check (Release-Blocking)

**Goal**: Ensure version is bumped for release PRs.

### Implementation (CI script)

```bash
#!/bin/bash
# .github/workflows/check-version-bump.sh

# Only run if PR is tagged for release (e.g., label: "release")
if [[ ! "$GITHUB_PR_LABELS" =~ "release" ]]; then
  exit 0
fi

PREV_VERSION=$(git show origin/master:package.json | jq -r '.version')
CURR_VERSION=$(jq -r '.version' package.json)

if [ "$PREV_VERSION" == "$CURR_VERSION" ]; then
  echo "❌ Release PR detected but package.json version not bumped"
  echo "Previous: $PREV_VERSION, Current: $CURR_VERSION"
  exit 1
fi

echo "✅ Version bumped: $PREV_VERSION → $CURR_VERSION"
exit 0
```

**Trigger**: On PRs labeled with `release`.

**Outcome**: Release PRs cannot merge without a version bump.

---

## Enforcement Escalation

Start with **Changelog Presence** (easiest, highest impact):
1. ✅ Changelog presence check (immediate)
2. ✅ PR label enforcement for UI (immediate)
3. ⏳ Documentation link check (optional, future)
4. ⏳ Version bump check (when release automation is added)

---

## How to add these checks

### For GitHub Actions

1. Create `.github/workflows/` directory at repo root.
2. Add YAML files (e.g., `check-changelog.yml`, `check-ui-changes.yml`).
3. In repo settings, make these checks required to merge.

### For GitLab / Gitea / local hooks

Adapt the shell scripts above to your platform's CI/CD system.

---

## Exceptions and overrides

- **No-changelog-needed**: Add `no-changelog-needed` label to skip changelog check (for docs-only PRs).
- **No-accessibility-check**: If a UI change is trivial (e.g., spacing tweak), add `accessibility-check-waived` label with justification in PR description.

Document exceptions in the PR description for the audit trail.

---

## Monitoring

Monitor PR merge patterns:
- % of PRs with changelog entries (target: 95%+)
- % of UI PRs with accessibility labels (target: 100%)
- % of release PRs with version bumps (target: 100%)

Add these metrics to your CI dashboard or project README.

---

## See also

- [Preflight](preflight.md) — what to check before you code
- [Afterflight](afterflight.md) — what to check before you merge
- [Standards Governance Agent](standards-governance-agent.md) — how standards are decided
