import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'ng-app';
  protected currentLocale: string;
  protected itemCount = 0;
  protected minutes = 0;

  constructor() {
    // Detect current locale from URL
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    this.currentLocale = pathSegments[0] === 'fr' ? 'fr' : 'en';

    // Example of using $localize in code
    console.log('Localized message:', $localize`:@@welcomeTitle:Welcome to Angular`);
  }

  incrementItems() {
    this.itemCount++;
  }

  incrementMinutes() {
    this.minutes++;
  }
}
