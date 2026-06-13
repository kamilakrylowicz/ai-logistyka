---
description: "Kompletny poradnik Git — conventional commits, branching, merge, revert, conflict resolution."
---

# Git — kompletny poradnik

## Kiedy czytać ten skill

- Konfigurujesz Git w nowym projekcie
- Commitujesz zmiany
- Tworzysz brancha
- Rozwiązujesz konflikty
- Cofasz zmiany

## Konfiguracja początkowa

```bash
git init
git branch -M main

# .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
.env.local
.env.*.local
*.log
.DS_Store
coverage/
.vite/
EOF

# Pierwszy commit
git add -A
git commit -m "chore: initial project setup"
```

## Conventional Commits

Format: `<typ>(<zakres>): <opis>`

| Typ | Kiedy | Przykład |
|-----|-------|---------|
| `feat` | Nowa funkcjonalność | `feat(auth): add Google login` |
| `fix` | Naprawa buga | `fix(api): handle null price in products` |
| `refactor` | Zmiana struktury bez zmiany zachowania | `refactor(db): extract query helpers` |
| `docs` | Dokumentacja | `docs: update API readme` |
| `chore` | CI, config, zależności | `chore: upgrade vitest to v3` |
| `style` | Formatowanie (bez zmiany logiki) | `style: fix indentation` |
| `test` | Testy | `test(products): add edge case for pricing` |

### Zasady

- **Opis po angielsku** (czytelne dla wszystkich)
- **Lowercase** — nie zaczynaj wielką literą
- **Bez kropki** na końcu
- **Tryb rozkazujący** — "add" nie "added"
- **Max ~72 znaki** w pierwszej linii

### Grupowanie

```bash
# ✅ DOBRZE — jeden logiczny commit
git add -A && git commit -m "feat(products): add CRUD endpoints with validation"

# ❌ ŹLE — 10 mikro-commitów
git commit -m "add products table"
git commit -m "add products controller"
git commit -m "add products validation"
# ...
```

## Branching

### Strategia

```
main ────────────────────────── produkcja (stable)
  └── develop ──────────────── integracja (testowanie)
       ├── feat/user-auth ──── ficzer
       ├── fix/null-price ──── bugfix
       └── refactor/db ─────── refaktor
```

### Workflow

```bash
# 1. Nowy ficzer
git checkout develop
git checkout -b feat/product-search

# 2. Praca...
git add -A && git commit -m "feat(search): implement product search"

# 3. Merge do develop
git checkout develop
git merge feat/product-search
git push

# 4. Cleanup
git branch -d feat/product-search
```

### Kiedy co?

| Sytuacja | Branch |
|----------|--------|
| Nowy ficzer | `feat/<nazwa>` |
| Bug fix | `fix/<nazwa>` |
| Hotfix produkcyjny | `hotfix/<nazwa>` z `main` |
| Refaktor | `refactor/<nazwa>` |

## Rozwiązywanie konfliktów

```bash
# 1. Przy merge — git poinformuje o konflikcie
git merge develop
# CONFLICT in src/products.ts

# 2. Otwórz plik — szukaj markerów
<<<<<<< HEAD
const maxPrice = 1000;
=======
const maxPrice = 5000;
>>>>>>> develop

# 3. Wybierz właściwą wersję (lub połącz)
const maxPrice = 5000;

# 4. Zaznacz jako rozwiązany
git add src/products.ts
git commit -m "fix: resolve merge conflict in products"
```

## Cofanie zmian

```bash
# Cofnij ostatni commit (zachowaj zmiany w working tree)
git reset --soft HEAD~1

# Cofnij ostatni commit (usuń zmiany)
git reset --hard HEAD~1

# Cofnij konkretny commit (tworzy nowy commit)
git revert abc1234

# Cofnij zmiany w jednym pliku
git checkout -- src/products.ts

# Cofnij wszystko do ostatniego commita
git checkout -- .
```

## Stash — odłóż na bok

```bash
# Odłóż bieżące zmiany
git stash

# Przywróć
git stash pop

# Lista odłożonych
git stash list
```

## GitHub — remote

```bash
# Dodaj remote
git remote add origin https://github.com/user/repo.git

# Pierwszy push
git push -u origin main

# Kolejne pushe
git push
```

## Pre-commit hooks (husky + lint-staged)

```bash
npm install -D husky lint-staged
npx husky init
```

```bash
# .husky/pre-commit
npx lint-staged
```

```json
// package.json
{
    "lint-staged": {
        "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
        "*.{css,json,md}": ["prettier --write"]
    }
}
```

## Checklist przed pushem

- [ ] Testy przechodzą? (`npm test`)
- [ ] Typecheck OK? (`npm run typecheck`)
- [ ] Commit message w konwencji Conventional Commits?
- [ ] Brak sekretów w kodzie?
- [ ] .env w .gitignore?
