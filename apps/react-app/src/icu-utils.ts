// 🌐 i18n tip: ICU message format - runtime parsing & evaluation for plurals/selects
// Why runtime? Variable values only known at runtime, plural rules vary by locale (Arabic has 6 forms!)
// Example: {count, plural, =0 {no items} =1 {one item} other {# items}}
// Babel transforms $localize templates to $localize._icu() calls, this module evaluates them

export interface ICUMessage {
  type: 'plural' | 'select' | 'selectordinal';
  variable: string;
  cases: Record<string, string>;
  offset?: number;
}

// 🌐 i18n tip: Parses ICU syntax into structured format for evaluation
// Input: "{count, plural, =0 {no items} other {# items}}"
// Output: {type: 'plural', variable: 'count', cases: {'=0': 'no items', 'other': '# items'}}
export function parseICUMessage(message: string): ICUMessage | null {
  const icuPattern = /\{([^,}]+),\s*(plural|select|selectordinal)\s*,\s*(?:offset:\s*(\d+)\s*)?((?:[^{}]|\{[^{}]*\})*)\}/;
  const match = message.match(icuPattern);

  if (!match) {
    return null;
  }

  const [, variable, type, offset, casesStr] = match;
  const cases:  Record<string, string> = {};

  // Parse cases like "=0 {no items} =1 {one item} other {# items}"
  const casePattern = /(=\d+|\w+)\s*\{([^}]*)\}/g;
  let caseMatch;

  while ((caseMatch = casePattern.exec(casesStr)) !== null) {
    const [, caseKey, caseValue] = caseMatch;
    cases[caseKey.trim()] = caseValue.trim();
  }

  return {
    type:  type as any,
    variable:  variable.trim(),
    cases,
    offset: offset ? parseInt(offset, 10) : undefined,
  };
}

// 🌐 i18n tip: Evaluates ICU message with runtime values and locale-specific plural rules
// Uses Intl.PluralRules to select correct plural form (zero/one/two/few/many/other)
// Replaces # with numbers, and interpolates all placeholder values
export function renderICUMessage(
  icu: ICUMessage,
  values: Record<string, any>,
  locale: string
): string {
  const value = values[icu.variable];

  // Helper function to replace all interpolations in the result string
  const replaceInterpolations = (str: string, numValue?: number): string => {
    let result = str;
    // Replace # with the numeric value
    if (numValue !== undefined) {
      result = result.replace(/#/g, String(numValue));
    }
    // Replace all {PLACEHOLDER} style interpolations
    Object.keys(values).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      result = result.replace(regex, String(values[key]));
    });
    return result;
  };

  if (icu.type === 'select') {
    const caseValue = icu.cases[value] || icu.cases['other'] || '';
    return replaceInterpolations(caseValue);
  }

  if (icu.type === 'plural' || icu.type === 'selectordinal') {
    const numValue = typeof value === 'number' ? value : 0;
    const adjustedValue = icu.offset ? numValue - icu.offset : numValue;

    // Check exact match first (=0, =1, etc.)
    const exactMatch = icu.cases[`=${numValue}`];
    if (exactMatch !== undefined) {
      return replaceInterpolations(exactMatch, adjustedValue);
    }

    // Get plural category for the locale
    const category = getPluralCategory(numValue, locale, icu.type === 'selectordinal');
    const categoryMatch = icu.cases[category] || icu.cases['other'] || '';

    return replaceInterpolations(categoryMatch, adjustedValue);
  }

  return '';
}

/**
 * Get plural category for a number in a specific locale
 * This is a simplified version - for full support use Intl.PluralRules
 */
export function getPluralCategory(
  n: number,
  locale: string,
  ordinal: boolean = false
): string {
  // Use native Intl.PluralRules if available
  if (typeof Intl !== 'undefined' && Intl.PluralRules) {
    const pr = new Intl.PluralRules(locale, { type: ordinal ? 'ordinal' : 'cardinal' });
    return pr.select(n);
  }

  // Fallback for English
  if (ordinal) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'one';
    if (mod10 === 2 && mod100 !== 12) return 'two';
    if (mod10 === 3 && mod100 !== 13) return 'few';
    return 'other';
  } else {
    if (n === 1) return 'one';
    return 'other';
  }
}
