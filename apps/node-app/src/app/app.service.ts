import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(itemCount = 3, minutes = 5): {
    message: string;
    description: string;
    language: string;
    itemsExample: string;
    timeExample: string;
  } {
    // Translations are already loaded by the I18nMiddleware
    return {
      message: $localize`:@@api.welcome:Hello API`,
      description: $localize`:@@api.description:This is a Node.js API with internationalization`,
      language: $localize`:@@api.currentLanguage:Current Language: English`,
      itemsExample: $localize`:@@api.items.count:{${itemCount}:VAR_PLURAL:, plural, =0 {No items} =1 {One item} other {${itemCount}:INTERPOLATION: items}}`,
      timeExample: $localize`:@@api.minutes.ago:{${minutes}:VAR_PLURAL:, plural, =0 {just now} =1 {one minute ago} other {${minutes}:INTERPOLATION: minutes ago}}`,
    };
  }
}
