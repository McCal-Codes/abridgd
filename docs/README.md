# Abridged Documentation
Last Updated: 2026-01-26

Complete documentation for the Abridged news reader application.

## Quick Links

- [Vision & Product](product/vision.md) — Product vision and philosophy
- [Getting Started](development/development.md) — Development setup guide
- [Feature List](product/FEATURES.md) — Complete feature overview

## Documentation Structure

```
docs/
├── README.md                    # This file - documentation index
├── product/                     # Product & architecture docs
├── development/                 # Development guides & standards
├── deployment/                  # Deployment & distribution
├── ios26/                       # iOS 26 UI component system
├── research/                    # Research notes & references
├── build/                       # Build troubleshooting
├── scripts/                     # Documentation scripts
├── standards/                   # Detailed standards & ADRs
└── NDA/                         # Legal documents
```

## Core Documentation

### 📱 Product & Architecture
- **[Vision](product/vision.md)** — Product vision, philosophy, and guiding principles
- **[Architecture](product/architecture.md)** — Technical architecture and system design
- **[Features](product/FEATURES.md)** — Complete feature list and capabilities
- **[Roadmap](product/roadmap.md)** — Feature roadmap and development priorities

### 💻 Development
- **[Development Guide](development/development.md)** — Getting started with development
- **[Debugging Guide](development/debugging.md)** — Debugging tips, tools, and common issues
- **[Engineering Standards](development/engineering-standards.md)** — Code quality and best practices
- **[Standards Governance](development/standards-governance-agent.md)** — Standards maintenance process
- **[Session Notes](development/session-notes/README.md)** — Dated development logs and decisions

### ✨ iOS 26 UI Components

Modern glass morphism UI system inspired by iOS 26 SwiftUI enhancements.

- **[iOS 26 Components](ios26/ios26-ui-components.md)** — Complete technical documentation
- **[Quick Reference](ios26/ios26-quick-reference.md)** — Code examples and common patterns
- **[Implementation Summary](ios26/ios26-implementation-summary.md)** — Implementation overview
- **[Installation Guide](ios26/ios26-installation.md)** — Setup and installation instructions

**Components:**
- GlassButton — Blur-effect buttons with prominence styles
- NavigationHeader — Headers with subtitle support
- BottomToolbar — Glass toolbars with semantic placement
- ZoomModal — Modals with zoom transitions
- BlurSheet — Bottom sheets with dynamic transparency

### 🚀 Deployment & Distribution

- **[Deployment Guide](deployment/deployment.md)** — Production deployment process
- **[EAS Workflows](deployment/eas-workflows.md)** — Expo Application Services configuration
- **[iOS IPA Build Guide](deployment/testflight/ios-ipa-testflight.md)** — Building IPAs for TestFlight
- **[TestFlight Testing Guide](deployment/testflight/TESTFLIGHT_TESTING_GUIDE.md)** — Beta testing process
- **[TestFlight Release Notes](deployment/testflight/APP_STORE_CONNECT_TESTFLIGHT_NOTES.md)** — Current beta build notes
- **[1.2.0 Testing Focus](deployment/testflight/TESTFLIGHT_1_2_0_TESTING.md)** — Experimental navbar test plan
- **[TestFlight Notes](deployment/APP_STORE_CONNECT_TESTFLIGHT_NOTES.md)** — Beta tester release notes

### 🔬 Research & References

- **[RSVP Research](research/rsvp-notes.md)** — Speed reading (RSVP) research and implementation notes

### 📋 Standards Documentation

Detailed standards and guidelines for maintaining code quality.

📁 **[standards/](standards/)** — Complete standards directory
- [README](standards/README.md) — Standards overview
- [Engineering Standards](standards/engineering.md) — Code quality guidelines
- [Design Standards](standards/design-standards.md) — UI/UX design principles
- [Branding Guidelines](standards/branding.md) — Brand identity standards
- [Testing Baseline](standards/testing-baseline.md) — Testing requirements
- [Repository Organization](standards/repo-organization.md) — Project structure
- [Accessibility Audit](standards/a11y-audit.md) — Accessibility guidelines
- [Preflight Checklist](standards/preflight.md) — Pre-deployment checklist
- [Afterflight Review](standards/afterflight.md) — Post-deployment review
- [Standards Drift Check](standards/standards-drift-check.md) — Quality maintenance
- [Standards Governance](standards/standards-governance-agent.md) — Governance process
- **[adr/](standards/adr/)** — Architecture Decision Records

### 🔧 Build & Troubleshooting

📁 **[build/](build/)** — Build-specific documentation
- [Troubleshooting Scanning](build/troubleshooting-scanning.md) — QR code and network issues
- [Troubleshooting Worklets](build/troubleshooting-worklets.md) — Reanimated worklet debugging

### 🛠️ Scripts & Automation

📁 **[scripts/](scripts/)** — Documentation for automation scripts
- [Doc Lint](scripts/doc-lint.js) — Documentation validation script

### 📄 Legal & Compliance

📁 **[NDA/](NDA/)** — Non-disclosure agreements and legal documents
- [Beta NDA](NDA/Abridgd_Beta_NDA.md) — Beta tester non-disclosure agreement
- [Beta License](NDA/Abridgd_Beta_License.md) — Beta software license agreement

---

## Documentation Standards

All documentation follows these principles:

1. **Agent-Ready Format** — Structured for AI agent consumption and understanding
2. **Clear Hierarchy** — Organized with consistent heading levels and structure
3. **Practical Examples** — Code samples and real-world usage patterns included
4. **Version Tracked** — Changes documented in CHANGELOG.md
5. **Maintained** — Regular reviews via standards governance process

## Contributing to Documentation

When adding or updating documentation:

1. Follow the agent-ready documentation standard (see iOS 26 docs for examples)
2. Include code examples where applicable
3. Add entry to appropriate section in this README
4. Update CHANGELOG.md with documentation changes
5. Run `npm run lint:docs` to validate formatting

## Questions?

For questions about documentation or contributions, contact: contact@mcc-cal.com
