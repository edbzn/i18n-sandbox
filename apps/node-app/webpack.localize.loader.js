const {transformAsync} = require('@babel/core');

module.exports = async function localizeLoader(source) {
  const callback = this.async();
  const options = this.getOptions();
  const {translatePlugin, localePlugin, diagnostics} = options;

  // Skip files that don't contain $localize
  if (!source.includes('$localize')) {
    return callback(null, source);
  }

  try {
    const result = await transformAsync(source, {
      filename: this.resourcePath,
      sourceMaps: true,
      plugins: [
        ['@babel/plugin-proposal-decorators', {legacy: true}],
        translatePlugin,
        localePlugin
      ],
      presets: [
        ['@babel/preset-typescript', {allowDeclareFields: true}],
      ],
    });

    if (!result) {
      return callback(null, source);
    }

    if (diagnostics.hasErrors) {
      return callback(new Error(diagnostics.formatDiagnostics('Localize translation errors')));
    }

    callback(null, result.code, result.map);
  } catch (error) {
    callback(error);
  }
};
