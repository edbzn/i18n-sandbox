// 🌐 i18n tip: Translation loading for Node.js API
// Compile-time: Simple translations replaced by Babel
// Runtime: ICU expressions evaluated by $localize._icu()
import '@angular/localize/init';
import { loadTranslations } from '@angular/localize';
import { parseICUMessage, renderICUMessage } from './utils/icu-utils';

import EN from './i18n/en.json';
import FR from './i18n/fr.json';

const locales = {
  en: EN,
  fr: FR,
};

// 🌐 i18n tip: Gets raw translation strings for ICU runtime evaluation
export const getTranslations = (locale: string): Record<string, string> => {
  const localeKey = locale as 'en' | 'fr';
  return locales[localeKey]?.translations || locales.en.translations;
};

// 🌐 i18n tip: Custom ICU runtime function for plural/select expressions
// Called by Babel-transformed code: $localize._icu(messageId, template, locale, values)
if (typeof $localize !== 'undefined') {
  ($localize as any)._icu = function (
    messageId: string,
    message: string,
    locale: string,
    values: Record<string, any>
  ): string {
    // Get translated template for current locale
    const translations = getTranslations(locale);
    let messageToUse = message;

    if (translations && messageId && translations[messageId]) {
      messageToUse = translations[messageId];
    }

    // Parse and evaluate ICU expression
    const icu = parseICUMessage(messageToUse);
    if (!icu) {
      return messageToUse;
    }

    return renderICUMessage(icu, values, locale);
  };
}

export const initTranslations = () => {
  // 🌐 i18n tip: Load translations for default locale
  // Can be changed based on environment variable or runtime configuration
  const currentLocale = EN; // Change to FR for French

  console.log('Loading translations:', currentLocale.locale);
  loadTranslations(currentLocale.translations);
};
