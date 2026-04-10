import { Routes } from '@angular/router';

export const STRUCTURES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./structures-page/structures-page').then((m) => m.StructuresPage),
  },
];
