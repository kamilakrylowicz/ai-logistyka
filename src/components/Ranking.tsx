import { useTranslation } from 'react-i18next';
import { getTopEntries } from '../modules/ranking.js';
import type { CategoryId } from '../types/quiz.js';

interface RankingProps {
    category: CategoryId;
}

/** Top 10 leaderboard for given category. */
export function Ranking({ category }: RankingProps) {
    const { t } = useTranslation();
    const entries = getTopEntries(10, category);

    if (entries.length === 0) return null;

    return (
        <div className="ranking-panel">
            <h3>{t('quiz.ranking_title')}</h3>
            <ol className="ranking-list">
                {entries.map((e, i) => (
                    <li key={i} className={`ranking-item ${i === 0 ? 'rank-first' : ''}`}>
                        <span className="rank-pos">{i + 1}</span>
                        <span className="rank-nick">{e.nick}</span>
                        <span className="rank-score">
                            {e.score}/{e.total}{' '}
                            <span className="rank-pct">
                                ({Math.round((e.score / e.total) * 100)}%)
                            </span>
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
