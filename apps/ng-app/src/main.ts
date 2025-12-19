import { loadTranslations } from '@angular/localize';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import EN from './i18n/en.json';
import FR from './i18n/fr.json';

// Detect locale from URL path
const pathSegments = window.location.pathname.split('/').filter(Boolean);
const localeFromPath = pathSegments[0];

let currentLocale = EN;
if (localeFromPath === 'fr') {
  currentLocale = FR;
} else if (localeFromPath === 'en') {
  currentLocale = EN;
}

// Load translations
loadTranslations(currentLocale.translations);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
