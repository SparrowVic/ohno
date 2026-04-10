import { Routes } from '@angular/router';

import { Shell } from './core/layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'algorithms', pathMatch: 'full' },
      {
        path: 'algorithms',
        loadChildren: () =>
          import('./features/algorithms/algorithms.routes').then((m) => m.ALGORITHMS_ROUTES),
      },
      {
        path: 'structures',
        loadChildren: () =>
          import('./features/structures/structures.routes').then((m) => m.STRUCTURES_ROUTES),
      },
      {
        path: 'playground',
        loadChildren: () =>
          import('./features/playground/playground.routes').then((m) => m.PLAYGROUND_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'algorithms' },
];
