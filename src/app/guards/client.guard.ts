import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProjectsService } from '../services/projects.service';

export const clientGuard: CanActivateFn = async (route, state) => {
  const projectsService = inject(ProjectsService);
  const router = inject(Router);

  // 1. Verificar si viene con código en la URL (ej: ?code=LOC-2026-X)
  const codeParam = route.queryParamMap.get('code');
  if (codeParam) {
    const verified = await projectsService.verifyCodeAndLoad(codeParam);
    if (verified) {
      return true;
    }
  }

  // 2. Verificar si ya hay un proyecto activo autenticado
  if (projectsService.currentProject()) {
    return true;
  }

  // 3. Verificar si hay un código guardado en la sesión
  try {
    const sessionCode = sessionStorage.getItem('pfe_client_auth_code');
    if (sessionCode) {
      const verified = await projectsService.verifyCodeAndLoad(sessionCode);
      if (verified) {
        return true;
      }
    }
  } catch {}

  // 4. Si no tiene acreditación, redirigir a la pantalla de acceso
  return router.createUrlTree(['/'], {
    queryParams: { returnUrl: state.url, requireAuth: 'true' }
  });
};
