---
description: "Kompletny poradnik obsługi błędów — wzorce try/catch, typy błędów, feedback użytkownika, retry."
---

# Obsługa błędów

## Kiedy czytać ten skill

- Implementujesz nowy endpoint API
- Dodajesz operacje na bazie danych
- Łączysz się z zewnętrznym API
- Użytkownik zgłasza "coś nie działa"

## Złota zasada

**Nigdy nie połykaj błędów cicho.** Każdy catch musi albo:
1. Zalogować z kontekstem + zareagować
2. Rzucić dalej (re-throw)
3. Zwrócić sensowny fallback

## Wzorce

### Backend — endpoint API

```typescript
import { httpLog } from './logger';

app.post('/api/products', async (req, res) => {
    try {
        // Walidacja
        const parsed = productSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Nieprawidłowe dane',
                details: parsed.error.issues,
            });
        }

        // Operacja
        const product = await createProduct(parsed.data);

        return res.status(201).json(product);
    } catch (err) {
        httpLog.error({
            err: (err as Error).message,
            body: req.body,
            path: req.path,
        }, 'Failed to create product');

        // Nie pokazuj internali użytkownikowi
        return res.status(500).json({
            error: 'Wystąpił błąd serwera. Spróbuj ponownie.',
        });
    }
});
```

### Backend — operacja na DB

```typescript
import { dbLog } from './logger';

export async function updateProductPrice(id: string, newPrice: number) {
    const { data, error } = await supabase
        .from('products')
        .update({ price: newPrice })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        dbLog.error({ productId: id, newPrice, err: error.message }, 'Failed to update price');
        throw new Error(`Nie udało się zaktualizować ceny: ${error.message}`);
    }

    if (!data) {
        dbLog.warn({ productId: id }, 'Product not found for price update');
        throw new Error('Produkt nie znaleziony');
    }

    dbLog.info({ productId: id, oldPrice: data.price, newPrice }, 'Price updated');
    return data;
}
```

### Backend — zewnętrzne API z retry

```typescript
import { httpLog } from './logger';

export async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries = 3,
): Promise<Response> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                signal: AbortSignal.timeout(10_000), // 10s timeout
            });

            if (response.ok) return response;

            // 429 / 5xx — retry
            if (response.status === 429 || response.status >= 500) {
                const delay = Math.min(1000 * 2 ** (attempt - 1), 8000); // exp backoff
                httpLog.warn({
                    url,
                    status: response.status,
                    attempt,
                    retryIn: `${delay}ms`,
                }, 'Retrying request');
                await new Promise((r) => setTimeout(r, delay));
                continue;
            }

            // 4xx (nie 429) — nie retry
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (err) {
            if (attempt === maxRetries) {
                httpLog.error({ url, attempt, err: (err as Error).message }, 'All retries exhausted');
                throw err;
            }
        }
    }

    throw new Error('Unreachable');
}
```

### Frontend — komponent React

```typescript
import { flog } from '../config/logger';

const log = flog('ProductForm');

function ProductForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(data: ProductInput) {
        setError(null);
        setLoading(true);

        try {
            await createProduct(data);
            toast.success('Produkt utworzony!');
        } catch (err) {
            log.error('Failed to create product', err);

            // Pokaż użytkownikowi przyjazny komunikat
            setError(
                err instanceof ValidationError
                    ? err.message
                    : 'Coś poszło nie tak. Spróbuj ponownie.',
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error-banner">{error}</div>}
            {/* ... */}
        </form>
    );
}
```

## Własne klasy błędów

```typescript
// server/errors.ts

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code: string = 'INTERNAL_ERROR',
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id: string) {
        super(`${resource} o ID ${id} nie znaleziony`, 404, 'NOT_FOUND');
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class AuthError extends AppError {
    constructor(message = 'Brak autoryzacji') {
        super(message, 401, 'UNAUTHORIZED');
    }
}
```

### Globalny error handler (Express)

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        httpLog.warn({
            code: err.code,
            status: err.statusCode,
            path: req.path,
        }, err.message);

        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
        });
    }

    // Nieznany błąd
    httpLog.error({
        err: err.message,
        stack: err.stack,
        path: req.path,
    }, 'Unhandled error');

    return res.status(500).json({
        error: 'Wystąpił nieoczekiwany błąd',
        code: 'INTERNAL_ERROR',
    });
});
```

## Walidacja z Zod

```typescript
import { z } from 'zod';

const ProductSchema = z.object({
    name: z.string().min(1, 'Nazwa jest wymagana').max(100),
    price: z.number().positive('Cena musi być dodatnia'),
    currency: z.enum(['PLN', 'EUR', 'USD']),
    description: z.string().optional(),
});

type ProductInput = z.infer<typeof ProductSchema>;

// Użycie
function validateProduct(input: unknown): ProductInput {
    const result = ProductSchema.safeParse(input);
    if (!result.success) {
        throw new ValidationError(
            result.error.issues.map((i) => i.message).join(', '),
        );
    }
    return result.data;
}
```

## Anty-wzorce

```typescript
// ❌ Cichy catch
try { await save() } catch {}

// ❌ Tylko console.log
try { ... } catch (e) { console.log(e) }

// ❌ Generyczny komunikat bez kontekstu
logger.error('Error occurred');

// ❌ Połykanie i zwracanie null
try { return await fetchData() } catch { return null }

// ❌ Catch z re-throw bez dodania kontekstu
try { ... } catch (e) { throw e }
```

## Checklist

- [ ] Czy każdy catch loguje z kontekstem?
- [ ] Czy użytkownik dostaje przyjazny komunikat (nie stack trace)?
- [ ] Czy błędy krytyczne przerywają flow?
- [ ] Czy operacje sieciowe mają timeout?
- [ ] Czy retry ma exponential backoff i max prób?
- [ ] Czy walidacja wejścia jest na początku funkcji?
