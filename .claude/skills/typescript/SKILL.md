---
description: "Kompletny poradnik TypeScript — strict mode, typy, interfejsy, generyki, utility types, wzorce."
---

# TypeScript — kompletny poradnik

## Kiedy czytać ten skill

- Tworzysz nowy moduł / plik
- Definiujesz typy dla API / bazy danych
- Widzisz `any` w kodzie i chcesz naprawić
- Konfigurujesz tsconfig

## Konfiguracja

### tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "exactOptionalPropertyTypes": false,
        "forceConsistentCasingInFileNames": true,
        "skipLibCheck": true,
        "outDir": "dist",
        "declaration": true,
        "jsx": "react-jsx",
        "paths": {
            "@/*": ["./src/*"]
        }
    },
    "include": ["src/**/*", "server/**/*"],
    "exclude": ["node_modules", "dist"]
}
```

### Kluczowe flagi

| Flaga | Efekt | Dlaczego włączona |
|-------|-------|-------------------|
| `strict` | Włącza wszystkie strict checks | Łapie błędy w compile-time |
| `noUncheckedIndexedAccess` | `array[0]` → `T \| undefined` | Zapobiega runtime errors |
| `noUnusedLocals` | Error na nieużywanych zmiennych | Czysty kod |
| `noUnusedParameters` | Error na nieużywanych parametrach | Czysty kod |

## Definiowanie typów

### Interfejsy vs Types

```typescript
// Interface — dla obiektów, rozszerzalny
interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    createdAt: Date;
}

// Type — dla unii, mappedTypes, utility
type UserRole = 'admin' | 'user';
type UserWithPosts = User & { posts: Post[] };
type Nullable<T> = T | null;
```

**Zasada**: Interfejsy dla "kształtu" obiektu. Types dla wszystkiego innego.

### Typy dla API

```typescript
// Request / Response
interface CreateProductRequest {
    name: string;
    price: number;
    currency: 'PLN' | 'EUR' | 'USD';
    description?: string; // opcjonalny
}

interface CreateProductResponse {
    id: string;
    name: string;
    price: number;
    currency: string;
    createdAt: string; // ISO 8601
}

// API error
interface ApiError {
    error: string;
    code: string;
    details?: unknown;
}

// Generyczny response
type ApiResponse<T> = { data: T; error: null } | { data: null; error: ApiError };
```

### Typy dla bazy danych

```typescript
// Wiersz z bazy (snake_case — jak w Supabase)
interface ProductRow {
    id: string;
    user_id: string;
    name: string;
    price: number;
    currency: string;
    status: 'active' | 'archived' | 'deleted';
    created_at: string;
    updated_at: string;
}

// Model domenowy (camelCase — jak w TypeScript)
interface Product {
    id: string;
    userId: string;
    name: string;
    price: number;
    currency: string;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
}

type ProductStatus = 'active' | 'archived' | 'deleted';

// Mapper DB → Model
function mapProductRow(row: ProductRow): Product {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        price: row.price,
        currency: row.currency,
        status: row.status,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}
```

## Generyki

### Podstawy

```typescript
// Generyczny typ odpowiedzi
interface Result<T> {
    success: boolean;
    data: T;
    error?: string;
}

// Użycie
const userResult: Result<User> = { success: true, data: user };
const listResult: Result<Product[]> = { success: true, data: products };
```

### Generyczne funkcje

```typescript
// Funkcja z ograniczeniem typu
function getById<T extends { id: string }>(items: T[], id: string): T | undefined {
    return items.find((item) => item.id === id);
}

// Użycie — TypeScript wnioskuje typ
const user = getById(users, '123'); // T = User
const product = getById(products, '456'); // T = Product
```

### Generyczny hook React

```typescript
function useFetch<T>(url: string): { data: T | null; loading: boolean; error: string | null } {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(url)
            .then((res) => res.json())
            .then((json: T) => setData(json))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [url]);

    return { data, loading, error };
}

// Użycie
const { data: products } = useFetch<Product[]>('/api/products');
```

## Utility Types

```typescript
// Partial — wszystkie pola opcjonalne
type UpdateProduct = Partial<CreateProductRequest>;

// Required — wszystkie pola wymagane
type FullProduct = Required<Product>;

// Pick — wybierz konkretne pola
type ProductSummary = Pick<Product, 'id' | 'name' | 'price'>;

// Omit — wszystko oprócz
type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

// Record — słownik
type StatusCounts = Record<ProductStatus, number>;

// Readonly — niemutowalne
type FrozenProduct = Readonly<Product>;

// Extract / Exclude — filtrowanie unii
type ActiveStatus = Extract<ProductStatus, 'active'>; // 'active'
type NonDeletedStatus = Exclude<ProductStatus, 'deleted'>; // 'active' | 'archived'
```

## Wzorce

### Discriminated Unions

```typescript
type AppEvent =
    | { type: 'product.created'; product: Product }
    | { type: 'product.deleted'; productId: string }
    | { type: 'user.logged_in'; userId: string };

function handleEvent(event: AppEvent) {
    switch (event.type) {
        case 'product.created':
            console.log(event.product.name); // TypeScript wie że product istnieje
            break;
        case 'product.deleted':
            console.log(event.productId); // TypeScript wie że productId istnieje
            break;
        case 'user.logged_in':
            console.log(event.userId);
            break;
    }
}
```

### Type Guards

```typescript
function isUser(value: unknown): value is User {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'email' in value
    );
}

// Użycie
if (isUser(data)) {
    console.log(data.email); // TypeScript wie że to User
}
```

### Const assertions

```typescript
const STATUSES = ['active', 'archived', 'deleted'] as const;
type Status = (typeof STATUSES)[number]; // 'active' | 'archived' | 'deleted'

const CONFIG = {
    maxRetries: 3,
    timeout: 5000,
    baseUrl: '/api',
} as const;
// CONFIG.maxRetries = 5; // ❌ Error — readonly
```

## Anty-wzorce

```typescript
// ❌ any — wyłącza type-checking
function process(data: any) { ... }

// ✅ unknown + type guard
function process(data: unknown) {
    if (typeof data === 'string') { ... }
}

// ❌ Type assertion bez sprawdzenia
const user = data as User;

// ✅ Walidacja runtime
const parsed = UserSchema.safeParse(data);
if (parsed.success) { const user = parsed.data; }

// ❌ Opcjonalne chaining bez fallback
const name = user?.profile?.name; // może być undefined

// ✅ Z fallback
const name = user?.profile?.name ?? 'Nieznany';

// ❌ Non-null assertion (!)
const el = document.getElementById('root')!;

// ✅ Sprawdzenie
const el = document.getElementById('root');
if (!el) throw new Error('Root element not found');
```

## Checklist

- [ ] `strict: true` w tsconfig?
- [ ] Brak `any` w kodzie?
- [ ] Interfejsy dla obiektów, types dla reszty?
- [ ] Eksportowane funkcje mają jawne typy return?
- [ ] Discriminated unions dla eventów/stanów?
- [ ] `as const` dla stałych?
