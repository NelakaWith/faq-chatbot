# Repository release workflow (semantic-release)

This repository is configured to use semantic-release for automated releases and changelog generation. The CI workflow (`.github/workflows/release.yml`) will run semantic-release on merges and on manual dispatches and will only publish from the `main` branch.

# Repository release workflow (semantic-release)

This repository is configured to use semantic-release for automated releases and changelog generation. The CI workflow (`.github/workflows/release.yml`) will run semantic-release on merges and on manual dispatches and will only publish from the `main` branch.

High-level flow

1. Develop and open a PR on a feature branch. Make commits using conventional commit style (feat:, fix:, chore:, docs:, etc.).
2. Merge the PR into `main` (or create a release via `workflow_dispatch` in Actions).
3. CI runs the `release.yml` job which executes semantic-release. When a new version is determined semantic-release will:
   - analyze commits (commit-analyzer)
   - generate release notes (release-notes-generator)
   - update the `CHANGELOG.md` (changelog plugin)
   - optionally publish to npm (controlled by `.releaserc` and presence of `NPM_TOKEN`)
   - create a GitHub Release with release notes
   - commit the updated `CHANGELOG.md` back to the repository (via `@semantic-release/git`)

Key files

- `.releaserc` - semantic-release configuration (plugins and branch configuration).
- `.github/workflows/release.yml` - CI workflow that runs semantic-release (includes a dry-run job in the workflow template).
- `scripts/ci_install.sh` - helper used in CI to install release tooling before running semantic-release.

Secrets and publishing

- `GITHUB_TOKEN` (available automatically in Actions) is used to create GitHub Releases and push changelog commits.
- To publish packages to npmjs.org, add `NPM_TOKEN` as a repository secret and enable `@semantic-release/npm` in `.releaserc` with `npmPublish: true`.
  - If you do not wish to publish to npm, keep `npmPublish: false` (recommended for deployments-only projects).

Local dry-run

To verify the behavior locally without publishing, run semantic-release in dry-run mode:

```bash
# install dependencies (you may need to run npm install if package-lock.json is out of date)
npm ci || npm install

# run semantic-release in dry-run mode (it will not publish or push changes)
npx semantic-release --dry-run
```

Notes:

- semantic-release decides the next version based on the commit messages following Conventional Commits. Use commitizen, commitlint, or a disciplined commit style to ensure reliable releases.
- The current configuration only allows publishing from `main` branch. A dry-run executed on a different branch will report that no publish will happen (expected behavior).

Which commits create a release

- Major release (breaking change): a commit with a BREAKING CHANGE in the footer or a header with a `!` (e.g. `feat!: ...`).
- Minor release: any `feat:` commit.
- Patch release: `fix:` commits (and `perf:` typically maps to patch).
- No release: `chore:`, `docs:`, `style:`, `refactor:`, `test:`, and similar types by themselves do not trigger a release.

Examples

# Repository release workflow (semantic-release)

This repository is configured to use semantic-release for automated releases and changelog generation. The CI workflow (`.github/workflows/release.yml`) will run semantic-release on merges and on manual dispatches and will only publish from the `main` branch.

## High-level flow

1. Develop and open a PR on a feature branch. Make commits using Conventional Commits (feat:, fix:, chore:, docs:, etc.).
2. Merge the PR into `main` (or create a release via `workflow_dispatch` in Actions).
3. CI runs the `release.yml` job which executes semantic-release. When a new version is determined semantic-release will:
   - analyze commits (commit-analyzer)
   - generate release notes (release-notes-generator)
   - update the `CHANGELOG.md` (changelog plugin)
   - optionally publish to npm (controlled by `.releaserc` and presence of `NPM_TOKEN`)
   - create a GitHub Release with release notes
   - commit the updated `CHANGELOG.md` back to the repository (via `@semantic-release/git`)

## Key files

- `.releaserc` - semantic-release configuration (plugins and branch configuration).
- `.github/workflows/release.yml` - CI workflow that runs semantic-release (includes a dry-run job in the workflow template).
- `scripts/ci_install.sh` - helper used in CI to install release tooling before running semantic-release.

