const {readFileSync} = require('node:fs');
const {transformAsync} = require('@babel/core');
const {
  Diagnostics,
  SimpleJsonTranslationParser,
  makeEs2015TranslatePlugin,
  makeLocalePlugin,
} = require('@angular/localize/tools');

// 🌐 i18n tip: Custom Babel plugin for runtime ICU evaluation
// Transforms $localize ICU templates to $localize._icu() calls
function makeICURuntimePlugin(locale, localizeName = '$localize') {
  return {
    visitor: {
      TaggedTemplateExpression(path) {
        const t = require('@babel/types');
        const tag = path.get('tag');
        if (tag.isIdentifier({name: localizeName})) {
          const quasi = path.node.quasi;

          // 🌐 i18n tip: Check if template contains ICU syntax (plural/select/selectordinal)
          const hasICU = quasi.quasis.some((q) =>
            /[:,]\s*(plural|select|selectordinal)/i.test(q.value.raw)
          );

          if (hasICU) {
            // Extract message ID
            const firstPart = quasi.quasis[0].value.raw;
            const idMatch = firstPart.match(/:@@([^:]+):/);
            const messageId = idMatch ? idMatch[1] : '';

            // Build ICU message string and expression map
            let messageStr = '';
            const expressionMap = [];

            quasi.quasis.forEach((element, i) => {
              let raw = element.value.raw;
              // Remove metadata from first part
              if (i === 0) {
                raw = raw.replace(/^:@@[^:]+:/, '');
              } else if (i > 0) {
                // Remove :PLACEHOLDER_NAME: prefix from subsequent parts
                raw = raw.replace(/^:([^:,}]+):/, '');
              }

              if (i < quasi.expressions.length) {
                const expr = quasi.expressions[i];
                // Extract placeholder name from next quasi
                const nextQuasi = quasi.quasis[i + 1];
                const nextRaw = nextQuasi ? nextQuasi.value.raw : '';
                const placeholderMatch = nextRaw.match(/^:([^:,}]+):/);
                const placeholderName = placeholderMatch
                  ? placeholderMatch[1].trim()
                  : `expr_${i}`;
                expressionMap.push({name: placeholderName, expr});

                messageStr += raw + placeholderName;
              } else {
                messageStr += raw;
              }
            });

            // Create runtime ICU call
            const valuesObj = t.objectExpression(
              expressionMap.map((item) =>
                t.objectProperty(t.stringLiteral(item.name), item.expr)
              )
            );

            const runtimeCall = t.callExpression(
              t.memberExpression(
                t.identifier(localizeName),
                t.identifier('_icu')
              ),
              [
                t.stringLiteral(messageId),
                t.stringLiteral(messageStr),
                t.stringLiteral(locale),
                valuesObj,
              ]
            );

            path.replaceWith(runtimeCall);
          }
        }
      },
    },
  };
}

class AngularLocalizePlugin {
  constructor(options) {
    this.options = {
      translationFile: options.translationFile,
      missingTranslation: options.missingTranslation || 'error',
      localizeName: options.localizeName || '$localize',
      include: options.include,
    };

    // Parse translations
    const contents = readFileSync(this.options.translationFile, 'utf-8');
    const parser = new SimpleJsonTranslationParser();
    const analysis = parser.analyze(this.options.translationFile, contents);
    if (!analysis.canParse) {
      throw new Error(analysis.diagnostics.formatDiagnostics(`Cannot parse ${this.options.translationFile}`));
    }
    const {locale, translations, diagnostics: parseDiagnostics} =
      parser.parse(this.options.translationFile, contents, analysis.hint);

    if (parseDiagnostics.hasErrors) {
      throw new Error(parseDiagnostics.formatDiagnostics(`Errors parsing ${this.options.translationFile}`));
    }

    this.locale = locale;
    this.translations = translations;

    // 🌐 i18n tip: Prepare Babel plugins for transformation
    this.diagnostics = new Diagnostics();
    this.translatePlugin = makeEs2015TranslatePlugin(this.diagnostics, this.translations, {
      missingTranslation: this.options.missingTranslation,
      localizeName: this.options.localizeName,
    });
    this.localePlugin = makeLocalePlugin(this.locale, {localizeName: this.options.localizeName});

    // 🌐 i18n tip: Add runtime ICU plugin for plural/select expressions
    this.icuRuntimePlugin = makeICURuntimePlugin(this.locale, this.options.localizeName);
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('AngularLocalizePlugin', (compilation) => {
      const NormalModule = require('webpack/lib/NormalModule');

      // Use the modern hook API
      NormalModule.getCompilationHooks(compilation).loader.tap('AngularLocalizePlugin', (loaderContext, module) => {
        const moduleId = module.resource;

        // Skip non-JS files
        if (!moduleId || !/\.(m?js|jsx|ts|tsx)$/.test(moduleId)) return;

        // Skip node_modules
        if (moduleId.includes('node_modules')) return;

        // Apply custom include filter
        if (this.options.include && !this.options.include(moduleId)) return;

        // Add a custom loader for this module
        module.loaders.push({
          loader: require.resolve('./webpack.localize.loader.js'),
          options: {
            translatePlugin: this.translatePlugin,
            localePlugin: this.localePlugin,
            icuRuntimePlugin: this.icuRuntimePlugin,
            diagnostics: this.diagnostics,
          },
        });
      });

      // Report diagnostics at the end of compilation using modern hook
      compilation.hooks.processAssets.tap(
        {
          name: 'AngularLocalizePlugin',
          stage: compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          if (this.diagnostics.hasErrors) {
            compilation.errors.push(new Error(this.diagnostics.formatDiagnostics('Localize translation errors')));
          } else if (this.diagnostics.messages.length) {
            compilation.warnings.push(new Error(this.diagnostics.formatDiagnostics('Localize translation messages')));
          }
        }
      );
    });
  }
}

module.exports = AngularLocalizePlugin;
