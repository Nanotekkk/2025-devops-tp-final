# GitHub Secrets Configuration

This file documents the secrets that need to be set in your GitHub repository for CI/CD and deployments to work correctly.

## How to Add Secrets to GitHub

1. Go to your GitHub repository
2. **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add each secret below

## Required Secrets

### Docker Hub (for docker-build.yml)

- **`DOCKER_USERNAME`**: Your Docker Hub username
  - Example: `myusername`

- **`DOCKER_PASSWORD`**: Docker Hub personal access token (NOT your password)
  - Generate at: https://hub.docker.com/settings/security → New Access Token
  - Scopes: Read & Write

### Neon Database

- **`NEON_DATABASE_URL`**: PostgreSQL connection string from Neon
  - Format: `postgresql://user:password@neon-host/dbname?sslmode=require`
  - Get from Neon Console → Project → Connection string

### Render (Optional, for deploy.yml)

- **`RENDER_SERVICE_ID`**: Service ID of your backend on Render
  - Found in Render dashboard → Service → Settings

- **`RENDER_API_KEY`**: Render API key
  - Generate at: https://dashboard.render.com/account/api-tokens

### Netlify (Optional, for deploy.yml)

- **`NETLIFY_AUTH_TOKEN`**: Netlify personal access token
  - Generate at: https://app.netlify.com/user/applications/personal → New access token

- **`NETLIFY_BUILD_HOOK_ID`**: Build hook ID from your Netlify site
  - Found at: https://app.netlify.com/sites/<site-name>/settings/deploys → Build hooks → Add build hook

## Using Secrets in Workflows

Secrets are accessed in GitHub Actions using the `${{ secrets.SECRET_NAME }}` syntax:

```yaml
- name: Example step
  env:
    MY_SECRET: ${{ secrets.DOCKER_PASSWORD }}
  run: echo $MY_SECRET
```

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Rotate tokens** periodically
3. **Use scoped tokens** (minimal permissions needed)
4. **Monitor usage** in provider dashboards
5. **Remove unused secrets** from GitHub

## Debugging Secret Access

If a workflow fails due to secrets:

1. Check that the secret name is spelled correctly (case-sensitive)
2. Verify the secret has been added to the correct repository
3. Ensure the organization/user has permission to create secrets
4. Check workflow logs for any error messages

## Minimal Required Setup

For a basic deployment without using `deploy.yml`:

1. **`DOCKER_USERNAME`**
2. **`DOCKER_PASSWORD`**
3. **`NEON_DATABASE_URL`**

These are required for:
- `ci.yml`: Running tests with a real Postgres database
- `docker-build.yml`: Pushing images to Docker Hub

Then manually link your GitHub repo to Netlify and Render dashboards (they auto-build on push).
