---
description: "Kompletny poradnik jakości kodu — modularność, nazewnictwo, JSDoc, refaktoring, code review."
---

# Jakość kodu

## Kiedy czytać ten skill

- Tworzysz nowy moduł / komponent
- Plik przekracza 200 linii
- Widzisz duplikację kodu
- Robisz code review
- Refaktorujesz istniejący kod

## Modularność

### Struktura katalogów

```
src/
├── app/                # Bootstrap, routing, providers
├── components/         # React komponenty UI
│   ├── common/         # Współdzielone (Button, Modal, Toast)
│   ├── layout/         # Layout (Sidebar, Header, Footer)
│   └── features/       # Komponenty per ficzer (ProductList, UserProfile)
├── hooks/              # Custom React hooks
├── modules/            # Logika domenowa (bez React)
│   ├── auth/
│   ├── products/
│   └── payments/
├── config/             # Stałe, konfiguracja
├── types/              # TypeScript interfaces
├── styles/             # CSS
└── utils/              # Generyczne helpery

server/
├── routes/             # Express route handlers
├── middleware/         # Auth, validation, logging
├── services/          # Logika biznesowa
├── db/                # Zapytania do bazy
└── utils/             # Helpery backendowe

tests/
├── unit/              # Testy jednostkowe
└── integration/       # Testy integracyjne
```

### Zasady podziału

| Zasada | Limit | Przykład |
|--------|-------|---------|
| Max linii na plik | ~200 | Rozbij na sub-moduły |
| Max linii na funkcję | ~30 | Wydziel pomocnicze funkcje |
| Max parametrów | 3-4 | Użyj obiektu options |
| Max zagnieżdżeń | 3 | Early return, extract function |

### Kiedy wydzielić nowy plik

```typescript
// ❌ Jeden mega-plik (products.ts — 500 linii)
export function createProduct() { ... }
export function updateProduct() { ... }
export function deleteProduct() { ... }
export function validateProduct() { ... }
export function formatPrice() { ... }
export function calculateDiscount() { ... }

// ✅ Podział na moduły
// products/create.ts — tworzenie
// products/update.ts — aktualizacja
// products/validation.ts — walidacja
// products/pricing.ts — ceny i rabaty
// products/index.ts — re-eksporty
```

### Re-eksporty (barrel files)

```typescript
// products/index.ts
export { createProduct } from './create';
export { updateProduct } from './update';
export { validateProduct } from './validation';
export { formatPrice, calculateDiscount } from './pricing';
```

## Nazewnictwo

### Pliki

| Element | Konwencja | Przykład |
|---------|-----------|---------|
| Komponenty React | PascalCase.tsx | `ProductCard.tsx` |
| Hooki | useCamelCase.ts | `useProducts.ts` |
| Moduły/utils | camelCase.ts | `formatDate.ts` |
| Testy | nazwa.test.ts | `pricing.test.ts` |
| Typy | camelCase.ts | `productTypes.ts` |
| CSS | kebab-case.css | `product-card.css` |
| Stałe/config | camelCase.ts | `apiConfig.ts` |

### Zmienne i funkcje

```typescript
// ✅ DOBRZE — jasne, opisowe
const isAuthenticated = checkAuth();
const productCount = products.length;
const formattedPrice = formatPrice(price, currency);
async function fetchUserProducts(userId: string) { ... }

// ❌ ŹLE — niejasne, skrótowe
const auth = check();
const cnt = p.length;
const fp = fmt(pr, cur);
async function getData(id) { ... }
```

### Stałe

```typescript
// ✅ SCREAMING_SNAKE_CASE dla prawdziwych stałych
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 20;
const API_TIMEOUT_MS = 10_000;

// ✅ camelCase dla konfiguracji
const apiConfig = {
    baseUrl: '/api',
    timeout: API_TIMEOUT_MS,
    retries: MAX_RETRY_COUNT,
};
```

### Boolean

```typescript
// ✅ Prefixes: is, has, can, should
const isLoading = true;
const hasPermission = user.role === 'admin';
const canEdit = isOwner && !isArchived;
const shouldRetry = attempt < MAX_RETRY_COUNT;
```

## JSDoc

### Eksportowane funkcje — OBOWIĄZKOWE

```typescript
/**
 * Oblicza cenę z rabatem dla danego zamówienia.
 *
 * @param order - Zamówienie do obliczenia
 * @param discountPercent - Procent rabatu (0-100)
 * @returns Cena po rabacie, zaokrąglona do 2 miejsc
 * @throws {ValidationError} Gdy discountPercent jest poza zakresem
 *
 * @example
 * ```ts
 * const price = calculateDiscount({ total: 100 }, 10);
 * // price === 90
 * ```
 */
export function calculateDiscount(order: Order, discountPercent: number): number {
    if (discountPercent < 0 || discountPercent > 100) {
        throw new ValidationError('Rabat musi być między 0 a 100');
    }
    return Math.round(order.total * (1 - discountPercent / 100) * 100) / 100;
}
```

### Moduł — nagłówek

```typescript
/**
 * @module pricing
 * Logika cenowa — rabaty, formatowanie, konwersja walut.
 * Używany przez API endpoints i komponenty frontendowe.
 */
```

## Early return

```typescript
// ❌ ŹLE — głębokie zagnieżdżenie
function processOrder(order) {
    if (order) {
        if (order.items.length > 0) {
            if (order.status === 'pending') {
                // logika...
            }
        }
    }
}

// ✅ DOBRZE — early return
function processOrder(order) {
    if (!order) return;
    if (order.items.length === 0) return;
    if (order.status !== 'pending') return;

    // logika — bez zagnieżdżeń
}
```

## DRY — Don't Repeat Yourself

```typescript
// ❌ ŹLE — duplikacja
async function getActiveProducts() {
    const { data } = await supabase.from('products').select('*').eq('status', 'active');
    return data?.map(row => ({ ...row, createdAt: new Date(row.created_at) })) ?? [];
}
async function getArchivedProducts() {
    const { data } = await supabase.from('products').select('*').eq('status', 'archived');
    return data?.map(row => ({ ...row, createdAt: new Date(row.created_at) })) ?? [];
}

// ✅ DOBRZE — jedna funkcja z parametrem
async function getProductsByStatus(status: ProductStatus) {
    const { data } = await supabase.from('products').select('*').eq('status', status);
    return data?.map(mapProductRow) ?? [];
}
```

## Narzędzia

### ESLint + Prettier

```bash
npm install -D eslint prettier eslint-config-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

```json
// eslint.config.js (flat config)
// prettier.config.js
// package.json scripts:
{
    "lint": "eslint src/ server/ tests/",
    "lint:fix": "eslint --fix src/ server/ tests/",
    "format": "prettier --write \"src/**/*.{ts,tsx}\" \"server/**/*.ts\" \"tests/**/*.ts\""
}
```

## Checklist

- [ ] Pliki ≤ 200 linii?
- [ ] Funkcje ≤ 30 linii?
- [ ] Brak duplikacji?
- [ ] Jasne, opisowe nazwy?
- [ ] JSDoc na eksportowanych funkcjach?
- [ ] Brak martwego kodu?
- [ ] Brak `any`?
- [ ] Early return zamiast zagnieżdżeń?
