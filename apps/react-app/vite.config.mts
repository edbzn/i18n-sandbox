/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import angularLocalizePlugin from './vite.localize';

const locale = process.env.LOCALE || 'en';

export default defineConfig(({ mode }) => {
  const isDevMode = mode === 'development';

  return {
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/react-app',
    // Only use locale-specific base in production builds
    base: isDevMode ? '/' : `/${locale}/`,
    server: {
      port: 4200,
      host: 'localhost',
    },
    preview: {
      port: 4200,
      host: 'localhost',
    },
    plugins: [
      react(),
      nxViteTsPaths(),
      nxCopyAssetsPlugin(['*.md']),
      // Only use compile-time translations in production
      ...(isDevMode ? [] : [
        angularLocalizePlugin({
          translations: `./src/i18n/${locale}.json`,
          locale,
          missingTranslation: 'warning',
        }),
      ]),
    ],
    // Uncomment this if you are using workers.
    // worker: {
    //   plugins: () => [ nxViteTsPaths() ],
    // },
    build: {
      outDir: '../../dist/apps/react-app/' + locale,
    },
  };
});
