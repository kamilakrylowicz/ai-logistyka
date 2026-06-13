import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Answer, CategoryId } from '../types/quiz.js';
import { Ranking } from './Ranking.js';

interface QuizScoreProps {
    score: number;
    total: number;
    answers: Answer[];
    category: CategoryId;
    onRestart: () => void;
}

/** Final score screen with breakdown and answer review. */
export function QuizScore({ score, total, answers, category, onRestart }: QuizScoreProps) {
    const { t } = useTranslation();
    const arcRef = useRef<SVGCircleElement>(null);
    const pct = score / total;
    const ARC = 439.8;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!arcRef.current) return;
            arcRef.current.style.strokeDashoffset = String(ARC * (1 - pct));
            arcRef.current.style.stroke =
                pct >= 0.8 ? 'var(--green)' : pct >= 0.5 ? 'var(--accent)' : 'var(--red)';
        }, 100);
        return () => clearTimeout(timer);
    }, [pct]);

    function getTitle() {
        if (score >= 9) return t('quiz.results.expert_title');
        if (score >= 7) return t('quiz.results.good_title');
        if (score >= 5) return t('quiz.results.average_title');
        return t('quiz.results.beginner_title');
    }

    function getSubtitle() {
        if (score >= 9) return t('quiz.results.expert_subtitle');
        if (score >= 7) return t('quiz.results.good_subtitle');
        if (score >= 5) return t('quiz.results.average_subtitle');
        return t('quiz.results.beginner_subtitle');
    }

    return (
        <div className="card score-screen">
            <div className="score-ring">
                <svg viewBox="0 0 160 160" width="160" height="160">
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="rgba(0,180,216,0.12)"
                        strokeWidth="12"
                    />
                    <circle
                        ref={arcRef}
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="var(--teal)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={ARC}
                        strokeDashoffset={ARC}
                        style={{
                            transition:
                                'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1), stroke 0.3s',
                        }}
                    />
                </svg>
                <div className="score-inner">
                    <div className="score-num">{score}</div>
                    <div className="score-total">{t('quiz.results.total', { total })}</div>
                </div>
            </div>

            <div className="score-title">{getTitle()}</div>
            <div className="score-subtitle">{getSubtitle()}</div>

            <div className="score-breakdown">
                <div className="sb-card">
                    <div className="sb-val" style={{ color: 'var(--green)' }}>
                        {score}
                    </div>
                    <div className="sb-label">{t('quiz.results.correct_label')}</div>
                </div>
                <div className="sb-card">
                    <div className="sb-val" style={{ color: 'var(--red)' }}>
                        {total - score}
                    </div>
                    <div className="sb-label">{t('quiz.results.wrong_label')}</div>
                </div>
                <div className="sb-card">
                    <div className="sb-val" style={{ color: 'var(--accent)' }}>
                        {Math.round(pct * 100)}%
                    </div>
                    <div className="sb-label">{t('quiz.results.efficiency_label')}</div>
                </div>
            </div>

            <div className="review-list">
                <h3>{t('quiz.review_title')}</h3>
                {answers.map((a, i) => (
                    <div key={i} className={`review-item ${a.correct ? 'r-correct' : 'r-wrong'}`}>
                        <div className="review-icon">{a.correct ? '✅' : '❌'}</div>
                        <div>
                            <div className="review-q">
                                {i + 1}. {a.q.substring(0, 80)}
                                {a.q.length > 80 ? '...' : ''}
                            </div>
                            {!a.correct && (
                                <div className="review-a">
                                    {t('quiz.correct_answer')}{' '}
                                    {a.opts[a.correctIdx].substring(0, 70)}...
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Ranking category={category} />

            <div
                className="controls"
                style={{
                    marginTop: '28px',
                    justifyContent: 'center',
                    gap: '14px',
                    flexWrap: 'wrap',
                }}
            >
                <button className="btn btn-outline" onClick={onRestart}>
                    {t('quiz.restart')}
                </button>
            </div>
        </div>
    );
}
