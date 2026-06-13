import { useTranslation } from 'react-i18next';

interface QuizIntroProps {
    onStart: () => void;
}

/** Intro screen shown before quiz begins. */
export function QuizIntro({ onStart }: QuizIntroProps) {
    const { t } = useTranslation();
    return (
        <div className="card intro-screen">
            <div className="intro-features">
                <div className="if-card">
                    <div className="if-icon">🧠</div>
                    <div className="if-label">{t('quiz.features.questions')}</div>
                    <div className="if-sub">{t('quiz.features.questions_sub')}</div>
                </div>
                <div className="if-card">
                    <div className="if-icon">⚡</div>
                    <div className="if-label">{t('quiz.features.feedback')}</div>
                    <div className="if-sub">{t('quiz.features.feedback_sub')}</div>
                </div>
                <div className="if-card">
                    <div className="if-icon">📊</div>
                    <div className="if-label">{t('quiz.features.score')}</div>
                    <div className="if-sub">{t('quiz.features.score_sub')}</div>
                </div>
            </div>
            <p
                style={{
                    color: 'var(--teal-lt)',
                    marginBottom: '28px',
                    fontSize: '14px',
                    lineHeight: '1.7',
                }}
            >
                {t('quiz.intro_text')}
            </p>
            <div className="controls">
                <button className="btn btn-primary" onClick={onStart}>
                    {t('quiz.start')}
                </button>
            </div>
        </div>
    );
}
