---
name: "i18n"
description: "Kompletny poradnik internacjonalizacji — i18next, klucze tłumaczeń, pliki locale, testowanie spójności, przełączanie języka."
globs:
  - "src/i18n/**"
  - "src/i18n/locales/*.json"
  - "src/components/**/*.tsx"
  - "src/modules/**/*.ts"
---

# Internacjonalizacja (i18n) — kompletny poradnik

## Architektura

```
src/i18n/
├── i18n.ts              ← Konfiguracja i18next (init, plugins, fallback)
└── locales/
    ├── pl.json          ← Tłumaczenia polskie (źródło prawdy)
    └── en.json          ← Tłumaczenia angielskie
```

## Fundamentalna zasada

**NIGDY nie hardcoduj tekstu** widocznego dla użytkownika w komponentach, hookach ani modułach.

```typescript
// ❌ ZABRONIONE — zawsze
<button>Zapisz</button>
<p>Nie znaleziono wyników</p>
alert('Operacja zakończona sukcesem');
placeholder="Wpisz email..."

// ✅ WYMAGANE — zawsze
<button>{t('common.save')}</button>
<p>{t('common.no_results')}</p>
alert(t('common.success'));
placeholder={t('auth.email_placeholder')}
```

## Użycie w kodzie

### Komponenty React (.tsx)

```typescript
import { useTranslation } from 'react-i18next';

function ProductList() {
    const { t } = useTranslation();
    
    return (
        <div>
            <h1>{t('products.title')}</h1>
            <button>{t('common.save')}</button>
            <input placeholder={t('common.search')} />
            <p>{t('products.count', { count: items.length })}</p>
        </div>
    );
}
```

### Moduły imperatywne (.ts — bez Reacta)

```typescript
import i18n from '../i18n/i18n';

const label = i18n.t('section.key');
const withParams = i18n.t('section.key', { value: 'foo' });
```

### Atrybuty HTML

```typescript
// Title, placeholder, aria-label — wszystko przez t()
<input 
    placeholder={t('auth.email_placeholder')} 
    aria-label={t('auth.email_label')} 
/>
<img alt={t('products.image_alt')} src={url} />
<button title={t('common.delete_tooltip')}>{t('common.delete')}</button>
```

## Konwencja kluczy

Hierarchiczne, lowercase, z kropkami:

```
sekcja.element
```

### Grupy standardowe

| Prefix | Przeznaczenie | Przykłady |
|--------|--------------|-----------|
| `common.*` | Współdzielone elementy UI | `save`, `cancel`, `delete`, `loading`, `error` |
| `auth.*` | Autentykacja | `login`, `logout`, `register`, `forgot_password` |
| `nav.*` | Nawigacja | `home`, `settings`, `profile`, `back` |
| `form.*` | Formularze | `required`, `invalid_email`, `too_short` |
| `{feature}.*` | Per-ficzer | `products.title`, `orders.empty`, `users.invite` |

### Walidacja formularzy

```json
{
    "form": {
        "required": "To pole jest wymagane",
        "invalid_email": "Nieprawidłowy adres email",
        "min_length": "Minimum {{min}} znaków",
        "max_length": "Maksymalnie {{max}} znaków",
        "password_mismatch": "Hasła nie są identyczne"
    }
}
```

## Interpolacja

Zmienne w `{{podwójnych klamrach}}`:

```json
// pl.json
{
    "products": {
        "count": "Znaleziono {{count}} produktów",
        "greeting": "Witaj, {{name}}!",
        "price": "Cena: {{price}} {{currency}}"
    }
}
```

```typescript
t('products.count', { count: 42 })     // "Znaleziono 42 produktów"
t('products.greeting', { name: 'Jan' }) // "Witaj, Jan!"
t('products.price', { price: '29.99', currency: 'PLN' }) // "Cena: 29.99 PLN"
```

### Pluralizacja

i18next obsługuje pluralizację per język:

```json
// pl.json
{
    "items": {
        "count_one": "{{count}} element",
        "count_few": "{{count}} elementy",
        "count_many": "{{count}} elementów",
        "count_other": "{{count}} elementów"
    }
}

// en.json
{
    "items": {
        "count_one": "{{count}} item",
        "count_other": "{{count}} items"
    }
}
```

```typescript
t('items.count', { count: 1 })  // PL: "1 element",  EN: "1 item"
t('items.count', { count: 3 })  // PL: "3 elementy",  EN: "3 items"
t('items.count', { count: 10 }) // PL: "10 elementów", EN: "10 items"
```

## Przełączanie języka

### Komponent przełącznika

```typescript
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
    const { i18n } = useTranslation();
    
    const toggle = () => {
        const next = i18n.language === 'pl' ? 'en' : 'pl';
        i18n.changeLanguage(next);
    };
    
    return (
        <button onClick={toggle}>
            {i18n.language === 'pl' ? '🇬🇧 EN' : '🇵🇱 PL'}
        </button>
    );
}
```

