import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { NavigationError } from '@angular/router';

import { claimChunkReload, isChunkLoadError, ReloadStorage, sameOriginPath } from './chunk-reload.utils';

function sessionStorageOf(view: Window): ReloadStorage | null {
  try {
    return view.sessionStorage;
  } catch {
    return null;
  }
}

export function reloadOnChunkLoadError(error: NavigationError): void {
  if (!isChunkLoadError(error.error)) return;
  const view = inject(DOCUMENT).defaultView;
  if (!view) return;
  const target = sameOriginPath(error.url, view.location.origin);
  if (!target || !claimChunkReload(sessionStorageOf(view), target, Date.now())) return;
  view.location.assign(target);
}
