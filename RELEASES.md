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

git push origin develop

# publish packages (optional / use CI)
npx changeset publish
```

Notes:

- Changesets creates small files under `.changeset/` describing bumps. Keep them small and descriptive.
- The root `package.json` contains helper scripts and `@changesets/cli` as a devDependency.
