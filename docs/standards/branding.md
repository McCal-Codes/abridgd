# Abridged App — Branding Standards
Version 1.0
Last Updated: January 16, 2026

## App Name & Display

### Official App Name
**Abridgd** (without the 'e')

This unique spelling:
- Ensures App Store uniqueness
- Maintains brand recognizability
- Keeps the pronunciation intuitive

### Technical vs. Display Names

| Context | Value | File Location |
|---------|-------|---------------|
| **User-Facing Display Name** | `Abridgd` | `app.json` → `expo.name` |
| **iOS Home Screen** | `Abridgd` | `ios/abridged/Info.plist` → `CFBundleDisplayName` |
| **Bundle Identifier** | `com.mccalmedia.abridged` | `ios/abridged.xcodeproj/project.pbxproj` → `PRODUCT_BUNDLE_IDENTIFIER` |
| **URL Schemes** | `abridged`, `com.mccalmedia.abridged` | `ios/abridged/Info.plist` → `CFBundleURLSchemes` |
| **Folder/Technical Names** | `abridged` (lowercase) | Repo, iOS project folders, slugs |

---

## Implementation Rules

### ✅ DO
- Use **"Abridgd"** in all user-facing contexts (App Store, home screen, splash screens, About page)
- Keep technical identifiers as `abridged` (lowercase, with 'e')
- Use consistent capitalization: always `Abridgd`, never `abridgd` or `ABRIDGD`

### ❌ DON'T
- Rename internal folders or technical identifiers to match the display name (breaks builds)
- Use "abridged" (with 'e') in user-facing copy
- Change bundle identifier unless required by Apple Developer account conflicts

---

## Files to Update When Changing Branding

If the app name changes in the future, update these files:

1. **`app.json`**
   ```json
   {
     "expo": {
       "name": "Abridgd",
       "slug": "abridged"  // Keep lowercase technical slug
     }
   }
   ```

2. **`ios/abridged/Info.plist`**
   ```xml
   <key>CFBundleDisplayName</key>
   <string>Abridgd</string>
   ```

3. **App Store Connect metadata** (when creating listing)
   - App Name: `Abridgd`
   - Subtitle, description, keywords

4. **Documentation and marketing materials**
   - README.md
   - docs/product/vision.md
   - Any public-facing content

---

## Rationale

### Why "Abridgd" instead of "Abridged"?

1. **App Store Uniqueness**: The name "Abridged" is common and likely already taken
2. **Brand Distinction**: Unique spelling makes the app memorable
3. **Modern Aesthetics**: Dropped vowel aligns with contemporary tech naming (Tumblr, Flickr, Scribd)
4. **Searchability**: Unique enough to be easily found, familiar enough to be understood

### Why Keep Technical Names as "abridged"?

- **Build Stability**: Xcode project structure relies on exact folder names and references
- **CocoaPods Integration**: Podfiles and workspace references use the lowercase technical name
- **Git History**: Renaming root folders creates merge conflicts and breaks PR references
- **Convention**: Technical identifiers typically use lowercase, simple ASCII

---

## Governance

Any changes to app branding must:
1. Update this document first
2. Update all files listed in "Files to Update" section
3. Verify the build succeeds locally before committing
4. Document the change in `CHANGELOG.md`

**Approval Required**: Tech lead or product owner must approve all branding changes.

---

## Editorial Microcopy — Priority Contrast Blurbs

Use this pattern when highlighting a funding/priorities mismatch in a single short blurb.

### Structure
1. **Hook with allocation** — amount + recipient.
2. **Everyday contrast** — relatable benchmark (e.g., average bonus, rent, bill).
3. **Essential needs gap** — 1–2 basics not funded (healthcare, housing, relief).
4. **Accountability line** — one pointed closer on priorities; no ad hominem.

### Style
- Tone: crisp, factual, calmly skeptical.
- Length: 60–100 words.
- Verbs: “set aside,” “approved,” “allocated” (avoid “lavished,” “showered”).
- Avoid slang, insults, and unverified claims.

### Template
- Hook: “On video: *Body* approves/admits they’ve set aside **$X** for **program/bonuses** (up to **$Y** each).”
- Contrast: “Meanwhile, the average **[everyday metric]** is **$Z**—if you’re lucky enough to get one.”
- Needs gap: “They can’t fund **[need 1]**, **[need 2]**, or **[need 3]**…”
- Accountability: “…but they can bankroll **[agency/action]**. That’s the priority.”

### Usage Checklist
- ✅ Facts and amounts verified and current
- ✅ One clear everyday benchmark
- ✅ One–two unmet needs named
- ✅ Single accountability line; no exaggeration

### Example (from recent copy)
On video: Congress admits they’ve set aside **$800 million** for ICE bonuses—up to **$44,000** each.
Meanwhile, the average American bonus is **$2,500**, if you’re lucky enough to get one.
They say they can’t fund healthcare, housing, or disaster relief…
…but they can bankroll cash incentives for an agency detaining people first and checking facts later. That’s the priority.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 16, 2026 | Initial branding standards. Established "Abridgd" as official name, documented technical vs. display name distinction. |
