#!/usr/bin/env bash
set -euo pipefail

echo "Installing repository dependencies..."
npm ci --ignore-scripts

echo "Installing workspace dependencies..."
cd dev/backend && npm ci --no-workspaces --legacy-peer-deps && cd ../..
cd dev/frontend && npm ci && cd ../..

echo "Installation complete. Ready for semantic-release."
