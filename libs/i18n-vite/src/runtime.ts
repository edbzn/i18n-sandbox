// Runtime utilities - safe to import in browser code
// ICU utilities
export {
  parseICUMessage,
  renderICUMessage,
  getPluralCategory,
} from './lib/icu-utils';
export type { ICUMessage } from './lib/icu-utils';

// i18n helpers
export {
  initTranslations,
  getTranslations,
  getAvailableLocales,
  getCurrentLocale,
  createI18nHelpers,
} from './lib/i18n-helpers';
