# @i18n-sandbox/i18n-webpack

Reusable Webpack i18n utilities for Angular localize integration.

## Features

- **Webpack Plugin**: Integrates `@angular/localize` with Webpack for compile-time and runtime translation
- **Custom Loader**: Babel-based transformation for $localize tagged templates
- **ICU Message Format**: Runtime parsing and evaluation for complex plurals and selects
- **Translation Helpers**: Utilities for loading translations and managing locales

## Installation

This library is part of the i18n-sandbox monorepo and is automatically available via TypeScript path mapping:

```typescript
const { AngularLocalizePlugin } = require('@i18n-sandbox/i18n-webpack');
// or
import { parseICUMessage, renderICUMessage } from '@i18n-sandbox/i18n-webpack/runtime';
```

## Usage

### Webpack Plugin

Add the plugin to your `webpack.config.js`:

```javascript
const { AngularLocalizePlugin } = require('@i18n-sandbox/i18n-webpack');

module.exports = {
  // ... other config
  plugins: [
    new AngularLocalizePlugin({
      translationFile: './src/i18n/en.json',
      missingTranslation: 'error',
      localizeName: '$localize',
      enableRuntimeICU: false, // Set to true for runtime ICU evaluation
      include: (moduleId) => {
        // Optional: filter which modules to process
        return !moduleId.includes('node_modules');
      },
    }),
  ],
};
```

### Translation Helpers

Create an i18n initialization module:

```typescript
import '@angular/localize/init';
import { createI18nHelpers } from '@i18n-sandbox/i18n-webpack/runtime';
import EN from './i18n/en.json';
import FR from './i18n/fr.json';

const i18n = createI18nHelpers({
  en: EN,
  fr: FR,
});

// Initialize translations on app startup
i18n.init('en');

export { i18n };
```

### ICU Runtime Evaluation

For development with runtime ICU support, attach the ICU evaluator to `$localize`:

```typescript
import { parseICUMessage, renderICUMessage } from '@i18n-sandbox/i18n-webpack/runtime';

// Attach ICU runtime evaluator to $localize
if (typeof $localize !== 'undefined') {
  ($localize as any)._icu = (
    messageId: string,
    message: string,
    locale: string,
    values: Record<string, any>
  ): string => {
    const translations = i18n.getTranslations(locale);
    const translatedMessage = translations[messageId] || message;
    
    const icu = parseICUMessage(translatedMessage);
    if (!icu) {
      return translatedMessage;
    }

    return renderICUMessage(icu, values, locale);
  };
}
```

## API

### Webpack Plugin

**`AngularLocalizePlugin(options)`**

Options:
- `translationFile`: Path to translation JSON file (required)
- `missingTranslation`: How to handle missing translations - `'error'`, `'warning'`, or `'ignore'` (default: `'error'`)
- `localizeName`: Name of the localize function (default: `'$localize'`)
- `enableRuntimeICU`: Enable runtime ICU evaluation for dev mode (default: `false`)
- `include`: Optional filter function to determine which modules to process

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

## Architecture

The library consists of:
- **webpack-localize.plugin.js**: Main Webpack plugin that hooks into compilation
- **webpack-localize.loader.js**: Custom Babel loader for transforming $localize templates
- **icu-utils.ts**: ICU message format parsing and evaluation
- **i18n-helpers.ts**: Translation loading and locale management utilities

The plugin and loader work together to transform your code during the Webpack build process, while the runtime utilities can be imported in your application code for ICU evaluation and translation management.
