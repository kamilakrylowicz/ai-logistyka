---
description: "Kompletny poradnik dokumentacji — README, CHANGELOG, JSDoc, komentarze, ADR."
---

# Dokumentacja

## Kiedy czytać ten skill

- Tworzysz README dla nowego projektu
- Dokumentujesz API
- Piszesz komentarze w kodzie
- Tworzysz changelog
- Podejmujesz decyzję architektoniczną

## README.md

### Struktura (kopiuj i modyfikuj)

```markdown
# Nazwa Projektu

Krótki opis — 1-2 zdania. Co robi, dla kogo.

## Szybki start

\`\`\`bash
git clone https://github.com/user/repo.git
cd repo
npm install
cp .env.example .env    # uzupełnij wartości
npm run dev
\`\`\`

## Wymagania

- Node.js >= 20
- npm >= 10
- Konto Supabase (darmowe)

## Zmienne środowiskowe

| Zmienna | Opis | Wymagana |
|---------|------|----------|
| `VITE_SUPABASE_URL` | URL projektu Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Klucz publiczny Supabase | ✅ |
| `OPENAI_API_KEY` | Klucz OpenAI | ❌ (opcjonalny) |

## Komendy

| Komenda | Opis |
|---------|------|
| `npm run dev` | Uruchom w trybie deweloperskim |
| `npm run build` | Zbuduj do produkcji |
| `npm test` | Uruchom testy |

## Architektura

\`\`\`
src/           — Frontend (React + TypeScript)
server/        — Backend (Node.js + Express)
supabase/      — Migracje bazy danych
tests/         — Testy automatyczne
\`\`\`

## Licencja

MIT
```

## CHANGELOG.md

### Format (Keep a Changelog)

```markdown
# Changelog

## [1.2.0] - 2025-01-15

### Dodane
- Wyszukiwanie produktów po nazwie
- Filtrowanie po kategorii

### Zmienione
- Zwiększono limit wyników z 20 na 50

### Naprawione
- Błąd przy pustej liście produktów
- Timeout przy dużych zapytaniach

## [1.1.0] - 2025-01-10

### Dodane
- Autentykacja Google OAuth
- Panel użytkownika
```

### Zasady

- **Wersjonowanie**: `MAJOR.MINOR.PATCH` (semver)
  - MAJOR: breaking changes
  - MINOR: nowa funkcjonalność (backward-compatible)
  - PATCH: bug fixes
- **Kategorie**: Dodane, Zmienione, Naprawione, Usunięte, Bezpieczeństwo
- **Format daty**: `YYYY-MM-DD`

## JSDoc — komentarze w kodzie

### Kiedy pisać JSDoc

| Sytuacja | JSDoc? | Zwykły komentarz? |
|----------|--------|-------------------|
| Eksportowana funkcja | ✅ Tak | ❌ |
| Publiczny interfejs/typ | ✅ Tak | ❌ |
| Skomplikowana logika | ❌ | ✅ `// wyjaśnienie` |
| Oczywisty kod | ❌ | ❌ Nie komentuj |
| Hack / workaround | ❌ | ✅ `// HACK: powód` |
| TODO | ❌ | ✅ `// TODO: co zrobić` |

### Format JSDoc

```typescript
/**
 * Oblicza końcową cenę z uwzględnieniem rabatu i podatku.
 *
 * @param basePrice - Cena bazowa w groszach
 * @param discountPercent - Procent rabatu (0-100)
 * @param taxRate - Stawka podatku (np. 0.23 dla 23% VAT)
 * @returns Cena końcowa w groszach, zaokrąglona w dół
 *
 * @example
 * ```ts
 * calculateFinalPrice(10000, 10, 0.23); // 11070 (90 zł + 23% VAT)
 * ```
 *
 * @throws {RangeError} Gdy discountPercent jest poza zakresem 0-100
 */
export function calculateFinalPrice(
    basePrice: number,
    discountPercent: number,
    taxRate: number,
): number { ... }
```

### Nagłówek modułu

```typescript
/**
 * @module pricing
 *
 * Logika cenowa — rabaty, podatki, konwersja walut.
 * Współdzielony między API (server/) i komponentami (src/).
 *
 * Zależności:
 * - `src/config/currencies.ts` — kody walut
 * - `server/db/fx-rates.ts` — kursy walut z Supabase
 */
```

## Komentarze inline — konwencje

```typescript
// ✅ DOBRZE — wyjaśnia DLACZEGO
// Retry 3x bo Mapbox API ma sporadyczne 502
const MAX_RETRIES = 3;

// ✅ DOBRZE — wyjaśnia nietypowe zachowanie
// Supabase zwraca null zamiast [] dla pustych wyników
const items = data ?? [];

// ❌ ŹLE — opisuje CO (oczywiste z kodu)
// Ustaw cenę na 100
const price = 100;

// ❌ ŹLE — komentarz kłamie (kod się zmienił)
// Pobierz produkty z cache
const products = await fetchFromDatabase(); // ← to nie cache!
```

### Markery

```typescript
// TODO: dodać walidację email po wdrożeniu mailer
// HACK: obejście buga w bibliotece X (issue #123)
// FIXME: race condition przy równoczesnych zapisach
// NOTE: ta kolejność jest celowa — najpierw auth, potem data
```

## ADR — Architecture Decision Records

### Kiedy pisać ADR

Gdy podejmujesz decyzję wpływającą na >1 moduł:
- Wybór technologii (np. dlaczego pino a nie winston)
- Wzorzec architektoniczny (np. dlaczego event-driven)
- Kompromis (np. dlaczego denormalizacja w tej tabeli)

### Format

```markdown
# ADR-001: Wybór pino jako biblioteki logowania

## Status
Zaakceptowany (2025-01-15)

## Kontekst
Potrzebujemy strukturyzowanego logowania z support dla JSON output w produkcji.

## Decyzja
Używamy pino zamiast winston/bunyan.

## Konsekwencje

### Pozytywne
- 5x szybszy niż winston
- Natywny JSON output
- Małe zależności

### Negatywne
- Pretty-print wymaga dodatkowego pakietu (pino-pretty)
- Mniej popularny niż winston (mniej przykładów online)

## Alternatywy
- winston — wolniejszy, więcej boilerplate
- console.log — brak struktury, brak poziomów
```

## API Documentation

### Inline w kodzie (dla prostych API)

```typescript
/**
 * @route POST /api/products
 * @description Tworzy nowy produkt
 * @body {CreateProductRequest}
 * @returns {201} {Product} Utworzony produkt
 * @returns {400} {ApiError} Nieprawidłowe dane
 * @returns {401} {ApiError} Brak autoryzacji
 */
app.post('/api/products', authMiddleware, createProduct);
```

## Checklist

- [ ] README.md z sekcjami: opis, szybki start, wymagania, komendy?
- [ ] .env.example w repozytorium?
- [ ] JSDoc na eksportowanych funkcjach?
- [ ] Komentarze wyjaśniają DLACZEGO, nie CO?
- [ ] Brak zakomentowanego kodu?
- [ ] CHANGELOG aktualizowany przy release?
