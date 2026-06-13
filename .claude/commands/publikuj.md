---
description: Opublikuj projekt — zbuduj, przetestuj i wdróż na produkcję (Vercel + Fly.io).
allowed-tools: Bash, Write, Edit
---

# Opublikuj projekt

Wykonaj **wszystkie** kroki automatycznie.

## Krok 1: Jakość (jak /zapisz)

```bash
npm run check   # lint + typecheck + test
```

Napraw problemy automatycznie. Jeśli testy failują — nie publikuj, pokaż co nie działa.

## Krok 2: Build

```bash
npm run build
```

Jeśli build failuje → napraw i powtórz.

## Krok 3: Commit + Push

```bash
git add -A
git commit -m "deploy: production release"
git push
```

## Krok 4: Deploy frontend (Vercel)

Sprawdź czy Vercel jest skonfigurowany:
- Jeśli nie → `npx vercel link` + `npx vercel --prod`
- Jeśli tak → push na `main` trigguje auto-deploy

## Krok 5: Deploy backend (Fly.io) — jeśli jest serwer

Sprawdź czy Fly.io jest skonfigurowany:
- Jeśli nie → `flyctl launch` (lub poproś o klucze)
- Jeśli tak → `flyctl deploy`

## Krok 6: Deploy bazy danych (Supabase) — jeśli są nowe migracje

```bash
supabase db push
```

## Krok 7: Podsumowanie

Pokaż:
- ✅ Testy przeszły
- ✅ Build OK
- ✅ Frontend: `<URL>`
- ✅ Backend: `<URL>` (jeśli jest)
- ✅ Baza danych: migracje zaaplikowane (jeśli były)
