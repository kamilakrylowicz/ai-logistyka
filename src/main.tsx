import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/i18n.js';
import './styles/quiz.css';
import { Quiz } from './components/Quiz.js';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
    <StrictMode>
        <Quiz />
    </StrictMode>,
);
