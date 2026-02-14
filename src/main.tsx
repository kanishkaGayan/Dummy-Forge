import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorHandler';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

const loadingScreen = document.getElementById('app-loading');
if (loadingScreen) {
  loadingScreen.classList.add('fade-out');
  window.setTimeout(() => loadingScreen.remove(), 300);
}
