// 🌐 i18n tip: Translation loading & locale detection helpers for Node.js
// Provides utilities for loading translations and managing locales

import { loadTranslations } from '@angular/localize';

/**
 * Initialize translations for a given locale
 * Loads translations into @angular/localize runtime
 */
export function initTranslations(
  translations: Record<string, any>,
  locale: string
): void {
  const localeTranslations = translations[locale];
  if (localeTranslations?.translations) {
    loadTranslations(localeTranslations.translations);
  }
}

/**
 * Get raw translation strings for ICU runtime evaluation
 * Used by $localize._icu() to fetch translated message templates
 */
export function getTranslations(
  translations: Record<string, any>,
  locale: string
): Record<string, string> {
  return translations[locale]?.translations || {};
}

/**
 * Get list of available locales from translations object
 */
export function getAvailableLocales(
  translations: Record<string, any>
): string[] {
  return Object.keys(translations);
}

/**
 * Create a translation helper factory for a specific set of translations
 * Returns an object with helper functions bound to the provided translations
 */
export function createI18nHelpers(translations: Record<string, any>) {
  const availableLocales = getAvailableLocales(translations);

  return {
    /**
     * Initialize translations for the given locale
     */
    init: (locale: string) => initTranslations(translations, locale),

    /**
     * Get raw translation strings for the given locale
     */
    getTranslations: (locale: string) => getTranslations(translations, locale),

    /**
     * Get list of available locales
     */
    getAvailableLocales: () => availableLocales,
  };
}
