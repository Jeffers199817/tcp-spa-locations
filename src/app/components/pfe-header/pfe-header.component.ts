import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { ProjectsService } from '../../services/projects.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { PfeLogoComponent } from '../pfe-logo/pfe-logo.component';

@Component({
  selector: 'app-pfe-header',
  standalone: true,
  imports: [CommonModule, RouterModule, PfeLogoComponent],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm border-b border-surface-container-high overflow-visible">
      <div class="h-16 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 md:gap-4">
        
        <!-- Brand & Project Selector -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <app-pfe-logo size="md"></app-pfe-logo>

          <div class="h-5 w-px bg-surface-container-highest hidden md:block"></div>

          <!-- Project selector button & dropdown -->
          <div class="relative">
            <button (click)="toggleProjectDropdown()" 
                    class="hidden md:flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container px-2.5 py-1.5 rounded-full transition-colors shrink-0 cursor-pointer" 
                    type="button">
              <span class="font-label-md text-label-md text-on-surface-variant font-medium text-xs">Proyecto:</span>
              <span class="font-label-md text-label-md text-on-surface font-bold text-xs max-w-[150px] truncate">
                {{ currentProjectTitle() }}
              </span>
              <span class="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
            </button>

            <!-- Dropdown projects menu -->
            @if (isProjectDropdownOpen()) {
              <div class="absolute left-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high py-2 z-50 animate-in fade-in zoom-in-95">
                <div class="px-3 py-1.5 border-b border-surface-container text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                  <span>Proyectos Activos ({{ allProjects().length }})</span>
                  <span class="text-[10px] text-primary">RLS Isolado</span>
                </div>
                @for (proj of allProjects(); track proj.id) {
                  <button (click)="selectProject(proj.id)" 
                          class="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer">
                    <div class="flex flex-col truncate pr-2">
                      <span class="font-semibold text-on-surface truncate">{{ proj.title }}</span>
                      <span class="text-[10px] text-on-surface-variant">{{ proj.accessCode }} • v{{ proj.revision }}.0</span>
                    </div>
                    @if (proj.id === currentProjectId()) {
                      <span class="material-symbols-outlined text-primary text-[16px]">check</span>
                    }
                  </button>
                }
              </div>
            }
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden lg:flex items-center gap-1 bg-surface-container-low/70 p-1 rounded-full shrink-0">
          <a routerLink="/p/10000000-0000-4000-8000-000000000001" 
             routerLinkActive="bg-surface-container-lowest text-on-surface shadow-sm font-semibold"
             [routerLinkActiveOptions]="{exact: false}"
             class="px-3.5 py-1 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-xs transition-all">
            Galería
          </a>

          <button (click)="openMapModal()" 
                  class="px-3 py-1 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-xs font-medium transition-colors cursor-pointer">
            Mapa
          </button>

          <button (click)="openDossierModal()" 
                  class="px-3 py-1 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-xs font-medium transition-colors cursor-pointer">
            Dossier
          </button>

          <a routerLink="/seleccionadas" 
             routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm"
             class="px-3.5 py-1 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-xs font-medium transition-colors inline-flex items-center gap-1.5">
            <span>Seleccionadas</span>
            <span class="bg-primary text-on-primary font-spec-numeral text-xs px-2 py-0.5 rounded-full font-bold transition-transform"
                  [class.scale-110]="favCount() > 0">
              {{ favCount() }}
            </span>
          </a>
        </nav>

        <!-- Right Controls & Status -->
        <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          <!-- Botón Rápido: Copiar Enlace Directo para Cliente con Código -->
          <button (click)="copyClientShareLink()" 
                  class="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors cursor-pointer border border-primary/20"
                  title="Copiar enlace con código integrado para compartir con clientes">
            <span class="material-symbols-outlined text-[15px]">share</span>
            <span>Compartir con Código</span>
          </button>

          <!-- Supabase Realtime Sync Indicator -->
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface shrink-0" 
               title="Sincronización WebSocket bidireccional activa">
            <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span class="font-label-md text-label-md text-on-surface-variant font-medium text-xs">Supabase Realtime</span>
          </div>

          <div class="h-5 w-px bg-surface-container-highest hidden sm:block"></div>

          <!-- Quick View Switcher (Cliente vs Admin con Protección) -->
          <div class="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-full shrink-0 text-xs">
            <a routerLink="/p/10000000-0000-4000-8000-000000000001" 
               [class.bg-surface-container-lowest]="isClientView()"
               [class.shadow-sm]="isClientView()"
               [class.font-bold]="isClientView()"
               class="px-2.5 py-1 rounded-full font-label-md text-on-surface transition-all flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px] text-secondary">visibility</span>
              <span class="hidden xs:inline">Vista</span> Cliente
            </a>
            
            <button (click)="handleAdminClick()" 
               [class.bg-surface-container-lowest]="!isClientView()"
               [class.shadow-sm]="!isClientView()"
               [class.font-bold]="!isClientView()"
               class="px-2.5 py-1 rounded-full font-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-[14px]">tune</span>
              Admin
              @if (isAdmin()) {
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Sesión Admin Activa"></span>
              }
            </button>
          </div>

          <!-- User Avatar Profile Menu -->
          <div class="relative">
            <button (click)="toggleProfileMenu()" 
                    class="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface shrink-0 shadow-sm cursor-pointer" 
                    title="Perfil de Usuario" 
                    type="button">
              <span class="material-symbols-outlined text-[18px] text-primary">account_circle</span>
            </button>

            @if (isProfileMenuOpen()) {
              <div class="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high p-3 z-50 animate-in fade-in zoom-in-95 text-left">
                <div class="flex items-center gap-2.5 pb-2.5 border-b border-surface-container">
                  <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {{ isAdmin() ? 'ADM' : 'CLI' }}
                  </div>
                  <div class="flex flex-col truncate">
                    <span class="font-bold text-xs text-on-surface">{{ isAdmin() ? 'Administrador PFE' : 'Cliente Autorizado' }}</span>
                    <span class="text-[10px] text-on-surface-variant">Nodo PFE-01 • RLS Activo</span>
                  </div>
                </div>

                <div class="py-2 text-[11px] text-on-surface-variant flex flex-col gap-1.5">
                  <div class="flex justify-between">
                    <span>Estado Admin:</span>
                    <span class="font-bold" [class.text-emerald-600]="isAdmin()" [class.text-amber-600]="!isAdmin()">
                      {{ isAdmin() ? 'Autenticado' : 'Protegido (Requiere Llave)' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span>Código Proyecto:</span>
                    <span class="font-bold text-on-surface font-mono">{{ currentProject()?.accessCode }}</span>
                  </div>
                </div>

                <div class="pt-2 border-t border-surface-container flex flex-col gap-1.5">
                  <button (click)="copyClientShareLink()" class="text-xs text-secondary font-semibold hover:underline flex items-center gap-1 w-full text-left cursor-pointer">
                    <span class="material-symbols-outlined text-[14px]">link</span>
                    <span>Copiar Enlace con Código</span>
                  </button>

                  @if (isAdmin()) {
                    <button (click)="logoutAdmin()" class="text-xs text-error font-semibold hover:underline flex items-center gap-1 w-full text-left cursor-pointer">
                      <span class="material-symbols-outlined text-[14px]">logout</span>
                      <span>Cerrar Sesión de Administrador</span>
                    </button>
                  } @else {
                    <a routerLink="/admin/login" (click)="isProfileMenuOpen.set(false)" class="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">key</span>
                      <span>Ingresar como Administrador</span>
                    </a>
                  }
                </div>
              </div>
            }
          </div>

        </div>

      </div>
    </header>

    <!-- Modal Informativo de Mapa de Producción -->
    @if (isMapModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div class="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4 text-left">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-secondary font-bold text-sm">
              <span class="material-symbols-outlined text-[20px]">explore</span>
              <span>Mapa Satelital de Locaciones Técnicas</span>
            </div>
            <button (click)="isMapModalOpen.set(false)" class="text-on-surface-variant hover:text-on-surface cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="h-56 bg-surface-container-low rounded-xl flex flex-col items-center justify-center p-4 text-center border border-dashed border-outline-variant relative overflow-hidden">
            <span class="material-symbols-outlined text-4xl text-secondary mb-2 animate-bounce">location_on</span>
            <h4 class="font-bold text-sm text-on-surface">Coordenadas y Logística de Rodaje</h4>
            <p class="text-xs text-on-surface-variant mt-1 max-w-sm">
              Visualización de radios de estacionamiento para camiones 10T, acometidas trifásicas y rutas de acceso para las 3 locaciones del proyecto.
            </p>
            <div class="mt-3 flex items-center gap-2 text-[11px] font-semibold text-tertiary bg-white px-3 py-1 rounded-full shadow-sm">
              <span>📍 Pedregal (19.3242° N, 99.2014° W) • San Telmo • Coyoacán</span>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button (click)="isMapModalOpen.set(false)" class="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs shadow-sm hover:brightness-105 cursor-pointer">
              Entendido
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Dossier PDF -->
    @if (isDossierModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div class="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4 text-left">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-primary font-bold text-sm">
              <span class="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              <span>Dossier Técnico Ejecutivo</span>
            </div>
            <button (click)="isDossierModalOpen.set(false)" class="text-on-surface-variant hover:text-on-surface cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <p class="text-xs text-on-surface-variant">
            Generando compilación en alta resolución con fichas técnicas, orientación solar, capacidad eléctrica y permisos municipales para <strong>{{ currentProjectTitle() }}</strong>.
          </p>
          <div class="p-3 bg-surface-container-low rounded-lg text-xs space-y-1">
            <div class="flex justify-between font-medium"><span>Versión:</span><span class="font-bold">v2.1 Inmutable</span></div>
            <div class="flex justify-between font-medium"><span>Locaciones Incluidas:</span><span class="font-bold">3 Recintos</span></div>
            <div class="flex justify-between font-medium"><span>Activos Curados:</span><span class="font-bold">{{ favCount() }} Seleccionadas</span></div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button (click)="isDossierModalOpen.set(false)" class="px-3.5 py-1.5 rounded-lg border border-surface-container-highest text-xs font-semibold hover:bg-surface-container cursor-pointer">
              Cancelar
            </button>
            <button (click)="simulateDossierDownload()" class="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs shadow-sm hover:brightness-105 flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">download</span>
              <span>Descargar PDF (24.8 MB)</span>
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class PfeHeaderComponent {
  private favoritesService = inject(FavoritesService);
  private projectsService = inject(ProjectsService);
  private adminAuth = inject(AdminAuthService);
  private router = inject(Router);

  public favCount = computed(() => this.favoritesService.count());
  public currentProject = computed(() => this.projectsService.currentProject());
  public currentProjectTitle = computed(() => this.currentProject()?.title || 'Campaña Global Verano 2026');
  public currentProjectId = computed(() => this.currentProject()?.id || '10000000-0000-4000-8000-000000000001');
  public allProjects = computed(() => this.projectsService.allProjects());
  public isAdmin = computed(() => this.adminAuth.isAuthenticated());

  public isProjectDropdownOpen = signal<boolean>(false);
  public isProfileMenuOpen = signal<boolean>(false);
  public isMapModalOpen = signal<boolean>(false);
  public isDossierModalOpen = signal<boolean>(false);

  public isClientView = computed(() => {
    return !this.router.url.startsWith('/admin');
  });

  handleAdminClick() {
    if (this.adminAuth.isAuthenticated()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/admin/login'], { queryParams: { returnUrl: '/admin' } });
    }
  }

  logoutAdmin() {
    this.adminAuth.logout();
    this.isProfileMenuOpen.set(false);
    this.favoritesService.triggerToast('Sesión de administrador cerrada.');
    this.router.navigate(['/']);
  }

  copyClientShareLink() {
    const proj = this.currentProject();
    const code = proj?.accessCode || 'LOC-2026-X';
    const link = `${window.location.origin}/p/${this.currentProjectId()}?code=${code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    this.favoritesService.triggerToast(`Enlace directo con código (${code}) copiado al portapapeles.`);
    this.isProfileMenuOpen.set(false);
  }

  toggleProjectDropdown() {
    this.isProjectDropdownOpen.update(v => !v);
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen.update(v => !v);
  }

  selectProject(projectId: string) {
    const p = this.allProjects().find(x => x.id === projectId);
    if (p) {
      this.projectsService.currentProject.set(p);
    }
    this.isProjectDropdownOpen.set(false);
  }

  openMapModal() {
    this.isMapModalOpen.set(true);
  }

  openDossierModal() {
    this.isDossierModalOpen.set(true);
  }

  simulateDossierDownload() {
    this.isDossierModalOpen.set(false);
    this.favoritesService.triggerToast('Compilación de Dossier PDF generada exitosamente.');
  }
}
