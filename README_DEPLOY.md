Deploy via GitHub Actions (SSH) — preferred (no Docker required)

This repository includes a GitHub Actions workflow that builds the frontend, packages the backend, and deploys the artifacts to a droplet over SSH. The workflow runs on pushes to the `develop` branch.

What the workflow does:

- Installs backend dependencies
- Builds the frontend (`dev/frontend`) into a static `dist/` directory
- Archives the backend and frontend build and copies the archive to the droplet via SCP
- On the droplet: extracts files, installs backend dependencies, places frontend static files into `/var/www/faq-chatbot`, and starts the backend with `pm2`

Prerequisites on the droplet (Ubuntu 20.04+ recommended):

1. Create a droplet and ensure you have an SSH keypair.

2. Install required packages on the droplet:

```bash
sudo apt update
sudo apt install -y nginx nodejs npm
sudo npm install -g pm2
```

3. Ensure nginx serves `/var/www/faq-chatbot` (example site config provided below).

4. Add the following **secrets** to your GitHub repository (Settings → Secrets and variables → Actions):

- `DROPLET_HOST` — droplet public IP or hostname
- `DROPLET_USER` — SSH user (e.g., `ubuntu`)
- `DROPLET_SSH_KEY` — private SSH key (PEM format) that can SSH to the droplet as `DROPLET_USER`
- `DROPLET_SSH_PORT` — SSH port (usually `22`)

Usage

1. Push changes to the `develop` branch. The `deploy` workflow will run automatically.

2. On the droplet, the workflow will:

   - extract the archive to `~/faq-chatbot-deploy`
   - run `npm ci --production` in `backend`
   - copy frontend static files to `/var/www/faq-chatbot`
   - start the backend using `pm2` as `faq-chatbot`
   - reload `nginx` to pick up static files

Example `nginx` site (droplet):

```nginx
server {
   listen 80;
   server_name _;

   root /var/www/faq-chatbot;
   index index.html;

   location /chat {
      proxy_pass http://127.0.0.1:3000/chat;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
   }

   location /status {
      proxy_pass http://127.0.0.1:3000/status;
   }

   location /health {
      proxy_pass http://127.0.0.1:3000/health;
   }

   location / {
      try_files $uri $uri/ /index.html;
   }

   client_max_body_size 10M;
}
```

Notes & troubleshooting

- The workflow expects the droplet to have a working `pm2` environment. If you prefer a different process manager, adjust the workflow `ssh` script.
- For TLS, add Certbot on the droplet and configure `nginx` accordingly (or use a CDN/terminator like Cloudflare).
- If you have private dependencies or additional build steps, extend the workflow.

Security

- Store only the private SSH key in `DROPLET_SSH_KEY` and ensure the key is restricted to the repo's Actions runs. Use an SSH keypair dedicated to CI where possible.
- Avoid storing secrets in plaintext in the repository.

If you want, I can also:

- Add a rollback step that keeps the previous release directory
- Add health-checks and a small smoke-test in the workflow
- Add automatic TLS via Let's Encrypt using Certbot commands in the SSH step

Docker-based deployment (optional)

If you prefer to run the application using Docker on the droplet (or locally), this repository includes Dockerfiles and a `docker-compose.yml` to run the backend and frontend as containers.

1. Build and run locally (project root):

```bash
# Build backend and frontend images and start services
docker compose build
docker compose up -d
```

2. Production notes for a droplet:

- Install Docker and the Compose plugin on the droplet (see official Docker docs).
- Copy the repository to the droplet or push images to a registry and pull.
- Use `docker compose up -d --build` to build and run containers.
- The frontend will be served by nginx on port 80 and proxy API calls to the backend container on port 3000.

3. Persisting data & process supervision:

- For production, mount any required volumes (logs, uploaded files) and configure restart policies in `docker-compose.yml`.
- Consider placing a reverse proxy/terminator (nginx, Traefik) in front of the stack for TLS management.

4. Example commands to manage the stack on the droplet:

```bash
# Pull latest code, then rebuild and restart
git pull origin develop
docker compose pull || true
docker compose up -d --build --remove-orphans

# View logs
docker compose logs -f

# Stop
docker compose down
```

Security & TLS

- For TLS on a droplet, use Certbot with nginx or a reverse proxy (Traefik) to automatically obtain and renew certificates.
- Ensure firewall allows only required ports (80/443) and block direct access to management ports like 3000 if you rely on the proxy.

That's it — both GitHub Actions SSH deployment and Docker-based deployment options are documented here. Let me know if you want me to add a workflow that builds Docker images, publishes them to a registry, and deploys the images on the droplet.
