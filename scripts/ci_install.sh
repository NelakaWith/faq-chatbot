#!/usr/bin/env bash
set -euo pipefail

echo "Installing repository dependencies..."
npm ci

echo "Installing workspace dependencies..."
cd dev/backend && npm ci --no-workspaces --legacy-peer-deps && cd ../..
cd dev/frontend && npm ci && cd ../..

echo "Verifying semantic-release plugins..."
npx semantic-release --version

echo "Done."
