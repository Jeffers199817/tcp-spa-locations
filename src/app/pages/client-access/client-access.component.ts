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
      
      <!-- Top mini-bar -->
      <div class="w-full py-3.5 px-6 flex items-center justify-between border-b border-surface-container-high/60 bg-surface-container-lowest/80 backdrop-blur-sm">
        <app-pfe-logo size="sm"></app-pfe-logo>
        
        <div class="flex items-center gap-3">
          <a routerLink="/admin" class="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container">
            <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span>Acceso Admin</span>
          </a>
        </div>
      </div>

      <!-- Main Login Container -->
      <div class="flex-grow flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <div class="absolute -top-16 -left-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -right-16 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

        <main class="w-full max-w-md p-space-lg bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-surface-container-high relative z-10 text-left">
          
          <!-- VISTA DE ACCESO CON CÓDIGO -->
          <div *ngIf="!unlocked" class="flex flex-col w-full relative">
            <div class="relative z-10 flex flex-col items-center justify-center py-2 w-full text-center">
              
              <!-- Badge Server -->
              <div class="flex items-center gap-space-xs px-3 py-1 bg-surface-container-high rounded-full mb-3 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
                  Servidor Seguro • Nodo PFE-01
                </span>
              </div>

              <!-- Brand Logo Emblem -->
              <div class="mb-4">
                <app-pfe-logo size="lg" [showText]="false"></app-pfe-logo>
              </div>

              <!-- Header Text -->
              <div class="mb-5 w-full">
                <h1 class="font-headline-md text-xl sm:text-2xl text-on-surface font-extrabold tracking-tight mb-1">
                  Acceso Privado a Locaciones
                </h1>
                <p class="font-body-sm text-xs text-on-surface-variant">
                  Proyecto: <span class="font-bold text-on-surface">Campaña Global Verano 2026</span> • PFE Scouting
                </p>
              </div>

              <!-- Notice if direct link had code or redirected -->
              @if (infoNotice) {
                <div class="w-full mb-4 p-2.5 rounded-lg bg-secondary/10 text-secondary text-xs font-semibold flex items-center gap-2 border border-secondary/20">
                  <span class="material-symbols-outlined text-base">info</span>
                  <span>{{ infoNotice }}</span>
                </div>
              }

              <!-- Form Box -->
              <div class="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high relative overflow-hidden text-left">
                
                <!-- NDA Banner -->
                <div class="flex items-center gap-space-sm p-space-sm bg-surface-container-low rounded-lg mb-4">
                  <span class="material-symbols-outlined text-secondary text-lg shrink-0">verified_user</span>
                  <div class="flex flex-col text-left">
                    <span class="font-label-md text-label-md text-on-surface font-bold text-xs">Contrato de Confidencialidad Activo</span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant text-[11px] mt-0.5">
                      Este deck contiene locaciones inéditas protegidas por NDA. El acceso queda registrado con huella digital.
                    </span>
                  </div>
                </div>

                <form (ngSubmit)="handleAuth()" class="space-y-4">
                  <div class="space-y-1 text-left">
                    <div class="flex justify-between items-center">
                      <label class="font-label-md text-label-md text-on-surface font-bold text-xs" for="passcode-input">
                        Código de Acreditación (6-8 caracteres)
                      </label>
                      <button (click)="fillDemoCode()" class="font-label-md text-label-md text-secondary hover:text-primary transition-colors cursor-pointer text-xs font-semibold" type="button">
                        Autocompletar Demo
                      </button>
                    </div>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">key</span>
                      <input 
                        id="passcode-input"
                        type="text"
                        [(ngModel)]="passcode"
                        name="passcode"
                        maxlength="12"
                        (input)="formatInput()"
                        placeholder="LOC-2026-X"
                        autocomplete="off"
                        spellcheck="false"
                        class="w-full h-11 pl-10 pr-4 font-mono text-base font-bold tracking-widest uppercase bg-surface-container-low text-on-surface rounded-lg focus:bg-surface-container-lowest focus:outline-none border border-transparent focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <!-- Direct link copy helper -->
                  <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5">
                    <span>¿Tienes un enlace con código integrado?</span>
                    <button type="button" (click)="copySampleLink()" class="text-primary hover:underline font-semibold cursor-pointer flex items-center gap-0.5">
                      <span class="material-symbols-outlined text-[13px]">link</span>
                      <span>Copiar link de prueba</span>
                    </button>
                  </div>

                  <!-- Spinner -->
                  @if (loading) {
                    <div class="flex items-center gap-space-xs p-space-sm bg-surface-container rounded-lg">
                      <div class="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0"></div>
                      <span class="font-label-md text-label-md text-on-surface text-xs font-semibold">Validando credenciales en Supabase...</span>
                    </div>
                  }

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
                    class="w-full h-11 bg-primary text-on-primary font-bold text-sm rounded-lg flex items-center justify-center gap-space-xs shadow-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span class="material-symbols-outlined text-base">lock_open</span>
                    <span>Ingresar a la Galería</span>
                  </button>
                </form>

                <!-- Badges -->
                <div class="mt-4 pt-3 border-t border-surface-container grid grid-cols-1 gap-1.5 text-left text-xs text-on-surface-variant">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-secondary text-sm">shield</span>
                    <span>Aislamiento estricto de datos por RLS PostgreSQL</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-secondary text-sm">group</span>
                    <span>Selección compartida de favoritos en tiempo real</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-secondary text-sm">history_toggle_off</span>
                    <span>Revisión publicada v2.1 inmutable</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- VISTA DE ACCESO CONFIRMADO / DESBLOQUEADO -->
          <div *ngIf="unlocked" class="flex flex-col w-full py-space-sm space-y-space-md animate-in fade-in text-left">
            <div class="p-space-md bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-space-sm">
                <div class="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-xs">
                  <span class="material-symbols-outlined text-xl">done_all</span>
                </div>
                <div class="flex flex-col">
                  <span class="font-headline-sm text-sm font-bold text-on-secondary-container">Acceso Confirmado</span>
                  <span class="font-body-sm text-xs text-on-secondary-container opacity-90">Sesión autorizada por RLS • Verano 2026</span>
                </div>
              </div>
              <button (click)="lockAgain()" class="font-label-md text-xs bg-surface-container-lowest text-on-surface px-space-sm py-1.5 rounded-lg shadow-sm hover:bg-surface-container cursor-pointer font-bold">
                Salir
              </button>
            </div>

            <div class="grid grid-cols-2 gap-space-sm">
              <div class="p-3 bg-surface-container-low rounded-lg flex flex-col border border-surface-container-high">
                <span class="text-xs text-on-surface-variant">Locaciones Disponibles</span>
                <span class="font-spec-numeral text-on-surface text-lg font-bold">3 Recintos</span>
              </div>
              <div class="p-3 bg-surface-container-low rounded-lg flex flex-col border border-surface-container-high">
                <span class="text-xs text-on-surface-variant">Equipo en Scouting</span>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span class="font-bold text-xs text-on-surface">3 Colaboradores</span>
                </div>
              </div>
            </div>

            <!-- Preview Card -->
            <div class="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col gap-space-sm border border-surface-container-high">
              <div class="flex items-center justify-between px-space-xs">
                <span class="font-bold text-xs text-on-surface">Vista Previa Inmediata</span>
                <span class="font-bold text-xs text-primary">Deck #04-PV</span>
              </div>
              <div class="h-44 rounded-lg bg-surface-container relative overflow-hidden flex items-end p-space-sm bg-cover bg-center shadow-inner"
                   style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAy9EMuNJ2GaP_hzO-fFen3OUMamZcxEqADXl9d3Uvs7F9K8wenkBoy7Zp5rjlLrapMYx-v2AbpewwN7a9kCGz5o3ABk8_sIhYMGnbRHCDmwUbVfSmmIWAAA7lhY-HTw1xQWJcVw7jxXgDDtQeXJe2hRS5u9HG5iGsBK6CWH6bsJDm6qpH4tWkhmYzJEPuvo6qoCcIRMt9HE-0ie1-EVj8MeqRGCcrp2ayNJUuyfzlGJuRL7DnMtj8Y')">
                <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent"></div>
                <div class="relative z-10 text-inverse-on-surface text-left">
                  <span class="font-label-md text-label-md uppercase tracking-wider block text-[10px] text-white/80">Locación Primaria</span>
                  <span class="font-headline-sm text-base block font-bold text-white">Villa Brutalista Pedregal</span>
                  <span class="font-body-sm text-xs opacity-90 text-white/90">Sonido Directo • Trifásica 80A</span>
                </div>
              </div>
            </div>

            <button (click)="goToProject()" class="w-full h-11 bg-primary text-on-primary font-bold text-sm rounded-lg flex items-center justify-center gap-space-xs shadow-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer">
              <span>Explorar Scouting Completo</span>
              <span class="material-symbols-outlined text-base">arrow_forward</span>
            </button>
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
  public unlocked: boolean = false;

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
    if (val.length === 3 && !val.includes('-')) {
      val = val + '-';
    }
    this.passcode = val;
  }

  fillDemoCode() {
    this.passcode = 'LOC-2026-X';
    this.errorMessage = '';
    this.infoNotice = '';
  }

  copySampleLink() {
    const sampleLink = `${window.location.origin}/p/10000000-0000-4000-8000-000000000001?code=LOC-2026-X`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sampleLink);
    }
    this.favoritesService.triggerToast('Enlace directo con código copiado: pásaselo a tus clientes.');
  }

  async handleAuth(isAutoFromUrl: boolean = false) {
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

      if (isAutoFromUrl) {
        this.favoritesService.triggerToast(`Acceso directo validado para ${project.title}`);
        this.router.navigate(['/p', project.id]);
      } else {
        this.unlocked = true;
      }
    } else {
      this.errorMessage = `Código "${this.passcode}" inválido o no autorizado por RLS. Usa LOC-2026-X o LOC-8821.`;
    }
  }

  lockAgain() {
    this.unlocked = false;
    this.passcode = '';
    try {
      sessionStorage.removeItem('pfe_client_auth_code');
    } catch {}
  }

  goToProject() {
    const proj = this.projectsService.currentProject();
    if (proj) {
      this.router.navigate(['/p', proj.id]);
    }
  }
}
