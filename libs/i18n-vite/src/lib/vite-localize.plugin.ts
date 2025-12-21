/**
 * Vite plugin for @angular/localize compile-time translation
 * Integrates Angular's localize Babel plugins with Vite
 */
import type { Plugin } from 'vite';
// @ts-ignore - @babel/core doesn't have proper types in some environments
import { transformAsync } from '@babel/core';
import {
  makeEs2015TranslatePlugin,
  makeEs5TranslatePlugin,
  makeLocalePlugin,
  Diagnostics,
  SimpleJsonTranslationParser,
} from '@angular/localize/tools';
// Using a type import workaround for private API
type ɵParsedTranslation = any;
import * as fs from 'fs';
import * as path from 'path';

export interface LocalizePluginOptions {
  /**
   * Path to translation file(s) or translations object
   */
  translations?: string | Record<string, ɵParsedTranslation>;

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

  /**
   * Enable runtime ICU evaluation (for dev mode)
   * @default false
   */
  enableRuntimeICU?: boolean;
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
    throw new Error(
      analysis.diagnostics.formatDiagnostics(`Cannot parse ${filePath}`),
    );
  }

  // Parse with the hint from analysis
  const diagnostics = new Diagnostics();
  const parsedFile = parser.parse(filePath, content, analysis.hint);

  if (parsedFile.diagnostics.hasErrors) {
    throw new Error(
      parsedFile.diagnostics.formatDiagnostics(`Failed to parse ${filePath}`),
    );
  }

  return {
    locale: parsedFile.locale || 'en',
    translations: parsedFile.translations,
  };
}

/**
 * Custom Babel plugin to convert ICU expressions to runtime calls
 */
function makeICURuntimePlugin(locale: string, localizeName: string) {
  return function ({ types: t }: any) {
    return {
      visitor: {
        TaggedTemplateExpression(path: any) {
          const tag = path.get('tag');
          if (tag.isIdentifier({ name: localizeName })) {
            const quasi = path.node.quasi;

            console.log('[Babel Plugin] Found $localize template');
            console.log(
              '[Babel Plugin] Template parts:',
              quasi.quasis.map((q: any) => q.value.raw),
            );

            // Check if any template parts contain ICU syntax
            // Look for patterns like ":VAR_PLURAL:, plural" or "{VAR_PLURAL, plural"
            const hasICU = quasi.quasis.some((q: any) =>
              /[:,]\s*(plural|select|selectordinal)/i.test(q.value.raw),
            );

            console.log('[Babel Plugin] Has ICU:', hasICU);

            if (hasICU) {
              // Extract the message ID from the template
              const firstPart = quasi.quasis[0].value.raw;
              const idMatch = firstPart.match(/:@@([^:]+):/);
              const messageId = idMatch ? idMatch[1] : '';

              // Build the ICU message string and expression map
              let messageStr = '';
              const expressionMap: any[] = [];

              quasi.quasis.forEach((element: any, i: number) => {
                let raw = element.value.raw;
                // Remove metadata like :@@id: from first part
                if (i === 0) {
                  raw = raw.replace(/^:@@[^:]+:/, '');
                } else if (i > 0) {
                  // Remove the :PLACEHOLDER_NAME: prefix from subsequent parts
                  raw = raw.replace(/^:([^:,}]+):/, '');
                }

                if (i < quasi.expressions.length) {
                  const expr = quasi.expressions[i];
                  // The placeholder name comes AFTER the expression in the next quasi
                  // Format: {${expr}:PLACEHOLDER_NAME:, ...}
                  const nextQuasi = quasi.quasis[i + 1];
                  const nextRaw = nextQuasi ? nextQuasi.value.raw : '';
                  const placeholderMatch = nextRaw.match(/^:([^:,}]+):/);
                  const placeholderName = placeholderMatch
                    ? placeholderMatch[1].trim()
                    : `expr_${i}`;
                  expressionMap.push({ name: placeholderName, expr });

                  // Add the current part + placeholder to message string
                  messageStr += raw + placeholderName;
                } else {
                  // Last quasi, just add it
                  messageStr += raw;
                }
              });

              // Create runtime ICU call: $localize._icu(messageId, message, locale, values)
              const valuesObj = t.objectExpression(
                expressionMap.map((item: any) =>
                  t.objectProperty(t.stringLiteral(item.name), item.expr),
                ),
              );

              // Extract locale dynamically from URL: window.location.pathname.match(/^\/(en|fr)/)?.[1] || 'en'
              const localeExpr = t.logicalExpression(
                '||',
                t.memberExpression(
                  t.callExpression(
                    t.memberExpression(
                      t.memberExpression(
                        t.memberExpression(
                          t.identifier('window'),
                          t.identifier('location'),
                        ),
                        t.identifier('pathname'),
                      ),
                      t.identifier('match'),
                    ),
                    [t.regExpLiteral('^\\/([a-z]{2})')],
                  ),
                  t.numericLiteral(1),
                  true, // optional chaining
                ),
                t.stringLiteral('en'),
              );

              const runtimeCall = t.callExpression(
                t.memberExpression(
                  t.identifier(localizeName),
                  t.identifier('_icu'),
                ),
                [
                  t.stringLiteral(messageId),
                  t.stringLiteral(messageStr),
                  localeExpr,
                  valuesObj,
                ],
              );

              path.replaceWith(runtimeCall);
            }
          }
        },
      },
    };
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
    enableRuntimeICU = false,
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
          path.resolve(config.root, translations),
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
        const plugins: any[] = [];

        if (enableRuntimeICU) {
          // In dev mode with runtime ICU: convert ICU expressions to runtime calls
          plugins.push(makeICURuntimePlugin(resolvedLocale, localizeName));
        } else {
          // In production: use compile-time translation
          plugins.push(
            // Inline the locale
            makeLocalePlugin(resolvedLocale, { localizeName }),
            // Translate ES2015+ tagged templates
            makeEs2015TranslatePlugin(diagnostics, translationsMap, {
              missingTranslation,
              localizeName,
            }),
            // Translate ES5 function calls (for compatibility)
            makeEs5TranslatePlugin(diagnostics, translationsMap, {
              missingTranslation,
              localizeName,
            }),
          );
        }

        const result = await transformAsync(code, {
          filename: id,
          sourceMaps: sourceMaps,
          compact: false,
          plugins,
        });

        // Handle diagnostics (only for compile-time mode)
        if (!enableRuntimeICU) {
          if (diagnostics.hasErrors) {
            const errorMessage = diagnostics.formatDiagnostics(
              `Translation errors in ${id}`,
            );
            this.error(errorMessage);
          } else if (diagnostics.messages.length > 0) {
            diagnostics.messages.forEach((msg) => {
              if (msg.type === 'warning') {
                this.warn(`${id}: ${msg.message}`);
              }
            });
          }
        }

        if (!result || !result.code) {
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
