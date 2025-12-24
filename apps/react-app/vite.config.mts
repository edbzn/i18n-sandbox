/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { angularLocalize } from '../../libs/i18n-vite/src';

// 🌐 i18n tip: Set locale via LOCALE env var for production builds
// Dev: nx serve (single build, all locales via routing)
// Prod: LOCALE=en nx build (separate build per locale in dist/apps/react-app/{locale}/)
const locale = process.env.LOCALE || 'en';

export default defineConfig(({ mode }) => {
  const isDevMode = mode === 'development';

  return {
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/react-app',

    // 🌐 i18n tip: Dev uses '/' (routing handles locales), prod uses '/{locale}/' (separate builds)
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

      angularLocalize({
        translations: `./src/i18n/${locale}.json`,
        locale: locale,
        missingTranslation: 'warning',
        production: !isDevMode,
        enableRuntimeICU: true,
      }),
    ],
    build: {
      // 🌐 i18n tip: Each locale builds to its own directory
      outDir: '../../dist/apps/react-app/' + locale,
    },
  };
});
