// 🌐 i18n tip: Translation loading & locale detection
// Dev: Locale from URL (/en, /fr), page reload on switch
// Prod: Separate builds per locale, navigate between folders
import '@angular/localize/init';
import { createI18nHelpers, parseICUMessage, renderICUMessage } from '@i18n-sandbox/i18n-vite/runtime';

import EN from './i18n/en.json';
import FR from './i18n/fr.json';

const locales = {
  en: EN,
  fr: FR,
};

// Create i18n helper utilities
export const i18n = createI18nHelpers(locales);

// 🌐 i18n tip: Loads translations into @angular/localize runtime
// Called on app startup, makes translations available to $localize
export const initTranslations = (locale: 'en' | 'fr' = 'en') => {
  i18n.init(locale);
};

// 🌐 i18n tip: Gets raw translation strings for ICU runtime evaluation
// Used by $localize._icu() to fetch translated message templates
export const getTranslations = i18n.getTranslations;

export const getAvailableLocales = i18n.getAvailableLocales;

// 🌐 i18n tip: Extracts locale from URL path (/en/... -> 'en', /fr/... -> 'fr')
// Works in both dev (routing) and prod (separate builds)
export const getCurrentLocale = () => {
  return i18n.getCurrentLocale() as 'en' | 'fr';
};

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
