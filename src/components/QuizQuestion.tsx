import { useTranslation } from 'react-i18next';
import type { Question, Answer } from '../types/quiz.js';

const LETTERS = ['A', 'B', 'C', 'D'];

interface QuizQuestionProps {
    question: Question;
    questionIndex: number;
    totalQuestions: number;
    score: number;
    answered: boolean;
    lastAnswer: Answer | null;
    onSelect: (idx: number) => void;
    onNext: () => void;
}

/** Single question card with options and feedback. */
export function QuizQuestion({
    question,
    questionIndex,
    totalQuestions,
    score,
    answered,
    lastAnswer,
    onSelect,
    onNext,
}: QuizQuestionProps) {
    const { t } = useTranslation();
    const progress = (questionIndex / totalQuestions) * 100;
    const isLast = questionIndex === totalQuestions - 1;

    function getOptionClass(idx: number): string {
        if (!answered) return 'option';
        if (idx === question.correct) return 'option correct disabled';
        if (lastAnswer && idx === lastAnswer.chosen && !lastAnswer.correct)
            return 'option wrong disabled';
        return 'option disabled dimmed';
    }

    return (
        <>
            <div className="progress-label">
                <span>
                    {t('quiz.progress', { current: questionIndex + 1, total: totalQuestions })}
                </span>
                <span>{t('quiz.score_label', { score })}</span>
            </div>
            <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="card">
                <div className="question-number">
                    {t('quiz.question_label', { num: String(questionIndex + 1).padStart(2, '0') })}
                </div>
                <div className="question-text">{question.q}</div>
                <div className="options">
                    {question.opts.map((opt, i) => (
                        <div key={i} className={getOptionClass(i)} onClick={() => onSelect(i)}>
                            <div className="opt-letter">{LETTERS[i]}</div>
                            <span>{opt}</span>
                        </div>
                    ))}
                </div>
                {answered && lastAnswer && (
                    <div className={`feedback ${lastAnswer.correct ? 'correct-fb' : 'wrong-fb'}`}>
                        <strong>
                            {lastAnswer.correct ? t('quiz.correct_title') : t('quiz.wrong_title')}
                        </strong>
                        <p>{question.fb}</p>
                    </div>
                )}
                <div className="controls">
                    <button className="btn btn-primary" onClick={onNext} disabled={!answered}>
                        {isLast ? t('quiz.show_results') : t('quiz.next')}
                    </button>
                </div>
            </div>
        </>
    );
}
