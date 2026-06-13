---
description: "Kompletny poradnik Supabase — tabele, RLS, migracje, Edge Functions, Realtime, zapytania."
---

# Supabase — kompletny poradnik

## Kiedy czytać ten skill

- Tworzysz nową tabelę w bazie danych
- Konfigurujesz Row Level Security (RLS)
- Piszesz migrację SQL
- Implementujesz autentykację
- Używasz Supabase Realtime
- Tworzysz Edge Function
- Wykonujesz zapytania z frontendu lub backendu

## Architektura

```
Frontend (anon key)          Backend (service_role key)
       ↓                              ↓
   Supabase Client              Supabase Client
       ↓                              ↓
   PostgREST API ──────────→ PostgreSQL
       ↓                         ↑
   RLS polityki              Omija RLS
   (filtrują dane)           (pełny dostęp)
```

**Kluczowa zasada**: Frontend NIGDY nie powinien mieć `service_role` key. RLS chroni dane na poziomie bazy.

## Tworzenie nowej tabeli

### Pełny wzorzec (kopiuj-wklej i modyfikuj)

```sql
-- 1. Utwórz tabelę
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    currency CHAR(3) DEFAULT 'PLN',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indeksy
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_status ON public.products(status) WHERE status != 'deleted';

-- 3. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 4. RLS — OBOWIĄZKOWE
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. Polityki dostępu
-- Użytkownik widzi tylko swoje produkty
CREATE POLICY "Users manage own products" ON public.products
    FOR ALL
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Service role ma pełny dostęp (backend)
CREATE POLICY "Service role full access" ON public.products
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- 6. Explicit GRANTs — OBOWIĄZKOWE
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- 7. Powiadom PostgREST o zmianach schematu
NOTIFY pgrst, 'reload schema';
```

### Typy pól — co kiedy używać

| Typ | Kiedy | Przykład |
|-----|-------|---------|
| `UUID` | Klucze główne, referencje | `id`, `user_id` |
| `TEXT` | Stringi dowolnej długości | `name`, `description` |
| `VARCHAR(N)` | Stringi z limitem | `country CHAR(2)` |
| `NUMERIC` | Pieniądze, precyzyjne liczby | `price`, `rate` |
| `INTEGER` | Liczby całkowite | `quantity`, `count` |
| `BOOLEAN` | Flagi | `is_active`, `is_verified` |
| `TIMESTAMPTZ` | Daty z timezone | `created_at`, `expires_at` |
| `JSONB` | Struktury dynamiczne | `metadata`, `settings` |
| `TEXT[]` | Tablice stringów | `tags`, `categories` |

### Wzorce RLS

#### Dane prywatne użytkownika

```sql
CREATE POLICY "Users manage own data" ON public.<table>
    FOR ALL
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
```

#### Dane publiczne (read-only)

```sql
CREATE POLICY "Public read" ON public.<table>
    FOR SELECT USING (true);
```

#### Dane organizacji (multi-tenancy)

```sql
-- Helper function (SECURITY DEFINER — omija RLS)
CREATE OR REPLACE FUNCTION get_user_org_id(uid UUID)
RETURNS UUID AS $$
    SELECT org_id FROM public.organization_members WHERE user_id = uid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Polityka
CREATE POLICY "Org members access" ON public.<table>
    FOR ALL
    USING (org_id = get_user_org_id((SELECT auth.uid())))
    WITH CHECK (org_id = get_user_org_id((SELECT auth.uid())));
```

> **UWAGA**: NIGDY nie używaj subquery `org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid())` w polityce na `organization_members` — powoduje nieskończoną rekurencję!

#### Performance tip

Zawsze `(SELECT auth.uid())` zamiast `auth.uid()` — subquery ewaluowane raz na zapytanie (nie raz na wiersz).

## Migracje

### Konwencja nazw

```
supabase/migrations/YYYYMMDDHHMMSS_opis.sql
```

Przykład: `20250115143000_create_products_table.sql`

### Workflow

1. Napisz SQL migracji
2. Zaaplikuj na LOCAL: `supabase db push` lub MCP `apply_migration`
3. Zapisz plik w `supabase/migrations/`
4. Przetestuj (frontend + backend)
5. Zaaplikuj na DEV/PROD: `supabase db push --linked`

