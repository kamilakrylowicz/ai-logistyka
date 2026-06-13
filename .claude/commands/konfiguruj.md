---
description: Pełna konfiguracja projektu — analiza, instalacja narzędzi, struktura, Supabase, CI/CD. Uruchom na nowym lub istniejącym projekcie.
effort: max
allowed-tools: Bash, Write, Edit, MultiEdit
---

# Konfiguracja projektu

Przeprowadź użytkownika przez pełną konfigurację projektu. Działaj proaktywnie — nie pytaj o rzeczy które możesz sam zdecydować. Pytaj TYLKO o klucze/sekrety i preferencje biznesowe.

## Faza 1: Analiza projektu

1. Sprawdź zawartość bieżącego katalogu:
   - Czy są istniejące pliki źródłowe? (.html, .js, .ts, .py, .css)
   - Czy jest `package.json`?
   - Czy jest już Vite/React/TypeScript?
   - Jaka jest struktura katalogów?

2. Podsumuj użytkownikowi co znalazłeś — krótko, bez żargonu:
   - "Widzę stronę HTML z 3 plikami JavaScript. Przekształcę ją w nowoczesny projekt."
   - lub "Pusty katalog — tworzę projekt od zera."
   - lub "Widzę projekt React, ale bez TypeScript. Dodam TypeScript i uporządkuję strukturę."

## Faza 2: Instalacja narzędzi

Zainstaluj WSZYSTKO co potrzebne (nie pytaj — po prostu rób):

```bash
# Inicjalizacja npm (jeśli brak package.json)
npm init -y

# Frontend
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom

# Jakość kodu + testy
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier husky lint-staged vitest jsdom

# Walidacja
npm install zod

# i18n (wielojęzyczność — obowiązkowe)
npm install i18next react-i18next i18next-browser-languagedetector

# Backend (zawsze instaluj — użytkownik może potrzebować później)
npm install pino pino-pretty
npm install -D tsx @types/node

# Baza danych (zawsze — Supabase jest free)
npm install @supabase/supabase-js
```

Skonfiguruj narzędzia:

- `tsconfig.json` — użyj **dokładnie** tego szablonu (bez `baseUrl`, bez `references` — deprecation w TS 7):
  ```json
  {
      "compilerOptions": {
          "target": "ES2020",
          "lib": ["ES2020", "DOM", "DOM.Iterable"],
          "module": "ESNext",
          "moduleResolution": "bundler",
          "strict": true,
          "noUnusedLocals": true,
          "noUnusedParameters": true,
          "noFallthroughCasesInSwitch": true,
          "skipLibCheck": true,
          "allowImportingTsExtensions": true,
          "resolveJsonModule": true,
          "isolatedModules": true,
          "noEmit": true,
          "jsx": "react-jsx",
          "types": ["vite/client"],
          "paths": { "@/*": ["./src/*"] }
      },
      "include": ["src", "src/vite-env.d.ts"]
  }
  ```
  **NIE dodawaj** `baseUrl` (deprecated) ani `references` (powoduje błędy composite).

- `src/vite-env.d.ts` — **OBOWIĄZKOWY** plik z deklaracjami typów Vite:
  ```typescript
  /// <reference types="vite/client" />
  
  // CSS modules
  declare module '*.css' {}
  declare module '*.scss' {}
  
  // Obrazki
  declare module '*.svg' { const src: string; export default src; }
  declare module '*.png' { const src: string; export default src; }
  declare module '*.jpg' { const src: string; export default src; }
  ```
  Bez tego pliku `npm run typecheck` zgłosi błędy na `import.meta.env` i importach CSS.

- `vite.config.ts` — React plugin, alias `@/` → `src/`
- `eslint.config.js` — flat config z `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`. **NIE instaluj** `eslint-plugin-react` (powoduje konflikty peer deps)
- `.prettierrc` — single quote, 4 spaces, trailing comma
- `vitest.config.ts` — environment `jsdom` (jsdom jest w devDependencies)
- `.gitignore` — node_modules, dist, .env
- `.env.example` — wzór zmiennych środowiskowych
- `package.json` scripts:
  - `dev` — uruchom w trybie deweloperskim
  - `check` — **jedno polecenie**: lint + typecheck + test (łączy trzy kroki)
  - `build` — zbuduj do produkcji
  - Skrypty pomocnicze (wewnętrzne, użytkownik ich nie widzi): `test`, `lint`, `typecheck`, `format`

Skonfiguruj Husky (git hooks):
```bash
npx husky init
echo 'npm run typecheck && npx lint-staged' > .husky/pre-commit
```

## Faza 3: Struktura projektu

Utwórz katalogi:
```
src/
├── components/    ← React komponenty
├── hooks/         ← Custom hooks (useCamelCase.ts)
├── modules/       ← Logika domenowa (PascalCase.ts)
├── stores/        ← Stan aplikacji
├── config/        ← Stałe, konfiguracje
├── types/         ← TypeScript interfaces
├── styles/        ← CSS
├── main.ts        ← Punkt wejścia
└── index.html     ← HTML (Vite entry)

server/
├── index.ts       ← Punkt wejścia serwera
├── config.ts      ← Zod env validation
├── logger.ts      ← Pino structured logging
├── supabase.ts    ← Supabase client (service_role)
└── shared/        ← Logika współdzielona

tests/             ← Vitest testy

docs/
├── adr/           ← Architecture Decision Records
└── playbooks/     ← Powtarzalne workflow

supabase/
└── migrations/    ← Pliki SQL (źródło prawdy)
```