## Secrets and publishing

- `GITHUB_TOKEN` (available automatically in Actions) is used to create GitHub Releases and push changelog commits.
- To publish packages to npmjs.org, add `NPM_TOKEN` as a repository secret and enable `@semantic-release/npm` in `.releaserc` with `npmPublish: true`.
  - If you do not wish to publish to npm, keep `npmPublish: false` (recommended for deployments-only projects).

## Local dry-run

To verify the behavior locally without publishing, run semantic-release in dry-run mode:

```bash
# install dependencies (you may need to run npm install if package-lock.json is out of date)
npm ci || npm install

# run semantic-release in dry-run mode (it will not publish or push changes)
npx semantic-release --dry-run
```

## Notes

- semantic-release decides the next version based on the commit messages following Conventional Commits. Use commitizen, commitlint, or a disciplined commit style to ensure reliable releases.
- The current configuration only allows publishing from `main` branch. A dry-run executed on a different branch will report that no publish will happen (expected behavior).

## Which commits create a release

- Major release (breaking change): a commit with a `BREAKING CHANGE` in the footer or a header with a `!` (e.g. `feat!: ...`).
- Minor release: any `feat:` commit.
- Patch release: `fix:` commits (and `perf:` typically maps to patch).
- No release: `chore:`, `docs:`, `style:`, `refactor:`, `test:`, and similar types by themselves do not trigger a release.

## Examples

### Major

```
feat!: change API X to Y

feat(scope): change public API
BREAKING CHANGE: removed parameter z
```

### Minor

```
feat(auth): add password reset endpoint
```

### Patch

```
fix(api): correct 500 on malformed input
perf(db): speed up queries
```

### No release

```
docs: update README
chore: bump dev deps
refactor(utils): internal-only refactor
```

## Quick release checklist

- [ ] Ensure feature PRs are merged into `main` with Conventional Commits
- [ ] Confirm `.releaserc` has the desired plugins and npm publish behavior
- [ ] (Optional) If publishing to npm, add `NPM_TOKEN` as a repo secret and ensure `.releaserc` has `@semantic-release/npm` with `npmPublish: true`
- [ ] Push to `main` or dispatch the `release.yml` workflow manually via Actions
- [ ] Check GitHub Actions logs: semantic-release will create a GitHub Release and update `CHANGELOG.md` in the repo

## Troubleshooting

- If semantic-release reports it is running on a non-publish branch (for example `develop`), this is expected: semantic-release is configured to only publish from `main`.
- If the release job fails due to npm auth, verify `NPM_TOKEN` is present and Actions is writing it to `~/.npmrc` or providing it as `NODE_AUTH_TOKEN` to the job.
- If `@semantic-release/git` cannot push the changelog commit, ensure the workflow permissions include `contents: write` and the checkout step uses `persist-credentials: true`.

## Additional notes

- The repository used to use Changesets for per-package versioning. If you require per-package independent releases (monorepo independent versioning), we can switch to a semantic-release multi-package strategy or revert to Changesets. For now the repo is set up as a single release flow (one version for the workspace) matching the big-brother example.
- [ ] Check GitHub Actions logs: semantic-release will create a GitHub Release and update `CHANGELOG.md` in the repo

## Troubleshooting

- If semantic-release reports it is running on a non-publish branch (for example `develop`), this is expected: semantic-release is configured to only publish from `main`.
- If the release job fails due to npm auth, verify `NPM_TOKEN` is present and Actions is writing it to `~/.npmrc` or providing it as `NODE_AUTH_TOKEN` to the job.
- If `@semantic-release/git` cannot push the changelog commit, ensure the workflow permissions include `contents: write` and the checkout step uses `persist-credentials: true`.

## Additional notes

- The repository used to use Changesets for per-package versioning. If you require per-package independent releases (monorepo independent versioning), we can switch to a semantic-release multi-package strategy or revert to Changesets. For now the repo is set up as a single release flow (one version for the workspace) matching the big-brother example.
