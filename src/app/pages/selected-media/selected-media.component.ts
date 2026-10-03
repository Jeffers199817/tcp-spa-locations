import { Component, computed, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { FavoritesService } from '../../services/favorites.service';
import { PfeHeaderComponent } from '../../components/pfe-header/pfe-header.component';
import { PfeFooterComponent } from '../../components/pfe-footer/pfe-footer.component';

interface SelectedCardItem {
  id: string;
  locationName: string;
  locIdNumber: string;
  title: string;
  src: string;
  specs: string;
  chips: string[];
  areaText: string;
  soundCheck: boolean;
}

@Component({
  selector: 'app-selected-media',
  standalone: true,
  imports: [CommonModule, RouterModule, PfeHeaderComponent, PfeFooterComponent],
  template: `
    <!-- Topbar General -->
    <app-pfe-header></app-pfe-header>

    <!-- Main Container -->
    <main class="w-full flex-grow max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 font-body-md text-on-surface antialiased">
      
      <!-- Toast Notifier -->
      <div class="fixed top-20 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-2.5 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold border border-white/10"
           [class.translate-y-[-20px]]="!lastToast().visible"
           [class.opacity-0]="!lastToast().visible"
           [class.translate-y-0]="lastToast().visible"
           [class.opacity-100]="lastToast().visible">
        <span class="material-symbols-outlined text-primary text-[18px]">check_circle</span>
        <span>{{ lastToast().message }}</span>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col gap-5 mb-8 text-left">
        
        <!-- Top banner & actions -->
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div class="flex items-center gap-2.5 mb-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary">
                RF-03 • Selección Final
              </span>
              <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-surface-container-high text-xs font-medium text-on-surface-variant">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>3 colaboradores en vivo</span>
              </div>
            </div>

            <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
              Locaciones Seleccionadas por el Equipo
            </h1>
            <p class="text-sm sm:text-base text-on-surface-variant mt-1 font-normal">
              {{ activeSelectedCards().length }} medios aprobados para revisión final • {{ currentProjectTitle() }}
            </p>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <button (click)="copyShareLink()" class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:brightness-105 text-on-primary font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">link</span>
              <span>Copiar Enlace de Selección</span>
            </button>
            <button (click)="exportDossier()" class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-surface-container-high hover:bg-gray-50 text-on-surface font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer">
              <span class="material-symbols-outlined text-[18px] text-primary">picture_as_pdf</span>
              <span>Exportar Resumen PDF</span>
            </button>
          </div>
        </div>

        <!-- Distribution pills bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-surface-container-high p-3 sm:px-4 rounded-xl shadow-xs">
          <div class="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
            <span class="font-bold uppercase tracking-wider text-on-surface text-[11px] mr-1">Distribución:</span>
            @for (item of locationBreakdown(); track item.name) {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-medium border border-surface-container-high">
                <span class="w-2 h-2 rounded-full bg-primary"></span>
                <span>{{ item.name }}: <strong class="font-bold">{{ item.count }}</strong></span>
              </span>
            }
          </div>

          <!-- Team Avatars -->
          <div class="flex items-center gap-2 shrink-0">
            <div class="flex -space-x-2">
              <div class="w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white" title="Laura M. (Locaciones)">LM</div>
              <div class="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white" title="Pedro D. (Producción)">PD</div>
              <div class="w-7 h-7 rounded-full bg-tertiary text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white" title="Director de Arte">DIR</div>
            </div>
            <span class="text-xs text-on-surface-variant font-medium">Revisión sincrónica activa</span>
          </div>
        </div>

      </div>

      <!-- Empty State if no favorites -->
      @if (activeSelectedCards().length === 0) {
        <div class="py-16 text-center bg-white rounded-2xl border border-dashed border-surface-container-highest p-8 max-w-2xl mx-auto shadow-sm animate-in fade-in">
          <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-4xl">star_outline</span>
          </div>
          <h2 class="text-xl font-bold text-on-surface">No hay locaciones seleccionadas actualmente</h2>
          <p class="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
            Regresa al catálogo general y haz clic en la estrella de cualquier foto o video técnico para agregarlo a la selección compartida del equipo.
          </p>
          <a [routerLink]="'/p/' + currentProjectId()" class="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-sm hover:brightness-105 transition-all">
            <span class="material-symbols-outlined text-base">arrow_back</span>
            <span>Explorar Catálogo de Locaciones</span>
          </a>
        </div>
      }

      <!-- MEDIA CARDS GRID -->
      @if (activeSelectedCards().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          @for (card of activeSelectedCards(); track card.id; let i = $index) {
            <div class="group flex flex-col bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
              
              <!-- Thumbnail & Badges -->
              <div class="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                <img 
                  (click)="openLightbox(i)"
                  [src]="card.src" 
                  [alt]="card.title" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"></div>

                <div class="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-white text-xs font-semibold shadow-sm">
                  <span class="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Seleccionada</span>
                </div>

                <!-- Unselect Bookmark Button -->
                <button 
                  (click)="removeCard(card.id, card.title)"
                  class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-primary flex items-center justify-center transition-transform active:scale-90 shadow-sm cursor-pointer" 
                  title="Desmarcar">
                  <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">bookmark</span>
                </button>
              </div>

              <!-- Card Content -->
              <div class="p-4 flex flex-col justify-between flex-grow gap-3 text-left">
                <div>
                  <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-1">
                    <span class="text-primary truncate pr-1">{{ card.locationName }}</span>
                    <span class="text-on-surface font-extrabold text-sm shrink-0">{{ card.locIdNumber }}</span>
                  </div>
                  <h3 class="font-bold text-base text-on-surface leading-snug line-clamp-1">
                    {{ card.title }}
                  </h3>
                </div>

                <!-- Chips -->
                <div class="flex flex-wrap gap-1.5 text-xs text-on-surface-variant">
                  @for (chip of card.chips; track chip) {
                    <span class="px-2 py-0.5 rounded bg-surface-container-low border border-surface-container-high flex items-center gap-1 text-[11px]">
                      {{ chip }}
                    </span>
                  }
                </div>

                <!-- Bottom Footer Info -->
                <div class="pt-2 border-t border-surface-container-high flex items-center justify-between text-xs font-medium text-on-surface-variant">
                  <span class="flex items-center gap-1 font-semibold" [class.text-emerald-700]="card.soundCheck" [class.text-on-surface-variant]="!card.soundCheck">
                    <span class="material-symbols-outlined text-[15px]">check_box</span> 
                    {{ card.soundCheck ? 'Direct Sound OK' : 'Aislamiento Parcial' }}
                  </span>
                  <span class="font-bold text-on-surface">{{ card.areaText }}</span>
                </div>
              </div>

            </div>
          }
        </div>
      }

    </main>

    <!-- STICKY BOTTOM ACTION BAR -->
    @if (activeSelectedCards().length > 0) {
      <div class="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-container-high py-3 px-6 shadow-lg animate-in slide-in-from-bottom">
        <div class="max-w-[1680px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="font-bold text-sm text-on-surface">
              Total: {{ activeSelectedCards().length }} fotos y videos elegidos
            </span>
            <span class="hidden md:inline text-xs text-on-surface-variant">• Aprobación en vivo por RLS</span>
          </div>

          <div class="flex items-center gap-2.5">
            <button (click)="downloadCsv()" class="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">table_view</span>
              <span>Descargar Lista CSV</span>
            </button>
            <button (click)="confirmSelection()" class="px-5 py-2 rounded-lg bg-secondary hover:brightness-105 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Confirmar Selección de Rodaje</span>
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Professional Footer -->
    <app-pfe-footer></app-pfe-footer>

    <!-- ULTRA-HIGH RESOLUTION IMMERSIVE LIGHTBOX MODAL -->
    @if (lightboxIdx() !== null && currentLightboxCard()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-between bg-[#050505]/98 backdrop-blur-xl p-3 sm:p-5 animate-in fade-in select-none">
        
        <!-- Header Controls (Barra de Control con Alto Contraste) -->
        <div class="flex items-center justify-between text-white max-w-7xl mx-auto w-full z-20 bg-[#0c0c0e]/95 backdrop-blur-xl border border-white/25 p-2.5 sm:px-4 rounded-xl shadow-2xl">
          <div class="flex flex-col text-left">
            <div class="flex items-center gap-2">
              <span class="font-bold text-xs sm:text-sm text-primary uppercase tracking-wider">{{ currentLightboxCard()?.locationName }}</span>
              <span class="text-white/40">•</span>
              <span class="text-[11px] text-white/80 font-mono">{{ lightboxIdx()! + 1 }} de {{ activeSelectedCards().length }} seleccionadas</span>
            </div>
            <h3 class="text-base sm:text-lg font-bold text-white mt-0.5 truncate max-w-md sm:max-w-xl">{{ currentLightboxCard()?.title }}</h3>
          </div>

          <div class="flex items-center gap-2 sm:gap-2.5">
            <!-- Multi-Resolution Download Dropdown -->
            <div class="relative">
              <button (click)="toggleDownloadMenu()" 
                      class="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-primary text-white border border-white/30 flex items-center gap-1.5 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                      title="Descargar en Varias Resoluciones">
                <span class="material-symbols-outlined text-[16px]">download</span>
                <span class="hidden sm:inline">Descargar</span>
                <span class="material-symbols-outlined text-[14px]">expand_more</span>
              </button>

              @if (isDownloadMenuOpen()) {
                <div class="absolute right-0 mt-2 w-56 bg-[#121215] backdrop-blur-xl border-2 border-white/30 rounded-xl p-2 shadow-2xl z-50 text-left text-xs animate-in fade-in zoom-in-95">
                  <span class="text-[10px] text-white/60 uppercase tracking-wider font-bold block px-2 py-1">Formatos de Producción</span>
                  <button (click)="triggerDownload(currentLightboxCard()!, '4k')" class="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 text-white flex items-center justify-between cursor-pointer">
                    <span>4K Master RAW</span>
                    <span class="text-[10px] text-white/70 font-mono">3840×2400</span>
                  </button>
                  <button (click)="triggerDownload(currentLightboxCard()!, '1080p')" class="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 text-white flex items-center justify-between cursor-pointer">
                    <span>Full HD 1080p</span>
                    <span class="text-[10px] text-white/70 font-mono">1920×1200</span>
                  </button>
                  <button (click)="triggerDownload(currentLightboxCard()!, 'proxy')" class="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 text-white flex items-center justify-between cursor-pointer">
                    <span>Proxy WebP</span>
                    <span class="text-[10px] text-white/70 font-mono">1280×800</span>
                  </button>
                </div>
              }
            </div>

            <!-- Zoom Toggle Level Button (1x -> 1.6x -> 2.5x) -->
            <button (click)="cycleZoom()" 
                    class="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-primary text-white border border-white/30 flex items-center gap-1.5 text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                    title="Alternar Nivel de Zoom 4K (Tecla Z)">
              <span class="material-symbols-outlined text-[16px]">zoom_in</span>
              <span>{{ zoomLevel() }}x</span>
            </button>

            <!-- Fullscreen Native Mode -->
            <button (click)="toggleFullscreen()" 
                    class="w-9 h-9 rounded-lg bg-[#18181c] hover:bg-primary text-white border border-white/30 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                    title="Modo Pantalla Completa Cinematográfico (Tecla F)">
              <span class="material-symbols-outlined text-[18px]">
                {{ isNativeFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}
              </span>
            </button>

            <!-- Unselect button inside lightbox -->
            <button (click)="removeCard(currentLightboxCard()!.id, currentLightboxCard()!.title)" 
                    class="px-3.5 py-1.5 rounded-lg bg-[#18181c] hover:bg-primary text-white border border-white/30 flex items-center gap-1.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                    title="Desmarcar de favoritos">
              <span class="material-symbols-outlined text-[18px] text-primary" style="font-variation-settings: 'FILL' 1;">bookmark</span>
              <span class="hidden sm:inline">Seleccionada</span>
            </button>

            <!-- Close button -->
            <button (click)="closeLightbox()" 
                    class="w-9 h-9 rounded-lg bg-[#18181c] hover:bg-rose-600 text-white border border-white/30 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ml-1" 
                    title="Cerrar (Esc)">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <!-- Center Image Stage with Navigation Arrows -->
        <div class="relative flex-grow flex items-center justify-center overflow-hidden my-auto w-full">
          
          <!-- Prev Arrow -->
          <button (click)="prevLightbox()" 
                  class="absolute left-2 sm:left-6 z-20 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#0c0c0e]/95 hover:bg-primary text-white border-2 border-white/40 flex items-center justify-center backdrop-blur-md transition-all shadow-[0_4px_30px_rgba(0,0,0,0.9)] hover:scale-105 active:scale-95 cursor-pointer"
                  title="Anterior (Flecha Izquierda)">
            <span class="material-symbols-outlined text-[28px]">chevron_left</span>
          </button>

          <!-- Media Element Container with Dynamic Zoom -->
          <div class="w-full h-full flex items-center justify-center p-1 sm:p-4 overflow-auto" 
               [class.cursor-grab]="zoomLevel() > 1">
            <img [src]="currentLightboxCard()?.src" 
                 [alt]="currentLightboxCard()?.title" 
                 class="max-h-[88vh] max-w-[94vw] object-contain rounded-lg shadow-[0_0_60px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-out origin-center"
                 [style.transform]="'scale(' + zoomLevel() + ')'"
            />
          </div>

          <!-- Next Arrow -->
          <button (click)="nextLightbox()" 
                  class="absolute right-2 sm:right-6 z-20 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#0c0c0e]/95 hover:bg-primary text-white border-2 border-white/40 flex items-center justify-center backdrop-blur-md transition-all shadow-[0_4px_30px_rgba(0,0,0,0.9)] hover:scale-105 active:scale-95 cursor-pointer"
                  title="Siguiente (Flecha Derecha)">
            <span class="material-symbols-outlined text-[28px]">chevron_right</span>
          </button>
        </div>

        <!-- Bottom Technical Specifications Ribbon -->
        <div class="bg-black/70 backdrop-blur-lg rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 max-w-5xl mx-auto w-full text-white text-xs font-medium border border-white/10 z-20">
          <div class="flex flex-wrap items-center gap-4 text-left">
            <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-amber-400">wb_sunny</span> Travesía solar: Azimut 112°</span>
            <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-sky-400">straighten</span> Lente: 24mm - 35mm</span>
            <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-red-400">power</span> Conexiones trifásicas 12m</span>
            <span class="hidden md:inline text-white/30">•</span>
            <span class="hidden md:flex items-center gap-1 text-white/80">
              <span class="material-symbols-outlined text-[15px] text-tertiary-fixed">hd</span>
              <span>Ultra Alta Resolución 4K RAW WebP</span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button (click)="addDpNote()" class="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">edit_note</span>
              <span>Añadir Nota DP</span>
            </button>
          </div>
        </div>

      </div>
    }
  `
})
export class SelectedMediaComponent {
  private favoritesService = inject(FavoritesService);
  private projectsService = inject(ProjectsService);
  private router = inject(Router);

  public lastToast = computed(() => this.favoritesService.lastToast());
  public lightboxIdx = signal<number | null>(null);

  // Catálogo completo de tarjetas de selección con los datos fieles al prototipo Stitch Screen 2
  private masterCards: SelectedCardItem[] = [
    {
      id: 'm-ped-4',
      locationName: 'Villa Moderna Pedregal',
      locIdNumber: '#01',
      title: 'Salón Principal & Estanque',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm6rC8AUnQx1TpaKQ47eqzWwB9WoyNbRLfdOa6Yd-_FeV8173wmRqe1_uoZVCCYHZThznl6Rk6zUr3O4lAOLsWpSpDwjs_XY0L9yIm1vgUInRa9vJXVdyzxC32Ku5N8VGeeAwMGKQLDzvyB3-oCrpc3zZavpPrK_AJFnUb1dEA0Sayhmv5Qhmk485Al4QavEWAmhdb2eugeZeusbvJuFBioENo3yz1EmCLgMAoP9qoSqMW21m4w501',
      specs: 'Luz oriente (08-13h) • Techo 4.5m • Acceso 10T',
      chips: ['Luz oriente (08-13h)', 'Techo 4.5m', 'Acceso 10T'],
      areaText: '450 m²',
      soundCheck: true
    },
    {
      id: 'm-ped-5',
      locationName: 'Villa Moderna Pedregal',
      locIdNumber: '#02',
      title: 'Galería de Concreto & Tragaluz',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe7k0BeMVrh_AzDXykrDAgC5nslus1lOvPKMjyES3bj0OlMI74DKNSLW0XP7b9rFU_g6wDeBvVE0_OsQd5y4mM1Hpih5MuVz6Fvqg4ZQCPWHfJzCVmkZklLqqYoDlAYySIPsRBANm0sHcyT1jOjM6JOeJGR2aUSQwHRz7AuirQKu0pcVVCUV-Ufb76dImB-eBDiUZA9v0X59YO6ZQ-lbdBIgmNfjt0YRQuLF-ZXnOQdoN85nnevxH3',
      specs: 'Luz Cenital • Techo 5.0m • Trifásica 63A',
      chips: ['Luz Cenital', 'Techo 5.0m', 'Trifásica 63A'],
      areaText: '220 m²',
      soundCheck: true
    },
    {
      id: 'm-hang-1',
      locationName: 'Hangar San Telmo',
      locIdNumber: '#01',
      title: 'Nave Principal Industrial',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3w_F6sEyCIH4qWyI6kQX-RlXoVaUo2HtLiJUugLYP4V3u0LeFQez4Uk5_HRen6iUMXza6-wL_jhVrSiUYLV4z30oY1CGMwl0WGMOMUM8z5vRN2Zh7WR0CfRFP-DkNbWrxTMU9_XoRHMJw9ey6wq3vPWNGhLdYchxJxviXcUbfV7dd8iBHtYodWj47O3umLXuxoHhmN_NuXoNGWhJpw8_q120npfFZjc4w28pyqH-b1lMce9YegsX2',
      specs: '1,200 m² libres • Altura: 9.0m • Trifásica 125A',
      chips: ['1,200 m² libres', 'Altura 9.0m', 'Trifásica 125A'],
      areaText: '1,200 m²',
      soundCheck: true
    },
    {
      id: 'm-ped-6',
      locationName: 'Villa Moderna Pedregal',
      locIdNumber: '#03',
      title: 'Terraza Panorámica & Deck',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxBkxaGoY0Jcgbk7niYgO-MpbH3j0yql5rjFHA9xMrb8CU0fKv4fDbIb-UlJY9zGnXTIOHF_pC37DIMFwoRBYtPhtBflRoNW4ju0GvvzZUu2Cmr8z1TdYqU_1I86FXvKLDGuiA0jeslQPz9GcQ831CiPinE3fheYgc0KjtulXdTfMtxbkWCk5W_fcNGB1t3bkIB4OTZ2X2BTiMVSvYTi7Yau9_Z3eVjO4EM35nVJXjl15TfjW3scsI',
      specs: 'Deck Teca • Alberca • Luz Tarde',
      chips: ['Deck Teca', 'Alberca', 'Luz Tarde'],
      areaText: '380 m²',
      soundCheck: false
    },
    {
      id: 'm-col-1',
      locationName: 'Casa Colonial Coyoacán',
      locIdNumber: '#01',
      title: 'Patio de Arcos & Fuente',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpo0oR3fnz9lpS_RgyVwDGPtebCF1WXCFfL_0Kx9Y47SSh0KHH927XVVOp4dQCU6-Z_tENgbvO3IgnicC8GE3RuQDMGxgS3GvhuUFqLxnpVJektX49KeEkgQadm0mI6lRXEqLuO9xXlsBqhb6vMdAojUhETBx_WqJxS-Y1J32RBCSsoJsi1pLDhuwMwXgYRueoTET-95Kbq0RNwJYAVIjmKTk4yVME3bPdtOrmcrCHzeHAq305gOI6',
      specs: 'Cantera Rosa • Techo 4.2m • Siglo XVIII',
      chips: ['Cantera Rosa', 'Techo 4.2m', 'Siglo XVIII'],
      areaText: '520 m²',
      soundCheck: true
    },
    {
      id: 'm-hang-2',
      locationName: 'Hangar San Telmo',
      locIdNumber: '#02',
      title: 'Mezzanine & Rampa Técnica',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq-UcK-XhS5gT17ltdoHS7fkjzGAuS0AF1cnj-j6xkfGJ_mlzEziAP5vtnAk6nIWD6DXwDeYWdoFIXDw-c0WQ3pNL6qDRcBvc2AfL7DkVl3mfiy5LtsohMdk7j8lZRL-bR6it3DUm6p8PZdTFStE_3LeAHfQYqoo3W54ZtpmjSO4SYoGbJeYoTbIUvkTT-vaOnF7c7oIzW9_FXoUEiW7hWvItCBbNdbILa_eRZhwPzh7npnNykkd3V',
      specs: 'Vista Cenital • Estructura Acero • Rampa',
      chips: ['Vista Cenital', 'Estructura Acero', 'Rampa 10T'],
      areaText: '300 m²',
      soundCheck: false
    },
    {
      id: 'm-ped-7',
      locationName: 'Villa Moderna Pedregal',
      locIdNumber: '#04',
      title: 'Suite Master & Vestidor',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANTRn6Jabv7G8DI7CBT0y6qx6nPZ8MZBCcehfzRcyyXqcU3XAOW7Tnh5OjtNl5OlOqG3u2pRWa9E3VX--sUhHQTgKNaiD2qd-Ypgs6yp_j3d_rBNaXRukeYfOYOZzt4vhl5jrddCz9Zll8dsNZQlK6JlC2ZgiT1006bDOz_bJMtHhEHpIQSatKqy-oEdklHP-4IkWiD6NAoy2sxru6l4EM84fdaySHUCu0lhMynfAHO1nOV4_usEH4',
      specs: 'Roble Natural • f/1.4 • Set Íntimo',
      chips: ['Roble Natural', 'f/1.4', 'Set Íntimo'],
      areaText: '140 m²',
      soundCheck: true
    }
  ];

  public isDownloadMenuOpen = signal<boolean>(false);
  public currentProject = computed(() => this.projectsService.currentProject() || this.projectsService.allProjects()[0]);
  public currentProjectTitle = computed(() => this.currentProject()?.title || 'Campaña Global Verano 2026');
  public currentProjectId = computed(() => this.currentProject()?.id || '10000000-0000-4000-8000-000000000001');

  public allAvailableCards = computed<SelectedCardItem[]>(() => {
    const cards: SelectedCardItem[] = [];
    const projs = this.projectsService.allProjects();
    for (const proj of projs) {
      for (const loc of proj.locations || []) {
        for (const sec of loc.sections || []) {
          for (const m of sec.media || []) {
            cards.push({
              id: m.id,
              locationName: loc.title,
              locIdNumber: '#' + loc.id.slice(-2),
              title: m.title,
              src: m.url || '',
              specs: (m.width ? `${m.width}x${m.height} • ` : '') + (m.mime || 'image/webp'),
              chips: [loc.title, m.mime ? m.mime.replace('image/', '').toUpperCase() : '4K RAW', m.type === 'video' ? 'Video 4K' : 'Foto Hi-Res'],
              areaText: 'Locación Aprobada',
              soundCheck: true
            });
          }
        }
      }
    }
    for (const mc of this.masterCards) {
      if (!cards.some(c => c.id === mc.id)) {
        cards.push(mc);
      }
    }
    return cards;
  });

  public activeSelectedCards = computed(() => {
    const favSet = this.favoritesService.selectedMediaIds();
    return this.allAvailableCards().filter(c => favSet.has(c.id));
  });

  public locationBreakdown = computed(() => {
    const counts = new Map<string, number>();
    for (const card of this.activeSelectedCards()) {
      counts.set(card.locationName, (counts.get(card.locationName) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  });

  public currentLightboxCard = computed(() => {
    const idx = this.lightboxIdx();
    const cards = this.activeSelectedCards();
    if (idx === null || idx < 0 || idx >= cards.length) return null;
    return cards[idx];
  });

  toggleDownloadMenu() {
    this.isDownloadMenuOpen.update(v => !v);
  }

  triggerDownload(card: SelectedCardItem, resolution: string) {
    this.isDownloadMenuOpen.set(false);
    const suffix = resolution === '4k' ? '_4K_MASTER_RAW' : resolution === '1080p' ? '_1080p_FULLHD' : '_PROXY_WEBP';
    const filename = `${card.locationName.replace(/[^a-zA-Z0-9]/g, '_')}_${card.title.replace(/[^a-zA-Z0-9]/g, '_')}${suffix}.webp`;
    
    try {
      const link = document.createElement('a');
      link.href = card.src;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.favoritesService.triggerToast(`Descargando ${resolution.toUpperCase()} (${filename})`);
    } catch {
      window.open(card.src, '_blank');
      this.favoritesService.triggerToast(`Abriendo archivo para descarga`);
    }
  }

  removeCard(id: string, name: string) {
    this.favoritesService.removeFavorite(id, name);
  }

  copyShareLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      this.favoritesService.triggerToast('Enlace de selección copiado al portapapeles.');
    } else {
      this.favoritesService.triggerToast('Enlace listo para compartir.');
    }
  }

  exportDossier() {
    this.favoritesService.triggerToast('Generando compilación PDF técnica de locaciones seleccionadas...');
  }

  downloadCsv() {
    this.favoritesService.triggerToast('Descargando lista CSV de locaciones y especificaciones técnicas...');
  }

  confirmSelection() {
    this.favoritesService.triggerToast('Selección confirmada para coordinación de permisos y rodaje.');
  }

  public zoomLevel = signal<number>(1);
  public isNativeFullscreen = signal<number | boolean>(false);

  openLightbox(idx: number) {
    this.lightboxIdx.set(idx);
    this.zoomLevel.set(1);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxIdx.set(null);
    this.zoomLevel.set(1);
    document.body.style.overflow = '';
  }

  cycleZoom() {
    const current = this.zoomLevel();
    if (current === 1) this.zoomLevel.set(1.6);
    else if (current === 1.6) this.zoomLevel.set(2.5);
    else this.zoomLevel.set(1);
    this.favoritesService.triggerToast(`Zoom inspección ajustado a ${this.zoomLevel()}x`);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => this.isNativeFullscreen.set(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => this.isNativeFullscreen.set(false)).catch(() => {});
    }
  }

  prevLightbox() {
    const total = this.activeSelectedCards().length;
    if (total === 0) return;
    const current = this.lightboxIdx() ?? 0;
    this.lightboxIdx.set((current - 1 + total) % total);
    this.zoomLevel.set(1);
  }

  nextLightbox() {
    const total = this.activeSelectedCards().length;
    if (total === 0) return;
    const current = this.lightboxIdx() ?? 0;
    this.lightboxIdx.set((current + 1) % total);
    this.zoomLevel.set(1);
  }

  addDpNote() {
    this.favoritesService.triggerToast('Nota técnica registrada para el Director de Fotografía.');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.lightboxIdx() !== null) {
      if (event.key === 'Escape') this.closeLightbox();
      if (event.key === 'ArrowRight') this.nextLightbox();
      if (event.key === 'ArrowLeft') this.prevLightbox();
      if (event.key === 'z' || event.key === 'Z') this.cycleZoom();
      if (event.key === 'f' || event.key === 'F') this.toggleFullscreen();
    }
  }
}
