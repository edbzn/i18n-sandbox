const {readFileSync} = require('node:fs');
const {transformAsync} = require('@babel/core');
const {
  Diagnostics,
  SimpleJsonTranslationParser,
  makeEs2015TranslatePlugin,
  makeLocalePlugin,
} = require('@angular/localize/tools');

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

    // Prepare Babel plugins
    this.diagnostics = new Diagnostics();
    this.translatePlugin = makeEs2015TranslatePlugin(this.diagnostics, this.translations, {
      missingTranslation: this.options.missingTranslation,
      localizeName: this.options.localizeName,
    });
    this.localePlugin = makeLocalePlugin(this.locale, {localizeName: this.options.localizeName});
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
