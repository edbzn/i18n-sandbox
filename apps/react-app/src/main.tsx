// 🌐 i18n tip: Compile-time translation with Angular's localize Babel plugins
// The Vite plugin transforms $localize calls at build time (both dev and prod)
// Simple translations: $localize`:@@key:text` → 'translated text'
// ICU expressions: Not yet supported at compile-time, need runtime evaluation
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import App from './app/app';
import {
  getCurrentLocale,
  initTranslations,
} from './i18n-init';


// 🌐 i18n tip: Initialize translations on app startup based on URL path
const locale = getCurrentLocale();

initTranslations(locale);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

// 🌐 i18n tip: Check build mode for routing strategy
const isProduction = import.meta.env.PROD;

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