### Persistence

`i18next-browser-languagedetector` automatycznie:
1. Wykrywa język przeglądarki
2. Zapisuje wybór w `localStorage`
3. Przywraca przy następnej wizycie

## Checklist — przy każdej zmianie UI

- [ ] Czy **wszystkie** stringi UI przechodzą przez `t()` lub `i18n.t()`?
- [ ] Czy klucze dodane do **obu** plików (`pl.json` + `en.json`)?
- [ ] Czy nazwy kluczy używają spójnej hierarchii (`sekcja.element`)?
- [ ] Czy stringi z dynamicznymi wartościami używają `{{interpolacji}}`?
- [ ] Czy atrybuty HTML (`placeholder`, `title`, `aria-label`, `alt`) też są przetłumaczone?
- [ ] Czy formularze walidacyjne używają kluczy `form.*`?

## Testowanie spójności kluczy

Dodaj test sprawdzający czy oba pliki locale mają identyczne klucze:

```typescript
// tests/i18n.test.ts
import { describe, it, expect } from 'vitest';
import pl from '../src/i18n/locales/pl.json';
import en from '../src/i18n/locales/en.json';

function flatKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    return Object.entries(obj).flatMap(([key, val]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        return typeof val === 'object' && val !== null
            ? flatKeys(val as Record<string, unknown>, path)
            : [path];
    });
}

describe('i18n locale files', () => {
    const plKeys = flatKeys(pl).sort();
    const enKeys = flatKeys(en).sort();

    it('pl.json and en.json have the same keys', () => {
        expect(plKeys).toEqual(enKeys);
    });

    it('no empty values in pl.json', () => {
        for (const key of plKeys) {
            const val = key.split('.').reduce((o: any, k) => o?.[k], pl);
            expect(val, `Empty value for key "${key}" in pl.json`).toBeTruthy();
        }
    });

    it('no empty values in en.json', () => {
        for (const key of enKeys) {
            const val = key.split('.').reduce((o: any, k) => o?.[k], en);
            expect(val, `Empty value for key "${key}" in en.json`).toBeTruthy();
        }
    });
});
```

## Dane vs UI — rozróżnienie

| Typ | Język | Gdzie | Przykład |
|-----|-------|-------|---------|
| **Labele UI** | Dynamiczny (PL/EN) | `pl.json` / `en.json` | Nazwy przycisków, nagłówki |
| **Wartości danych** | Neutralny (EN) | Baza danych, enums | `active`, `pending`, `truck` |
| **Labele danych** | Dynamiczny | `pl.json` / `en.json` | Wyświetlane tłumaczenia enumów |

Dla enumów z bazy danych — przechowuj wartość neutralną, tłumacz w UI:

```json
// pl.json
{
    "status": {
        "active": "Aktywny",
        "pending": "Oczekujący",
        "completed": "Zakończony"
    }
}
```

```typescript
// W komponencie:
<span>{t(`status.${item.status}`)}</span>
```

## Dodawanie nowego języka

1. Skopiuj `pl.json` → `{kod}.json` (np. `de.json`)
2. Przetłumacz wszystkie wartości
3. Dodaj do `i18n.ts`:
   ```typescript
   import de from './locales/de.json';
   // w resources:
   resources: { pl: { translation: pl }, en: { translation: en }, de: { translation: de } },
   ```
4. Dodaj opcję w `LanguageSwitcher`
5. Zaktualizuj test (`i18n.test.ts`) — dodaj sprawdzenie nowego pliku

## Częste błędy

### ❌ Hardcoded tekst w warunkach

```typescript
// ŹLE
{isAdmin ? 'Panel administracyjny' : 'Panel użytkownika'}

// DOBRZE
{isAdmin ? t('nav.admin_panel') : t('nav.user_panel')}
```

### ❌ Sklejanie stringów

```typescript
// ŹLE — kolejność słów zależy od języka
`Witaj ${name}, masz ${count} wiadomości`

// DOBRZE — interpolacja
t('greeting.with_messages', { name, count })
// pl: "Witaj {{name}}, masz {{count}} wiadomości"
// en: "Hello {{name}}, you have {{count}} messages"
```

### ❌ Tłumaczenie w useState/useMemo

```typescript
// ŹLE — wartość nie aktualizuje się po zmianie języka
const [label] = useState(t('common.save'));

// DOBRZE — t() w render
<button>{t('common.save')}</button>
```

### ❌ Zapomniany placeholder/title

```typescript
// ŹLE — hardcoded atrybut
<input placeholder="Szukaj..." />

// DOBRZE
<input placeholder={t('common.search')} />
```
