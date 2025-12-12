# Rapport de Déploiement - Christmas Gift List

Ce document décrit toutes les étapes réalisées pour déployer l'application en production.

## 🎯 Architecture de Déploiement

- **Base de données** : Neon PostgreSQL (cloud)
- **Backend (API Go)** : Render (service web Docker)
- **Frontend (React)** : Netlify (static hosting)
- **CI/CD** : GitHub Actions

**URLs de production** :
- Backend : `https://two025-devops-tp-final-ltcc.onrender.com`
- Frontend : `https://2025-devops-tp-final.netlify.app`

---

## 📋 Étapes Réalisées

### 1. Configuration de la Base de Données (Neon)

**Actions** :
- Création d'un projet PostgreSQL 15 sur Neon
- Récupération de la connection string
- Configuration de la database `christmas_gifts`

**Connexion** :
```
postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require
```

---

### 2. Configuration du Backend (Render)

**Service créé** : `christmas-gifts-backend` (Web Service Docker)

**Configuration Render** :
- **Docker Build Context** : `backend`
- **Dockerfile Path** : `backend/Dockerfile`
- **Port** : `10000` (configuré automatiquement)
- **Region** : Frankfurt

**Variable d'environnement** :
- `DATABASE_URL` → Connection string Neon

**Problèmes résolus** :
- ❌ Erreur initiale : Dockerfile non trouvé (cherchait à la racine)
- ✅ Solution : Configuration du build context à `backend/`

**Résultat** :
- ✅ Backend déployé et fonctionnel
- ✅ Health check OK : `/health` retourne `OK`
- ✅ Connexion database réussie
- ✅ Migrations exécutées automatiquement au démarrage

---

### 3. Configuration du Frontend (Netlify)

**Site créé** : `2025-devops-tp-final`

**Configuration Netlify** :
- **Base directory** : `frontend`
- **Build command** : `npm run build`
- **Publish directory** : `frontend/dist`

**Variable d'environnement** :
- `VITE_BACKEND_URL` = `https://two025-devops-tp-final-ltcc.onrender.com`

**Modifications code** :

1. **`frontend/src/lib/api.ts`** : Configuration dynamique de l'URL backend
```typescript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';
```

2. **`frontend/src/vite-env.d.ts`** : Déclaration TypeScript pour la variable d'environnement
```typescript
interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
}
```

3. **`frontend/netlify.toml`** : Configuration du routing SPA
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 4. Configuration GitHub Secrets

**Secrets configurés** (GitHub → Settings → Secrets and variables → Actions) :

| Secret | Usage | Fichier workflow |
|--------|-------|-----------------|
| `DOCKER_USERNAME` | Authentification Docker Hub | `docker-build.yml` |
| `DOCKER_PASSWORD` | Token Docker Hub | `docker-build.yml` |
| `RENDER_SERVICE_ID` | ID du service Render | `deploy.yml` |
| `RENDER_API_KEY` | Clé API Render | `deploy.yml` |
| `NETLIFY_AUTH_TOKEN` | Token d'authentification Netlify | `deploy.yml` |
| `NETLIFY_BUILD_HOOK_ID` | ID du build hook Netlify | `deploy.yml` |
| `NEON_DATABASE_URL` | Connection string PostgreSQL | (optionnel pour CI) |

---

### 5. Configuration CI/CD (GitHub Actions)

**Workflows configurés** :

#### **`ci.yml`** : Tests et validation
- Tests backend (Go)
- Tests frontend (React + Vitest)
- Tests end-to-end (Playwright)

**Modifications apportées** :
1. Ajout de l'installation des navigateurs Playwright :
```yaml
- name: Install Playwright Browsers
  working-directory: frontend
  run: npx playwright install --with-deps
```

2. Configuration pour les tests e2e :
```yaml
- name: Install Playwright Browsers
  working-directory: e2e
  run: npx playwright install --with-deps
```

3. **`e2e/playwright.config.ts`** : Fix du conflit de port
```typescript
webServer: {
  command: 'cd ../frontend && npm run dev',
  url: 'http://localhost:5173',
  reuseExistingServer: true,  // Changé de !process.env.CI à true
}
```

**Problème résolu** :
- ❌ Port 5173 déjà utilisé en CI
- ✅ Playwright réutilise maintenant le serveur existant

#### **`docker-build.yml`** : Build et push des images Docker
- Build automatique sur push main/develop
- Push vers Docker Hub

#### **`deploy.yml`** : Déploiement automatique
- Trigger deploy Render (backend)
- Trigger deploy Netlify (frontend)

---

## 🔧 Problèmes Rencontrés et Solutions

### 1. Playwright - Navigateurs manquants
**Erreur** : `browserType.launch: Executable doesn't exist`
**Solution** : Ajout de `npx playwright install --with-deps` dans le workflow CI

### 2. Playwright - Conflit de port 5173
**Erreur** : Port déjà utilisé lors des tests e2e
**Solution** : Configuration `reuseExistingServer: true` dans `playwright.config.ts`

### 3. Render - Dockerfile non trouvé
**Erreur** : `error: failed to read dockerfile: open Dockerfile: no such file or directory`
**Solution** : Configuration du build context à `backend/` dans les settings Render

### 4. Frontend - Variable d'environnement non typée
**Erreur** : TypeScript error sur `import.meta.env.VITE_BACKEND_URL`
**Solution** : Création de `frontend/src/vite-env.d.ts` avec la déclaration de type

---

## ✅ Validation du Déploiement

### Tests effectués :
1. ✅ Backend health check : `https://two025-devops-tp-final-ltcc.onrender.com/health` → `OK`
2. ✅ Connexion database Neon fonctionnelle
3. ✅ Migrations automatiques exécutées
4. ✅ Frontend accessible sur Netlify
5. ✅ Communication frontend ↔ backend opérationnelle
6. ✅ Workflows GitHub Actions passent (CI/CD)

---

## 📊 État Final

| Composant | Statut | URL |
|-----------|--------|-----|
| Database | ✅ Déployé | Neon PostgreSQL |
| Backend API | ✅ Déployé | https://two025-devops-tp-final-ltcc.onrender.com |
| Frontend | ✅ Déployé | https://2025-devops-tp-final.netlify.app |
| CI/CD | ✅ Fonctionnel | GitHub Actions |
| Docker Images | ✅ Build auto | Docker Hub |

---

## 🚀 Déploiements Futurs

Le déploiement est maintenant automatisé :
- Push sur `main` → CI tests + Build Docker + Deploy Render/Netlify
- Les migrations database s'exécutent automatiquement au démarrage du backend

## 🏗️ Architecture

```
Netlify (React SPA)
  ↓ /api/* → redirect
Render (Go backend)
  ↓
Neon (PostgreSQL)
```

## 🔄 Continuous Deployment

- Push to `main` → GitHub Actions runs tests + builds images
- Docker images pushed to Docker Hub automatically
- (Optional) Configure Render/Netlify webhooks for auto-deploy on git push

## 💰 Cost Estimate (Monthly)

- **Neon**: Free tier (1 project, up to 1 GB storage)
- **Render**: ~$7/month (Web Service free tier, or $7 for starter)
- **Netlify**: Free tier included
- **Docker Hub**: Free tier included

Total: **$0-7/month** for this project 🎄
