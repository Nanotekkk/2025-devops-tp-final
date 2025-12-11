# Deployment Guide: Render + Netlify + Neon

This guide explains how to deploy the Christmas Gift List application using **Render** (backend), **Netlify** (frontend), and **Neon** (PostgreSQL database).

## Architecture Overview

```
┌──────────────────┐
│   Netlify SPA    │ (Frontend - React)
│  (Built dist/)   │
└────────┬─────────┘
         │ /api/* (redirect)
         ▼
┌──────────────────┐
│   Render Web     │ (Backend - Go)
│   Service 8080   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Neon DB        │ (PostgreSQL - managed)
└──────────────────┘
```

## Prerequisites

- **GitHub** account with this repository
- **Render** account (free tier available)
- **Netlify** account (free tier available)
- **Neon** account (free tier with Postgres 15+)
- **Docker Hub** account (for pushing images)

## Step 1: Create Neon PostgreSQL Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project → PostgreSQL 15
3. Create a database named `christmas_gifts` (or keep default)
4. Copy the **connection string** (looks like `postgresql://user:password@host/dbname?sslmode=require`)
5. Store it securely — you'll need it for Render and GitHub Actions

### Verify Connection

```bash
psql "postgresql://user:password@host/dbname?sslmode=require"
```

## Step 2: Deploy Backend on Render

### Option A: Using `render.yaml` (IaC)

1. Push the `render.yaml` file to your GitHub repository (already done)
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New +** → **Web Service**
4. Select **Build and deploy from a Git repository**
5. Connect your GitHub repo
6. Render auto-detects `render.yaml` and creates services defined in it
7. Add environment variable `DATABASE_URL` from Neon in the Render Web Service settings

### Option B: Manual Setup (if `render.yaml` doesn't work)

1. Create a **New Web Service** on Render
2. Connect your GitHub repo
3. Set build command: `./backend/Dockerfile` (auto-detected)
4. Set start command: `./server`
5. Set environment variable:
   - **DATABASE_URL**: Paste Neon connection string (add `?sslmode=require` if not present)
6. Set **PORT**: `8080` (or leave blank if backend defaults to 8080)
7. Deploy

### Health Check

Render will ping `/health` endpoint (defined in backend). If it returns `OK`, service is healthy.

### Verify Backend

Once deployed, test the backend:

```bash
curl https://<your-render-service>.onrender.com/health
```

Should return: `OK`

## Step 3: Run Database Migrations on Neon

After backend is deployed (or once you have a running backend), run migrations to create tables.

### Local Migration (with local backend)

If you're testing locally:

```bash
cd backend
DATABASE_URL="postgresql://user:password@neon-host/dbname?sslmode=require" ./scripts/migrate.sh
```

### Via Backend Startup

The backend automatically runs migrations on startup (check `cmd/server/main.go` → `database.CreateTables()`). So once the Render service starts successfully, tables should be created. Check Render logs to confirm.

## Step 4: Deploy Frontend on Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Select **GitHub** and authorize
4. Choose your repository
5. Netlify auto-detects `frontend/netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. **Important**: Before deploying, edit `frontend/netlify.toml`:
   - Replace `RENDER_BACKEND_URL` with your actual Render service URL (e.g., `https://christmas-gifts-backend-xyz.onrender.com`)
7. Deploy

### Update Netlify Config

After Render backend is live, update `frontend/netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://christmas-gifts-backend-xyz.onrender.com/:splat"
  status = 200
  force = true
```

Then re-deploy on Netlify (or push to GitHub and auto-deploy via git integration).

### Verify Frontend

Once deployed, open your Netlify site URL and test:
- View the list of people
- Add a new person
- Add gifts

## Step 5: GitHub Actions for CI/CD

### Existing Workflows

- **`.github/workflows/ci.yml`**: Runs tests on push to `main` and `develop`
- **`.github/workflows/docker-build.yml`**: Builds and pushes Docker images to Docker Hub on push/tags
- **`.github/workflows/release.yml`**: Creates GitHub release on push to `v*` tags

### Docker Hub Setup

1. Create Docker Hub account and repositories:
   - `docker.io/<username>/christmas-gifts-backend`
   - `docker.io/<username>/christmas-gifts-frontend`
2. Go to GitHub repo **Settings → Secrets → New repository secret**:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub personal access token

### Database URL Secret

Add to GitHub repo **Settings → Secrets**:
- `NEON_DATABASE_URL`: Your Neon PostgreSQL connection string

This is used in CI tests (e2e) if needed.

## Environment Variables Summary

### Backend (Render Service)

```
DATABASE_URL=postgresql://user:password@neon-host/dbname?sslmode=require
PORT=8080
```

### Frontend (Netlify Redirect)

No environment variables needed. The `netlify.toml` redirect proxy `/api/*` to Render backend.

## Testing the Full Stack

1. **Backend health check**:
   ```bash
   curl https://<render-backend>.onrender.com/health
   ```

2. **Frontend from Netlify**:
   Open https://<netlify-site>.netlify.app

3. **Add a person**:
   - Click "Add Person" button
   - Fill name and relationship
   - Should POST to backend via `/api/people`

4. **Add a gift**:
   - Click on a person
   - Click "Add Gift"
   - Should POST to backend via `/api/gifts`

## Troubleshooting

### Backend won't start on Render

- Check logs in Render dashboard → Service → Logs
- Verify `DATABASE_URL` is set and Neon database is reachable
- Ensure `sslmode=require` is in the connection string for Neon

### Frontend shows 502 or API errors

- Check Netlify redirect rules in `netlify.toml`
- Verify Render backend URL is correct
- Check CORS headers in backend (should allow all origins)

### Database migration failed

- Ensure Neon DB credentials are correct
- Run migrations manually: `./scripts/migrate.sh` with correct `DATABASE_URL`
- Check that `migrations/` folder exists and has `.sql` files

### Images not on Docker Hub

- Ensure `DOCKER_USERNAME` and `DOCKER_PASSWORD` are set in GitHub secrets
- Check `.github/workflows/docker-build.yml` is enabled
- Push to `main` or create a tag `v*` to trigger workflow

## Rolling Back

### Backend (Render)

Go to Render dashboard → Service → Deployments → Select previous deployment → Click "Redeploy"

### Frontend (Netlify)

Go to Netlify → Site → Deploys → Select previous deploy → Publish/Revert

### Database (Neon)

Backups are available in Neon console. Restore from snapshot if needed.

## Next Steps

- Enable auto-deploy on GitHub push (Netlify & Render both support this)
- Set up monitoring/alerts in Render dashboard
- Configure custom domain for both Netlify and Render
- Add status page or uptime monitoring
