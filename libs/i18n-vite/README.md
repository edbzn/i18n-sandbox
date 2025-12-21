# @i18n-sandbox/i18n-vite

Reusable Vite i18n utilities for Angular localize integration.

## Features

- **Vite Plugin**: Integrates `@angular/localize` with Vite for compile-time and runtime translation
- **ICU Message Format**: Runtime parsing and evaluation for complex plurals and selects
- **Translation Helpers**: Utilities for loading translations and detecting locales

## Installation

This library is part of the i18n-sandbox monorepo and is automatically available via TypeScript path mapping:

```typescript
import { angularLocalize, createI18nHelpers } from '@i18n-sandbox/i18n-vite';
```

## Usage

### Vite Plugin

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { angularLocalize } from '@i18n-sandbox/i18n-vite';

export default defineConfig({
  plugins: [
    angularLocalize({
      translations: './src/i18n/en.json',
      locale: 'en',
      missingTranslation: 'warning',
      enableRuntimeICU: true, // Enable for dev mode with ICU support
    }),
  ],
});
```

### Translation Helpers

Create an i18n initialization module:

```typescript
import { createI18nHelpers } from '@i18n-sandbox/i18n-vite';
import EN from './i18n/en.json';
import FR from './i18n/fr.json';

const i18n = createI18nHelpers({
  en: EN,
  fr: FR,
});

// Initialize translations on app startup
const locale = i18n.getCurrentLocale();
i18n.init(locale);

export { i18n };
```

### ICU Runtime Evaluation

For development with runtime ICU support, attach the ICU evaluator to `$localize`:

```typescript
import { parseICUMessage, renderICUMessage } from '@i18n-sandbox/i18n-vite';

// Attach ICU runtime evaluator to $localize
$localize._icu = (messageId: string, message: string, locale: string, values: Record<string, any>): string => {
  const translations = i18n.getTranslations(locale);
  const translatedMessage = translations[messageId] || message;

  const icu = parseICUMessage(translatedMessage);
  if (!icu) {
    return translatedMessage;
  }

  return renderICUMessage(icu, values, locale);
};
```

## API

### Vite Plugin

**`angularLocalize(options)`**

Options:

- `translations`: Path to translation file or translations object
- `locale`: Target locale for the build (default: `'en'`)
- `missingTranslation`: How to handle missing translations (default: `'warning'`)
- `localizeName`: Name of the localize function (default: `'$localize'`)
- `sourceMaps`: Whether to include source maps (default: `true`)
- `include`: File extensions to process (default: `['.js', '.jsx', '.ts', '.tsx', '.mjs']`)
- `enableRuntimeICU`: Enable runtime ICU evaluation for dev mode (default: `false`)

### ICU Utils

**`parseICUMessage(message: string): ICUMessage | null`**

Parses ICU message format syntax into a structured object.

**`renderICUMessage(icu: ICUMessage, values: Record<string, any>, locale: string): string`**

Evaluates an ICU message with runtime values and locale-specific plural rules.

**`getPluralCategory(n: number, locale: string, ordinal?: boolean): string`**

Gets the plural category for a number in a specific locale using `Intl.PluralRules`.

### Translation Helpers

**`createI18nHelpers(translations: Record<string, any>)`**

Creates a helper object with methods for managing translations:

- `init(locale)`: Initialize translations for a locale
- `getTranslations(locale)`: Get raw translation strings
- `getAvailableLocales()`: Get list of available locales
- `getCurrentLocale(fallback?)`: Extract locale from URL path

## How It Works

### Compile-Time Translation (Production)

In production builds (`enableRuntimeICU: false`), the plugin uses Angular's Babel plugins to:

1. Inline the target locale
2. Replace `$localize` tagged templates with translated strings at compile time
3. Handle simple interpolations and plurals

### Runtime ICU Evaluation (Development)

In development mode (`enableRuntimeICU: true`), the plugin:

1. Converts ICU expressions to `$localize._icu()` runtime calls
2. Allows dynamic locale switching without rebuilding
3. Evaluates complex plurals and selects using `Intl.PluralRules`

This hybrid approach provides the best of both worlds: fast development with dynamic locale switching, and optimized production builds with compile-time translation.
