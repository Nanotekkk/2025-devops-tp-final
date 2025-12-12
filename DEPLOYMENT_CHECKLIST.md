# Complete Deployment Checklist

This document provides **step-by-step instructions** to deploy the Christmas Gift List application to production using Render, Netlify, and Neon.

**Estimated time: 30-45 minutes** (first-time setup)

---

## Phase 1: Prerequisites (5 minutes)

### 1.1 Create Required Accounts

- [ ] **GitHub**: Ensure you have a GitHub account with this repository
- [ ] **Docker Hub**: https://hub.docker.com/signup (free tier)
- [ ] **Neon**: https://console.neon.tech/auth/signup (free tier)
- [ ] **Render**: https://dashboard.render.com/register (free tier)
- [ ] **Netlify**: https://app.netlify.com/signup (free tier)

### 1.2 Verify Local Setup Works

Before deploying to production, ensure everything works locally:

```bash
# Clone and enter the project
git clone <your-repo-url>
cd 2025-devops-tp-final

# Install dependencies
cd frontend && npm install && cd ..
cd backend && go mod download && cd ..
cd e2e && npm install && cd ..

# Start local PostgreSQL
docker-compose up -d db
# Wait for postgres to be ready
sleep 5

# Test backend
cd backend
DATABASE_URL="postgres://postgres:postgres@localhost:5432/christmas_gifts?sslmode=disable" go run cmd/server/main.go &
sleep 3
curl http://localhost:8080/health  # Should return "OK"
kill %1  # Stop backend

# Test frontend
cd ../frontend
npm run dev
# Open http://localhost:5173 in browser, verify it loads

# Test docker-compose
cd ..
docker-compose up
# Open http://localhost:5173, add a person, add a gift
docker-compose down
```

✅ If all tests pass, proceed to Phase 2.

---

## Phase 2: Set Up Neon PostgreSQL (5 minutes)

### 2.1 Create Neon Project

