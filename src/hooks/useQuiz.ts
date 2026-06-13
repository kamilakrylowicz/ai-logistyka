import { useState } from 'react';
import { getQuestions } from '../modules/quizData.js';
import { saveRankingEntry } from '../modules/ranking.js';
import type { Answer, CategoryId, QuizPhase } from '../types/quiz.js';

interface QuizState {
    phase: QuizPhase;
    current: number;
    score: number;
    answers: Answer[];
    answered: boolean;
    categoryId: CategoryId;
    nick: string;
}

/** Manages quiz state and transitions. */
export function useQuiz() {
    const [state, setState] = useState<QuizState>({
        phase: 'intro',
        current: 0,
        score: 0,
        answers: [],
        answered: false,
        categoryId: 'all',
        nick: '',
    });
    const [questions, setQuestions] = useState(() => getQuestions('all'));

    function goToCategory() {
        setState((s) => ({ ...s, phase: 'category' }));
    }

    function startQuiz(categoryId: CategoryId, nick: string) {
        const qs = getQuestions(categoryId);
        setQuestions(qs);
        setState({
            phase: 'question',
            current: 0,
            score: 0,
            answers: [],
            answered: false,
            categoryId,
            nick,
        });
    }

    function selectAnswer(idx: number) {
        if (state.answered) return;
        const q = questions[state.current];
        const isCorrect = idx === q.correct;
        const newAnswer: Answer = {
            q: q.q,
            correct: isCorrect,
            chosen: idx,
            correctIdx: q.correct,
            opts: q.opts,
        };
        setState((s) => ({
            ...s,
            answered: true,
            score: isCorrect ? s.score + 1 : s.score,
            answers: [...s.answers, newAnswer],
        }));
    }

    function nextQuestion() {
        const next = state.current + 1;
        if (next >= questions.length) {
            saveRankingEntry({
                nick: state.nick || 'Anonim',
                score: state.score,
                total: questions.length,
                category: state.categoryId,
                date: new Date().toISOString(),
            });
            setState((s) => ({ ...s, phase: 'score' }));
        } else {
            setState((s) => ({ ...s, current: next, answered: false }));
        }
    }

    function restartQuiz() {
        setState((s) => ({ ...s, phase: 'category' }));
    }

    return { state, questions, goToCategory, startQuiz, selectAnswer, nextQuestion, restartQuiz };
}
