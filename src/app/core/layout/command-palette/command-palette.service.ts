import { Injectable, Signal, signal } from '@angular/core';

export type PaletteMode = 'search' | 'shortcuts';

@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  private readonly openState = signal(false);
  private readonly modeState = signal<PaletteMode>('search');

  readonly open: Signal<boolean> = this.openState.asReadonly();
  readonly mode: Signal<PaletteMode> = this.modeState.asReadonly();

  openSearch(): void {
    this.modeState.set('search');
    this.openState.set(true);
  }

  openShortcuts(): void {
    this.modeState.set('shortcuts');
    this.openState.set(true);
  }

  close(): void {
    this.openState.set(false);
  }

  toggle(): void {
    if (this.openState()) this.close();
    else this.openSearch();
  }
}
