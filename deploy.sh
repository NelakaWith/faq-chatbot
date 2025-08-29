#!/usr/bin/env bash
set -e

# Simple deploy script for a droplet (run from project root on the droplet)
# Prerequisites: Docker & Docker Compose (or Docker Compose plugin) installed on the droplet.

echo "Pulling latest images (if using remote registry) and building local images..."
# If you push images to a registry, you can `docker-compose pull` here.

docker-compose build --pull

echo "Starting containers..."
docker-compose up -d --remove-orphans

echo "Deployment complete. Use 'docker-compose ps' to view services."
