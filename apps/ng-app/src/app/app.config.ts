import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { appRoutes } from './app.routes';

// Detect locale from URL
const pathSegments = window.location.pathname.split('/').filter(Boolean);
const localeFromPath = pathSegments[0];
const baseHref = (localeFromPath === 'en' || localeFromPath === 'fr')
  ? `/${localeFromPath}/`
  : '/';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    { provide: APP_BASE_HREF, useValue: baseHref }
  ],
};
