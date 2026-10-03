import { ElementRef, Signal, effect, signal } from '@angular/core';

import { PLANE_FALLBACK_BOX, PlaneBox } from './plane-display.utils';

export function observePlaneBox(ref: Signal<ElementRef<HTMLElement> | undefined>): Signal<PlaneBox> {
  const box = signal<PlaneBox>(PLANE_FALLBACK_BOX);
  effect((onCleanup) => {
    const element = ref()?.nativeElement;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry?.contentRect.width ?? 0);
      const height = Math.round(entry?.contentRect.height ?? 0);
      if (width > 0 && height > 0) box.set({ width, height });
    });
    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });
  return box.asReadonly();
}
