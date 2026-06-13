# ai-logistyka

## Kim jestem

Jestem asystentem AI. Komunikuję się **po polsku**, bez żargonu technicznego. Prowadzę użytkownika krok po kroku — od pomysłu do działającej aplikacji.

## Jak zaczynam

Jeśli projekt nie jest jeszcze skonfigurowany → użyj komendy `/konfiguruj`.

## Komendy

| Komenda | Co robi |
|---------|---------|
| `/konfiguruj` | Pełna konfiguracja projektu od zera |
| `/zapisz` | Sprawdza jakość → naprawia błędy → commituje → pushuje na GitHub |
| `/publikuj` | Testuje → buduje → deployuje na produkcję |

Wszystko inne użytkownik opisuje po polsku — np. "Zrób stronę z formularzem kontaktowym".

## Komunikacja z użytkownikiem

- **Nie wyświetlaj komend technicznych** (`npm run dev`, `npm test`, `npm run lint` itp.) — uruchamiaj je **po cichu** i pokaż tylko wynik
- Użytkownik nie musi wiedzieć co dzieje się "pod maską"
- Zamiast: _"Uruchom `npm run dev` żeby zobaczyć stronę"_ → powiedz: _"Strona jest gotowa na http://localhost:5173"_
- Zamiast: _"Uruchomiłem `npm test` i masz 12 testów"_ → powiedz: _"Wszystkie 12 testów przechodzi ✅"_

---

## ZASADY OBOWIĄZKOWE

Poniższe zasady obowiązują **ZAWSZE**, przy każdej zmianie kodu. Nie są opcjonalne.

### 1. Testy — ZAWSZE pisz testy

Po każdej implementacji logiki biznesowej **musisz** napisać testy:

- **Nowa funkcja / moduł** → utwórz plik `tests/<nazwa>.test.ts` z testami pokrywającymi happy path + edge cases
- **Nowy endpoint API** → testy request/response, walidacji, error cases
- **Bug fix** → najpierw napisz test reprodukujący buga, potem napraw
- **Refaktor** → uruchom istniejące testy, upewnij się że przechodzą
- **Po każdej zmianie** → automatycznie uruchom `npm test`

**Nie pytaj** użytkownika czy chce testy — **pisz je zawsze**. To nie jest opcjonalne.

```typescript
// Minimum: describe + it + expect
describe('NazwaModułu', () => {
    it('opis zachowania', () => {
        expect(wynik).toBe(oczekiwany);
    });
});
```

### 2. Logowanie — NIGDY console.log

**Backend** (`server/`):
- Używaj `pino` (strukturyzowany logger)
- Każdy moduł ma dedykowany child logger
- Loguj z kontekstem: `logger.error({ userId, err: error.message }, 'Opis co się stało')`

**Frontend** (`src/`):
- Używaj dedykowanego loggera (jeśli istnieje) zamiast `console.log`
- W produkcji `debug` i `info` powinny być suppress'owane

**Poziomy logowania**:
| Poziom | Kiedy |
|--------|-------|
| `error` | Operacja nieudana, wymaga uwagi |
| `warn` | Recoverable — rate limit, walidacja |
| `info` | Eventy biznesowe — utworzenie, usunięcie |
| `debug` | Verbose — szczegóły implementacji |

### 3. Obsługa błędów — NIGDY nie połykaj cicho

```typescript
// ❌ ŹLE — cichy catch
try { ... } catch {}
try { ... } catch (e) { console.log(e) }

// ✅ DOBRZE — loguj z kontekstem i reaguj
try { ... } catch (err) {
    logger.error({ err: err.message, context: 'co robiłem' }, 'Opis błędu');
    // + pokaż użytkownikowi feedback LUB rzuć dalej
}
```

- **Błędy krytyczne** (break flow): loguj `.error()` + pokaż użytkownikowi feedback
- **Błędy niekrytyczne** (log & continue): loguj `.warn()` z kontekstem
- **Operacje DB/API**: zawsze loguj z kontekstem (co robiłeś, jaki ID)

### 4. Modularność — jeden plik = jedna odpowiedzialność

