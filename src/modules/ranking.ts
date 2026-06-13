import type { CategoryId, RankingEntry } from '../types/quiz.js';

const STORAGE_KEY = 'quiz_ranking';
const MAX_ENTRIES = 50;

/** Loads ranking from localStorage. */
export function loadRanking(): RankingEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as RankingEntry[]) : [];
    } catch {
        return [];
    }
}

/** Saves a new entry and returns updated ranking sorted by score desc. */
export function saveRankingEntry(entry: RankingEntry): RankingEntry[] {
    const existing = loadRanking();
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
}

/** Returns top N entries, optionally filtered by category. */
export function getTopEntries(n: number, category?: CategoryId): RankingEntry[] {
    const all = loadRanking();
    const filtered =
        category && category !== 'all' ? all.filter((e) => e.category === category) : all;
    return filtered.sort((a, b) => b.score / b.total - a.score / a.total).slice(0, n);
}
