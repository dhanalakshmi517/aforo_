#!/bin/bash

echo "Starting Wasp with automatic patching..."
echo

# Run the wasp build command
wasp build

echo
echo "Applying patches to fix TypeScript errors..."
echo

# Run our patch script
npm run apply-patches

echo
echo "Setup complete! You can now run your application."
echo
