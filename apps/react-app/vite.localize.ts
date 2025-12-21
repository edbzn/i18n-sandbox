/**
 * Vite plugin for @angular/localize compile-time translation
 * Integrates Angular's localize Babel plugins with Vite
 */
import type { Plugin } from 'vite';
import { transformAsync } from '@babel/core';
import {
  makeEs2015TranslatePlugin,
  makeEs5TranslatePlugin,
  makeLocalePlugin,
  Diagnostics,
  SimpleJsonTranslationParser,
} from '@angular/localize/tools';
import type { ɵParsedTranslation } from '@angular/localize/private';
import * as fs from 'fs';
import * as path from 'path';

export interface LocalizePluginOptions {
  /**
   * Path to translation file(s) or translations object
   */
  translations?:  string | Record<string, ɵParsedTranslation>;

  /**
   * Target locale for the build
   */
  locale?: string;

  /**
   * How to handle missing translations
   * @default 'warning'
   */
  missingTranslation?: 'error' | 'warning' | 'ignore';

  /**
   * Name of the localize function
   * @default '$localize'
   */
  localizeName?: string;

  /**
   * Whether to include source maps
   * @default true
   */
  sourceMaps?: boolean;

  /**
   * File extensions to process
   * @default ['.js', '.jsx', '.ts', '.tsx', '.mjs']
   */
  include?: string[];
}

interface TranslationFile {
  locale: string;
  translations: Record<string, ɵParsedTranslation>;
}

/**
 * Load translations from a JSON file
 */
function loadTranslations(filePath: string): TranslationFile {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parser = new SimpleJsonTranslationParser();

  // First analyze the file
  const analysis = parser.analyze(filePath, content);
  if (!analysis.canParse) {
    throw new Error(analysis.diagnostics.formatDiagnostics(`Cannot parse ${filePath}`));
  }

  // Parse with the hint from analysis
  const diagnostics = new Diagnostics();
  const parsedFile = parser.parse(filePath, content, analysis.hint);

  if (parsedFile.diagnostics.hasErrors) {
    throw new Error(parsedFile.diagnostics.formatDiagnostics(`Failed to parse ${filePath}`));
  }

  return {
    locale: parsedFile.locale,
    translations: parsedFile.translations,
  };
}

/**
 * Vite plugin for @angular/localize
 */
export function angularLocalize(options: LocalizePluginOptions = {}): Plugin {
  const {
    translations = {},
    locale = 'en',
    missingTranslation = 'warning',
    localizeName = '$localize',
    sourceMaps = true,
    include = ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
  } = options;

  let translationsMap: Record<string, ɵParsedTranslation> = {};
  let resolvedLocale = locale;

  return {
    name: 'vite-plugin-angular-localize',

    enforce: 'post', // Run after other transforms

    configResolved(config) {
      // Load translations during config resolution
      if (typeof translations === 'string') {
        const translationFile = loadTranslations(
          path.resolve(config.root, translations)
        );
        translationsMap = translationFile.translations;
        resolvedLocale = translationFile.locale;
      } else {
        translationsMap = translations;
      }
    },

    async transform(code, id) {
      // Filter files based on extension
      const ext = path.extname(id);
      if (!include.includes(ext)) {
        return null;
      }

      // Skip if no $localize in the code (performance optimization)
      if (!code.includes(localizeName)) {
        return null;
      }

      // Skip node_modules except @angular/localize
      if (id.includes('node_modules') && !id.includes('@angular/localize')) {
        return null;
      }

      const diagnostics = new Diagnostics();

      try {
        const result = await transformAsync(code, {
          filename: id,
          sourceMaps:  sourceMaps,
          compact: false,
          plugins: [
            // Inline the locale
            makeLocalePlugin(resolvedLocale, { localizeName }),
            // Translate ES2015+ tagged templates
            makeEs2015TranslatePlugin(
              diagnostics,
              translationsMap,
              {
                missingTranslation,
                localizeName,
              }
            ),
            // Translate ES5 function calls (for compatibility)
            makeEs5TranslatePlugin(
              diagnostics,
              translationsMap,
              {
                missingTranslation,
                localizeName,
              }
            ),
          ],
        });

        // Handle diagnostics
        if (diagnostics. hasErrors) {
          const errorMessage = diagnostics.formatDiagnostics(
            `Translation errors in ${id}`
          );
          this.error(errorMessage);
        } else if (diagnostics.messages.length > 0) {
          diagnostics.messages.forEach((msg) => {
            if (msg.type === 'warning') {
              this.warn(`${id}: ${msg.message}`);
            }
          });
        }

        if (! result || ! result.code) {
          return null;
        }

        return {
          code: result.code,
          map: result.map || null,
        };
      } catch (error) {
        this.error(`Failed to transform ${id}: ${error}`);
        return null;
      }
    },
  };
}

export default angularLocalize;
