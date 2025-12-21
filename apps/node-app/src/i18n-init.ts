// 🌐 i18n tip: Translation loading for Node.js API
// Compile-time: Simple translations replaced by Babel
// Runtime: ICU expressions evaluated by $localize._icu()
import '@angular/localize/init';
import { createI18nHelpers, parseICUMessage, renderICUMessage } from '@i18n-sandbox/i18n-webpack/runtime';

import EN from './i18n/en.json';
import FR from './i18n/fr.json';

const locales = {
  en: EN,
  fr: FR,
};

// Create i18n helper utilities
const i18n = createI18nHelpers(locales);

// 🌐 i18n tip: Gets raw translation strings for ICU runtime evaluation
export const getTranslations = i18n.getTranslations;

export const initTranslations = () => {
  // 🌐 i18n tip: Load translations for default locale
  // Can be changed based on environment variable or runtime configuration
  const locale = 'en'; // Change to 'fr' for French

  console.log('Loading translations:', locale);
  i18n.init(locale);
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
