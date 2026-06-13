---
description: "Kompletny poradnik deploy — Vercel (frontend), Fly.io (backend), GitHub Actions CI/CD, Supabase migrations."
---

# Deployment

## Kiedy czytać ten skill

- Konfigurujesz deploy po raz pierwszy
- Dodajesz CI/CD pipeline
- Wdrażasz nową wersję na produkcję
- Konfigurujesz domeny i SSL

## Architektura deployment

```
GitHub (kod źródłowy)
    ├── push to main ──→ Vercel (frontend) ──→ https://app.twoja-domena.pl
    ├── push to main ──→ Fly.io (backend) ──→ https://api.twoja-domena.pl
    └── migracje SQL ──→ Supabase (baza) ──→ PostgreSQL
```

## Frontend — Vercel

### Pierwszy deploy

```bash
# Zainstaluj Vercel CLI
npm install -g vercel

# Połącz projekt
vercel link

# Deploy preview
vercel

# Deploy produkcja
vercel --prod
```

### vercel.json

```json
{
    "rewrites": [
        { "source": "/((?!api/).*)", "destination": "/index.html" }
    ],
    "headers": [
        {
            "source": "/assets/(.*)",
            "headers": [
                { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
            ]
        }
    ]
}
```

### Zmienne środowiskowe

```bash
# Ustaw w Vercel Dashboard lub CLI
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

| Zmienna | Scope |
|---------|-------|
| `VITE_SUPABASE_URL` | Production + Preview |
| `VITE_SUPABASE_ANON_KEY` | Production + Preview |
| `VITE_API_URL` | Production (osobny dla preview) |

## Backend — Fly.io

### Pierwszy deploy

```bash
# Zainstaluj Fly CLI
curl -L https://fly.io/install.sh | sh

# Zaloguj
fly auth login

# Utwórz app
fly launch --name my-app-api

# Deploy
fly deploy
```

### Dockerfile (multi-stage)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:server

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 8080
CMD ["node", "dist/server/index.js"]
```

### fly.toml

```toml
app = "my-app-api"
primary_region = "waw"

[build]

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 1

[env]
  NODE_ENV = "production"
  PORT = "8080"
```

### Sekrety

```bash
fly secrets set SUPABASE_URL="https://xxx.supabase.co"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="eyJ..."
fly secrets set OPENAI_API_KEY="sk-..."
```

## CI/CD — GitHub Actions

### .github/workflows/ci.yml

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Tests
        run: npm test

  deploy-frontend:
    needs: quality
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: quality
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### GitHub Secrets — co ustawić

| Secret | Skąd | Cel |
|--------|------|-----|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens | Deploy frontend |
| `VERCEL_ORG_ID` | `vercel link` → `.vercel/project.json` | Deploy frontend |
| `VERCEL_PROJECT_ID` | `vercel link` → `.vercel/project.json` | Deploy frontend |
| `FLY_API_TOKEN` | `fly tokens create deploy` | Deploy backend |

## Supabase — migracje na produkcji

```bash
# Zaaplikuj migracje
supabase link --project-ref <ref-id>
supabase db push

# Lub ręcznie
supabase db query --linked -f supabase/migrations/20250115_create_products.sql
```

## Health check endpoint

```typescript
// Dodaj do backendu — monitoring i auto-restart
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || 'unknown',
        uptime: process.uptime(),
    });
});
```

## Domeny

### Vercel

```bash
vercel domains add twoja-domena.pl
```

### Fly.io

```bash
fly certs create api.twoja-domena.pl
```

### DNS

| Typ | Name | Value |
|-----|------|-------|
| CNAME | `www` | `cname.vercel-dns.com` |
| CNAME | `api` | `my-app-api.fly.dev` |
| A | `@` | `76.76.21.21` (Vercel) |

## Checklist przed deploy

- [ ] Testy przechodzą? (`npm test`)
- [ ] Build OK? (`npm run build`)
- [ ] Zmienne środowiskowe ustawione na produkcji?
- [ ] Migracje DB zaaplikowane?
- [ ] Health check endpoint działa?
- [ ] CORS skonfigurowany na domenę produkcyjną?
- [ ] Sekrety NIE w kodzie?
- [ ] `.env` w `.gitignore`?
