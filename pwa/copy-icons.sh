#!/bin/bash
# Script to copy icons from extension to PWA
# Creates all required icon sizes

echo "Copying icons from extension to PWA..."

# Create icons directory if it doesn't exist
mkdir -p icons

# Copy base icon
if [ -f "../extension/icons/icon128.png" ]; then
    cp ../extension/icons/icon128.png icons/icon128.png
    echo "✓ Copied icon128.png"
else
    echo "⚠ Warning: icon128.png not found in extension/icons/"
fi

# Create other sizes (you may need ImageMagick or similar)
# For now, just copy the same icon for all sizes
# In production, you should create proper sized icons

if [ -f "icons/icon128.png" ]; then
    cp icons/icon128.png icons/icon72.png
    cp icons/icon128.png icons/icon96.png
    cp icons/icon128.png icons/icon144.png
    cp icons/icon128.png icons/icon192.png
    cp icons/icon128.png icons/icon512.png
    echo "✓ Created all icon sizes (using icon128 as base)"
    echo "⚠ Note: You should create proper sized icons for production"
else
    echo "❌ Error: Could not find base icon"
    exit 1
fi

echo "Done! Icons are in pwa/icons/"