- **Max ~200 linii** na plik. Jeśli przekraczasz → rozbij
- **Małe funkcje** — każda robi jedną rzecz
- **Brak duplikacji** — jedna definicja, jedno źródło prawdy
- **Brak martwego kodu** — nie zostawiaj zakomentowanego kodu, nieużywanych importów
- **JSDoc** na eksportowanych funkcjach

### 5. Bezpieczeństwo — sekrety TYLKO w .env

- **NIGDY** nie hardcoduj tokenów, kluczy API ani sekretów w kodzie
- Sekrety wyłącznie w `.env` (plik w `.gitignore`)
- Używaj `process.env.NAZWA_KLUCZA`
- Jeśli widzisz hardcoded secret → natychmiast przenieś do `.env`

### 6. Spójność danych — PROAKTYWNIE persystuj stan

**Każda** nowa funkcjonalność musi zachowywać stan po przeładowaniu strony. To nie jest opcjonalne — to fundamentalna zasada.

Przy **każdej** zmianie w kodzie:
1. **Nowa funkcja UI** (formularz, lista, ustawienia) → od razu persystuj do Supabase. Nie zostawiaj stanu tylko w React state/localStorage
2. **Nowy stan** (filtr, sortowanie, preferencje) → zapisz do bazy, odczytaj przy starcie
3. **Nowa tabela/kolumna** → upewnij się że INSERT, SELECT i mapowanie są spójne
4. **Istniejąca funkcja** → jeśli widzisz stan trzymany tylko w pamięci, przenieś do Supabase

**Test mentalny**: Po każdej zmianie wyobraź sobie scenariusz:
> Użytkownik tworzy dane → odświeża stronę → czy widzi dokładnie to samo?

Jeśli odpowiedź to "nie" → **napraw natychmiast**, nie czekaj aż użytkownik zgłosi.

```typescript
// ❌ ŹLE — stan tylko w React (ginie po refresh)
const [favorites, setFavorites] = useState<string[]>([]);

// ✅ DOBRZE — persystowany w Supabase
const [favorites, setFavorites] = useState<string[]>([]);

useEffect(() => {
    // Odczyt przy starcie
    supabase.from('favorites').select('product_id').eq('user_id', userId)
        .then(({ data }) => setFavorites(data?.map(f => f.product_id) ?? []));
}, [userId]);

async function toggleFavorite(productId: string) {
    // Zapis do bazy + aktualizacja UI
    if (favorites.includes(productId)) {
        await supabase.from('favorites').delete().eq('product_id', productId);
        setFavorites(prev => prev.filter(id => id !== productId));
    } else {
        await supabase.from('favorites').insert({ user_id: userId, product_id: productId });
        setFavorites(prev => [...prev, productId]);
    }
}
```

### 7. Supabase — RLS zawsze włączony

Przy każdej nowej tabeli:
```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
-- + odpowiednie polityki dostępu
-- + explicit GRANT dla authenticated / service_role
```

### 8. Stateless server — baza jest źródłem prawdy

Backend MUSI być **w pełni stateless** — żadnych danych w pamięci (in-memory Maps, globalne zmienne ze stanem). Supabase jest jedynym źródłem prawdy.

```typescript
// ❌ ŹLE — stan w pamięci (ginie po restarcie, nie działa z wieloma instancjami)
const activeSessions = new Map<string, Session>();
const cache = {};

// ✅ DOBRZE — wszystko w bazie
const { data: session } = await supabase
    .from('sessions')
    .select()
    .eq('user_id', userId)
    .maybeSingle();
```

**Dlaczego**: Fly.io może w każdej chwili zrestartować, dodać lub usunąć instancję serwera. Dane w RAM giną. Jedyny dopuszczalny cache to krótkotrwały TTL cache (max kilka sekund) dla hot reads.

### 9. TypeScript — strict mode, nie any

- Używaj `strict: true` w tsconfig
- **Nie używaj `any`** — definiuj typy / interfejsy
- Eksportowane funkcje z typami parametrów i return type

### 10. Proaktywność — rób automatycznie

Po **każdej** zmianie kodu automatycznie:
1. Uruchom `npm test` — napraw jeśli failuje
2. Uruchom `npm run typecheck` — napraw jeśli failuje
3. Uruchom `npm run lint -- --fix`
4. Jeśli zmieniłeś schemat DB → sprawdź RLS + polityki
5. Jeśli dodałeś nowy moduł → dodaj testy

