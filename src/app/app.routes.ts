import { Routes } from '@angular/router';

import { Shell } from './core/layout/shell/shell';

export const routes: Routes = [
  {
    path: 'algorithms/:id',
    loadComponent: () =>
      import('./features/algorithms/algorithm-detail/algorithm-detail').then(
        (m) => m.AlgorithmDetail,
      ),
  },
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
    ],
  },
  { path: '**', redirectTo: '' },
];
