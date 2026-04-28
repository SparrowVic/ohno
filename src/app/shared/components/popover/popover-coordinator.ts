import { Injectable } from '@angular/core';

export interface PopoverRegistration {
  activate(): void;
  unregister(): void;
}

@Injectable({ providedIn: 'root' })
export class PopoverCoordinator {
  private nextId = 0;
  private readonly closeHandlers = new Map<number, () => void>();

  register(close: () => void): PopoverRegistration {
    const id = ++this.nextId;
    this.closeHandlers.set(id, close);

    return {
      activate: () => this.closeOthers(id),
      unregister: () => this.closeHandlers.delete(id),
    };
  }

  private closeOthers(activeId: number): void {
    for (const [id, close] of Array.from(this.closeHandlers.entries())) {
      if (id === activeId) continue;
      close();
    }
  }
}
