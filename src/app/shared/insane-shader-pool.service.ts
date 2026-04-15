import { Injectable, signal } from '@angular/core';

const MAX_ACTIVE_INSANE_SHADERS = 6;

@Injectable({ providedIn: 'root' })
export class InsaneShaderPoolService {
  readonly activeIds = signal<readonly string[]>([]);

  activate(id: string): void {
    this.activeIds.update((current) => {
      if (current.includes(id)) {
        return current;
      }

      if (current.length >= MAX_ACTIVE_INSANE_SHADERS) {
        return current;
      }

      return [...current, id];
    });
  }

  deactivate(id: string): void {
    this.activeIds.update((current) => {
      if (!current.includes(id)) {
        return current;
      }

      return current.filter((entry) => entry !== id);
    });
  }

  has(id: string): boolean {
    return this.activeIds().includes(id);
  }
}
