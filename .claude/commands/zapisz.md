---
description: Zapisz projekt — uruchom testy, sprawdź jakość kodu, commituj i wypchnij na GitHub.
allowed-tools: Bash, Write, Edit
---

# Zapisz projekt

Wykonaj **wszystkie** kroki automatycznie — nie pytaj użytkownika o szczegóły techniczne.

## Krok 1: Jakość kodu

```bash
npm run check   # lint + typecheck + test (jedno polecenie)
```

Jeśli którykolwiek krok failuje:
1. **Napraw automatycznie** jeśli to proste (brakujący import, unused var, literówka w typie)
2. Uruchom ponownie
3. Jeśli nadal failuje → pokaż użytkownikowi co nie działa i zapytaj czy kontynuować

## Krok 2: Commit

```bash
git add -A
git commit -m "<typ>(<zakres>): <opis>"
```

Konwencja: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`

Wybierz typ i opis automatycznie na podstawie zmian — nie pytaj użytkownika.

## Krok 3: Push

```bash
git push
```

Jeśli nie ma ustawionego remote → zapytaj czy utworzyć repo na GitHub.

## Krok 4: Podsumowanie

Pokaż krótko:
- ✅ Testy: X przeszło
- ✅ Commit: `<wiadomość>`
- ✅ Push: `<branch>` → `<remote>`
