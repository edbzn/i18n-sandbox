/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import angularLocalizePlugin from './vite.localize';

const locale = process.env.LOCALE || 'en';

export default defineConfig(() => {
  return {
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/react-app',
    base: `/${locale}/`,
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
      angularLocalizePlugin({
        translations: `./src/i18n/${locale}.json`,
        locale,
        missingTranslation: 'warning',
      }),
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
