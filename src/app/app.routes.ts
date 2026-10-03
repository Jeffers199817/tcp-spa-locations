import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { clientGuard } from './guards/client.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/client-access/client-access.component').then(m => m.ClientAccessComponent)
  },
  {
    path: 'p/:id',
    canActivate: [clientGuard],
    loadComponent: () => import('./pages/project-view/project-view.component').then(m => m.ProjectViewComponent)
  },
  {
    path: 'seleccionadas',
    canActivate: [clientGuard],
    loadComponent: () => import('./pages/selected-media/selected-media.component').then(m => m.SelectedMediaComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/projects/:id/edit',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin-project-editor/admin-project-editor.component').then(m => m.AdminProjectEditorComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
