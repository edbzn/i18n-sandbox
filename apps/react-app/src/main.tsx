import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentLocale, initTranslations } from './i18n-init';
import App from './app/app';

// Initialize translations based on current URL
const locale = getCurrentLocale();
initTranslations(locale);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

function LocaleWrapper() {
  return <App />;
}

root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/en" element={<LocaleWrapper />} />
        <Route path="/fr" element={<LocaleWrapper />} />
        <Route path="/" element={<Navigate to="/en" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
