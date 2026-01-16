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
   - docs/vision.md
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

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 16, 2026 | Initial branding standards. Established "Abridgd" as official name, documented technical vs. display name distinction. |
