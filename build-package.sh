#!/bin/bash
# Script để build extension package cho Chrome Web Store / Edge Add-ons

VERSION=$(grep '"version"' extension/manifest.json | cut -d'"' -f4)
PACKAGE_NAME="metruyencv-reader-v${VERSION}.zip"

echo "📦 Building extension package..."
echo "Version: ${VERSION}"
echo "Package name: ${PACKAGE_NAME}"

# Tạo thư mục temp
TEMP_DIR=$(mktemp -d)
echo "Temp directory: ${TEMP_DIR}"

# Copy files vào temp (loại bỏ file không cần thiết)
echo "Copying files..."
cd extension
find . -type f \
  ! -name "*.md" \
  ! -name ".git*" \
  ! -name "*.sh" \
  ! -name "*.bat" \
  ! -name ".DS_Store" \
  ! -name "Thumbs.db" \
  -exec cp --parents {} "${TEMP_DIR}/" \;

# Tạo ZIP
cd "${TEMP_DIR}"
echo "Creating ZIP file..."
zip -r "../../${PACKAGE_NAME}" . -x "*.git*" "*.md" "*.sh" "*.bat" ".DS_Store" "Thumbs.db"

# Cleanup
cd ../..
rm -rf "${TEMP_DIR}"

echo "✅ Package created: ${PACKAGE_NAME}"
echo "📏 File size: $(du -h ${PACKAGE_NAME} | cut -f1)"
echo ""
echo "📋 Checklist before upload:"
echo "  [ ] Icons đã có (16x16, 48x48, 128x128)"
echo "  [ ] Đã test extension"
echo "  [ ] Privacy Policy đã chuẩn bị"
echo "  [ ] Screenshots đã có"
echo ""
echo "🚀 Ready to upload to store!"

