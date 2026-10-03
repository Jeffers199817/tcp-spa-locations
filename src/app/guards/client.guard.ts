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

  // 1. Si es un administrador autenticado, permitir acceso a cualquier proyecto
  if (adminAuth.isAuthenticated()) {
    if (targetProjectId) {
      projectsService.selectProjectById(targetProjectId);
    }
    return true;
  }

  // 2. Si viene con código en la URL (ej: /p/:id?code=LOC-2026-X)
  if (codeParam) {
    const verified = await projectsService.verifyCodeAndLoad(codeParam);
    if (verified) {
      // Si la URL especifica un proyecto, verificar que coincida con el código ingresado
      if (!targetProjectId || verified.id === targetProjectId) {
        return true;
      }
    }
  }

  // 3. Si hay un código de sesión activa guardado en sessionStorage
  try {
    const sessionCode = sessionStorage.getItem('pfe_client_auth_code');
    if (sessionCode) {
      const verified = await projectsService.verifyCodeAndLoad(sessionCode);
      if (verified) {
        // En /seleccionadas permitimos si hay sesión activa; en /p/:id verificamos correspondencia
        if (!targetProjectId || verified.id === targetProjectId) {
          return true;
        }
      }
    }
  } catch {}

  // 4. Sin sesión autorizada o código inválido: redirigir a pantalla de login
  return router.createUrlTree(['/'], {
    queryParams: { returnUrl: state.url, requireAuth: 'true' }
  });
};
