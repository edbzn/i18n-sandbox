import { Injectable, NestMiddleware } from '@nestjs/common';
import { loadTranslations } from '@angular/localize';
import { setLocale, setTranslations } from '../i18n-init';

import EN from '../i18n/en.json';
import FR from '../i18n/fr.json';

const locales = {
  en: EN,
  fr: FR,
};

@Injectable()
export class I18nMiddleware implements NestMiddleware {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  use(req: any, res: any, next: () => void) {
    // Extract locale from path (e.g., /api/fr, /api/en)
    const pathLocale = req.path.split('/')[2]; // Assuming /api/{locale}
    const locale = pathLocale && (pathLocale === 'en' || pathLocale === 'fr') 
      ? pathLocale 
      : 'en';

    // Load translations for this request
    const localeData = locales[locale];
    setLocale(locale);
    setTranslations(localeData.translations);
    loadTranslations(localeData.translations);

    // Store locale in request for use in controllers/services
    req.locale = locale;

    next();
  }
}
