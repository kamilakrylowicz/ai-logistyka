import { describe, it, expect } from 'vitest';
import { ALL_QUESTIONS, getQuestions, CATEGORIES } from '../src/modules/quizData.js';

describe('quizData', () => {
    it('has at least 10 questions total', () => {
        expect(ALL_QUESTIONS.length).toBeGreaterThanOrEqual(10);
    });

    it('every question has 4 options', () => {
        ALL_QUESTIONS.forEach((q, i) => {
            expect(q.opts, `question ${i} opts`).toHaveLength(4);
        });
    });

    it('every correct index is within options range', () => {
        ALL_QUESTIONS.forEach((q, i) => {
            expect(q.correct, `question ${i} correct index`).toBeGreaterThanOrEqual(0);
            expect(q.correct, `question ${i} correct index`).toBeLessThan(q.opts.length);
        });
    });

    it('every question has non-empty text and feedback', () => {
        ALL_QUESTIONS.forEach((q, i) => {
            expect(q.q, `question ${i} text`).toBeTruthy();
            expect(q.fb, `question ${i} feedback`).toBeTruthy();
        });
    });

    it('getQuestions returns max 10 for "all" category', () => {
        const qs = getQuestions('all');
        expect(qs.length).toBeLessThanOrEqual(10);
    });

    it('getQuestions filters by category', () => {
        const qs = getQuestions('warehouses');
        expect(qs.every(q => q.category === 'warehouses')).toBe(true);
    });

    it('all categories have at least one question', () => {
        const categoryIds = CATEGORIES.filter(c => c.id !== 'all').map(c => c.id);
        categoryIds.forEach(id => {
            const qs = getQuestions(id);
            expect(qs.length, `category ${id} should have questions`).toBeGreaterThan(0);
        });
    });
});
