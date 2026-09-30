import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppLanguageService } from './core/i18n/app-language.service';
import { OhnoCommandPalette } from './core/layout/command-palette/command-palette';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OhnoCommandPalette],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly language = inject(AppLanguageService);

  constructor() {
    this.language.activeLang();
  }
}
