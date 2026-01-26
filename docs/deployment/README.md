# Deployment Documentation
Last Updated: 2026-01-26

Guides for building, deploying, and distributing Abridged.

## Documents

### [Deployment Guide](deployment.md)
Production deployment process:
- Build configurations
- Environment setup
- Release checklist
- Version management
- Rollback procedures

### [EAS Workflows](eas-workflows.md)
Expo Application Services (EAS) configuration:
- EAS Build setup
- EAS Submit configuration
- Workflow automation
- Build profiles (development, preview, production)

### [EAS Hosting (Web Deploy)](eas-hosting.md)
Deploy Expo Router web builds to EAS Hosting:
- Output modes (`single`, `static`, `server`)
- Exporting web builds
- `eas deploy` usage
- Preview vs production URLs and troubleshooting

### TestFlight & IPA Builds (`testflight/`)
- [iOS IPA Build Guide](testflight/ios-ipa-testflight.md) — Xcode setup, signing, helper script, and EAS build/submit.
- [TestFlight Testing Guide](testflight/TESTFLIGHT_TESTING_GUIDE.md) — Beta onboarding, feedback, and coverage checklist.
- [TestFlight Release Notes](testflight/APP_STORE_CONNECT_TESTFLIGHT_NOTES.md) — Current beta build notes and focus areas.
- [1.2.0 Testing Guide](testflight/TESTFLIGHT_1_2_0_TESTING.md) — Experimental navbar testing plan.

---

**Related Documentation:**
- [Development Guide](../development/development.md) — Development workflow
- [Build Troubleshooting](../build/) — Build-specific debugging
- [Engineering Standards](../development/engineering-standards.md) — Release standards
