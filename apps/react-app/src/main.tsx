import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { getCurrentLocale, initTranslations, getTranslations } from './i18n-init';
import { parseICUMessage, renderICUMessage } from './icu-utils';
import App from './app/app';


// Extend $localize with ICU support
if (typeof $localize !== 'undefined') {
  ($localize as any)._icu = function(
    messageId: string,
    message: string,
    locale: string,
    values: Record<string, any>
  ): string {
    // Get translations for the current locale
    const translations = getTranslations(locale);
    let messageToUse = message;

    if (translations && messageId && translations[messageId]) {
      messageToUse = translations[messageId];
    }

    const icu = parseICUMessage(messageToUse);
    if (!icu) {
      return messageToUse;
    }
    const result = renderICUMessage(icu, values, locale);
    return result;
  };
}

// Initialize translations based on current URL
const locale = getCurrentLocale();
initTranslations(locale);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

// Check if we're in production (built with locale-specific base path)
const isProduction = import.meta.env.PROD && import.meta.env.BASE_URL !== '/';

root.render(
  <StrictMode>
    <BrowserRouter>
      {isProduction ? (
        // Production: no routing needed, base path handles locale
        <App />
      ) : (
        // Development: use routing for locale switching
        <Routes>
          <Route path="/en" element={<App />} />
          <Route path="/fr" element={<App />} />
          <Route path="/" element={<Navigate to="/en" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  </StrictMode>,
);
