import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { FavoritesService } from '../../services/favorites.service';
import { PfeFooterComponent } from '../../components/pfe-footer/pfe-footer.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PfeFooterComponent],
  template: `
    <div class="min-h-screen flex flex-col justify-between bg-surface font-body-md text-on-surface antialiased">
      
      <!-- Top mini-bar -->
      <div class="w-full py-4 px-6 flex items-center justify-between border-b border-surface-container-high/60 bg-surface-container-lowest/80 backdrop-blur-sm">
        <div class="flex items-center gap-2">
          <a routerLink="/" class="flex items-center gap-2 cursor-pointer">
            <span class="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-black text-xs">PFE</span>
            <span class="font-headline-sm text-sm text-on-surface font-bold tracking-tight">PFE Locaciones</span>
          </a>
        </div>
        <a routerLink="/" class="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">visibility</span>
          <span>Volver a Vista Cliente</span>
        </a>
      </div>

      <!-- Main Login Container -->
      <div class="flex-grow flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <div class="absolute -top-16 -left-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -right-16 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

        <main class="w-full max-w-md p-space-lg bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-surface-container-high relative z-10 text-left">
          
          <div class="flex flex-col items-center text-center mb-6">
            <div class="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-3 shadow-inner">
              <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>

            <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full mb-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span>PFE Core • Portal de Administración</span>
            </div>

            <h1 class="text-2xl font-extrabold text-on-surface">
              Acceso Exclusivo de Administrador
            </h1>
            <p class="text-xs text-on-surface-variant mt-1 max-w-sm">
              Ingresa la Llave Maestra de Seguridad para gestionar proyectos, publicar revisiones oficiales y subir medios.
            </p>
          </div>

          <!-- Form Box -->
          <form (ngSubmit)="handleLogin()" class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-bold text-on-surface" for="admin-key">
                  Llave Maestra de Administrador *
                </label>
                <button (click)="fillDemoAdminKey()" type="button" class="text-xs text-secondary hover:text-primary font-semibold transition-colors cursor-pointer">
                  Autocompletar Demo
                </button>
              </div>

              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">vpn_key</span>
                <input 
                  id="admin-key"
                  type="password"
                  [(ngModel)]="adminKey"
                  name="adminKey"
                  placeholder="PFE-ADMIN-MASTER"
                  class="w-full h-11 pl-10 pr-4 font-mono text-sm tracking-wider uppercase bg-surface-container-low text-on-surface rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
                />
              </div>
            </div>

            <!-- Error message -->
            @if (errorMessage) {
              <div class="p-3 rounded-lg bg-error/10 text-error flex items-center gap-2 text-xs font-medium border border-error/20 animate-in fade-in">
                <span class="material-symbols-outlined text-base">warning</span>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <!-- Loading Spinner -->
            @if (loading) {
              <div class="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2 text-xs font-semibold text-on-surface">
                <div class="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <span>Verificando credenciales con Supabase Auth...</span>
              </div>
            }

            <button 
              type="submit"
              [disabled]="loading"
              class="w-full h-11 bg-primary text-on-primary font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <span class="material-symbols-outlined text-lg">lock_open</span>
              <span>Autenticar y Entrar al Dashboard</span>
            </button>
          </form>

          <!-- Security reassurance -->
          <div class="mt-6 pt-4 border-t border-surface-container-high grid grid-cols-1 gap-2 text-xs text-on-surface-variant">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary text-base">shield</span>
              <span>Protección estricta de rutas con <strong>adminGuard</strong></span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary text-base">lock</span>
              <span>Aislamiento de cuotas de storage en Supabase</span>
            </div>
          </div>

        </main>
      </div>

      <!-- Professional Footer -->
      <app-pfe-footer></app-pfe-footer>

    </div>
  `
})
export class AdminLoginComponent {
  private adminAuth = inject(AdminAuthService);
  private favoritesService = inject(FavoritesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public adminKey: string = '';
  public errorMessage: string = '';
  public loading: boolean = false;

  fillDemoAdminKey() {
    this.adminKey = 'PFE-ADMIN-MASTER';
    this.errorMessage = '';
  }

  handleLogin() {
    if (!this.adminKey) {
      this.errorMessage = 'Ingresa la llave maestra de administrador.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    setTimeout(() => {
      this.loading = false;
      const success = this.adminAuth.login(this.adminKey);
      if (success) {
        this.favoritesService.triggerToast('Sesión administrativa verificada con éxito.');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/admin';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.errorMessage = 'Llave de administrador inválida o revocada. Prueba con PFE-ADMIN-MASTER.';
      }
    }, 400);
  }
}
