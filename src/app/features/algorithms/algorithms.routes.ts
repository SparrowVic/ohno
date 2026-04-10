import { Routes } from '@angular/router';

export const ALGORITHMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./algorithms-page/algorithms-page').then((m) => m.AlgorithmsPage),
  },
];
