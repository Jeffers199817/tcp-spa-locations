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
              <div class="absolute left-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high py-2 z-50 animate-in fade-in zoom-in-95">
                <div class="px-3 py-1.5 border-b border-surface-container text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                  <span>Proyectos ({{ allProjects().length }})</span>
                  <span class="text-[10px] text-primary font-medium">{{ isAdmin() ? 'Acceso Admin Total' : 'Acreditación Única' }}</span>
                </div>
                @for (proj of allProjects(); track proj.id) {
                  @if (isAdmin() || proj.id === currentProjectId()) {
                    <button (click)="selectProject(proj.id)" 
                            class="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
                            [class.bg-surface-container-low]="proj.id === currentProjectId()">
                      <div class="flex flex-col truncate pr-2">
                        <span class="font-bold text-on-surface truncate">{{ proj.title }}</span>
                        <span class="text-[10px] text-on-surface-variant">{{ proj.accessCode }} • v{{ proj.revision }}.0</span>
                      </div>
                      @if (proj.id === currentProjectId()) {
                        <span class="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      }
                    </button>
                  } @else {
                    <!-- Proyecto Bloqueado para el Cliente -->
                    <div (click)="handleBlockedProjectClick(proj)"
                         class="w-full text-left px-3 py-2 text-xs flex items-center justify-between opacity-55 bg-surface-container-low/40 border-b border-surface-container/40 cursor-not-allowed select-none group">
                      <div class="flex flex-col truncate pr-2">
                        <div class="flex items-center gap-1.5 text-on-surface-variant">
                          <span class="material-symbols-outlined text-[15px] text-amber-500">lock</span>
                          <span class="font-medium truncate">{{ proj.title }}</span>
                        </div>
                        <span class="text-[9px] text-amber-600 font-semibold pl-5">Bloqueado • Requiere código NDA</span>
                      </div>
                      <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20">Restringido</span>
                    </div>
                  }
                }
              </div>
            }
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden lg:flex items-center gap-1 bg-surface-container-low/70 p-1 rounded-full shrink-0">
          <a [routerLink]="['/p', currentProjectId()]" 
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
          
          <!-- Botón Rápido: Solo visible para Administrador autenticado -->
          @if (isAdmin()) {
            <button (click)="copyClientShareLink()" 
                    class="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors cursor-pointer border border-primary/20"
                    title="Copiar enlace a la pantalla de login con código para clientes">
              <span class="material-symbols-outlined text-[15px]">share</span>
              <span>Generar Link Login</span>
            </button>
          }

          <!-- Sincronización en vivo -->
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface shrink-0" 
               title="Sincronización en tiempo real activa">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-label-md text-label-md text-on-surface-variant font-medium text-xs">En Vivo</span>
          </div>

          <div class="h-5 w-px bg-surface-container-highest hidden sm:block"></div>

          <!-- Quick View Switcher (Solo visible si el usuario ya es Administrador autenticado) -->
          @if (isAdmin()) {
            <div class="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-full shrink-0 text-xs">
              <a [routerLink]="['/p', currentProjectId()]" 
                 [class.bg-surface-container-lowest]="isClientView()"
                 [class.shadow-sm]="isClientView()"
                 [class.font-bold]="isClientView()"
                 class="px-2.5 py-1 rounded-full font-label-md text-on-surface transition-all flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px] text-secondary">visibility</span>
                <span class="hidden xs:inline">Vista</span> Cliente
              </a>
              
              <a routerLink="/admin" 
                 [class.bg-surface-container-lowest]="!isClientView()"
                 [class.shadow-sm]="!isClientView()"
                 [class.font-bold]="!isClientView()"
                 class="px-2.5 py-1 rounded-full font-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 cursor-pointer">
                <span class="material-symbols-outlined text-[14px]">tune</span>
                Admin
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Sesión Admin Activa"></span>
              </a>
            </div>
          }

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
                    <span class="text-[10px] text-on-surface-variant">Acceso Verificado • Privado</span>
                  </div>
                </div>

                <div class="py-2 text-[11px] text-on-surface-variant flex flex-col gap-1.5">
                  <div class="flex justify-between">
                    <span>Código Proyecto:</span>
                    <span class="font-bold text-on-surface font-mono">{{ currentProject()?.accessCode }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Revisión:</span>
                    <span class="font-semibold text-secondary">v{{ currentProject()?.revision }}.0 Oficial</span>
                  </div>
                </div>

                <div class="pt-2 border-t border-surface-container flex flex-col gap-1.5">
                  @if (isAdmin()) {
                    <button (click)="copyClientShareLink()" class="text-xs text-secondary font-semibold hover:underline flex items-center gap-1 w-full text-left cursor-pointer">
                      <span class="material-symbols-outlined text-[14px]">link</span>
                      <span>Copiar Enlace con Código</span>
                    </button>
                  }

                  @if (isAdmin()) {
                    <button (click)="logoutAdmin()" class="text-xs text-error font-semibold hover:underline flex items-center gap-1 w-full text-left cursor-pointer">
                      <span class="material-symbols-outlined text-[14px]">logout</span>
                      <span>Cerrar Sesión de Administrador</span>
                    </button>
                  } @else {
                    <button (click)="logoutClient()" class="text-xs text-error font-semibold hover:underline flex items-center gap-1 w-full text-left cursor-pointer">
                      <span class="material-symbols-outlined text-[14px]">lock</span>
                      <span>Salir de la Galería</span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>

        </div>

      </div>
    </header>

    <!-- Modal Interactivo de Mapa de Producción por Proyecto -->
    @if (isMapModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in" (click)="isMapModalOpen.set(false)">
        <div class="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4 text-left max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          
          <!-- Header del Mapa Específico del Proyecto -->
          <div class="flex items-start justify-between pb-3 border-b border-surface-container-high">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center border border-secondary/20">
                <span class="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-secondary">
                  Mapa Satelital de Producción • {{ currentProjectTitle() }}
                </span>
                <h3 class="font-extrabold text-base text-on-surface flex items-center gap-1.5 mt-0.5">
                  <span>{{ projectMapConfig()?.regionName || 'Región Técnica de Rodaje' }}</span>
                </h3>
              </div>
            </div>
            <button (click)="isMapModalOpen.set(false)" class="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center cursor-pointer transition-colors">
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <!-- Contenedor del Mapa Visual e Interactivo del Proyecto -->
          <div class="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex flex-col justify-between p-4 group">
            
            <!-- Fondo Satelital / Radar Cinematográfico con Grid Dinámico -->
            <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none"></div>

            <!-- Top Overlay: GPS Info & Style Tag -->
            <div class="relative z-10 flex items-center justify-between text-xs text-white">
              <div class="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="font-mono text-[11px] font-bold">
                  {{ projectMapConfig()?.centerLat || 19.3242 }}° N, {{ projectMapConfig()?.centerLng || -99.2014 }}° W
                </span>
              </div>
              <span class="px-2.5 py-0.5 rounded-full bg-primary/80 backdrop-blur-md text-white font-mono text-[10px] uppercase font-bold">
                Modo: {{ projectMapConfig()?.mapStyle || 'cinematic' }}
              </span>
            </div>

            <!-- Visual Markers Pins on Canvas -->
            <div class="relative z-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 my-auto">
              @for (marker of projectMapConfig()?.markers || []; track marker.name; let mIdx = $index) {
                <div class="flex flex-col items-center gap-1 group/pin cursor-pointer transition-transform hover:scale-110">
                  <div class="relative flex items-center justify-center">
                    <span class="absolute w-8 h-8 rounded-full bg-primary/30 animate-ping"></span>
                    <div class="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold">
                      <span class="material-symbols-outlined text-[18px]">location_on</span>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 whitespace-nowrap shadow-md">
                    {{ marker.name }}
                  </span>
                </div>
              }
            </div>

            <!-- Bottom Map Bar -->
            <div class="relative z-10 flex items-center justify-between text-white text-[11px] bg-black/70 backdrop-blur-md p-2 rounded-lg border border-white/10">
              <span class="font-medium text-white/80">Radio de giro camiones 10T & acometida técnica OK</span>
              <a [href]="getGoogleMapsUrl()" target="_blank" class="text-primary hover:underline font-bold flex items-center gap-1">
                <span>Abrir en Google Maps</span>
                <span class="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>
          </div>

          <!-- Desglose de Marcadores y Especificaciones de Acceso de las Locaciones de Este Proyecto -->
          <div class="space-y-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
              Locaciones & Puntos de Acceso Registrados para este Proyecto ({{ projectMapConfig()?.markers?.length || 0 }}):
            </span>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              @for (m of projectMapConfig()?.markers || []; track m.name) {
                <div class="p-3 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between gap-1 text-xs">
                  <div>
                    <div class="flex items-center justify-between mb-0.5">
                      <span class="font-bold text-on-surface text-xs">{{ m.name }}</span>
                      <span class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant">
                        {{ m.category || 'Locación' }}
                      </span>
                    </div>
                    @if (m.address) {
                      <p class="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <span class="material-symbols-outlined text-[13px] text-secondary">pin_drop</span>
                        <span class="truncate">{{ m.address }}</span>
                      </p>
                    }
                  </div>
                  <div class="pt-1.5 border-t border-surface-container-high text-[10px] text-tertiary font-medium">
                    {{ m.logisticsNote || 'Acceso para camiones de rodaje 10T' }}
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Logística de Rodaje & Permisos Específicos del Proyecto -->
          @if (projectMapConfig()?.logisticsNotes) {
            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-on-surface flex items-start gap-2.5">
              <span class="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">local_shipping</span>
              <div>
                <strong class="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">Logística de Acceso & Estacionamiento:</strong>
                <p class="text-on-surface-variant text-xs mt-0.5 leading-relaxed">{{ projectMapConfig()?.logisticsNotes }}</p>
              </div>
            </div>
          }

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-surface-container-high">
            <span class="text-xs text-on-surface-variant">
              Coordenadas validadas para scouting técnico.
            </span>
            <button (click)="isMapModalOpen.set(false)" class="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-sm hover:brightness-105 cursor-pointer">
              Cerrar Mapa
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
            <div class="flex justify-between font-medium"><span>Versión:</span><span class="font-bold">v2.1 Oficial</span></div>
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

  public projectMapConfig = computed(() => this.currentProject()?.mapConfig);

  getGoogleMapsUrl(): string {
    const cfg = this.projectMapConfig();
    const lat = cfg?.centerLat || 19.3242;
    const lng = cfg?.centerLng || -99.2014;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

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
    const link = `${window.location.origin}/?project=${this.currentProjectId()}&code=${code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    this.favoritesService.triggerToast(`Enlace de login con código (${code}) copiado.`);
    this.isProfileMenuOpen.set(false);
  }

  toggleProjectDropdown() {
    this.isProjectDropdownOpen.update(v => !v);
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen.update(v => !v);
  }

  logoutClient() {
    this.isProfileMenuOpen.set(false);
    try {
      sessionStorage.removeItem('pfe_client_auth_code');
      sessionStorage.removeItem('pfe_client_authorized_project_id');
    } catch {}
    this.favoritesService.triggerToast('Sesión de proyecto cerrada.');
    this.router.navigate(['/']);
  }

  handleBlockedProjectClick(proj: any) {
    this.favoritesService.triggerToast(`Acceso bloqueado: Tu acreditación solo te permite ver "${this.currentProjectTitle()}". Para "${proj?.title || 'este proyecto'}" se requiere un enlace y código de acreditación independiente.`, 'warning');
  }

  selectProject(projectId: string) {
    if (!this.isAdmin()) {
      if (projectId !== this.currentProjectId()) {
        const p = this.allProjects().find(x => x.id === projectId);
        this.handleBlockedProjectClick(p || null);
        return;
      }
    }
    this.projectsService.selectProjectById(projectId);
    this.isProjectDropdownOpen.set(false);
    this.router.navigate(['/p', projectId]);
  }

  openMapModal() {
    this.isMapModalOpen.set(true);
  }

  openDossierModal() {
    this.isDossierModalOpen.set(true);
  }

  simulateDossierDownload() {
    this.isDossierModalOpen.set(false);
    const proj = this.currentProject();
    if (!proj) return;
    const filename = `Dossier_Tecnico_${proj.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_2026.html`;
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Dossier Técnico Oficial — ${proj.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #111; line-height: 1.5; }
          .header { border-bottom: 3px solid #b91c1c; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
          .badge { background: #b91c1c; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
          th { background: #f9fafb; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <span class="badge">PFE Locaciones • Dossier de Rodaje</span>
            <h1 style="margin: 6px 0 2px 0; font-size: 24px;">${proj.title}</h1>
            <p style="margin:0; font-size: 12px; color: #666;">Código: <strong>${proj.accessCode}</strong> • Revisión v${proj.revision}.0 Aprobada</p>
          </div>
          <div style="text-align: right; font-size: 12px; color: #666;">
            <div>Fecha: ${new Date().toLocaleDateString('es-ES')}</div>
            <div>Mesa de Producción: 24/7 Hotline</div>
          </div>
        </div>
        <p style="font-size: 13px; color: #444;">Dossier completo de scouting con fichas técnicas, acometidas trifásicas, orientación de luz solar y direct sound verificado.</p>
        ${(proj.locations || []).map((loc, idx) => `
          <div class="card">
            <h3 style="margin:0 0 8px 0;">${idx + 1}. ${loc.title}</h3>
            <p style="font-size: 12px; color: #555; margin: 0 0 10px 0;">${loc.description || 'Recinto técnico verificado'}</p>
            <table>
              <tr><th>Parámetro</th><th>Especificación Técnica</th></tr>
              <tr><td>Capacidad Eléctrica</td><td>Acometida trifásica 80A - 125A protegida. Apta para generadores 60kW - 100kW.</td></tr>
              <tr><td>Estudio de Sonido</td><td>Direct Sound Verificado. Sin interferencias de tráfico pesado en horarios de llamado.</td></tr>
              <tr><td>Logística de Acceso</td><td>Radio de giro para camiones 10T y estacionamiento para unidad móvil.</td></tr>
            </table>
          </div>
        `).join('')}
        <script>window.print();</script>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    }
    this.favoritesService.triggerToast(`Dossier PDF generado para "${proj.title}".`);
  }
}
