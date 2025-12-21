const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const AngularLocalizePlugin = require('./webpack.localize');

// Determine the locale from environment variable or default to 'en'
const locale = process.env.LOCALE || 'en';

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/node-app'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ["./src/assets"],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true,
    }),
    new AngularLocalizePlugin({
      translationFile: join(__dirname, `src/i18n/${locale}.json`),
      missingTranslation: 'error',
    }),
  ],
};
