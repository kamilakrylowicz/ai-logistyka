export interface Question {
    q: string;
    opts: string[];
    correct: number;
    fb: string;
}

export interface Answer {
    q: string;
    correct: boolean;
    chosen: number;
    correctIdx: number;
    opts: string[];
}

export type QuizPhase = 'intro' | 'question' | 'score';
