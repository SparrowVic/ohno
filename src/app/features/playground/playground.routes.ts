import { Routes } from '@angular/router';

export const PLAYGROUND_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./playground-page/playground-page').then((m) => m.PlaygroundPage),
  },
];
