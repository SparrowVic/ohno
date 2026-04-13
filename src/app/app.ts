import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppLanguageService } from './core/i18n/app-language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly language = inject(AppLanguageService);

  constructor() {
    this.language.activeLang();
  }
}
