import '@angular/localize/init';
import { loadTranslations } from '@angular/localize';

import EN from './i18n/en.json';
import FR from './i18n/fr.json';

const locales = {
  en: EN,
  fr: FR,
};

export const initTranslations = (locale: 'en' | 'fr' = 'en') => {
  const currentLocale = locales[locale];
  loadTranslations(currentLocale.translations);
};

export const getAvailableLocales = () => Object.keys(locales);
export const getCurrentLocale = () => {
  // Get locale from URL path
  const path = window.location.pathname;
  const match = path.match(/^\/(en|fr)/);
  return match ? match[1] as 'en' | 'fr' : 'en';
};
