# Architektura projektu

## Opis

Quiz wiedzy o AI w logistyce — aplikacja React + TypeScript. 10 pytań z natychmiastowym feedbackiem i ekranem wyników.

## Moduły

| Moduł | Cel | Plik |
|-------|-----|------|
| quizData | Dane pytań quizu | `src/modules/quizData.ts` |
| useQuiz | Logika stanu quizu | `src/hooks/useQuiz.ts` |
| logger | Frontend structured logger | `src/config/logger.ts` |
| supabase | Klient Supabase (frontend) | `src/config/supabase.ts` |

## Komponenty

| Komponent | Cel | Plik |
|-----------|-----|------|
| Quiz | Root — przełącza fazy | `src/components/Quiz.tsx` |
| QuizIntro | Ekran startowy | `src/components/QuizIntro.tsx` |
| QuizQuestion | Pytanie + opcje + feedback | `src/components/QuizQuestion.tsx` |
| QuizScore | Wyniki końcowe + przegląd | `src/components/QuizScore.tsx` |

## Typy

| Typ | Cel | Plik |
|-----|-----|------|
| Question | Struktura pytania quizu | `src/types/quiz.ts` |
| Answer | Odpowiedź użytkownika | `src/types/quiz.ts` |
| QuizPhase | Faza quizu (intro/question/score) | `src/types/quiz.ts` |

## Stack

- Frontend: Vite + React 19 + TypeScript strict
- i18n: i18next (pl/en) — wszystkie stringi przez klucze tłumaczeń
- Testy: Vitest + @testing-library/react (12 testów)
- Linting: ESLint flat config + @typescript-eslint
- Hooks: Husky pre-commit (typecheck + lint-staged)
- CI: GitHub Actions (lint + typecheck + test)
- Backend: gotowy szkielet (server/) — Express + pino + Supabase service_role
- DB: Supabase — klucze w .env (jeszcze nie skonfigurowane)

## Decyzje architektoniczne

- Stan quizu tylko w React (nie persystowany) — wynik quizu jest jednorazowy, nie ma potrzeby zapisu
- Supabase client tworzony z env vars — bez hardcoded credentials
- Frontend logger (`flog`) wrappuje console — suppressed w produkcji
