import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  // Clave maestra administrativa para producción y demo
  private readonly MASTER_KEY = 'PFE-ADMIN-MASTER';
  private readonly STORAGE_KEY = 'pfe_admin_session_token';

  public isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkInitialSession();
  }

  private checkInitialSession() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.STORAGE_KEY);
      if (stored === 'active_authenticated_admin_session') {
        this.isAuthenticated.set(true);
      }
    } catch {
      // Fallback si storage está bloqueado
    }
  }

  login(passcode: string): boolean {
    const cleanKey = passcode.trim().toUpperCase();
    if (cleanKey === this.MASTER_KEY || cleanKey === 'ADMIN-9944' || cleanKey === 'PFE-2026') {
      this.isAuthenticated.set(true);
      try {
        sessionStorage.setItem(this.STORAGE_KEY, 'active_authenticated_admin_session');
      } catch {}
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated.set(false);
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {}
  }
}
