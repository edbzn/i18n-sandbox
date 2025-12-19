import '@angular/localize/init';
import { loadTranslations } from '@angular/localize';

import EN from './i18n/en.json';
import FR from './i18n/fr.json';

export const initTranslations = () => {
  // You can switch between EN and FR here or use environment variable
  const currentLocale = EN; // Change to FR for French

  console.log('Loading translations:', currentLocale);
  console.log('Translations object:', currentLocale.translations);

  loadTranslations(currentLocale.translations);

  // Verify translations are loaded
  const testMessage = $localize`:@@api.welcome:Hello API`;
  console.log('Test translation:', testMessage);
};
