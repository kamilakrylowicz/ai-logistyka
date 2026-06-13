import { describe, it, expect } from 'vitest';
import { questions } from '../src/modules/quizData.js';

describe('quizData', () => {
    it('has exactly 10 questions', () => {
        expect(questions).toHaveLength(10);
    });

    it('every question has 4 options', () => {
        questions.forEach((q, i) => {
            expect(q.opts, `question ${i} opts`).toHaveLength(4);
        });
    });

    it('every correct index is within options range', () => {
        questions.forEach((q, i) => {
            expect(q.correct, `question ${i} correct index`).toBeGreaterThanOrEqual(0);
            expect(q.correct, `question ${i} correct index`).toBeLessThan(q.opts.length);
        });
    });

    it('every question has non-empty text and feedback', () => {
        questions.forEach((q, i) => {
            expect(q.q, `question ${i} text`).toBeTruthy();
            expect(q.fb, `question ${i} feedback`).toBeTruthy();
        });
    });
});
