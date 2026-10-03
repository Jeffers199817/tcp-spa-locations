import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProjectsService } from '../services/projects.service';
import { AdminAuthService } from '../services/admin-auth.service';

export const clientGuard: CanActivateFn = async (route, state) => {
  const projectsService = inject(ProjectsService);
  const adminAuth = inject(AdminAuthService);
  const router = inject(Router);

  const targetProjectId = route.paramMap.get('id');
  const codeParam = route.queryParamMap.get('code');

  // 1. Administrador autenticado: acceso irrestricto a todos los proyectos
  if (adminAuth.isAuthenticated()) {
    if (targetProjectId) {
      projectsService.selectProjectById(targetProjectId);
    }
    return true;
  }

  // 2. Sesión activa en sessionStorage
  try {
    const sessionCode = sessionStorage.getItem('pfe_client_auth_code');
    const authorizedProjectId = sessionStorage.getItem('pfe_client_authorized_project_id');

    if (sessionCode) {
      const verified = await projectsService.verifyCodeAndLoad(sessionCode);
      if (verified) {
        // En /seleccionadas permitimos el acceso si hay sesión activa
        if (!targetProjectId) {
          return true;
        }

        // En /p/:id verificamos que el ID coincida estrictamente con el proyecto autorizado
        if (verified.id === targetProjectId || authorizedProjectId === targetProjectId) {
          projectsService.selectProjectById(targetProjectId);
          return true;
        } else {
          // Intento de ver otro proyecto no autorizado: BLOQUEAR y enviar a login
          return router.createUrlTree(['/'], {
            queryParams: { 
              project: targetProjectId,
              requireAuth: 'true',
              blockedNotice: 'unauthorized_project'
            }
          });
        }
      }
    }
  } catch {}

  // 3. Si no hay sesión pero viene código en la URL, redirigir a la pantalla de login con código precargado
  return router.createUrlTree(['/'], {
    queryParams: { 
      project: targetProjectId || undefined,
      code: codeParam || undefined,
      requireAuth: 'true' 
    }
  });
};
