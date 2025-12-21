// 🌐 i18n tip: Translation loading & locale detection
// Dev: Locale from URL (/en, /fr), page reload on switch
// Prod: Separate builds per locale, navigate between folders
import '@angular/localize/init';
import { loadTranslations } from '@angular/localize';

import EN from './i18n/en.json';
import FR from './i18n/fr.json';

const locales = {
  en: EN,
  fr: FR,
};

// 🌐 i18n tip: Loads translations into @angular/localize runtime
// Called on app startup, makes translations available to $localize
export const initTranslations = (locale: 'en' | 'fr' = 'en') => {
  const currentLocale = locales[locale];
  loadTranslations(currentLocale.translations);
};

// 🌐 i18n tip: Gets raw translation strings for ICU runtime evaluation
// Used by $localize._icu() to fetch translated message templates
export const getTranslations = (locale: string): Record<string, string> => {
  const localeKey = locale as 'en' | 'fr';
  return locales[localeKey]?.translations || locales.en.translations;
};

export const getAvailableLocales = () => Object.keys(locales);

// 🌐 i18n tip: Extracts locale from URL path (/en/... -> 'en', /fr/... -> 'fr')
// Works in both dev (routing) and prod (separate builds)
export const getCurrentLocale = () => {
  const path = window.location.pathname;
  const match = path.match(/^\/(en|fr)/);
  return match ? match[1] as 'en' | 'fr' : 'en';
};
