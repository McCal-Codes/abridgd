# Dependency Evaluation Checklist

Use this checklist before adding a new third-party dependency.

1. Purpose & Scope
   - [ ] Is the goal clearly documented in the PR/RFC? (feature, bug, performance)
   - [ ] Is there an existing in-repo alternative or simpler way?

2. Maintenance & Health
   - [ ] Is the repo actively maintained? (recent commits, issue activity)
   - [ ] Does the package have a clear license compatible with our policies?
   - [ ] Are there open security advisories/CVEs?

3. Size & Performance
   - [ ] Estimated bundle size/impact assessed (for web or JS bundles)
   - [ ] Native binary size impact assessed (for native modules)
   - [ ] Performance implications documented (memory, CPU)

4. Compatibility & Integration
   - [ ] Works with our minimum supported RN/Expo versions (or has a maintained bridge)
   - [ ] Setup complexity and native code requirements are documented
   - [ ] Breaking changes / migration notes included

5. Accessibility & Internationalization
   - [ ] Accessibility behavior is acceptable or can be overridden
   - [ ] Internationalization/localization needs considered

6. Testing & Observability
   - [ ] Has automated tests been added for integration points?
   - [ ] Observability (logs, metrics) integration plan documented

7. Security & Privacy
   - [ ] No unexpected permissions or tracking behavior
   - [ ] Privacy impact evaluated (PII handling, telemetry)

8. Fallback & Contingency
   - [ ] Has an upgrade/rollback plan been considered?
   - [ ] Owner/maintainer identified (who owns lifecycle)

Acceptance Criteria (must be met)
- All applicable checklist items are completed and documented in the PR.
- A small PoC or integration test exists demonstrating core interactions.
- The team agrees on acceptable trade-offs (size/security/maintenance).

If the package fails critical checkpoints (security, license, maintenance), do **not** add it.
