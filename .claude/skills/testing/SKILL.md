---
description: "Kompletny poradnik pisania testów z Vitest — unit, integration, mocking, TDD."
---

# Testowanie z Vitest

## Kiedy czytać ten skill

- Tworzysz nowy moduł z logiką biznesową
- Naprawiasz buga
- Dodajesz nowy endpoint API
- Refaktorujesz istniejący kod
- Użytkownik prosi o "przetestowanie"

## Konfiguracja

### Instalacja

```bash
npm install -D vitest @vitest/coverage-v8
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.ts', 'server/**/*.ts'],
            exclude: ['**/*.test.ts', '**/types/**'],
        },
    },
});
```

### package.json scripts

```json
{
    "scripts": {
        "test": "vitest run",
        "test:watch": "vitest",
        "test:coverage": "vitest run --coverage"
    }
}
```

## Struktura testów

```
tests/
├── unit/                    # Testy jednostkowe (mockowane zależności)
│   ├── auth.test.ts
│   ├── validation.test.ts
│   └── pricing.test.ts
├── integration/             # Testy integracyjne (real DB, real HTTP)
│   ├── helpers/
│   │   ├── setup.ts         # Shared setup (broker start, DB connect)
│   │   ├── fixtures.ts      # Factory functions dla test data
│   │   └── cleanup.ts       # Cleanup po testach
│   ├── api-offers.test.ts
│   └── api-users.test.ts
└── e2e/                     # End-to-end (opcjonalnie)
```

## Pisanie testów jednostkowych

### Wzorzec: Arrange → Act → Assert

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateDiscount } from '../src/pricing';

describe('calculateDiscount', () => {
    // ── Happy path ──
    it('applies 10% discount for orders above 100', () => {
        // Arrange
        const order = { total: 150, items: 3 };

        // Act
        const result = calculateDiscount(order);

        // Assert
        expect(result).toBe(135); // 150 * 0.9
    });

    // ── Edge cases ──
    it('returns 0 for empty order', () => {
        expect(calculateDiscount({ total: 0, items: 0 })).toBe(0);
    });

    it('does not apply discount below threshold', () => {
        expect(calculateDiscount({ total: 99, items: 1 })).toBe(99);
    });

    // ── Boundary ──
    it('applies discount at exactly 100', () => {
        expect(calculateDiscount({ total: 100, items: 1 })).toBe(90);
    });

    // ── Negative ──
    it('throws for negative total', () => {
        expect(() => calculateDiscount({ total: -10, items: 1 }))
            .toThrow('Total cannot be negative');
    });
});
```

### Mockowanie zależności

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock całego modułu
vi.mock('../server/supabase', () => ({
    supabase: {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
    },
}));

import { supabase } from '../server/supabase';
import { getUserById } from '../server/users';

describe('getUserById', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns user data', async () => {
        // Arrange — setup mock response
        const mockUser = { id: '123', name: 'Jan', email: 'jan@test.pl' };
        vi.mocked(supabase.from('users').select().eq().single)
            .mockResolvedValue({ data: mockUser, error: null });

        // Act
        const user = await getUserById('123');

        // Assert
        expect(user).toEqual(mockUser);
        expect(supabase.from).toHaveBeenCalledWith('users');
    });

    it('throws on database error', async () => {
        vi.mocked(supabase.from('users').select().eq().single)
            .mockResolvedValue({ data: null, error: { message: 'Not found' } });

        await expect(getUserById('999')).rejects.toThrow('Not found');
    });
});
```

### Mockowanie fetch / HTTP

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('API client', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('handles 404 gracefully', async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(null, { status: 404 }),
        );

        const result = await fetchUser('nonexistent');
        expect(result).toBeNull();
    });

    it('retries on 500', async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce(new Response(null, { status: 500 }))
            .mockResolvedValueOnce(
                new Response(JSON.stringify({ id: '1' }), { status: 200 }),
            );

        const result = await fetchUser('1');
        expect(result).toEqual({ id: '1' });
        expect(fetch).toHaveBeenCalledTimes(2);
    });
});
```

### Mockowanie timerów

```typescript
describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('calls function after delay', () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 300);

        debounced();
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(300);
        expect(fn).toHaveBeenCalledOnce();
    });
});
```

## Testy integracyjne

### Setup — shared broker

```typescript
// tests/integration/helpers/setup.ts
import { createServer } from '../../../server/app';

let server: ReturnType<typeof createServer>;
let port: number;

export async function startTestServer() {
    if (server) return { server, port };

    server = createServer();
    await new Promise<void>((resolve) => {
        const s = server.listen(0, () => {
            port = (s.address() as any).port;
            resolve();
        });
    });

    return { server, port };
}

export function getBaseUrl() {
    return `http://localhost:${port}`;
}
```

### Fixtures — factory functions

```typescript
// tests/integration/helpers/fixtures.ts
export function createUserPayload(overrides = {}) {
    return {
        name: 'Test User',
        email: `test-${Date.now()}@test.pl`,
        role: 'user',
        ...overrides,
    };
}

export function createOfferPayload(overrides = {}) {
    return {
        title: 'Test Offer',
        price: 100,
        currency: 'PLN',
        ...overrides,
    };
}
```

### Test integracyjny

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startTestServer, getBaseUrl } from './helpers/setup';
import { createOfferPayload } from './helpers/fixtures';

describe('Offers API', () => {
    const createdIds: string[] = [];

    beforeAll(async () => {
        await startTestServer();
    });

    afterAll(async () => {
        // Cleanup — usuń dane testowe
        for (const id of createdIds) {
            await fetch(`${getBaseUrl()}/offers/${id}`, { method: 'DELETE' });
        }
    });

    it('creates an offer', async () => {
        const payload = createOfferPayload({ price: 250 });

        const res = await fetch(`${getBaseUrl()}/offers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.price).toBe(250);
        createdIds.push(data.id);
    });

    it('returns 400 for invalid price', async () => {
        const res = await fetch(`${getBaseUrl()}/offers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: -1 }),
        });

        expect(res.status).toBe(400);
    });
});
```

## TDD Workflow

1. **RED** — napisz test który failuje
2. **GREEN** — napisz minimum kodu żeby test przeszedł
3. **REFACTOR** — oczyść kod, test nadal musi przechodzić

```typescript
// 1. RED — test napisany PRZED implementacją
it('validates email format', () => {
    expect(isValidEmail('bad')).toBe(false);
    expect(isValidEmail('good@test.pl')).toBe(true);
    expect(isValidEmail('')).toBe(false);
});

// 2. GREEN — minimalna implementacja
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 3. REFACTOR — wydziel do modułu validation.ts
```

## Checklist przed commitem

- [ ] Czy nowa logika ma testy?
- [ ] Czy pokryłeś happy path + edge cases + error cases?
- [ ] Czy testy przechodzą? (`npm test`)
- [ ] Czy testy są niezależne od siebie (brak shared state)?
- [ ] Czy mockujesz zależności zewnętrzne (DB, API)?
- [ ] Czy cleanup po testach nie zostawia śmieci?

## Typowe błędy

| Błąd | Rozwiązanie |
|------|-------------|
| Test zależy od innego testu | Użyj `beforeEach` do resetu stanu |
| Test łączy się z prawdziwą DB | Mockuj `supabase` |
| Test jest flaky (czasem przechodzi) | Sprawdź race conditions, użyj `vi.useFakeTimers()` |
| Za dużo mocków = test nic nie sprawdza | Przenieś do integration tests |
| Test sprawdza implementację a nie zachowanie | Testuj output, nie internals |
