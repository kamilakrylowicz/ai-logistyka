import { useTranslation } from 'react-i18next';
import { useQuiz } from '../hooks/useQuiz.js';
import { QuizIntro } from './QuizIntro.js';
import { QuizQuestion } from './QuizQuestion.js';
import { QuizScore } from './QuizScore.js';

/** Root quiz component — manages phase rendering. */
export function Quiz() {
    const { t } = useTranslation();
    const { state, questions, startQuiz, selectAnswer, nextQuestion, restartQuiz } = useQuiz();

    const lastAnswer = state.answers[state.answers.length - 1] ?? null;
    const currentQuestion = questions[state.current];

    return (
        <div className="container">
            <div className="header">
                <div className="badge">🚛 {t('app.badge')}</div>
                <h1>
                    {t('app.title')}
                    <br />
                    <span>{t('app.subtitle')}</span>
                </h1>
                <p>{t('quiz.description')}</p>
            </div>

            {state.phase === 'intro' && <QuizIntro onStart={startQuiz} />}

            {state.phase === 'question' && currentQuestion && (
                <QuizQuestion
                    question={currentQuestion}
                    questionIndex={state.current}
                    totalQuestions={questions.length}
                    score={state.score}
                    answered={state.answered}
                    lastAnswer={lastAnswer}
                    onSelect={selectAnswer}
                    onNext={nextQuestion}
                />
            )}

            {state.phase === 'score' && (
                <QuizScore
                    score={state.score}
                    total={questions.length}
                    answers={state.answers}
                    onRestart={restartQuiz}
                />
            )}
        </div>
    );
}
