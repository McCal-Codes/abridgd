# Repository Organization Standards

This document defines how the Abridged repository is organized and the principles that guide additions and refactoring.

**Last Updated:** January 15, 2026  
**Status:** Active  

---

## Philosophy

- **Minimize cognitive load:** Developers should know where code lives without asking.
- **Prevent entropy:** Clear boundaries reduce junk drawers and "random scripts."
- **Gradual migration:** Don't force a big rewrite. New code follows new patterns; old code migrates naturally.
- **Clarity over perfection:** A clear, imperfect system beats a perfect system no one follows.

---

## Root Directory Structure

```
abridged/
  ├─ .editorconfig           # Formatting consistency (all editors)
  ├─ .env.example            # Template for environment variables
  ├─ .gitignore              # Git ignore rules
  ├─ .nvmrc                  # Node.js version (18+)
  ├─ app.json                # Expo configuration
  ├─ babel.config.js         # Babel transpilation config
  ├─ eas.json                # Expo Application Services config
  ├─ index.ts                # Entry point for the app
  ├─ jest.config.js          # Jest testing configuration
  ├─ jest.setup.js           # Jest setup/mocking
  ├─ package.json            # Dependencies & npm scripts
  ├─ tsconfig.json           # TypeScript configuration
  ├─ CHANGELOG.md            # User-facing release notes
  ├─ README.md               # Project overview & quickstart
  │
  ├─ assets/                 # Static assets (fonts, images)
  ├─ docs/                   # Project documentation
  │  ├─ standards/           # Standards & governance
  │  ├─ architecture.md      # System design overview
  │  ├─ debugging.md         # Debugging guides
  │  ├─ deployment.md        # Deployment procedures
  │  └─ roadmap.md           # Feature roadmap
  │
  ├─ ios/                    # iOS-specific native code & build artifacts
  ├─ scripts/                # Operational automation
  │  ├─ build/               # iOS build scripts
  │  ├─ debug/               # Article scraper debugging
  │  ├─ test/                # Feed & API testing
  │  ├─ audit/               # Repo health checks (future)
  │  └─ README.md            # Script documentation
  │
  └─ src/                    # Application source code
     ├─ App.tsx              # Root component
     ├─ index.ts             # (Expo entry point reference)
     │
     ├─ components/          # Type-based (legacy)
     │  ├─ AbridgedReader.tsx
     │  ├─ ArticleCard.tsx
     │  └─ ...
     │
     ├─ context/             # React Context providers
     ├─ data/                # Configuration & mock data
     ├─ navigation/          # Navigation structure
     ├─ screens/             # Screen components (being organized)
     ├─ services/            # API & business logic
     ├─ theme/               # Design tokens & styles
     ├─ types/               # Shared TypeScript types
     ├─ utils/               # Utility functions
     │
     ├─ shared/              # Reusable, domain-agnostic code (NEW)
     │  ├─ ui/               # Generic UI components
     │  └─ testing/          # Test utilities & mocks
     │
     └─ features/            # Feature-based domains (FUTURE)
        └─ (article, feed, settings, etc. — lazy migration)
```

---

## Source Code Organization (`src/`)

### Type-Based vs. Feature-Based

The codebase is **transitioning** from type-based (`components/`, `screens/`) to feature-based (`features/`).

**Current State:**
- Most code is organized by type (what it is)
- This works fine for v1 but creates coordination problems as features grow

**Future State:**
- New features should be organized by domain (what it does)
- Old code migrates naturally as it's refactored

**Rule of thumb:**
- Is it reusable across multiple features? → `shared/`
- Is it specific to one feature/domain? → `features/<domain>/`
- Unclear? Default to `shared/` for now

### `shared/` Subdirectories

#### `shared/ui/`

Generic, reusable UI components. No domain knowledge.

**Examples:**
- `ArticleCard.tsx` — reusable article display component
- `ScaleButton.tsx` — generic button with scaling
- `FunLoadingIndicator.tsx` — generic loading spinner
- `ErrorBoundary.tsx` — error handling wrapper

**Rule:** If it has no knowledge of "articles" or "feeds," it belongs here.

#### `shared/testing/`

Test utilities and mock data.

**Examples:**
- `mockArticles.ts` — sample article data for tests
- `test-helpers.ts` — reusable test utilities

### Screens Organization

Screens are being organized into domain folders. **No logic changes, just file moves.**

```
src/screens/
  article/
    ArticleScreen.tsx
  feed/
    HomeScreen.tsx
    SectionScreen.tsx
  digest/
    DigestScreen.tsx
    DigestSettingsScreen.tsx
  saved/
    SavedScreen.tsx
  settings/
    SettingsScreen.tsx
    ReadingSettingsScreen.tsx
    SourcesSettingsScreen.tsx
    GroundingFocusSettingsScreen.tsx
    AccessibilitySettingsScreen.tsx
    NavigationSettingsScreen.tsx
    AppInfoScreen.tsx
    DebugSettingsScreen.tsx
    TabBarSettingsScreen.tsx
```

