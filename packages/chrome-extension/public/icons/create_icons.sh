#!/bin/bash
# Create placeholder icons using ImageMagick (if available) or simple base64 PNGs

# Check if convert (ImageMagick) is available
if command -v convert &> /dev/null; then
    # Create icons with different sizes using ImageMagick
    for size in 16 32 48 128; do
        convert -size ${size}x${size} xc:none -gravity center \
            -fill '#2563EB' -draw "circle $(($size/2)),$(($size/2)) $(($size/2)),$(($size/4))" \
            -fill '#3B82F6' -draw "circle $(($size/2)),$(($size/2)) $(($size/2)),$(($size/3))" \
            icon${size}.png
    done
    echo "Icons created with ImageMagick"
else
    echo "ImageMagick not available, creating placeholder icons"
    # Create base64 encoded 1x1 blue PNG as placeholder
    for size in 16 32 48 128; do
        echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon${size}.png
    done
    echo "Placeholder icons created (will need to be replaced with actual icons)"
fi