### Zasada: każda migracja DDL kończy się

```sql
NOTIFY pgrst, 'reload schema';
```

Bez tego PostgREST nie widzi nowych kolumn/tabel do wygaśnięcia cache.

## Zapytania z frontendu (anon key)

### CRUD

```typescript
import { supabase } from '../config/supabase';

// SELECT
const { data, error } = await supabase
    .from('products')
    .select('id, name, price, status')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20);

// INSERT
const { data, error } = await supabase
    .from('products')
    .insert({ name: 'Nowy', price: 99.99, currency: 'PLN' })
    .select()
    .single();

// UPDATE
const { error } = await supabase
    .from('products')
    .update({ name: 'Zmieniony', price: 149.99 })
    .eq('id', productId);

// SOFT DELETE (rekomendowane zamiast fizycznego usunięcia)
const { error } = await supabase
    .from('products')
    .update({ status: 'deleted' })
    .eq('id', productId);
```

### .single() vs .maybeSingle()

```typescript
// ❌ .single() — rzuca error gdy brak wiersza (HTTP 406)
const { data } = await supabase.from('settings').select().eq('user_id', id).single();

// ✅ .maybeSingle() — zwraca null gdy brak wiersza
const { data } = await supabase.from('settings').select().eq('user_id', id).maybeSingle();
```

**Zasada**: `.single()` tylko gdy wiersz ZAWSZE istnieje. W przeciwnym razie `.maybeSingle()`.

## Zapytania z backendu (service_role)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Service role OMIJA RLS — pełny dostęp do wszystkich danych
const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', someUserId);

if (error) {
    logger.error({ err: error.message, userId: someUserId }, 'Failed to fetch products');
    throw new Error(error.message);
}
```

## Autentykacja

### Frontend — logowanie

```typescript
// Email + hasło
const { data, error } = await supabase.auth.signUp({
    email: 'user@test.pl',
    password: 'securePassword123',
});

// Login
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@test.pl',
    password: 'securePassword123',
});

// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
});

// Wylogowanie
await supabase.auth.signOut();

// Aktualny user
const { data: { user } } = await supabase.auth.getUser();
```

### Nasłuchiwanie zmian auth

```typescript
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        // Użytkownik zalogowany
    } else if (event === 'SIGNED_OUT') {
        // Użytkownik wylogowany
    }
});
```

## Realtime — nasłuchiwanie zmian

```typescript
// Nasłuchuj INSERT na tabeli messages
const channel = supabase
    .channel('messages')
    .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
            console.log('New message:', payload.new);
        },
    )
    .subscribe();

// Cleanup
channel.unsubscribe();
```

### Broadcast (bez DB)

```typescript
// Nadawca
const channel = supabase.channel('room-1');
channel.send({ type: 'broadcast', event: 'cursor', payload: { x: 100, y: 200 } });

// Odbiorca
supabase
    .channel('room-1')
    .on('broadcast', { event: 'cursor' }, (payload) => {
        console.log('Cursor:', payload);
    })
    .subscribe();
```

## Edge Functions

### Struktura pliku

```typescript
// supabase/functions/hello/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
    const { name } = await req.json();

    return new Response(
        JSON.stringify({ message: `Hello ${name}!` }),
        { headers: { 'Content-Type': 'application/json' } },
    );
});
```

### Deploy

```bash
supabase functions deploy hello
```

### Wywoływanie z frontendu

```typescript
const { data, error } = await supabase.functions.invoke('hello', {
    body: { name: 'World' },
});
```

## Checklist przy zmianach w bazie

- [ ] RLS włączony na nowej tabeli?
- [ ] Polityki dostępu zdefiniowane?
- [ ] Explicit GRANTs dodane?
- [ ] Migracja zapisana do pliku?
- [ ] `NOTIFY pgrst, 'reload schema'` na końcu migracji?
- [ ] Frontend z `anon_key` widzi TYLKO to co powinien?
- [ ] `.maybeSingle()` zamiast `.single()` dla opcjonalnych wierszy?
- [ ] Indeksy na kolumnach używanych w WHERE?
