import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../modules/quizData.js';
import type { CategoryId } from '../types/quiz.js';

interface CategorySelectProps {
    onStart: (categoryId: CategoryId, nick: string) => void;
}

/** Category selection screen with nick input. */
export function CategorySelect({ onStart }: CategorySelectProps) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<CategoryId>('all');
    const [nick, setNick] = useState('');

    return (
        <div className="card">
            <h2 style={{ marginBottom: '8px', fontSize: '20px' }}>{t('quiz.category_title')}</h2>
            <p style={{ color: 'var(--teal-lt)', fontSize: '14px', marginBottom: '24px' }}>
                {t('quiz.category_subtitle')}
            </p>

            <div className="category-grid">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        className={`category-btn ${selected === cat.id ? 'active' : ''}`}
                        onClick={() => setSelected(cat.id)}
                    >
                        <span className="cat-icon">{cat.icon}</span>
                        <span className="cat-label">{t(cat.labelKey)}</span>
                        <span className="cat-desc">{t(cat.descKey)}</span>
                    </button>
                ))}
            </div>

            <div className="nick-field">
                <label htmlFor="nick-input">{t('quiz.nick_label')}</label>
                <input
                    id="nick-input"
                    type="text"
                    placeholder={t('quiz.nick_placeholder')}
                    value={nick}
                    maxLength={20}
                    onChange={(e) => setNick(e.target.value)}
                />
            </div>

            <div className="controls" style={{ marginTop: '24px', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => onStart(selected, nick)}>
                    {t('quiz.start')}
                </button>
            </div>
        </div>
    );
}
