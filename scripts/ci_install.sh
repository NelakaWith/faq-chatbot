#!/usr/bin/env bash
set -euo pipefail

echo "Installing repository dependencies..."
npm ci

echo "Installing workspace dependencies..."
cd dev/backend && npm ci --no-workspaces --legacy-peer-deps && cd ../..
cd dev/frontend && npm ci && cd ../..

echo "Verifying semantic-release is available..."
if command -v npx >/dev/null 2>&1 && npx --quiet semantic-release --version >/dev/null 2>&1; then
    echo "✓ semantic-release is properly installed and accessible via npx"
else
    echo "✗ semantic-release installation failed or not accessible"
    echo "Attempting to debug..."
    echo "npx version: $(npx --version)"
    echo "semantic-release location: $(npm list semantic-release)"
    exit 1
fi

echo "Installation complete. Ready for semantic-release."
