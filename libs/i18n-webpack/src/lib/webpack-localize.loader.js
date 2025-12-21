/**
 * Webpack loader for @angular/localize translation
 * Applies Babel transformations to translate $localize templates
 */
const { transformAsync } = require('@babel/core');

module.exports = async function localizeLoader(source) {
  const callback = this.async();
  const options = this.getOptions();
  const {
    translatePlugin,
    localePlugin,
    icuRuntimePlugin,
    diagnostics,
    enableRuntimeICU,
  } = options;

  // Skip files that don't contain $localize
  if (!source.includes('$localize')) {
    return callback(null, source);
  }

  try {
    const plugins = [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
    ];

    if (enableRuntimeICU) {
      // Runtime ICU: convert ICU expressions to runtime calls
      plugins.push(icuRuntimePlugin);
    } else {
      // Compile-time: translate everything at build time
      plugins.push(translatePlugin, localePlugin);
    }

    const result = await transformAsync(source, {
      filename: this.resourcePath,
      sourceMaps: true,
      plugins,
      presets: [['@babel/preset-typescript', { allowDeclareFields: true }]],
    });

    if (!result) {
      return callback(null, source);
    }

    if (!enableRuntimeICU && diagnostics.hasErrors) {
      return callback(
        new Error(diagnostics.formatDiagnostics('Localize translation errors'))
      );
    }

    callback(null, result.code, result.map);
  } catch (error) {
    callback(error);
  }
};
