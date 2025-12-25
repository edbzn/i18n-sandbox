// 🌐 i18n tip: Runtime-only translation loading for Node.js API
// All translations are evaluated at runtime, no build-time transformation
import '@angular/localize/init';
import { loadTranslations } from '@angular/localize';
import { parseICUMessage, renderICUMessage } from '@i18n-sandbox/i18n-webpack/runtime';
import * as fs from 'fs';
import * as path from 'path';

let currentTranslations: Record<string, string> = {};
let currentLocale = 'en';

// 🌐 i18n tip: Gets raw translation strings for ICU runtime evaluation
export const getTranslations = (): Record<string, string> => {
  return currentTranslations;
};

export const initTranslations = () => {
  // 🌐 i18n tip: Load translations based on environment variable at runtime
  // Single build serves all locales - locale determined at startup
  const locale = process.env.LOCALE || 'en';
  currentLocale = locale;

  // All translation files are bundled as assets
  const translationsPath = path.join(__dirname, 'assets', 'i18n', `${locale}.json`);

  console.log(`🌐 Initializing i18n with locale: ${locale}`);

  if (fs.existsSync(translationsPath)) {
    const content = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));
    currentTranslations = content.translations || {};
    loadTranslations(currentTranslations);
    console.log(`✓ Loaded ${Object.keys(currentTranslations).length} translations for ${locale}`);
  } else {
    console.warn(`⚠ Translation file not found: ${translationsPath}`);
  }

  // Set the locale globally
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ($localize as any).locale = locale;

  // 🌐 i18n tip: Override $localize to support runtime ICU evaluation
  const originalLocalize = $localize;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).$localize = function(parts: TemplateStringsArray, ...values: any[]) {
    const messageId = extractMessageId(parts);
    let template = parts[0].replace(/:@@[^:]+:/, '');

    // Reconstruct the template with values
    for (let i = 0; i < values.length; i++) {
      template += String(values[i]) + parts[i + 1];
    }

    // Get translated message
    let translatedMessage = template;
    if (messageId && currentTranslations[messageId]) {
      translatedMessage = currentTranslations[messageId];

      // Check if it contains ICU syntax
      if (/\{[^}]+,\s*(plural|select|selectordinal)/.test(translatedMessage)) {
        // Extract the ICU variable name
        const icuVarMatch = translatedMessage.match(/\{([^,}]+),\s*(plural|select|selectordinal)/);
        if (icuVarMatch && values.length > 0) {
          const varName = icuVarMatch[1].trim();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const valuesMap: Record<string, any> = {};
          valuesMap[varName] = values[0]; // First value is the plural variable

          const icu = parseICUMessage(translatedMessage);
          if (icu) {
            const result = renderICUMessage(icu, valuesMap, currentLocale);
            // Replace INTERPOLATION placeholder with the value if present
            return result.replace(/INTERPOLATION/g, String(values[0]));
          }
        }
      }
    }

    return translatedMessage;
  };

  // Copy properties from original $localize
  Object.setPrototypeOf($localize, originalLocalize);
};

// Helper to extract message ID from $localize template
function extractMessageId(parts: TemplateStringsArray): string | undefined {
  const firstPart = parts[0];
  const match = firstPart.match(/:@@([^:]+):/);
  return match ? match[1] : undefined;
}

// 🌐 i18n tip: Custom ICU runtime function for plural/select expressions
// Called by Babel-transformed code: $localize._icu(messageId, template, locale, values)
if (typeof $localize !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ($localize as any)._icu = function (
    messageId: string,
    message: string,
    _locale: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: Record<string, any>
  ): string {
    // Get translated template for current locale
    const translations = getTranslations();
    let messageToUse = message;

    if (translations && messageId && translations[messageId]) {
      messageToUse = translations[messageId];
    }

    // Parse and evaluate ICU expression
    const icu = parseICUMessage(messageToUse);
    if (!icu) {
      return messageToUse;
    }

    return renderICUMessage(icu, values, currentLocale);
  };
}