Jeśli są istniejące pliki:
1. **HTML → `src/index.html`** (dostosuj do Vite: dodaj `<script type="module">`)
2. **CSS → `src/styles/`** (przenieś, nie zmieniaj)
3. **JavaScript → `src/modules/` lub `src/components/`** (przenieś, potem konwertuj na TypeScript)
4. **Zachowaj działający stan** — po każdym kroku sprawdź czy `npm run dev` działa

## Faza 4: Konwersja do TypeScript

Jeśli są pliki `.js`:
1. Zmień rozszerzenia `.js` → `.ts` (lub `.tsx` jeśli JSX)
2. Dodaj podstawowe typy (parametry funkcji, return types)
3. Zamień `require()` na `import`
4. Uruchom `npm run typecheck` — napraw błędy

## Faza 5: Logowanie

Skonfiguruj strukturyzowane logowanie:

**Backend** — `server/logger.ts`:
```typescript
import pino from 'pino';

export const rootLog = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
});

// Child loggery dla modułów:
// export const dbLog = rootLog.child({ module: 'db' });
```

**Frontend** — `src/config/logger.ts`:
```typescript
type Level = 'debug' | 'info' | 'warn' | 'error';

const MIN_LEVEL: Record<string, number> = { debug: 0, info: 1, warn: 2, error: 3 };
let currentLevel: Level = import.meta.env.PROD ? 'warn' : 'debug';

export function flog(tag: string) {
    const prefix = `[${tag}]`;
    const shouldLog = (level: Level) => MIN_LEVEL[level] >= MIN_LEVEL[currentLevel];
    return {
        debug: (...args: unknown[]) => shouldLog('debug') && console.debug(prefix, ...args),
        info: (...args: unknown[]) => shouldLog('info') && console.info(prefix, ...args),
        warn: (...args: unknown[]) => shouldLog('warn') && console.warn(prefix, ...args),
        error: (...args: unknown[]) => shouldLog('error') && console.error(prefix, ...args),
    };
}
```

## Faza 6: Internacjonalizacja (i18n)

Skonfiguruj i18next — **obowiązkowe** od początku projektu.

**Utwórz `src/i18n/i18n.ts`**:
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import pl from './locales/pl.json';
import en from './locales/en.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: { pl: { translation: pl }, en: { translation: en } },
        fallbackLng: 'pl',
        interpolation: { escapeValue: false },
    });

export default i18n;
```

**Utwórz pliki tłumaczeń:**

`src/i18n/locales/pl.json`:
```json
{
    "common": {
        "save": "Zapisz",
        "cancel": "Anuluj",
        "delete": "Usuń",
        "edit": "Edytuj",
        "loading": "Ładowanie...",
        "error": "Wystąpił błąd",
        "confirm": "Potwierdź",
        "back": "Wróć",
        "search": "Szukaj",
        "no_results": "Brak wyników"
    },
    "app": {
        "title": "ai-logistyka"
    }
}
```

`src/i18n/locales/en.json`:
```json
{
    "common": {
        "save": "Save",
        "cancel": "Cancel",
        "delete": "Delete",
        "edit": "Edit",
        "loading": "Loading...",
        "error": "An error occurred",
        "confirm": "Confirm",
        "back": "Back",
        "search": "Search",
        "no_results": "No results"
    },
    "app": {
        "title": "ai-logistyka"
    }
}
```

**Dodaj import i18n do `src/main.tsx`** (przed renderowaniem React):
```typescript
import './i18n/i18n';
```

**Od tego momentu** — każdy nowy string UI dodawaj do **obu** plików locale i używaj `t('klucz')`.

## Faza 7: Supabase

Zainstaluj oficjalne skille Supabase (dają agentowi głęboką wiedzę o Supabase — RLS, Edge Functions, best practices):
```bash
npx skills add supabase/agent-skills
```

Zapytaj użytkownika:
> "Czy masz już konto Supabase? Jeśli nie, załóż bezpłatne konto na supabase.com i utwórz nowy projekt."

Gdy potwierdzi:
1. Poproś o **URL projektu** i **anon key** (Settings → API)
2. Zapisz do `.env`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
3. Utwórz `src/config/supabase.ts` (klient frontend)
4. Utwórz `server/supabase.ts` (klient backend z service_role)
5. Zainstaluj Supabase CLI: `npx supabase init` (jeśli nie zainstalowane)
6. Połącz: `npx supabase link --project-ref <ref>`

## Faza 8: Git

```bash
git init  # jeśli brak .git
git add -A
git commit -m "feat: initial project setup with Fullstack Kit"
```

Zapytaj:
> "Chcesz utworzyć repozytorium na GitHub? (prywatne)"

Jeśli tak:
```bash
gh repo create <nazwa> --private --source=. --push
```

## Faza 9: CI/CD

Utwórz `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
```

## Faza 10: Podsumowanie

Na końcu pokaż użytkownikowi:
1. Co zostało skonfigurowane (lista ✅)
2. Jakie komendy są dostępne (`npm run dev`, `npm test`, itp.)
3. Jak dalej pracować: "Opisz mi co chcesz zbudować — a ja to zaimplementuję"

## Zasady

- **Komunikuj się po polsku** — bez żargonu technicznego
- **Nie pytaj o rzeczy techniczne** — sam decyduj (Vite vs Webpack, pino vs winston)
- **Pytaj TYLKO o**: klucze API, preferencje biznesowe, decyzje produktowe
- **Po każdym kroku** pokaż krótki status: "✅ Zainstalowałem narzędzia"
- **Jeśli coś nie działa** — napraw sam, nie pytaj użytkownika o pomoc techniczną
