---
description: "Kompletny poradnik logowania — pino (backend), strukturyzowany logger (frontend), poziomy, kontekst."
---

# Logowanie strukturyzowane

## Kiedy czytać ten skill

- Tworzysz nowy moduł backendowy
- Dodajesz logowanie do istniejącego kodu
- Debugujesz problem na produkcji
- Zamieniasz `console.log` na właściwy logger

## Backend — pino

### Instalacja i setup

```bash
npm install pino pino-pretty
```

### Centralny logger (`server/logger.ts`)

```typescript
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const rootLogger = pino({
    level: isDev ? 'debug' : 'info',
    transport: isDev
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
        : undefined, // JSON w produkcji
});

// ── Child loggery per moduł ──
export const httpLog = rootLogger.child({ module: 'http' });
export const dbLog = rootLogger.child({ module: 'db' });
export const authLog = rootLogger.child({ module: 'auth' });
export const wsLog = rootLogger.child({ module: 'ws' });
export const workerLog = rootLogger.child({ module: 'worker' });

// Nowy moduł? Dodaj child logger tutaj:
// export const xxxLog = rootLogger.child({ module: 'xxx' });
```

### Użycie w module

```typescript
import { dbLog } from './logger';

export async function createProduct(data: ProductInput) {
    dbLog.info({ name: data.name, price: data.price }, 'Creating product');

    try {
        const result = await supabase.from('products').insert(data).select().single();

        if (result.error) {
            dbLog.error({ err: result.error.message, data }, 'Failed to create product');
            throw new Error(result.error.message);
        }

        dbLog.info({ productId: result.data.id }, 'Product created');
        return result.data;
    } catch (err) {
        dbLog.error({ err: (err as Error).message, data }, 'Unexpected error creating product');
        throw err;
    }
}
```

### Poziomy logowania

| Poziom | Kiedy | Widoczny w PROD? | Przykład |
|--------|-------|-------------------|---------|
| `fatal` | Awaria startu → `process.exit(1)` | ✅ Tak | Brak połączenia z DB |
| `error` | Operacja nieudana, wymaga uwagi | ✅ Tak | Zapis do DB failed |
| `warn` | Recoverable, ale warto wiedzieć | ✅ Tak | Rate limit hit, auth rejection |
| `info` | Eventy biznesowe | ✅ Tak | User created, order placed |
| `debug` | Verbose, szczegóły implementacji | ❌ Nie | Request payload, SQL query |

### Logowanie z kontekstem — ZAWSZE

```typescript
// ❌ ŹLE — brak kontekstu
dbLog.error('Failed to update');

// ❌ ŹLE — stringowa interpolacja
dbLog.error(`Failed to update product ${id}`);

// ✅ DOBRZE — obiekt + wiadomość
dbLog.error({ productId: id, err: error.message }, 'Failed to update product');

// ✅ DOBRZE — bogaty kontekst
httpLog.info({
    method: req.method,
    path: req.url,
    statusCode: res.statusCode,
    duration: `${Date.now() - start}ms`,
}, 'HTTP request completed');
```

### Logowanie HTTP middleware

```typescript
import { httpLog } from './logger';

export function requestLogger(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        httpLog.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            ms: Date.now() - start,
        }, 'request');
    });

    next();
}
```

## Frontend — dedykowany logger

### Setup (`src/config/logger.ts`)

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const MIN_LEVEL: Record<string, number> = {
    debug: 0, info: 1, warn: 2, error: 3,
};

const currentLevel = import.meta.env.PROD ? 'warn' : 'debug';

export function flog(tag: string) {
    const prefix = `[${tag}]`;

    function shouldLog(level: LogLevel) {
        return MIN_LEVEL[level] >= MIN_LEVEL[currentLevel];
    }

    return {
        debug: (...args: any[]) => shouldLog('debug') && console.debug(prefix, ...args),
        info: (...args: any[]) => shouldLog('info') && console.info(prefix, ...args),
        warn: (...args: any[]) => shouldLog('warn') && console.warn(prefix, ...args),
        error: (...args: any[]) => shouldLog('error') && console.error(prefix, ...args),
    };
}
```

### Użycie w komponencie/module

```typescript
import { flog } from '../config/logger';

const log = flog('ProductList');

export function loadProducts() {
    log.info('Loading products...');

    try {
        const data = await fetchProducts();
        log.debug('Products loaded', { count: data.length });
        return data;
    } catch (err) {
        log.error('Failed to load products', err);
        throw err;
    }
}
```

### Produkcja

W buildzie produkcyjnym (`import.meta.env.PROD === true`) automatycznie suppress `debug` i `info`. Tylko `warn` i `error` trafiają do konsoli.

## Czego NIGDY nie logować

| Nie loguj | Dlaczego | Zamiast tego |
|-----------|----------|-------------|
| Hasła, tokeny | Bezpieczeństwo | Loguj ID usera, nie credentials |
| Pełne body requestu | Duże, mogą mieć PII | Loguj klucze, długość, typ |
| Stack trace w `info` | Szum | Stack trace tylko w `error` |
| W pętli (per-item) | Performance, spam | Loguj batch: `{ count: items.length }` |

## Checklist

- [ ] Czy moduł ma dedykowany child logger?
- [ ] Czy logi mają kontekst (obiekt + wiadomość)?
- [ ] Czy używasz właściwego poziomu (error/warn/info/debug)?
- [ ] Czy nie logujesz danych wrażliwych?
- [ ] Czy `console.log` został zamieniony na logger?
