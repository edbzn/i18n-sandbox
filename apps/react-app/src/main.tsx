// 🌐 i18n tip: ICU runtime support for plural/select expressions
// Compile-time: Simple translations replaced by Babel ($localize`:@@key:text`)
// Runtime: ICU expressions evaluated by $localize._icu() ({count, plural, ...})
// Uses Intl.PluralRules for locale-specific plural forms (English: one/other, French: one/other, Arabic: 6 forms)
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import {
  getCurrentLocale,
  initTranslations,
  getTranslations,
} from './i18n-init';
import {
  parseICUMessage,
  renderICUMessage,
} from '@i18n-sandbox/i18n-vite/runtime';
import App from './app/app';

// 🌐 i18n tip: Custom ICU runtime function, called by Babel-transformed code
// Transforms: $localize`:@@id:{count, plural, ...}` -> $localize._icu('id', template, locale, values)
if (typeof $localize !== 'undefined') {
  ($localize as any)._icu = function (
    messageId: string, // Translation key
    message: string, // ICU template string
    locale: string, // Current locale (en/fr)
    values: Record<string, any>, // Runtime values
  ): string {
    // 🌐 i18n tip: Get translated template for current locale
    const translations = getTranslations(locale);
    let messageToUse = message;

    if (translations && messageId && translations[messageId]) {
      messageToUse = translations[messageId];
    }

    // 🌐 i18n tip: Parse ICU syntax and evaluate with runtime values
    const icu = parseICUMessage(messageToUse);
    if (!icu) {
      return messageToUse;
    }

    const result = renderICUMessage(icu, values, locale);
    return result;
  };
}

// 🌐 i18n tip: Initialize translations on app startup based on URL path
const locale = getCurrentLocale();
initTranslations(locale);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

// 🌐 i18n tip: Check build mode for routing strategy
const isProduction = import.meta.env.PROD && import.meta.env.BASE_URL !== '/';

root.render(
  <StrictMode>
    <BrowserRouter>
      {isProduction ? (
        // 🌐 i18n tip: Prod - each locale is a separate build (en/, fr/)
        <App />
      ) : (
        // 🌐 i18n tip: Dev - single build with client routing, reload on locale switch
        <Routes>
          <Route path="/en" element={<App />} />
          <Route path="/fr" element={<App />} />
          <Route path="/" element={<Navigate to="/en" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  </StrictMode>,
);
