#!/usr/bin/env bash
set -euo pipefail

echo "Installing repository dependencies..."
npm ci

echo "Installing workspace dependencies..."
cd dev/backend && npm ci --no-workspaces --legacy-peer-deps && cd ../..
cd dev/frontend && npm ci && cd ../..

echo "Verifying semantic-release setup..."
npm list semantic-release
npm ls @semantic-release/changelog

echo "Done."
