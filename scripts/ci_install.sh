#!/usr/bin/env bash
set -euo pipefail

echo "Installing repository dependencies and semantic-release plugins..."
npm ci
npm install --no-save semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/github @semantic-release/npm @semantic-release/release-notes-generator @semantic-release/commit-analyzer

echo "Done."
