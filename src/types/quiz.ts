export interface Question {
    q: string;
    opts: string[];
    correct: number;
    fb: string;
    category: CategoryId;
}

export interface Answer {
    q: string;
    correct: boolean;
    chosen: number;
    correctIdx: number;
    opts: string[];
}

export type QuizPhase = 'intro' | 'category' | 'question' | 'score';

export type CategoryId = 'all' | 'warehouses' | 'automation' | 'data' | 'strategy';

export interface Category {
    id: CategoryId;
    labelKey: string;
    descKey: string;
    icon: string;
}

export interface RankingEntry {
    nick: string;
    score: number;
    total: number;
    category: CategoryId;
    date: string;
}
