Monorepo release workflow (Changesets)

This repository uses Changesets to manage per-package versioning and changelogs.

Basic workflow:

1. Make changes in `dev/backend` or `dev/frontend`.
2. Run `npx changeset` and answer prompts to create a changeset describing the change and the bump type (patch/minor/major) for affected packages.
3. When ready to cut releases run:

```bash
# generate versions and changelogs locally
npx changeset version

# review and commit generated changes
git add .
git commit -m "chore(release): version packages"

git push origin main

# publish packages (optional / use CI)
npx changeset publish
```

Notes:

- Changesets creates small files under `.changeset/` describing bumps. Keep them small and descriptive.
- The root `package.json` contains helper scripts and `@changesets/cli` as a devDependency.

## Continuous integration (GitHub Actions)

We've added a GitHub Actions workflow `.github/workflows/changesets-release.yml` that automates publishing. The workflow triggers on:

- Tag pushes matching `v*.*.*` (for example `v1.2.3`)
- Pushes to the `main` branch

What the workflow does:

- Checks out the repository (full history)
- Installs Node and dependencies
- Runs `npx changeset publish --yes` which will publish updated packages and create GitHub releases/changelog entries

## Secrets and permissions

By default the workflow uses the built-in `GITHUB_TOKEN` (available as `secrets.GITHUB_TOKEN`) which is sufficient for creating releases and tagging in the repo. If you publish to external package registries (npmjs, GitHub Packages) and need a Personal Access Token (PAT), add a repository secret named `NPM_TOKEN` (or another name) and update the workflow to use it:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Notes on usage

1. Developer creates changesets locally whenever they make changes:

```bash
# from repo root
npx changeset
```

2. When ready to publish (manually or via CI), create a tag like `v1.0.1` and push it, or push to the `main` branch:

```bash
git tag v1.0.1
git push origin v1.0.1
```

The GitHub Action will run and publish packages according to the generated changesets.

## Troubleshooting

- If the workflow fails due to permission errors, ensure `contents: write` and `packages: write` are allowed in the workflow `permissions` block and that `GITHUB_TOKEN` has repo write access.
- For private package registries, use a PAT with the appropriate scopes and set it as a repository secret.
