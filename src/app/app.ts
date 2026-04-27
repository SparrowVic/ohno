import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppLanguageService } from './core/i18n/app-language.service';
import { BgEnergyLayer } from './core/layout/bg-energy-layer/bg-energy-layer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BgEnergyLayer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly language = inject(AppLanguageService);

  constructor() {
    this.language.activeLang();
  }
}