1. Go to https://console.neon.tech
2. Click **Sign up** (or log in)
3. Complete sign-up or login
4. Click **Create a new project**
5. Choose:
   - **Region**: Select closest to your Render region (e.g., Frankfurt if you'll use Frankfurt on Render)
   - **PostgreSQL Version**: 15 (latest stable)
   - **Name**: `christmas-gifts-prod` (optional, for clarity)
6. Click **Create project**

**You should now see:**
```
Project: christmas-gifts-prod
Database: neondb (or custom name)
Role: neondb_owner (or custom)
```

### 2.2 Create Database and User (Optional but Recommended)

By default, Neon creates a database. If you want a dedicated user for this app:

1. In Neon console → **SQL Editor** → run:

```sql
CREATE DATABASE christmas_gifts;
CREATE ROLE christmas_app WITH LOGIN PASSWORD 'secure-password-here';
GRANT ALL PRIVILEGES ON DATABASE christmas_gifts TO christmas_app;
```

2. Note the new connection string (shown in console or generate new one).

### 2.3 Copy Connection String

1. In Neon console → **Connection string** tab
2. Select **Password** (not Postgres URI)
3. Copy the full string, should look like:
   ```
   postgresql://neondb_owner:XXXXX@ep-cool-name.us-east-1.neon.tech/neondb?sslmode=require
   ```
4. **Save this securely** — you'll use it in the next steps

### 2.4 Verify Connection (Optional)

If you have `psql` installed locally:

```bash
psql "postgresql://neondb_owner:XXXXX@ep-cool-name.us-east-1.neon.tech/neondb?sslmode=require"
```

If connection successful, you'll see:
```
neondb=>
```

Type `\q` to exit.

---

## Phase 3: Set Up GitHub Secrets (5 minutes)

Your GitHub Actions workflows need secrets to access Docker Hub and Neon.

### 3.1 Docker Hub Personal Access Token

1. Go to https://hub.docker.com/settings/security
2. Click **New Access Token**
3. Name: `github-actions` (or your preference)
4. Permissions: **Read & Write**
5. Click **Generate**
6. **Copy the token** (shown only once!)

### 3.2 Add Secrets to GitHub

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret** for each:

| Secret Name | Value |
|---|---|
| `DOCKER_USERNAME` | Your Docker Hub username (e.g., `john123`) |
| `DOCKER_PASSWORD` | The token you just generated |
| `NEON_DATABASE_URL` | Neon connection string from Phase 2 |

Example:
```
DOCKER_USERNAME = john123
DOCKER_PASSWORD = dckr_pat_XXXXX...
NEON_DATABASE_URL = postgresql://neondb_owner:XXXXX@ep-cool-name.us-east-1.neon.tech/neondb?sslmode=require
```

### 3.3 Verify Secrets Added

Go to **Settings → Secrets and variables → Actions** → you should see:
- ✅ DOCKER_PASSWORD (hidden)
- ✅ DOCKER_USERNAME
- ✅ NEON_DATABASE_URL (hidden)

---

## Phase 4: Deploy Backend on Render (10 minutes)

### 4.1 Create Render Account & Link GitHub

1. Go to https://dashboard.render.com
2. Sign up / Log in
3. Click **GitHub** to connect your GitHub account
4. Authorize `render` to access your repositories
5. You should now see your repo listed in Render

### 4.2 Create Web Service (Docker)

1. In Render dashboard, click **New +**
2. Select **Web Service**
3. Choose **Build and deploy from a Git repository**
4. Select your GitHub repo (`2025-devops-tp-final`)
5. Fill in:
   - **Name**: `christmas-gifts-backend` (or your preference)
   - **Region**: Frankfurt (or closest to Neon region)
   - **Branch**: `main`
   - **Runtime**: `Docker` (auto-detected)
   - **Build Command**: (leave empty, uses Dockerfile)
   - **Start Command**: (leave empty, uses Dockerfile)

### 4.3 Add Environment Variables

In the **Environment** section, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Paste your Neon connection string |
| `PORT` | `8080` |

Example:
```
DATABASE_URL = postgresql://neondb_owner:XXXXX@ep-cool-name.us-east-1.neon.tech/neondb?sslmode=require
PORT = 8080
```

### 4.4 Configure Deploy Settings

1. **Auto-Deploy**: Enable (auto-deploy on push to main)
2. **Pull Request Previews**: Disable (optional)
3. Click **Create Web Service**

**Render will now:**
1. Clone your repo
2. Build the Docker image (using `backend/Dockerfile`)
3. Start the service
4. Automatically run migrations on startup (via backend code)

### 4.5 Monitor Deployment

1. Wait for deployment to complete (1-3 minutes)
2. Go to **Logs** tab to watch build process
3. Once deployed, you'll see a public URL like:
   ```
   https://christmas-gifts-backend-abc123.onrender.com
   ```

### 4.6 Verify Backend is Running

```bash
# Test health endpoint
curl https://christmas-gifts-backend-abc123.onrender.com/health

# Should return: OK
```

If you get 502/503, check logs in Render dashboard.

✅ **Save the backend URL** — you'll need it for Netlify config.

---

## Phase 5: Deploy Frontend on Netlify (8 minutes)

### 5.1 Create Netlify Account & Connect GitHub

1. Go to https://app.netlify.com
2. Sign up / Log in
3. Click **Add new site → Import an existing project**
4. Click **GitHub**
5. Authorize Netlify to access your repositories
6. Select your repo (`2025-devops-tp-final`)

### 5.2 Configure Build Settings

Netlify should auto-detect:
- **Base directory**: `frontend` ✅
- **Build command**: `npm run build` ✅
- **Publish directory**: `dist` ✅

If not auto-detected, manually set them.

### 5.3 Update Backend URL in netlify.toml

This is **CRITICAL**. The frontend needs to know where the backend is.

1. Open `frontend/netlify.toml` in your editor
2. Replace `RENDER_BACKEND_URL` with your actual Render URL:

**Before:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://RENDER_BACKEND_URL/:splat"
```

**After:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://christmas-gifts-backend-abc123.onrender.com/:splat"
```

3. **Push this change to GitHub**:
```bash
git add frontend/netlify.toml
git commit -m "Update backend URL in Netlify config"
git push
```

### 5.4 Deploy

Back in Netlify:
1. Click **Deploy site**
2. Wait for build to complete (1-2 minutes)
3. You'll get a deployment URL:
   ```
   https://xxx-yyy-zzz.netlify.app
   ```

### 5.5 Verify Frontend is Running

1. Open the Netlify URL in your browser
2. You should see the Christmas Gift List app
3. Test the API proxy:
   - Click "Add Person"
   - Fill in name and relationship
   - Click "Add"
   - Should successfully POST to backend via `/api/people`

If you see errors, check:
- Browser console for error messages
- Netlify deploy logs
- Backend URL is correct in `netlify.toml`

✅ **Save the frontend URL** — this is your production site!

---

## Phase 6: Docker Hub Images (5 minutes)

Your GitHub Actions workflow automatically builds and pushes Docker images on every push to `main`.

### 6.1 Verify Images are Pushed

1. Go to https://hub.docker.com
2. Look for your repositories:
   - `<username>/christmas-gifts-backend`
   - `<username>/christmas-gifts-frontend`

If they don't exist yet, they'll be created on next push.

### 6.2 Trigger a Build (Optional)

To manually trigger a build and push:

```bash
# Make a small change (e.g., add comment to README)
echo "# Built on $(date)" >> README.md

# Commit and push
git add README.md
git commit -m "Trigger Docker image build"
git push
```

This will:
1. Run CI tests (`.github/workflows/ci.yml`)
2. Build and push Docker images (`.github/workflows/docker-build.yml`)

Monitor progress on GitHub → **Actions** tab.

### 6.3 Verify Docker Hub

Once workflow completes:

1. Go to Docker Hub → Your account
2. Click on `christmas-gifts-backend` → **Tags**
3. You should see:
   - `main` (latest from main branch)
   - `sha-XXXXX` (commit hash)

Same for `christmas-gifts-frontend`.

---

## Phase 7: Run End-to-End Tests in Production (Optional, 5 minutes)

### 7.1 Test API Manually

```bash
# Test backend directly
BACKEND_URL="https://christmas-gifts-backend-abc123.onrender.com"

# Get all people
curl "$BACKEND_URL/api/people"

# Add a person
curl -X POST "$BACKEND_URL/api/people" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","relationship":"Friend"}'

# Get gifts for person
curl "$BACKEND_URL/api/people/{person_id}/gifts"
```

### 7.2 Test Frontend Flow

1. Open your Netlify site: `https://xxx-yyy-zzz.netlify.app`
2. **Add a person**:
   - Click "Add Person" button
   - Enter name: "Test User"
   - Select relationship: "Friend"
   - Click "Add"
   - Should appear in list
3. **Add a gift**:
   - Click on the person you just added
   - Enter gift: "PlayStation 5"
   - Click "Add Gift"
   - Should appear under that person
4. **Select a gift**:
   - Click "Select" on a gift
   - Should change status

✅ If all actions work, your deployment is **successful**!

---

## Phase 8: Set Up Monitoring & Logging (Optional, 5 minutes)

### 8.1 Enable Render Logging

1. Render dashboard → Your backend service → **Logs**
2. View real-time logs
3. Errors and warnings appear here

### 8.2 Enable Netlify Analytics

1. Netlify → Your site → **Analytics**
2. View page views and performance
3. Check for any 5xx errors

### 8.3 Set Up Database Backups (Neon)

1. Neon console → Your project → **Backups**
2. Auto-backup is enabled by default
3. Manual backup: Click **Create backup**

---

## Phase 9: Configure Custom Domain (Optional, 10 minutes)

### 9.1 Frontend Custom Domain (Netlify)

1. Netlify → Your site → **Domain settings**
2. Click **Add custom domain**
3. Enter your domain (e.g., `gifts.example.com`)
4. Follow DNS setup instructions
5. Wait for DNS to propagate (up to 48 hours)

### 9.2 Backend Custom Domain (Render)

1. Render → Your service → **Custom domains**
2. Click **Add custom domain**
3. Enter your domain (e.g., `api.gifts.example.com`)
4. Follow DNS setup instructions

---

## Phase 10: Documentation & Cleanup (5 minutes)

### 10.1 Document Production URLs

Create a `.env.production` file (do NOT commit):

```bash
FRONTEND_URL=https://xxx-yyy-zzz.netlify.app
BACKEND_URL=https://christmas-gifts-backend-abc123.onrender.com
DATABASE_URL=postgresql://neondb_owner:XXXXX@...
```

Keep this locally or in a secure location (e.g., encrypted password manager).

### 10.2 Document Team Handoff

If handing off to team, create a `RUNBOOK.md` with:
- Production URLs
- How to roll back
- Common issues and fixes
- Who to contact for access

### 10.3 Set Up Uptime Monitoring (Optional)

Services like https://status.io or https://uptimerobot.com can monitor your services:

```
- Check health: https://christmas-gifts-backend-abc123.onrender.com/health
- Every 5 minutes
- Alert if down for 5+ minutes
```

---

## Troubleshooting

### Backend won't start on Render

**Error**: Service keeps restarting or shows 502 errors

**Fixes**:
1. Check Render logs: **Logs** tab
2. Verify `DATABASE_URL` is set correctly
3. Check that Neon database is reachable:
   ```bash
   psql "your-connection-string"
   ```
4. Restart service: **Service** → **Settings** → **Restart**

### Frontend shows blank page or 404

**Error**: Netlify site is live but shows error page

**Fixes**:
1. Check Netlify deploy logs: **Deploys** → last deployment → **Deploy log**
2. Verify `netlify.toml` is in `frontend/` directory
3. Ensure `RENDER_BACKEND_URL` is replaced with actual URL
4. Force rebuild: **Deploys** → **Trigger deploy** → **Deploy site**

### API calls return 502/503

**Error**: Frontend loads but API calls fail

**Fixes**:
1. Check backend is running: `curl <backend-url>/health`
2. Verify `netlify.toml` redirect is correct
3. Check CORS headers in backend (should allow all origins)
4. Check network tab in browser DevTools for actual error

### Database migration failed

**Error**: Backend logs show migration error

**Fixes**:
1. Verify Neon connection string has `?sslmode=require`
2. Ensure `migrations/` folder exists in backend
3. Check table definitions in `internal/database/database.go`
4. Manually run: 
   ```bash
   psql "your-neon-url" < backend/migrations/001_initial_schema.up.sql
   ```

### Docker images not pushing to Docker Hub

**Error**: GitHub Actions workflow fails

**Fixes**:
1. Check GitHub secrets are set correctly (case-sensitive!)
2. Verify Docker Hub token hasn't expired
3. Ensure Docker repository exists on Docker Hub
4. Check GitHub Actions logs: **Actions** → workflow → job logs

---

## Rollback Procedures

### Rollback Frontend (Netlify)

1. Netlify → **Deploys**
2. Click on previous successful deploy
3. Click **Publish** button to activate it

**Time to rollback**: 30 seconds

### Rollback Backend (Render)

1. Render → Service → **Deployments**
2. Click on previous successful deployment
3. Click **Redeploy** button

**Time to rollback**: 1-2 minutes (rebuilds and starts service)

### Rollback Database (Neon)

1. Neon console → **Branches** (or **Backups** if available)
2. Select previous backup/branch
3. Restore to point-in-time (if available in plan)

**Time to rollback**: 5-10 minutes

---

## Next Steps

Once production is live:

1. **Monitor**: Check Render and Netlify logs daily for first week
2. **Backup**: Set up automated Neon backups
3. **Scale**: Monitor performance; upgrade Render plan if needed
4. **Security**: Enable GitHub branch protection rules
5. **Testing**: Set up scheduled E2E tests against production

---

## Useful Links

| Service | Link | Purpose |
|---|---|---|
| GitHub Repo | https://github.com/yourname/repo | Source control |
| GitHub Actions | Your repo → Actions tab | CI/CD pipeline |
| Neon Console | https://console.neon.tech | Database management |
| Render Dashboard | https://dashboard.render.com | Backend hosting |
| Netlify Dashboard | https://app.netlify.app | Frontend hosting |
| Docker Hub | https://hub.docker.com | Image registry |

---

## Summary Timeline

| Phase | Time | Status |
|---|---|---|
| 1. Prerequisites | 5 min | ⏳ Start here |
| 2. Neon Setup | 5 min | → Create DB |
| 3. GitHub Secrets | 5 min | → Add secrets |
| 4. Render Backend | 10 min | → Deploy backend |
| 5. Netlify Frontend | 8 min | → Deploy frontend |
| 6. Docker Hub | 5 min | → Verify images |
| 7. E2E Testing | 5 min | → Test flow |
| **TOTAL** | **~43 min** | ✅ Live! |

---

**🎄 Congratulations! Your Christmas Gift List is now in production!**

For questions or issues, refer to the troubleshooting section or check service dashboards for logs.
