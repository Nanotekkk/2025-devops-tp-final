# Quick Deploy Guide

This project is configured to deploy on **Render** (backend), **Netlify** (frontend), and **Neon** (PostgreSQL).

## Fastest Path to Production

### 1. Create a Neon Database (5 min)
- Go to https://console.neon.tech
- Create a new PostgreSQL 15 project
- Copy the connection string (includes username, password, host)

### 2. Set GitHub Secrets (2 min)
Go to **Settings → Secrets and variables → Actions**, add:
- `DOCKER_USERNAME` (Docker Hub username)
- `DOCKER_PASSWORD` (Docker Hub token from https://hub.docker.com/settings/security)
- `NEON_DATABASE_URL` (Neon connection string)

### 3. Deploy Backend on Render (3 min)
- Go to https://dashboard.render.com
- Click **New Web Service**
- Connect your GitHub repo
- Render detects `render.yaml` automatically
- Add env var: `DATABASE_URL = <NEON_CONNECTION_STRING>`
- Deploy (migrations run automatically on startup)

### 4. Deploy Frontend on Netlify (2 min)
- Go to https://app.netlify.com
- Click **Add new site → Import an existing project → GitHub**
- Select your repo
- **Critical**: Update `frontend/netlify.toml`:
  ```toml
  [[redirects]]
    from = "/api/*"
    to = "https://YOUR-RENDER-SERVICE.onrender.com/:splat"
  ```
- Deploy

### 5. Test
- Open Netlify site URL
- Add a person
- Add a gift
- ✅ Done!

## Detailed Guides

- Full deployment walkthrough: [`docs/deploy-render-netlify-neon.md`](docs/deploy-render-netlify-neon.md)
- GitHub secrets setup: [`docs/github-secrets.md`](docs/github-secrets.md)
- Local testing: [`README.md`](README.md)

## Architecture

```
Netlify (React SPA)
  ↓ /api/* → redirect
Render (Go backend)
  ↓
Neon (PostgreSQL)
```

## Continuous Deployment

- Push to `main` → GitHub Actions runs tests + builds images
- Docker images pushed to Docker Hub automatically
- (Optional) Configure Render/Netlify webhooks for auto-deploy on git push

## Cost Estimate (Monthly)

- **Neon**: Free tier (1 project, up to 1 GB storage)
- **Render**: ~$7/month (Web Service free tier, or $7 for starter)
- **Netlify**: Free tier included
- **Docker Hub**: Free tier included

Total: **$0-7/month** for this project 🎄
