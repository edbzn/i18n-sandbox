// 🌐 i18n tip: Translation loading & locale detection helpers
// Provides utilities for loading translations and detecting current locale
// Can be used in both dev (routing) and prod (separate builds) modes

import { loadTranslations } from '@angular/localize';

/**
 * Initialize translations for a given locale
 * Loads translations into @angular/localize runtime
 */
export function initTranslations(
  translations: Record<string, any>,
  locale: string,
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
  locale: string,
): Record<string, string> {
  return translations[locale]?.translations || {};
}

/**
 * Get list of available locales from translations object
 */
export function getAvailableLocales(
  translations: Record<string, any>,
): string[] {
  return Object.keys(translations);
}

/**
 * Extract locale from URL path
 * Works in both dev (routing) and prod (separate builds)
 * Example: /en/... -> 'en', /fr/... -> 'fr'
 */
export function getCurrentLocale(
  availableLocales: string[],
  fallback: string = 'en',
): string {
  const path = window.location.pathname;
  const localePattern = new RegExp(`^/(${availableLocales.join('|')})`);
  const match = path.match(localePattern);
  return match ? match[1] : fallback;
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

    /**
     * Get current locale from URL
     */
    getCurrentLocale: (fallback?: string) =>
      getCurrentLocale(availableLocales, fallback),
  };
}
