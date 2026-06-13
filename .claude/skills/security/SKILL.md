---
description: "Kompletny poradnik bezpieczeństwa — .env, CORS, walidacja, auth, headers, CSP."
---

# Bezpieczeństwo

## Kiedy czytać ten skill

- Konfigurujesz autentykację
- Dodajesz nowy endpoint API
- Przechowujesz dane wrażliwe
- Konfigurujesz CORS
- Wdrażasz na produkcję

## Sekrety i zmienne środowiskowe

### Zasada #1: Nigdy w kodzie

```typescript
// ❌ NIGDY
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'super_secret';

// ✅ ZAWSZE
const API_KEY = process.env.OPENAI_API_KEY;
const DB_URL = process.env.SUPABASE_URL;
```

### .env — konfiguracja

```bash
# .env (NIGDY nie commituj!)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
```

### .gitignore — OBOWIĄZKOWE

```gitignore
.env
.env.local
.env.*.local
```

### .env.example — wzorzec

```bash
# .env.example (commituj to — bez wartości!)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

### Frontend vs Backend

| Zmienna | Widoczna w przeglądarce? | Prefix |
|---------|--------------------------|--------|
| `VITE_SUPABASE_URL` | ✅ Tak (publiczna) | `VITE_` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Tak (publiczna) | `VITE_` |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Nie (backend only) | brak |
| `OPENAI_API_KEY` | ❌ Nie (backend only) | brak |

**Zasada**: Tylko zmienne z prefixem `VITE_` trafiają do frontendu. **Nigdy** nie dawaj `VITE_` prefix zmiennym wrażliwym!

## Autentykacja i autoryzacja

### Supabase Auth — middleware

```typescript
import { supabase } from './supabase';

export async function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Nieprawidłowy token' });
    }

    req.user = user;
    next();
}
```

### Autoryzacja — sprawdzanie uprawnień

```typescript
export function requireRole(...roles: string[]) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }
        next();
    };
}

// Użycie
app.delete('/api/products/:id', authMiddleware, requireRole('admin'), deleteProduct);
```

### IDOR Protection (Insecure Direct Object Reference)

```typescript
// ❌ ŹLE — user może zmienić ID w URL i edytować cudze dane
app.put('/api/products/:id', async (req, res) => {
    await supabase.from('products').update(req.body).eq('id', req.params.id);
});

// ✅ DOBRZE — sprawdź że product należy do zalogowanego usera
app.put('/api/products/:id', authMiddleware, async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .update(req.body)
        .eq('id', req.params.id)
        .eq('user_id', req.user.id); // ← kluczowe!

    if (!data) return res.status(404).json({ error: 'Nie znaleziono' });
});
```

## CORS

```typescript
import cors from 'cors';

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://twoja-domena.pl', 'https://www.twoja-domena.pl']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## Walidacja wejścia

```typescript
import { z } from 'zod';

// Waliduj ZAWSZE na granicy systemu (API endpoint)
const CreateProductSchema = z.object({
    name: z.string().min(1).max(200).trim(),
    price: z.number().positive().max(1_000_000),
    currency: z.enum(['PLN', 'EUR', 'USD']),
    description: z.string().max(5000).optional(),
});

app.post('/api/products', (req, res) => {
    const result = CreateProductSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: 'Nieprawidłowe dane',
            details: result.error.issues,
        });
    }
    // result.data jest typowane i bezpieczne
});
```

## Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet()); // Dodaje wszystkie security headers

// Lub ręcznie:
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});
```

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 100, // max 100 requestów per IP
    message: { error: 'Za dużo żądań. Spróbuj za chwilę.' },
    standardHeaders: true,
});

app.use('/api/', apiLimiter);

// Osobny limit dla auth (bardziej restrykcyjny)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Za dużo prób logowania.' },
});

app.use('/api/auth/', authLimiter);
```

## SQL Injection — ochrona

```sql
-- ❌ NIGDY — string concatenation
SELECT * FROM users WHERE email = '${email}';

-- ✅ ZAWSZE — parametryzowane zapytania
-- Supabase robi to automatycznie:
supabase.from('users').select().eq('email', email);

-- Jeśli piszesz raw SQL:
const { data } = await supabase.rpc('get_user', { p_email: email });
```

## Checklist

- [ ] `.env` w `.gitignore`?
- [ ] `.env.example` w repozytorium (bez wartości)?
- [ ] Sekrety tylko w `process.env`, nigdy w kodzie?
- [ ] Zmienne frontendowe z `VITE_` prefix tylko dla publicznych?
- [ ] Auth middleware na chronionych endpointach?
- [ ] IDOR protection (sprawdzenie ownership)?
- [ ] Walidacja wejścia (Zod) na granicy API?
- [ ] CORS ograniczony do znanych domen?
- [ ] Rate limiting na API?
- [ ] RLS włączony na tabelach Supabase?
