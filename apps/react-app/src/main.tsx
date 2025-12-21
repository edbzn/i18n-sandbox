import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { getCurrentLocale, initTranslations } from './i18n-init';
import App from './app/app';

// Initialize translations based on current URL
const locale = getCurrentLocale();
initTranslations(locale);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
