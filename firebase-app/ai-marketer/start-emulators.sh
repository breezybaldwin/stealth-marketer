#!/bin/bash

# Start Firebase emulators with persistent data
# This script saves emulator data between restarts

echo "🚀 Starting Firebase emulators with data persistence..."
echo ""
echo "Data will be saved to .emulator-data/"
echo "Auth data, Firestore data, and other emulator state will persist between restarts."
echo ""

# Check if .emulator-data exists, if not create it
if [ ! -d ".emulator-data" ]; then
  echo "Creating .emulator-data directory..."
  mkdir -p .emulator-data
fi

# Check if there's existing data to import
if [ -d ".emulator-data" ] && [ "$(ls -A .emulator-data)" ]; then
  echo "📦 Found existing emulator data - importing..."
  firebase emulators:start --import=.emulator-data --export-on-exit=.emulator-data
else
  echo "🆕 No existing data found - starting fresh..."
  firebase emulators:start --export-on-exit=.emulator-data
fi