**Status:** Not yet organized. Will happen naturally as screens are refactored.

**Settings IA alignment:** All settings work must follow `docs/standards/settings-ia-apollo.md`. Customization has been decomposed into Reading Experience, Grounding & Focus, and Accessibility. TabBarSettingsScreen is the Navigation → Tab Bar Studio entry. SourcesSettingsScreen sits under Reading Experience until a dedicated sources flow lives outside Settings.

### `data/` → `config/`

Configuration and constants are being centralized.

**Current:** `src/data/feedConfig.ts`, `src/data/mockArticles.ts`  
**Future:**
```
src/config/
  feeds.ts          # Feed sources & parsers
  featureFlags.ts   # Feature toggles (future)
```

**Rule:** Application configuration lives in `config/`, not scattered across `src/`.

---

## Scripts Organization (`scripts/`)

Scripts are organized by **intent** to prevent the "junk drawer" problem.

```
scripts/
  build/            # Build automation (iOS IPA, bundles)
  debug/            # Debugging tools (scrapers, parsers, feeds)
  test/             # Validation tools (APIs, feeds, pipelines)
  audit/            # Repo health checks (future)
  README.md         # Documentation for all scripts
```

**Rule:** All scripts go into one of these folders. **Never add scripts to `scripts/` root.**

See `scripts/README.md` for details on each script.

---

## Documentation Organization (`docs/`)

```
docs/
  standards/        # Governance & standards
    engineering.md  # Code style, patterns, best practices
    a11y-audit.md   # Accessibility standards
    preflight.md    # Pre-deployment checklists
    afterflight.md  # Post-deployment validation
    README.md       # Standards overview
    adr/            # Architecture Decision Records
  
  architecture.md   # System design & data flow
  debugging.md      # Debugging guides & troubleshooting
  deployment.md     # Deployment procedures
  roadmap.md        # Feature roadmap & vision
```

**Rules:**
- Engineering standards live in `docs/standards/`
- User-facing docs (setup, quickstart) go in root `README.md`
- Runbooks and operational guides go in `docs/`

---

## Adding New Code

### Decision Tree

```
Is it a new screen or page?
  ├─ Yes → src/screens/<domain>/ScreenName.tsx
  └─ No
    ├─ Is it a reusable UI component?
    │  └─ Yes → src/shared/ui/ComponentName.tsx
    │
    ├─ Is it domain-specific business logic?
    │  └─ Yes → src/features/<domain>/... (future pattern)
    │
    └─ Is it a utility, helper, or shared service?
       └─ src/services/ or src/utils/
```

### Naming Conventions

- **Directories:** kebab-case (`article-screen`, `feed-config`)
- **Components:** PascalCase (`ArticleCard.tsx`)
- **Utilities:** camelCase (`parseRssXml.ts`)
- **Types:** PascalCase (`ArticleItem.ts`, `FeedConfig.ts`)

### Imports

Prefer explicit, unambiguous paths:

```typescript
// ✅ Good: Clear where it comes from
import { ArticleCard } from '@/shared/ui/ArticleCard';
import { parseFeed } from '@/services/feedParser';

// ❌ Avoid: Ambiguous barrels
import { ArticleCard } from '@/components';
```

Consider adding `paths` to `tsconfig.json` for shortcuts:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/components/*": ["src/components/*"],
      "@/shared/*": ["src/shared/*"],
      "@/services/*": ["src/services/*"]
    }
  }
}
```

---

## Code Quality Gates

These are enforced or checked, not just suggestions:

1. **Formatting:** EditorConfig (`.editorconfig`) applies to all editors
2. **Type Safety:** TypeScript strict mode in `tsconfig.json`
3. **Testing:** All screens/features should have tests (see `src/__tests__/`)
4. **Documentation:** Standards in `docs/standards/` are canonical

---

## Migration Path (Non-Breaking)

Old code doesn't need to move immediately. New code should follow new patterns:

1. **Screens:** Gradually move into `src/screens/<domain>/` as refactored
2. **Components:** New generic components go to `shared/ui/`; old ones stay until refactored
3. **Config:** New config goes to `src/config/`; old `src/data/` migrates over time

**Key principle:** Entropy doesn't increase retroactively. New mess is prevented; old mess is cleaned up gradually.

---

## Governance & Changes

**Owner:** Standards Governance Agent (automated via GitHub Actions)  
**Review:** Changes to this file should be justified in ADR or issue.  
**Updates:** Last updated by organization initiative on 2026-01-15.

See `docs/standards/README.md` for governance procedures.
