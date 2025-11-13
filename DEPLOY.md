Deploy workflow and secrets

This document explains how the repository deploy process works when a release is published, and what secrets are required to enable the deploy.

What triggers deploys

- The deploy GitHub Actions workflow (`.github/workflows/deploy.yml`) is configured to run when a GitHub Release is published (`release.published`) and also supports manual dispatch (`workflow_dispatch`).
- The typical flow is: semantic-release runs -> publishes a release on GitHub -> the `deploy.yml` workflow triggers and performs the deployment steps.

Required secrets and configuration

- `GITHUB_TOKEN` (automatically provided by Actions) — used for GitHub API operations and to create releases.
- If deploying to a remote server via SSH (example: a DigitalOcean droplet), add the following secrets in the repository settings:
  - `DROPLET_HOST` — host or IP address
  - `DROPLET_USER` — SSH username
  - `DROPLET_SSH_KEY` — private SSH key (PEM format). The workflow will write this to a file at runtime and use it for `scp`/`ssh`.

- Optional: `NPM_TOKEN` — if you also want CI to publish to npmjs.org as part of the release. Add it as a repo secret and enable `@semantic-release/npm` in `.releaserc`.

How deploy happens (summary)

1. semantic-release publishes a GitHub Release.
2. `deploy.yml` receives the `release.published` event.
3. The workflow creates a GitHub Deployment record for tracking.
4. The deployment status is set to "in_progress".
5. The workflow checks out the repo, builds the frontend (if applicable), copies build artifacts to the remote host via `scp`, and runs remote deployment commands via `ssh`.
6. On success, the deployment status is updated to "success" with the production URL.
7. On failure, the deployment status is updated to "failure".

Verifying a deploy

- After a release is created you can watch the `deploy.yml` job in GitHub Actions. The run will list the job steps and show the `scp`/`ssh` outputs.
- View all deployments on the GitHub Deployments page: https://github.com/NelakaWith/faq-chatbot/deployments
- Each deployment shows its status (in_progress, success, or failure) and links to the production environment.
- On the remote host, check the deploy directory and the running services (for example, `pm2 status` or systemd unit logs).

GitHub Deployments tracking

- The workflow automatically creates GitHub Deployment records for every deployment.
- All deployments are tracked in the "production" environment.
- Deployment records include:
  - The git ref (tag or commit) being deployed
  - Deployment status (in_progress, success, or failure)
  - Timestamp and duration of the deployment
  - Link to the production environment URL on success
- View deployment history at: https://github.com/NelakaWith/faq-chatbot/deployments

Manual dispatch

- You can manually trigger the deploy workflow from the Actions UI using "Run workflow" on the `deploy.yml` workflow. The manual dispatch path is useful for testing or re-deploying an existing release.
- When manually triggered, you can optionally specify a tag to deploy (e.g., v1.2.3).

Security notes

- Keep `DROPLET_SSH_KEY` private and limit its permissions on the remote host. Use a dedicated deploy user with minimal privileges.
- Rotate secrets periodically and revoke old keys if a developer leaves the team or a key is compromised.

Troubleshooting

- If `scp` or `ssh` fails, verify `DROPLET_HOST` is reachable from the Actions runner and `DROPLET_SSH_KEY` matches the authorized key on the remote host.
- If the workflow cannot push changelog updates, ensure the release workflow has `permissions.contents: write` and the checkout step uses `persist-credentials: true`.

If you want, I can add a small `deploy-checklist.md` or extend this doc with sample commands and remote scripts used in the droplet deploy process.