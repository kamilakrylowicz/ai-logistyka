import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuiz } from '../src/hooks/useQuiz.js';

describe('useQuiz', () => {
    it('starts in intro phase', () => {
        const { result } = renderHook(() => useQuiz());
        expect(result.current.state.phase).toBe('intro');
    });

    it('transitions to category phase after goToCategory', () => {
        const { result } = renderHook(() => useQuiz());
        act(() => { result.current.goToCategory(); });
        expect(result.current.state.phase).toBe('category');
    });

    it('transitions to question phase after startQuiz', () => {
        const { result } = renderHook(() => useQuiz());
        act(() => { result.current.startQuiz('all', 'Tester'); });
        expect(result.current.state.phase).toBe('question');
        expect(result.current.state.current).toBe(0);
    });

    it('increments score when correct answer selected', () => {
        const { result } = renderHook(() => useQuiz());
        act(() => { result.current.startQuiz('all', ''); });
        const correctIdx = result.current.questions[0].correct;
        act(() => { result.current.selectAnswer(correctIdx); });
        expect(result.current.state.score).toBe(1);
        expect(result.current.state.answered).toBe(true);
    });

    it('does not increment score on wrong answer', () => {
        const { result } = renderHook(() => useQuiz());
        act(() => { result.current.startQuiz('all', ''); });
        const wrongIdx = (result.current.questions[0].correct + 1) % 4;
        act(() => { result.current.selectAnswer(wrongIdx); });
        expect(result.current.state.score).toBe(0);
    });

    it('ignores duplicate answer selection', () => {
        const { result } = renderHook(() => useQuiz());
        act(() => { result.current.startQuiz('all', ''); });
        const correctIdx = result.current.questions[0].correct;
        act(() => { result.current.selectAnswer(correctIdx); });
        act(() => { result.current.selectAnswer(correctIdx); });
        expect(result.current.state.answers).toHaveLength(1);
    });

    it('advances to next question', () => {
        const { result } = renderHook(() => useQuiz());
        act(() => { result.current.startQuiz('all', ''); });
        act(() => { result.current.selectAnswer(0); });
        act(() => { result.current.nextQuestion(); });
        expect(result.current.state.current).toBe(1);
        expect(result.current.state.answered).toBe(false);
    });

    it('transitions to score phase after last question', () => {
        const { result } = renderHook(() => useQuiz());
        act(() => { result.current.startQuiz('all', ''); });
        const total = result.current.questions.length;
        for (let i = 0; i < total; i++) {
            act(() => { result.current.selectAnswer(0); });
            act(() => { result.current.nextQuestion(); });
        }
        expect(result.current.state.phase).toBe('score');
    });

    it('restarts quiz back to category phase', () => {
        const { result } = renderHook(() => useQuiz());
        act(() => { result.current.startQuiz('all', 'Test'); });
        act(() => { result.current.selectAnswer(0); });
        act(() => { result.current.restartQuiz(); });
        expect(result.current.state.phase).toBe('category');
    });

    it('filters questions by category', () => {
        const { result } = renderHook(() => useQuiz());
        act(() => { result.current.startQuiz('warehouses', ''); });
        const allWarehouse = result.current.questions.every(q => q.category === 'warehouses');
        expect(allWarehouse).toBe(true);
    });
});
