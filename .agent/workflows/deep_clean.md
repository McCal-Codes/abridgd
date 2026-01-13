---
description: Deep clean the development environment to resolve build/caching issues
---

1. Clear Watchman watches (fixes file system sync issues)
// turbo
2. watchman watch-del-all

3. Remove node_modules and lockfiles to ensure clean dependency tree
// turbo
4. rm -rf node_modules package-lock.json

5. Clear Metro Bundler cache
// turbo
6. rm -rf $TMPDIR/metro-*

7. Reinstall dependencies
// turbo
8. npm install

9. (Optional) If native folders exist, clean them
10. cd ios && xcodebuild clean || true
11. cd ..
