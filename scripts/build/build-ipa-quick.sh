#!/bin/bash

# Quick IPA Build Script
# Run this from the project root directory

set -e

echo "🚀 Quick iOS IPA Build"
echo "====================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

cd ios

# Check if ExportOptions.plist exists
if [[ ! -f "ExportOptions.plist" ]]; then
    echo -e "${BLUE}[INFO]${NC} Creating ExportOptions.plist..."
    cat > ExportOptions.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>teamID</key>
    <string>8GU67G2W48</string>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
EOF
fi

echo -e "${BLUE}[INFO]${NC} Installing pods..."
pod install --repo-update

echo -e "${BLUE}[INFO]${NC} Creating archive..."
xcodebuild -workspace abridged.xcworkspace \
    -scheme abridged \
    -configuration Release \
    -sdk iphoneos \
    archive \
    -archivePath abridged.xcarchive \
    -allowProvisioningUpdates

echo -e "${BLUE}[INFO]${NC} Exporting IPA..."
xcodebuild -exportArchive \
    -archivePath abridged.xcarchive \
    -exportPath . \
    -exportOptionsPlist ExportOptions.plist

if [[ -f "abridged.ipa" ]]; then
    echo -e "${GREEN}[SUCCESS]${NC} IPA created successfully!"
    echo -e "${GREEN}[SUCCESS]${NC} Location: $(pwd)/abridged.ipa"
    ls -la abridged.ipa
else
    echo -e "${RED}[ERROR]${NC} IPA creation failed!"
    exit 1
fi