import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { FavoritesService } from '../../services/favorites.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { PfeFooterComponent } from '../../components/pfe-footer/pfe-footer.component';
import { PfeLogoComponent } from '../../components/pfe-logo/pfe-logo.component';

@Component({
  selector: 'app-client-access',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PfeFooterComponent, PfeLogoComponent],
  template: `
    <div class="min-h-screen flex flex-col justify-between bg-surface font-body-md text-on-surface antialiased">
      
      <!-- Top mini-bar con acceso claro a Admin y Cliente -->
      <div class="w-full py-3.5 px-6 flex items-center justify-between border-b border-surface-container-high/60 bg-surface-container-lowest/80 backdrop-blur-sm">
        <app-pfe-logo size="sm"></app-pfe-logo>
        
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Portal de Locaciones</span>
          </div>
          <a routerLink="/admin/login" 
             class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all border border-surface-container-high shadow-xs cursor-pointer">
            <span class="material-symbols-outlined text-[16px] text-primary">admin_panel_settings</span>
            <span>Acceso Administrador</span>
          </a>
        </div>
      </div>

      <!-- Main Login Container -->
      <div class="flex-grow flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <div class="absolute -top-16 -left-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -right-16 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

        <main class="w-full max-w-md p-6 sm:p-8 bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-surface-container-high relative z-10 text-left">
          
          <div class="flex flex-col items-center justify-center py-1 w-full text-center">
            
            <!-- Brand Logo Emblem -->
            <div class="mb-4">
              <app-pfe-logo size="lg" [showText]="false"></app-pfe-logo>
            </div>

            <!-- Header Text -->
            <div class="mb-6 w-full">
              <h1 class="font-headline-md text-2xl text-on-surface font-extrabold tracking-tight mb-1.5">
                Acceso a Locaciones
              </h1>
              <p class="font-body-sm text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                Ingresa el código confidencial asignado por la productora para acceder al catálogo técnico del proyecto.
              </p>
            </div>

            <!-- Notice if direct link had code or redirected -->
            @if (infoNotice) {
              <div class="w-full mb-4 p-3 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center gap-2 border border-primary/20 text-left">
                <span class="material-symbols-outlined text-base">info</span>
                <span>{{ infoNotice }}</span>
              </div>
            }

            <!-- Form Box -->
            <form (ngSubmit)="handleAuth()" class="w-full space-y-4 text-left">
              <div>
                <div class="flex justify-between items-center mb-1.5">
                  <label class="font-label-md text-on-surface font-bold text-xs" for="passcode-input">
                    Código de Acreditación
                  </label>
                  <button (click)="fillDemoCode()" class="text-secondary hover:text-primary transition-colors cursor-pointer text-xs font-semibold" type="button">
                    Código Demo
                  </button>
                </div>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">key</span>
                  <input 
                    id="passcode-input"
                    type="text"
                    [(ngModel)]="passcode"
                    name="passcode"
                    maxlength="14"
                    (input)="formatInput()"
                    placeholder="LOC-XXXX"
                    autocomplete="off"
                    spellcheck="false"
                    class="w-full h-12 pl-11 pr-4 font-mono text-base font-bold tracking-widest uppercase bg-surface-container-low text-on-surface rounded-xl focus:bg-surface-container-lowest focus:outline-none border border-transparent focus:border-primary transition-all shadow-inner"
                  />
                </div>
              </div>

              <!-- Error message -->
              @if (errorMessage) {
                <div class="p-3 bg-error-container text-on-error-container rounded-lg flex items-center gap-2 text-xs font-medium border border-error/20 animate-in fade-in">
                  <span class="material-symbols-outlined text-base text-error">warning</span>
                  <span>{{ errorMessage }}</span>
                </div>
              }

              <!-- Submit button -->
              <button 
                type="submit"
                [disabled]="loading"
                class="w-full h-12 bg-primary text-on-primary font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                @if (loading) {
                  <div class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Verificando Acreditación...</span>
                } @else {
                  <span class="material-symbols-outlined text-base">lock_open</span>
                  <span>Ingresar a la Galería</span>
                }
              </button>
            </form>

            <!-- Discreto aviso NDA al pie de la tarjeta -->
            <div class="mt-6 pt-4 border-t border-surface-container-high/80 w-full flex items-center justify-center gap-2 text-[11px] text-on-surface-variant">
              <span class="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
              <span>Material confidencial protegido por acuerdos de reserva (NDA).</span>
            </div>

          </div>

        </main>
      </div>

      <!-- Professional Footer -->
      <app-pfe-footer></app-pfe-footer>

    </div>
  `
})
export class ClientAccessComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private favoritesService = inject(FavoritesService);
  private adminAuth = inject(AdminAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public passcode: string = '';
  public errorMessage: string = '';
  public infoNotice: string = '';
  public loading: boolean = false;

  async ngOnInit() {
    // 1. Verificar si viene código directo por query parameter (ej: ?code=LOC-2026-X)
    const codeParam = this.route.snapshot.queryParamMap.get('code');
    const requireAuth = this.route.snapshot.queryParamMap.get('requireAuth');

    if (requireAuth === 'true') {
      this.infoNotice = 'Se requiere autenticación de proyecto para acceder al material privado.';
    }

    if (codeParam) {
      this.passcode = codeParam;
      this.infoNotice = `Validando código de enlace directo: ${codeParam}...`;
      await this.handleAuth(true);
    }
  }

  formatInput() {
    let val = this.passcode.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (val.startsWith('LOC') && val.length === 3 && !val.includes('-')) {
      val = val + '-';
    }
    this.passcode = val;
  }

  fillDemoCode() {
    this.passcode = 'LOC-2026-X';
    this.errorMessage = '';
    this.infoNotice = '';
  }

  async handleAuth(isAutoFromUrl: boolean = false) {
    const clean = this.passcode.trim().toUpperCase();

    // Acceso administrativo directo si se ingresa la clave de admin
    if (clean === 'ADMIN' || clean === 'PFE-ADMIN-MASTER' || clean === 'ADM-IN') {
      this.adminAuth.login('PFE-ADMIN-MASTER');
      this.favoritesService.triggerToast('Sesión de Administrador PFE Core activada.');
      this.router.navigate(['/admin']);
      return;
    }

    if (!this.passcode || this.passcode.length < 5) {
      this.errorMessage = 'Ingresa un código válido (ej. LOC-2026-X o LOC-8821).';
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    const project = await this.projectsService.verifyCodeAndLoad(this.passcode);
    this.loading = false;

    if (project) {
      try {
        sessionStorage.setItem('pfe_client_auth_code', this.passcode.toUpperCase());
      } catch {}

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      this.favoritesService.triggerToast(`Acceso autorizado a ${project.title}`);
      if (returnUrl) {
        this.router.navigateByUrl(returnUrl);
      } else {
        this.router.navigate(['/p', project.id]);
      }
    } else {
      this.errorMessage = `Código "${this.passcode}" no reconocido o no autorizado. Solicita acceso a tu coordinador de producción.`;
    }
  }
}
