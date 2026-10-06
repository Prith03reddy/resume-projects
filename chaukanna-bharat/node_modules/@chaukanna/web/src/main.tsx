import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { AnalysisProvider } from './context/AnalysisContext.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AnalysisProvider>
        <App />
      </AnalysisProvider>
    </LanguageProvider>
  </React.StrictMode>
);
