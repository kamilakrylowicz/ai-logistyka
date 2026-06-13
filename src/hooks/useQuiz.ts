import { useState } from 'react';
import { questions } from '../modules/quizData.js';
import type { Answer, QuizPhase } from '../types/quiz.js';

interface QuizState {
    phase: QuizPhase;
    current: number;
    score: number;
    answers: Answer[];
    answered: boolean;
}

/** Manages quiz state and transitions. */
export function useQuiz() {
    const [state, setState] = useState<QuizState>({
        phase: 'intro',
        current: 0,
        score: 0,
        answers: [],
        answered: false,
    });

    function startQuiz() {
        setState((s) => ({ ...s, phase: 'question' }));
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
            setState((s) => ({ ...s, phase: 'score' }));
        } else {
            setState((s) => ({ ...s, current: next, answered: false }));
        }
    }

    function restartQuiz() {
        setState({ phase: 'question', current: 0, score: 0, answers: [], answered: false });
    }

    return { state, questions, startQuiz, selectAnswer, nextQuestion, restartQuiz };
}
