#!/usr/bin/env bash
set -euo pipefail

echo "Installing repository dependencies and semantic-release plugins..."
npm ci
npm install --no-save semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/github @semantic-release/npm @semantic-release/release-notes-generator @semantic-release/commit-analyzer

echo "Installing workspace dependencies..."
cd dev/backend && npm ci --no-workspaces --legacy-peer-deps && cd ../..
cd dev/frontend && npm ci && cd ../..

echo "Done."
