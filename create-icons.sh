#!/bin/bash

# Smart PDF Bundler Icon Generator
# This script converts the SVG logo to PNG icons for various platforms

echo "🎨 Generating Smart PDF Bundler Icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed. Please install it first:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    echo "   Windows: Download from https://imagemagick.org/"
    exit 1
fi

# Create icons directory
mkdir -p icons

# Generate different sizes
echo "📱 Generating app icons..."

# 16x16 (favicon)
convert logo.svg -resize 16x16 icons/favicon-16x16.png

# 32x32 (favicon)
convert logo.svg -resize 32x32 icons/favicon-32x32.png

# 48x48 (Windows taskbar)
convert logo.svg -resize 48x48 icons/icon-48x48.png

# 64x64 (Windows desktop)
convert logo.svg -resize 64x64 icons/icon-64x64.png

# 128x128 (macOS dock)
convert logo.svg -resize 128x128 icons/icon-128x128.png

# 256x256 (macOS dock, high DPI)
convert logo.svg -resize 256x256 icons/icon-256x256.png

# 512x512 (macOS app store)
convert logo.svg -resize 512x512 icons/icon-512x512.png

# 1024x1024 (macOS app store, high DPI)
convert logo.svg -resize 1024x1024 icons/icon-1024x1024.png

# Generate ICO file for Windows
echo "🪟 Generating Windows ICO file..."
convert logo.svg -resize 256x256 icons/favicon.ico

# Generate ICNS file for macOS
echo "🍎 Generating macOS ICNS file..."
mkdir -p icons/macos
convert logo.svg -resize 16x16 icons/macos/icon_16x16.png
convert logo.svg -resize 32x32 icons/macos/icon_16x16@2x.png
convert logo.svg -resize 32x32 icons/macos/icon_32x32.png
convert logo.svg -resize 64x64 icons/macos/icon_32x32@2x.png
convert logo.svg -resize 128x128 icons/macos/icon_128x128.png
convert logo.svg -resize 256x256 icons/macos/icon_128x128@2x.png
convert logo.svg -resize 256x256 icons/macos/icon_256x256.png
convert logo.svg -resize 512x512 icons/macos/icon_256x256@2x.png
convert logo.svg -resize 512x512 icons/macos/icon_512x512.png
convert logo.svg -resize 1024x1024 icons/macos/icon_512x512@2x.png

# Create ICNS file (requires iconutil on macOS)
if command -v iconutil &> /dev/null; then
    echo "📦 Creating macOS ICNS file..."
    cd icons/macos
    iconutil -c icns . -o ../Smart-PDF-Bundler.icns
    cd ../..
else
    echo "⚠️  iconutil not found. ICNS file not created."
    echo "   You can create it manually using Icon Composer or similar tools."
fi

echo ""
echo "✅ Icons generated successfully!"
echo "📁 Icons are saved in the 'icons' directory:"
echo "   • favicon.ico - Windows favicon"
echo "   • icon-*.png - Various PNG sizes"
echo "   • Smart-PDF-Bundler.icns - macOS app icon (if created)"
echo ""
echo "🎯 Usage:"
echo "   • Use favicon.ico for web browsers"
echo "   • Use icon-256x256.png for desktop shortcuts"
echo "   • Use Smart-PDF-Bundler.icns for macOS apps" 