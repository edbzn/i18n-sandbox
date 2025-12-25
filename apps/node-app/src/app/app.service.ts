import { Injectable } from '@nestjs/common';
import { loadTranslations } from '@angular/localize';
import { setLocale, setTranslations } from '../i18n-init';

import EN from '../i18n/en.json';
import FR from '../i18n/fr.json';

const locales = {
  en: EN,
  fr: FR,
};

@Injectable()
export class AppService {
  getData(locale: 'en' | 'fr' = 'en', itemCount = 3, minutes = 5): {
    message: string;
    description: string;
    language: string;
    locale: string;
    itemsExample: string;
    timeExample: string;
  } {
    // Load the requested locale
    const localeData = locales[locale] || locales.en;

    // Update the module-scoped variables for ICU runtime evaluation
    setLocale(locale);
    setTranslations(localeData.translations);
    loadTranslations(localeData.translations);

    return {
      message: $localize`:@@api.welcome:Hello API`,
      description: $localize`:@@api.description:This is a Node.js API with internationalization`,
      language: $localize`:@@api.currentLanguage:Current Language: English`,
      locale: locale,
      itemsExample: $localize`:@@api.items.count:{${itemCount}:VAR_PLURAL:, plural, =0 {No items} =1 {One item} other {${itemCount}:INTERPOLATION: items}}`,
      timeExample: $localize`:@@api.minutes.ago:{${minutes}:VAR_PLURAL:, plural, =0 {just now} =1 {one minute ago} other {${minutes}:INTERPOLATION: minutes ago}}`,
    };
  }
}
