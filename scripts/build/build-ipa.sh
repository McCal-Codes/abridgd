#!/bin/bash

# Build iOS IPA Workflow
# This script builds a signed iOS IPA file locally without a paid Apple Developer Account

set -e  # Exit on any error

echo "🚀 Starting iOS IPA Build Workflow..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if Xcode is installed
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode is not installed. Please install Xcode from the Mac App Store."
        exit 1
    fi

    # Check if we're in the ios directory
    if [[ ! -f "abridged.xcodeproj/project.pbxproj" ]]; then
        print_error "Not in the ios directory. Please run this script from the ios/ directory."
        exit 1
    fi

    # Check if ExportOptions.plist exists
    if [[ ! -f "ExportOptions.plist" ]]; then
        print_warning "ExportOptions.plist not found. Creating one..."
        create_export_options
    fi

    print_success "Prerequisites check passed!"
}

# Create ExportOptions.plist if it doesn't exist
create_export_options() {
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
    print_success "Created ExportOptions.plist"
}

# Install/update CocoaPods
install_pods() {
    print_status "Installing/updating CocoaPods dependencies..."

    if command -v pod &> /dev/null; then
        pod install --repo-update
        print_success "CocoaPods dependencies installed!"
    else
        print_error "CocoaPods not found. Please install CocoaPods: sudo gem install cocoapods"
        exit 1
    fi
}

# Clean previous builds
clean_build() {
    print_status "Cleaning previous builds..."

    # Remove old archive and IPA
    rm -rf abridged.xcarchive
    rm -f abridged.ipa

    # Clean Xcode build
    xcodebuild clean -workspace abridged.xcworkspace -scheme abridged

    print_success "Clean completed!"
}

# Archive the build
create_archive() {
    print_status "Creating archive..."

    xcodebuild -workspace abridged.xcworkspace \
        -scheme abridged \
        -configuration Release \
        -sdk iphoneos \
        archive \
        -archivePath abridged.xcarchive \
        -allowProvisioningUpdates

    if [[ -d "abridged.xcarchive" ]]; then
        print_success "Archive created successfully!"
    else
        print_error "Archive creation failed!"
        exit 1
    fi
}

# Export IPA from archive
export_ipa() {
    print_status "Exporting IPA..."

    xcodebuild -exportArchive \
        -archivePath abridged.xcarchive \
        -exportPath . \
        -exportOptionsPlist ExportOptions.plist

    if [[ -f "abridged.ipa" ]]; then
        print_success "IPA exported successfully!"
        print_success "IPA location: $(pwd)/abridged.ipa"
        ls -la abridged.ipa
    else
        print_error "IPA export failed!"
        exit 1
    fi
}

# Main workflow
main() {
    echo "📱 iOS IPA Build Workflow"
    echo "========================"

    check_prerequisites
    install_pods
    clean_build
    create_archive
    export_ipa

    echo ""
    print_success "🎉 Workflow completed successfully!"
    print_success "Your IPA file is ready at: $(pwd)/abridged.ipa"
    echo ""
    print_status "You can now install this IPA on your registered iOS devices."
}

# Handle command line arguments
case "${1:-}" in
    "clean")
        clean_build
        ;;
    "archive")
        check_prerequisites
        install_pods
        create_archive
        ;;
    "export")
        export_ipa
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no command)  Run full workflow"
        echo "  clean         Clean previous builds"
        echo "  archive       Create archive only"
        echo "  export        Export IPA from existing archive"
        echo "  help          Show this help"
        ;;
    *)
        main
        ;;
esac