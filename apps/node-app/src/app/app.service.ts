import { Injectable } from '@nestjs/common';
import { loadTranslations } from '@angular/localize';
import EN from '../i18n/en.json';
import FR from '../i18n/fr.json';

const locales = {
  en: EN,
  fr: FR,
};

@Injectable()
export class AppService {
  getData(locale: 'en' | 'fr' = 'en'): { message: string; description: string; language: string; locale: string } {
    // Load the requested locale
    const localeData = locales[locale] || locales.en;
    loadTranslations(localeData.translations);

    return {
      message: $localize`:@@api.welcome:Hello API`,
      description: $localize`:@@api.description:This is a Node.js API with internationalization`,
      language: $localize`:@@api.currentLanguage:Current Language: English`,
      locale: locale,
    };
  }
}