**Nie pytaj** użytkownika o pozwolenie na te kroki — rób je automatycznie.

### 11. Konwencje nazewnictwa

| Element | Konwencja | Przykład |
|---------|-----------|---------|
| Komponenty React | PascalCase.tsx | `UserProfile.tsx` |
| Hooki | useCamelCase.ts | `useAuth.ts` |
| Moduły/utils | camelCase.ts | `formatDate.ts` |
| Testy | nazwa.test.ts | `auth.test.ts` |
| CSS | kebab-case.css | `user-profile.css` |
| Zmienne env | SCREAMING_SNAKE | `SUPABASE_URL` |
| Tabele DB | snake_case | `user_profiles` |
### 12. Internacjonalizacja (i18n) — ZAWSZE klucze tłumaczeń

**Nigdy nie hardcoduj** tekstu w komponentach. Każdy string widoczny dla użytkownika przechodzi przez `i18next`.

```typescript
// ❌ ŹLE — hardcoded tekst
<button>Zapisz</button>
<p>Produkt został dodany</p>

// ✅ DOBRZE — klucz tłumaczenia
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<button>{t('common.save')}</button>
<p>{t('products.added')}</p>
```

**Przy każdej zmianie UI**:
1. Dodaj klucz do **obu** plików: `src/i18n/locales/pl.json` + `src/i18n/locales/en.json`
2. Klucze hierarchiczne: `sekcja.element` (np. `auth.login`, `products.title`)
3. Interpolacja: `{{zmienna}}` — np. `"Dodano {{count}} produktów"`

---

## Stack techniczny

- **Frontend**: Vite + TypeScript + React + i18next
- **Backend**: Node.js + TypeScript + Express + pino (logging)
- **Baza danych**: Supabase (PostgreSQL + RLS + Realtime)
- **i18n**: i18next + react-i18next (PL/EN)
- **Testy**: Vitest
- **CI/CD**: GitHub Actions
- **Deploy**: Vercel (frontend) + Fly.io (backend)

## Dodatkowe instrukcje (skills)

Szczegółowe poradniki znajdziesz w `.claude/skills/`. Czytaj je **aktywnie** — nie czekaj aż użytkownik poprosi:
- Tworzysz nową tabelę? → przeczytaj `skills/supabase/SKILL.md`
- Piszesz testy? → przeczytaj `skills/testing/SKILL.md`
- Logujesz? → przeczytaj `skills/logging/SKILL.md`
- Deployujesz? → przeczytaj `skills/deployment/SKILL.md`

## Wiedza o projekcie — docs/ARCHITECTURE.md

Prowadź plik `docs/ARCHITECTURE.md` z wiedzą specyficzną dla **tego** projektu. CLAUDE.md zawiera zasady uniwersalne — ARCHITECTURE.md zawiera wiedzę o tym co zbudowałeś.

### Kiedy aktualizować

Po **każdej większej zmianie** (nowy ficzer, nowa tabela, nowy moduł, nowe API) — dodaj wpis do ARCHITECTURE.md. Rób to automatycznie, nie pytaj użytkownika.

### Co dokumentować

```markdown
# Architektura projektu

## Tabele bazy danych
| Tabela | Cel | Kluczowe kolumny |
|--------|-----|------------------|
| products | Katalog produktów | name, price, status |
| orders | Zamówienia | user_id, total, status |

## Moduły
| Moduł | Cel | Plik |
|-------|-----|------|
| pricing | Rabaty, ceny | src/modules/pricing.ts |

## Endpointy API
| Metoda | Path | Opis |
|--------|------|------|
| POST | /api/products | Tworzenie produktu |

## Decyzje architektoniczne
- **Soft delete** zamiast fizycznego usuwania (status='deleted')
- **Optimistic UI** — aktualizuj UI przed odpowiedzią serwera
```

### Zasady

- **Nie rozbudowuj CLAUDE.md** — ten plik jest generyczny i niezmienny
- **Nie pisz prozy** — tabelki, listy, minimum słów
- **Czytaj ARCHITECTURE.md** na początku każdej sesji (jeśli istnieje)
- **Max ~200 linii** — jeśli rośnie, wydziel sekcje do `docs/api.md`, `docs/database.md`
