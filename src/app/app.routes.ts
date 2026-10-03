import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/client-access/client-access.component').then(m => m.ClientAccessComponent)
  },
  {
    path: 'p/:id',
    loadComponent: () => import('./pages/project-view/project-view.component').then(m => m.ProjectViewComponent)
  },
  {
    path: 'seleccionadas',
    loadComponent: () => import('./pages/selected-media/selected-media.component').then(m => m.SelectedMediaComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/projects/:id/edit',
    loadComponent: () => import('./pages/admin-project-editor/admin-project-editor.component').then(m => m.AdminProjectEditorComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
