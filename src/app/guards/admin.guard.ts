import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const adminAuth = inject(AdminAuthService);
  const router = inject(Router);

  if (adminAuth.isAuthenticated()) {
    return true;
  }

  // Redirigir al formulario de acceso de administrador pasando la URL de destino
  return router.createUrlTree(['/admin/login'], {
    queryParams: { returnUrl: state.url }
  });
};
