import { Component, computed, signal, inject, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { FavoritesService, DpNote } from '../../services/favorites.service';
import { PfeHeaderComponent } from '../../components/pfe-header/pfe-header.component';
import { PfeFooterComponent } from '../../components/pfe-footer/pfe-footer.component';

export interface SelectedCardItem {
  id: string;
  projectId?: string;
  projectTitle?: string;
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
  imports: [CommonModule, FormsModule, RouterModule, PfeHeaderComponent, PfeFooterComponent],
  template: `
    <!-- Topbar General -->
    <app-pfe-header></app-pfe-header>

    <!-- Main Container -->
    <main class="w-full flex-grow max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 font-body-md text-on-surface antialiased">
      
      <!-- Toast Notifier (Ultra High Priority z-[9999], Visible Over Lightbox & Modals) -->
      <div class="fixed top-6 right-6 z-[9999] transform transition-all duration-300 pointer-events-none flex items-center gap-3 bg-[#121215] text-white px-5 py-3 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] border border-white/20 text-xs sm:text-sm font-semibold max-w-md"
           [class.translate-y-[-30px]]="!lastToast().visible"
           [class.opacity-0]="!lastToast().visible"
           [class.translate-y-0]="lastToast().visible"
           [class.opacity-100]="lastToast().visible">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
        <span class="material-symbols-outlined text-[20px] text-emerald-400 shrink-0">check_circle</span>
        <span class="leading-snug">{{ lastToast().message }}</span>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col gap-5 mb-8 text-left">
        
        <!-- Top banner & actions -->
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2.5 mb-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20">
                Top Global • Seleccionadas por Clientes
              </span>
              <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-surface-container-high text-xs font-semibold text-on-surface-variant shadow-xs">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Votación Multidisciplinaria Activa</span>
              </div>
              <span class="text-xs text-on-surface-variant font-medium">
                Regla de Sesión: Máx. 1 desmarcado por tarjeta
              </span>
            </div>

            <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
              Ranking de Locaciones Seleccionadas
            </h1>
            <p class="text-sm sm:text-base text-on-surface-variant mt-1 font-normal max-w-3xl">
              Consolidado de locaciones más votadas por directores, agencias y DP en todos los proyectos de producción.
            </p>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <button (click)="copyShareLink()" class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs sm:text-sm border border-surface-container-high transition-all active:scale-95 cursor-pointer">
              <span class="material-symbols-outlined text-[18px] text-primary">link</span>
              <span>Copiar Enlace</span>
            </button>
            <button (click)="downloadCsv()" class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-surface-container-high hover:bg-gray-50 text-on-surface font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer" title="Descargar únicamente las locaciones marcadas con checkbox">
              <span class="material-symbols-outlined text-[18px] text-emerald-600">table_view</span>
              <span>Descargar Lista CSV ({{ selectedForExportCount() }})</span>
            </button>
            <button (click)="exportDossier()" class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:brightness-105 text-on-primary font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Exportar Resumen PDF</span>
            </button>
          </div>
        </div>

        <!-- FILTRO DE PROYECTOS & SELECTOR DE EXPORTACIÓN -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-surface-container-high p-3 sm:px-4 rounded-xl shadow-xs">
          
          <!-- Project Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            <span class="font-bold uppercase tracking-wider text-on-surface text-[11px] mr-2 shrink-0">Proyecto:</span>
            <button (click)="setProjectFilter('all')" 
                    class="px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer border"
                    [class.bg-primary]="activeProjectFilter() === 'all'"
                    [class.text-white]="activeProjectFilter() === 'all'"
                    [class.border-primary]="activeProjectFilter() === 'all'"
                    [class.bg-surface-container-low]="activeProjectFilter() !== 'all'"
                    [class.text-on-surface-variant]="activeProjectFilter() !== 'all'"
                    [class.border-surface-container-high]="activeProjectFilter() !== 'all'">
              Todos los Proyectos (Top Global)
            </button>
            @for (p of availableProjects(); track p.id) {
              <button (click)="setProjectFilter(p.id)" 
                      class="px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer border"
                      [class.bg-primary]="activeProjectFilter() === p.id"
                      [class.text-white]="activeProjectFilter() === p.id"
                      [class.border-primary]="activeProjectFilter() === p.id"
                      [class.bg-surface-container-low]="activeProjectFilter() !== p.id"
                      [class.text-on-surface-variant]="activeProjectFilter() !== p.id"
                      [class.border-surface-container-high]="activeProjectFilter() !== p.id">
                {{ p.title }}
              </button>
            }
          </div>

          <!-- Quick Multi-selection Actions for CSV/PDF Export -->
          <div class="flex items-center justify-between sm:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-surface-container-high text-xs shrink-0">
            <span class="text-on-surface-variant font-medium">
              <strong class="text-on-surface font-bold">{{ selectedForExportCount() }}</strong> de {{ rankedCards().length }} seleccionadas
            </span>
            <div class="flex items-center gap-1">
              <button (click)="selectAllForExport()" class="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-primary font-bold text-[11px] cursor-pointer">
                Todas
              </button>
              <button (click)="deselectAllForExport()" class="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-bold text-[11px] cursor-pointer">
                Ninguna
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Empty State if no cards match -->
      @if (rankedCards().length === 0) {
        <div class="py-16 text-center bg-white rounded-2xl border border-dashed border-surface-container-highest p-8 max-w-2xl mx-auto shadow-sm animate-in fade-in">
          <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-4xl">star_outline</span>
          </div>
          <h2 class="text-xl font-bold text-on-surface">No hay locaciones que coincidan con este filtro</h2>
          <p class="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
            Puedes explorar el catálogo completo o restablecer el filtro para ver las locaciones más votadas de todos los proyectos.
          </p>
          <button (click)="setProjectFilter('all')" class="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-sm hover:brightness-105 transition-all cursor-pointer">
            <span class="material-symbols-outlined text-base">restart_alt</span>
            <span>Ver Top Global de Todos los Proyectos</span>
          </button>
        </div>
      }

      <!-- MEDIA CARDS GRID -->
      @if (rankedCards().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          @for (card of rankedCards(); track card.id; let i = $index) {
            <div class="group flex flex-col bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 relative"
                 [class.border-primary]="isCardSelectedForExport(card.id)"
                 [class.border-surface-container-high]="!isCardSelectedForExport(card.id)"
                 [class.ring-2]="isCardSelectedForExport(card.id)"
                 [class.ring-primary/20]="isCardSelectedForExport(card.id)">
              
              <!-- Thumbnail & Badges -->
              <div class="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                <img 
                  (click)="openLightbox(i)"
                  [src]="card.src" 
                  [alt]="card.title" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

                <!-- Ranking Medal / Position -->
                <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black shadow-md"
                     [class.bg-amber-400]="i === 0"
                     [class.text-amber-950]="i === 0"
                     [class.bg-slate-200]="i === 1"
                     [class.text-slate-900]="i === 1"
                     [class.bg-amber-700]="i === 2"
                     [class.text-amber-100]="i === 2"
                     [class.bg-black/75]="i > 2"
                     [class.text-white]="i > 2">
                  <span>{{ i === 0 ? '🥇 #1' : i === 1 ? '🥈 #2' : i === 2 ? '🥉 #3' : '#' + (i + 1) }}</span>
                  <span class="text-[10px] font-semibold opacity-90">Top</span>
                </div>

                <!-- Custom Export Checkbox (Para elegir las que desee descargar en CSV/PDF) -->
                <label class="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/85 backdrop-blur-md text-white text-[11px] font-semibold cursor-pointer shadow-sm border border-white/20 select-none"
                       title="Marcar para incluir en descarga de CSV y PDF">
                  <input 
                    type="checkbox" 
                    [checked]="isCardSelectedForExport(card.id)" 
                    (change)="toggleCardExportCheck(card.id, $event)"
                    class="w-3.5 h-3.5 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>Exportar</span>
                </label>

                <!-- Unselect / Vote Bookmark Button con Regla de 1 Desmarcado por Sesión -->
                <button 
                  (click)="handleToggleCardSelection(card)"
                  class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/95 hover:bg-white text-on-surface flex items-center gap-1.5 transition-all active:scale-90 shadow-md cursor-pointer border border-black/10" 
                  [title]="isSessionUnfavorited(card.id) ? 'Ya has retirado tu voto en esta sesión (máx. 1 vez)' : (isFavorite(card.id) ? 'Desmarcar voto (-1)' : 'Volver a marcar (+1)')">
                  <span class="material-symbols-outlined text-[17px]" 
                        [class.text-rose-600]="isFavorite(card.id)"
                        [class.text-gray-400]="!isFavorite(card.id)"
                        [style.font-variation-settings]="getHeartVariation(isFavorite(card.id))">
                    favorite
                  </span>
                  <span class="text-xs font-black font-mono text-on-surface">
                    {{ getCardLikes(card.id) }}
                  </span>
                </button>
              </div>

              <!-- Card Content -->
              <div class="p-4 flex flex-col justify-between flex-grow gap-2.5 text-left">
                <div>
                  <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
                    <span class="text-primary truncate pr-1">{{ card.locationName }}</span>
                    <span class="text-on-surface-variant font-mono text-[10px] shrink-0">{{ card.locIdNumber }}</span>
                  </div>
                  
                  <div class="flex items-start justify-between gap-1">
                    <h3 class="font-bold text-sm sm:text-base text-on-surface leading-snug line-clamp-1">
                      {{ card.title }}
                    </h3>
                    @if (hasNote(card.id)) {
                      <span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 shrink-0" [title]="getNote(card.id)?.noteText || 'Nota DP'">
                        <span class="material-symbols-outlined text-[12px]">rate_review</span>
                        <span>DP</span>
                      </span>
                    }
                  </div>

                  <!-- Project reference tag -->
                  <div class="mt-1 flex items-center gap-1 text-[11px] text-on-surface-variant">
                    <span class="material-symbols-outlined text-[14px] text-primary">folder</span>
                    <span class="truncate">{{ card.projectTitle || currentProjectTitle() }}</span>
                  </div>
                </div>

                <!-- Chips -->
                <div class="flex flex-wrap gap-1 text-xs text-on-surface-variant">
                  @for (chip of card.chips; track chip) {
                    <span class="px-2 py-0.5 rounded bg-surface-container-low border border-surface-container-high text-[10px] font-medium">
                      {{ chip }}
                    </span>
                  }
                </div>

                <!-- Bottom Status Indicator & Rule Notice -->
                <div class="pt-2 border-t border-surface-container-high flex flex-col gap-1 text-xs">
                  <div class="flex items-center justify-between text-on-surface-variant font-medium">
                    <span class="flex items-center gap-1 font-semibold text-[11px]" [class.text-emerald-700]="card.soundCheck">
                      <span class="material-symbols-outlined text-[14px]">check_box</span> 
                      {{ card.soundCheck ? 'Direct Sound OK' : 'Aislamiento Parcial' }}
                    </span>
                    <span class="font-bold text-on-surface text-[11px]">{{ card.areaText }}</span>
                  </div>

                  @if (isSessionUnfavorited(card.id)) {
                    <div class="text-[10px] font-bold text-amber-700 bg-amber-50 rounded px-2 py-0.5 flex items-center justify-between">
                      <span>Voto retirado en esta sesión (-1)</span>
                      <span>Límite 1x</span>
                    </div>
                  }
                </div>
              </div>

            </div>
          }
        </div>
      }

    </main>

    <!-- STICKY BOTTOM ACTION BAR -->
    @if (rankedCards().length > 0) {
      <div class="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-container-high py-3 px-6 shadow-lg animate-in slide-in-from-bottom">
        <div class="max-w-[1680px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="font-bold text-sm text-on-surface">
              {{ selectedForExportCount() }} locaciones seleccionadas para descarga
            </span>
            <span class="hidden md:inline text-xs text-on-surface-variant">• Ranking de {{ rankedCards().length }} locaciones globales</span>
          </div>

          <div class="flex items-center gap-2.5">
            <button (click)="downloadCsv()" class="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-surface-container-high shadow-xs">
              <span class="material-symbols-outlined text-[16px] text-emerald-600">table_view</span>
              <span>Descargar Lista CSV</span>
            </button>
            <button (click)="exportDossier()" class="px-5 py-2 rounded-lg bg-primary hover:brightness-105 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Exportar Resumen PDF</span>
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
              <span class="text-[11px] text-white/80 font-mono">{{ lightboxIdx()! + 1 }} de {{ rankedCards().length }} en ranking</span>
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

            <!-- Bookmark Button inside lightbox con regla de 1 desmarcado -->
            <button (click)="handleToggleCardSelection(currentLightboxCard()!)" 
                    class="px-3.5 py-1.5 rounded-lg bg-[#18181c] hover:bg-white/10 text-white border border-white/30 flex items-center gap-1.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                    title="Alternar selección de favoritos">
              <span class="material-symbols-outlined text-[18px] text-rose-500" 
                    [style.font-variation-settings]="getHeartVariation(isFavorite(currentLightboxCard()!.id))">
                favorite
              </span>
              <span>{{ getCardLikes(currentLightboxCard()!.id) }}</span>
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

        <!-- Bottom Technical Specifications Ribbon with DP Note display & button -->
        <div class="bg-[#0c0c0e]/95 backdrop-blur-xl rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 max-w-5xl mx-auto w-full text-white text-xs font-medium border border-white/20 z-20 shadow-2xl">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-amber-400">wb_sunny</span> Travesía solar: Azimut 112°</span>
              <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-sky-400">straighten</span> 24mm - 35mm</span>
              <span class="hidden md:flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-red-400">power</span> Trifásica 12m</span>
            </div>

            @if (currentNote()) {
              <div class="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-lg text-amber-200 text-xs">
                <span class="material-symbols-outlined text-[16px] text-amber-400 shrink-0">rate_review</span>
                <div class="flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
                  <strong class="text-amber-300 font-bold shrink-0">DP ({{ currentNote()?.category }}):</strong>
                  <span class="truncate italic text-white/90">"{{ currentNote()?.noteText }}"</span>
                </div>
              </div>
            }
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button (click)="openDpNoteModal()" 
                    class="px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 border"
                    [class.bg-amber-500]="!!currentNote()"
                    [class.border-amber-400]="!!currentNote()"
                    [class.text-black]="!!currentNote()"
                    [class.hover:bg-amber-400]="!!currentNote()"
                    [class.bg-[#1c1c22]]="!currentNote()"
                    [class.border-white/30]="!currentNote()"
                    [class.text-white]="!currentNote()"
                    [class.hover:bg-white]="!currentNote()"
                    [class.hover:text-black]="!currentNote()">
              <span class="material-symbols-outlined text-[18px]">edit_note</span>
              <span>{{ currentNote() ? 'Ver / Responder Nota DP' : 'Añadir Nota de DP' }}</span>
            </button>
          </div>
        </div>

        <!-- MODAL INTERACTIVO DE NOTA DE DP CON CHAT SOCIAL DE RODAJE -->
        @if (isDpNoteModalOpen()) {
          <div class="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in" (click)="closeDpNoteModal()">
            <div class="bg-[#141418] border-2 border-white/30 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-left text-white max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
              
              <!-- Modal Header -->
              <div class="flex items-start justify-between pb-3 border-b border-white/15">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <span class="material-symbols-outlined text-2xl">movie_filter</span>
                  </div>
                  <div class="flex flex-col">
                    <h3 class="font-bold text-base text-white">Nota Técnica & Chat de Rodaje (DP / Producción)</h3>
                    <span class="text-xs text-white/70">{{ currentLightboxCard()?.locationName }} • {{ currentLightboxCard()?.title }}</span>
                  </div>
                </div>
                <button (click)="closeDpNoteModal()" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors">
                  <span class="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <!-- Hilo de Conversación / Respuestas del Chat Social -->
              @if (currentNote() && currentNote()?.replies && currentNote()!.replies!.length > 0) {
                <div class="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10 max-h-48 overflow-y-auto">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-white/60">Respuestas del Equipo de Producción:</span>
                  @for (rep of currentNote()!.replies; track rep.id) {
                    <div class="flex flex-col gap-1 p-2 rounded-lg bg-white/5 border border-white/10 text-xs">
                      <div class="flex items-center justify-between text-[11px]">
                        <span class="font-bold text-amber-300 flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          {{ rep.author }} ({{ rep.role }})
                        </span>
                        <span class="text-white/50 text-[10px]">{{ rep.timestamp }}</span>
                      </div>
                      <p class="text-white/90 leading-relaxed pl-2.5">{{ rep.message }}</p>
                    </div>
                  }
                </div>
              }

              <!-- Categoría / Especialidad -->
              <div>
                <label class="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Especialidad Técnica:</label>
                <div class="flex flex-wrap gap-1.5">
                  @for (cat of ['Lentes / Óptica', 'Iluminación / Sol', 'Grip / Cámara', 'Eléctrico / Planta', 'Arte & Set']; track cat) {
                    <button type="button" 
                            (click)="noteCategory.set(cat)" 
                            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border"
                            [class.bg-amber-500]="noteCategory() === cat"
                            [class.border-amber-400]="noteCategory() === cat"
                            [class.text-black]="noteCategory() === cat"
                            [class.bg-white/10]="noteCategory() !== cat"
                            [class.border-white/20]="noteCategory() !== cat"
                            [class.text-white/80]="noteCategory() !== cat">
                      {{ cat }}
                    </button>
                  }
                </div>
              </div>

              <!-- Quick presets / suggestions -->
              <div>
                <label class="block text-[11px] font-medium text-white/60 mb-1">Sugerencias rápidas:</label>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" (click)="appendPreset('Lente anamórfico 35mm')" class="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/70 border border-white/10 cursor-pointer">
                    + Anamórfico 35mm
                  </button>
                  <button type="button" (click)="appendPreset('Hora mágica 17:30h')" class="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/70 border border-white/10 cursor-pointer">
                    + Hora mágica 17:30h
                  </button>
                  <button type="button" (click)="appendPreset('Riel dolly sobre piso')" class="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/70 border border-white/10 cursor-pointer">
                    + Riel dolly
                  </button>
                  <button type="button" (click)="appendPreset('Acometida trifásica 80A')" class="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/70 border border-white/10 cursor-pointer">
                    + Trifásica 80A
                  </button>
                </div>
              </div>

              <!-- Textarea -->
              <div>
                <label class="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5" for="dp-note-selected-textarea">
                  Instrucción / Requerimiento Técnico:
                </label>
                <textarea 
                  id="dp-note-selected-textarea"
                  rows="3"
                  [(ngModel)]="noteInputText"
                  placeholder="Ej: Montar óptica anamórfica 40mm a f/2.0. Solicitar HMI 4K para contrarrestar luz solar desde el jardín poniente..."
                  class="w-full bg-[#0a0a0d] border border-white/30 focus:border-amber-400 rounded-xl p-3 text-white text-xs placeholder:text-white/40 focus:outline-none transition-colors resize-none leading-relaxed"
                ></textarea>
              </div>

              <!-- Author / Firmante -->
              <div>
                <label class="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1" for="dp-note-selected-author">
                  Responsable / Cargo:
                </label>
                <input 
                  id="dp-note-selected-author"
                  type="text"
                  [(ngModel)]="noteAuthor"
                  placeholder="Director de Fotografía (DP)"
                  class="w-full bg-[#0a0a0d] border border-white/30 focus:border-amber-400 rounded-xl px-3 py-2 text-white text-xs placeholder:text-white/40 focus:outline-none transition-colors"
                />
              </div>

              <!-- Quick reply input para social chat si ya existe la nota -->
              @if (currentNote()) {
                <div class="pt-2 border-t border-white/15">
                  <label class="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                    Responder en este hilo de rodaje:
                  </label>
                  <div class="flex items-center gap-2">
                    <input 
                      type="text"
                      [(ngModel)]="quickReplyText"
                      (keyup.enter)="sendQuickReply()"
                      placeholder="Escribe una actualización o respuesta técnica..."
                      class="flex-grow bg-[#0a0a0d] border border-white/30 focus:border-amber-400 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/40 focus:outline-none"
                    />
                    <button type="button" (click)="sendQuickReply()" class="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg cursor-pointer whitespace-nowrap">
                      Enviar
                    </button>
                  </div>
                </div>
              }

              <!-- Action buttons -->
              <div class="flex items-center justify-between pt-2 border-t border-white/15">
                <div>
                  @if (currentNote()) {
                    <button type="button" (click)="deleteDpNote()" class="px-3 py-2 rounded-lg bg-rose-900/40 hover:bg-rose-700 text-rose-200 text-xs font-bold transition-colors cursor-pointer border border-rose-500/40 flex items-center gap-1">
                      <span class="material-symbols-outlined text-[15px]">delete</span>
                      <span>Eliminar</span>
                    </button>
                  }
                </div>

                <div class="flex items-center gap-2">
                  <button type="button" (click)="closeDpNoteModal()" class="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer">
                    Cancelar
                  </button>
                  <button type="button" (click)="saveDpNote()" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px]">save</span>
                    <span>Guardar Nota</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        }

      </div>
    }
  `
})
export class SelectedMediaComponent implements OnInit {
  private favoritesService = inject(FavoritesService);
  private projectsService = inject(ProjectsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public lastToast = computed(() => this.favoritesService.lastToast());
  public lightboxIdx = signal<number | null>(null);

  // Filtro de proyectos: 'all' = Top Global de todos los proyectos
  public activeProjectFilter = signal<string>('all');

  // Selección individual para exportar a CSV / PDF
  public exportSelectedIds = signal<Set<string>>(new Set());

  // Catálogo maestro base con datos cinematográficos
  private masterCards: SelectedCardItem[] = [
    {
      id: 'm-ped-hero',
      projectId: '10000000-0000-4000-8000-000000000001',
      projectTitle: 'Campaña Global Verano 2026',
      locationName: 'Villa Moderna Pedregal',
      locIdNumber: '#01',
      title: 'Vista Panorámica & Alberca Principal',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9EMuNJ2GaP_hzO-fFen3OUMamZcxEqADXl9d3Uvs7F9K8wenkBoy7Zp5rjlLrapMYx-v2AbpewwN7a9kCGz5o3ABk8_sIhYMGnbRHCDmwUbVfSmmIWAAA7lhY-HTw1xQWJcVw7jxXgDDtQeXJe2hRS5u9HG5iGsBK6CWH6bsJDm6qpH4tWkhmYzJEPuvo6qoCcIRMt9HE-0ie1-EVj8MeqRGCcrp2ayNJUuyfzlGJuRL7DnMtj8Y',
      specs: 'Luz Poniente (16-19h) • Techo 5.2m • Acceso Grúa Techno 30',
      chips: ['Luz Poniente', 'Techo 5.2m', 'Grúa Techno 30'],
      areaText: '600 m²',
      soundCheck: true
    },
    {
      id: 'm-ped-4',
      projectId: '10000000-0000-4000-8000-000000000001',
      projectTitle: 'Campaña Global Verano 2026',
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
      id: 'm-hang-1',
      projectId: '10000000-0000-4000-8000-000000000001',
      projectTitle: 'Campaña Global Verano 2026',
      locationName: 'Hangar San Telmo',
      locIdNumber: '#02',
      title: 'Nave Principal Industrial',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3w_F6sEyCIH4qWyI6kQX-RlXoVaUo2HtLiJUugLYP4V3u0LeFQez4Uk5_HRen6iUMXza6-wL_jhVrSiUYLV4z30oY1CGMwl0WGMOMUM8z5vRN2Zh7WR0CfRFP-DkNbWrxTMU9_XoRHMJw9ey6wq3vPWNGhLdYchxJxviXcUbfV7dd8iBHtYodWj47O3umLXuxoHhmN_NuXoNGWhJpw8_q120npfFZjc4w28pyqH-b1lMce9YegsX2',
      specs: '1,200 m² libres • Altura: 9.0m • Trifásica 125A',
      chips: ['1,200 m² libres', 'Altura 9.0m', 'Trifásica 125A'],
      areaText: '1,200 m²',
      soundCheck: true
    },
    {
      id: 'm-ped-1',
      projectId: '10000000-0000-4000-8000-000000000001',
      projectTitle: 'Campaña Global Verano 2026',
      locationName: 'Villa Moderna Pedregal',
      locIdNumber: '#01',
      title: 'Fachada & Entrada Principal',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC75aW0F1U95kLd752T_zQ1q8pAky9qgJ4z1QZz6uL7mR2uV3xT9rY1aZ3xW6vB8nM2kL4pQ7sT1uV9xY2aC5bN8mK3jL6pQ9rT2uV5wX8yZ1aC4bN7mK2jL5pQ8rT1uV4wX7yZ0aC3bN6mK1jL4pQ7rT0uV3wX6yZ9aC2bN5mK0jL3pQ6rS',
      specs: 'Riel Dolly • Piso Basalto • Luz Cenital',
      chips: ['Riel Dolly', 'Piso Basalto', 'Luz Cenital'],
      areaText: '310 m²',
      soundCheck: true
    },
    {
      id: 'm-col-1',
      projectId: '20000000-0000-4000-8000-000000000002',
      projectTitle: 'Campaña Primavera-Costa 2026',
      locationName: 'Casa Colonial Coyoacán',
      locIdNumber: '#01',
      title: 'Patio de Arcos & Fuente Colonial',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpo0oR3fnz9lpS_RgyVwDGPtebCF1WXCFfL_0Kx9Y47SSh0KHH927XVVOp4dQCU6-Z_tENgbvO3IgnicC8GE3RuQDMGxgS3GvhuUFqLxnpVJektX49KeEkgQadm0mI6lRXEqLuO9xXlsBqhb6vMdAojUhETBx_WqJxS-Y1J32RBCSsoJsi1pLDhuwMwXgYRueoTET-95Kbq0RNwJYAVIjmKTk4yVME3bPdtOrmcrCHzeHAq305gOI6',
      specs: 'Cantera Rosa • Techo 4.2m • Siglo XVIII',
      chips: ['Cantera Rosa', 'Techo 4.2m', 'Siglo XVIII'],
      areaText: '520 m²',
      soundCheck: true
    },
    {
      id: 'm-ped-6',
      projectId: '10000000-0000-4000-8000-000000000001',
      projectTitle: 'Campaña Global Verano 2026',
      locationName: 'Villa Moderna Pedregal',
      locIdNumber: '#01',
      title: 'Terraza Panorámica & Deck',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxBkxaGoY0Jcgbk7niYgO-MpbH3j0yql5rjFHA9xMrb8CU0fKv4fDbIb-UlJY9zGnXTIOHF_pC37DIMFwoRBYtPhtBflRoNW4ju0GvvzZUu2Cmr8z1TdYqU_1I86FXvKLDGuiA0jeslQPz9GcQ831CiPinE3fheYgc0KjtulXdTfMtxbkWCk5W_fcNGB1t3bkIB4OTZ2X2BTiMVSvYTi7Yau9_Z3eVjO4EM35nVJXjl15TfjW3scsI',
      specs: 'Deck Teca • Alberca • Luz Tarde',
      chips: ['Deck Teca', 'Alberca', 'Luz Tarde'],
      areaText: '380 m²',
      soundCheck: false
    },
    {
      id: 'm-ped-5',
      projectId: '10000000-0000-4000-8000-000000000001',
      projectTitle: 'Campaña Global Verano 2026',
      locationName: 'Villa Moderna Pedregal',
      locIdNumber: '#01',
      title: 'Galería de Concreto & Tragaluz',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe7k0BeMVrh_AzDXykrDAgC5nslus1lOvPKMjyES3bj0OlMI74DKNSLW0XP7b9rFU_g6wDeBvVE0_OsQd5y4mM1Hpih5MuVz6Fvqg4ZQCPWHfJzCVmkZklLqqYoDlAYySIPsRBANm0sHcyT1jOjM6JOeJGR2aUSQwHRz7AuirQKu0pcVVCUV-Ufb76dImB-eBDiUZA9v0X59YO6ZQ-lbdBIgmNfjt0YRQuLF-ZXnOQdoN85nnevxH3',
      specs: 'Luz Cenital • Techo 5.0m • Trifásica 63A',
      chips: ['Luz Cenital', 'Techo 5.0m', 'Trifásica 63A'],
      areaText: '220 m²',
      soundCheck: true
    },
    {
      id: 'm-ped-7',
      projectId: '10000000-0000-4000-8000-000000000001',
      projectTitle: 'Campaña Global Verano 2026',
      locationName: 'Villa Moderna Pedregal',
      locIdNumber: '#01',
      title: 'Suite Master & Vestidor',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANTRn6Jabv7G8DI7CBT0y6qx6nPZ8MZBCcehfzRcyyXqcU3XAOW7Tnh5OjtNl5OlOqG3u2pRWa9E3VX--sUhHQTgKNaiD2qd-Ypgs6yp_j3d_rBNaXRukeYfOYOZzt4vhl5jrddCz9Zll8dsNZQlK6JlC2ZgiT1006bDOz_bJMtHhEHpIQSatKqy-oEdklHP-4IkWiD6NAoy2sxru6l4EM84fdaySHUCu0lhMynfAHO1nOV4_usEH4',
      specs: 'Roble Natural • f/1.4 • Set Íntimo',
      chips: ['Roble Natural', 'f/1.4', 'Set Íntimo'],
      areaText: '140 m²',
      soundCheck: true
    },
    {
      id: 'm-hang-2',
      projectId: '10000000-0000-4000-8000-000000000001',
      projectTitle: 'Campaña Global Verano 2026',
      locationName: 'Hangar San Telmo',
      locIdNumber: '#02',
      title: 'Mezzanine & Rampa Técnica',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq-UcK-XhS5gT17ltdoHS7fkjzGAuS0AF1cnj-j6xkfGJ_mlzEziAP5vtnAk6nIWD6DXwDeYWdoFIXDw-c0WQ3pNL6qDRcBvc2AfL7DkVl3mfiy5LtsohMdk7j8lZRL-bR6it3DUm6p8PZdTFStE_3LeAHfQYqoo3W54ZtpmjSO4SYoGbJeYoTbIUvkTT-vaOnF7c7oIzW9_FXoUEiW7hWvItCBbNdbILa_eRZhwPzh7npnNykkd3V',
      specs: 'Vista Cenital • Estructura Acero • Rampa 10T',
      chips: ['Vista Cenital', 'Estructura Acero', 'Rampa 10T'],
      areaText: '300 m²',
      soundCheck: false
    }
  ];

  public isDownloadMenuOpen = signal<boolean>(false);
  public availableProjects = computed(() => this.projectsService.allProjects());
  public currentProject = computed(() => this.projectsService.currentProject() || this.availableProjects()[0]);
  public currentProjectTitle = computed(() => this.currentProject()?.title || 'Campaña Global Verano 2026');

  ngOnInit() {
    // Inicializar exportación seleccionando todas las tarjetas maestras por defecto
    const allIds = new Set(this.masterCards.map(c => c.id));
    this.exportSelectedIds.set(allIds);
  }

  // Lista combinada de todas las tarjetas disponibles en la plataforma
  public allAvailableCards = computed<SelectedCardItem[]>(() => {
    const list: SelectedCardItem[] = [];
    const projs = this.projectsService.allProjects();

    for (const proj of projs) {
      for (const loc of proj.locations || []) {
        for (const sec of loc.sections || []) {
          for (const m of sec.media || []) {
            list.push({
              id: m.id,
              projectId: proj.id,
              projectTitle: proj.title,
              locationName: loc.title,
              locIdNumber: '#' + loc.id.slice(-2),
              title: m.title,
              src: m.url || '',
              specs: (m.width ? `${m.width}x${m.height} • ` : '') + (m.mime || 'image/webp'),
              chips: [proj.title, loc.title, m.mime ? m.mime.replace('image/', '').toUpperCase() : '4K RAW'],
              areaText: 'Locación Aprobada',
              soundCheck: true
            });
          }
        }
      }
    }

    // Agregar las tarjetas maestras enriquecidas
    for (const mc of this.masterCards) {
      const existingIdx = list.findIndex(c => c.id === mc.id);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...mc };
      } else {
        list.push(mc);
      }
    }

    return list;
  });

  // Top de Seleccionadas Ordenadas por Número de Votos de Clientes Descendente
  public rankedCards = computed(() => {
    let cards = this.allAvailableCards();
    const filter = this.activeProjectFilter();

    if (filter !== 'all') {
      cards = cards.filter(c => c.projectId === filter);
    }

    // Ordenar de mayor a menor número de selecciones de clientes
    return [...cards].sort((a, b) => {
      const likesA = this.favoritesService.getLikes(a.id);
      const likesB = this.favoritesService.getLikes(b.id);
      return likesB - likesA;
    });
  });

  public selectedForExportCount = computed(() => {
    const set = this.exportSelectedIds();
    return this.rankedCards().filter(c => set.has(c.id)).length;
  });

  setProjectFilter(projectId: string) {
    this.activeProjectFilter.set(projectId);
    this.favoritesService.triggerToast(
      projectId === 'all' 
        ? 'Mostrando Top Global de todos los proyectos' 
        : `Filtrando por: ${this.availableProjects().find(p => p.id === projectId)?.title || 'Proyecto'}`
    );
  }

  isCardSelectedForExport(id: string): boolean {
    return this.exportSelectedIds().has(id);
  }

  toggleCardExportCheck(id: string, event: Event) {
    event.stopPropagation();
    const current = new Set(this.exportSelectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.exportSelectedIds.set(current);
  }

  selectAllForExport() {
    const current = new Set(this.exportSelectedIds());
    for (const c of this.rankedCards()) {
      current.add(c.id);
    }
    this.exportSelectedIds.set(current);
    this.favoritesService.triggerToast('Todas las locaciones del ranking marcadas para exportar.');
  }

  deselectAllForExport() {
    const current = new Set(this.exportSelectedIds());
    for (const c of this.rankedCards()) {
      current.delete(c.id);
    }
    this.exportSelectedIds.set(current);
    this.favoritesService.triggerToast('Selección de exportación vaciada.');
  }

  // Regla de votación / 1 desmarcado por sesión
  isFavorite(id: string): boolean {
    return this.favoritesService.isFavorite(id);
  }

  isSessionUnfavorited(id: string): boolean {
    return this.favoritesService.hasSessionUnfavorited(id);
  }

  getCardLikes(id: string): number {
    return this.favoritesService.getLikes(id);
  }

  getHeartVariation(isFav: boolean): string {
    return isFav ? "'FILL' 1" : "'FILL' 0";
  }

  handleToggleCardSelection(card: SelectedCardItem) {
    const res = this.favoritesService.toggleFavoriteWithSessionRule(card.id, card.title);
    // Notificación y feedback ya emitidos por FavoritesService
  }

  public currentLightboxCard = computed(() => {
    const idx = this.lightboxIdx();
    const cards = this.rankedCards();
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

  copyShareLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      this.favoritesService.triggerToast('Enlace de ranking de seleccionadas copiado al portapapeles.');
    } else {
      this.favoritesService.triggerToast('Enlace listo para compartir.');
    }
  }

  // Descarga real de CSV con UTF-8 BOM
  downloadCsv() {
    const cardsToExport = this.rankedCards().filter(c => this.exportSelectedIds().has(c.id));
    if (cardsToExport.length === 0) {
      this.favoritesService.triggerToast('Por favor selecciona al menos una locación con la casilla "Exportar" para generar el CSV.', 'warning');
      return;
    }

    const headers = [
      'Ranking',
      'Locación',
      'Proyecto',
      'Encuadre Técnico',
      'Votos Selecciones Clientes',
      'Estado Nota DP',
      'Especificaciones Técnicas',
      'Superficie',
      'Sonido Directo',
      'Formato Master'
    ];

    const rows = cardsToExport.map((card, idx) => {
      const likes = this.favoritesService.getLikes(card.id);
      const note = this.favoritesService.getNote(card.id);
      const noteStatus = note 
        ? `Activa [${note.category}]: "${note.noteText.replace(/"/g, '""')}"` 
        : 'Sin nota técnica';

      return [
        `#${idx + 1}`,
        `"${card.locationName.replace(/"/g, '""')}"`,
        `"${(card.projectTitle || this.currentProjectTitle()).replace(/"/g, '""')}"`,
        `"${card.title.replace(/"/g, '""')}"`,
        likes,
        `"${noteStatus}"`,
        `"${card.specs.replace(/"/g, '""')}"`,
        `"${card.areaText}"`,
        card.soundCheck ? 'Direct Sound OK' : 'Aislamiento Parcial',
        `"4K Master RAW WebP"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PFE_Locaciones_Seleccionadas_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.favoritesService.triggerToast(`Lista CSV de ${cardsToExport.length} locaciones seleccionadas descargada correctamente.`);
  }

  // Exportar Resumen PDF Imprimible Real
  exportDossier() {
    const cardsToExport = this.rankedCards().filter(c => this.exportSelectedIds().has(c.id));
    if (cardsToExport.length === 0) {
      this.favoritesService.triggerToast('Por favor selecciona al menos una locación con la casilla "Exportar" para generar el resumen PDF.', 'warning');
      return;
    }

    this.favoritesService.triggerToast(`Generando Resumen Ejecutivo PDF con ${cardsToExport.length} locaciones seleccionadas...`);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>PFE Scouting — Resumen Ejecutivo de Locaciones Seleccionadas</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111; margin: 0; padding: 20px; line-height: 1.5; }
          .header { border-bottom: 3px solid #111; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .badge { background: #000; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          .meta { font-size: 12px; color: #555; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; page-break-inside: avoid; }
          .card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; page-break-inside: avoid; margin-bottom: 16px; background: #fafafa; }
          .card img { width: 100%; height: 180px; object-fit: cover; display: block; }
          .card-content { padding: 12px; }
          .loc-name { font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; }
          .loc-title { font-size: 15px; font-weight: 800; margin: 2px 0 6px; }
          .specs { font-size: 11px; color: #444; margin-bottom: 6px; }
          .rank-tag { display: inline-block; background: #fef08a; color: #713f12; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 900; margin-right: 6px; }
          .dp-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 8px; margin-top: 8px; font-size: 11px; color: #92400e; }
          .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 11px; color: #777; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">PFE SCOUTING • LOCACIONES DE PRODUCCIÓN</div>
            <div class="meta">Resumen Ejecutivo de Locaciones Seleccionadas por el Equipo • ${new Date().toLocaleDateString()}</div>
          </div>
          <div>
            <span class="badge">TOP GLOBAL</span>
          </div>
        </div>

        <div style="margin-bottom: 16px; font-size: 13px; color: #333;">
          Total de locaciones incluidas en este resumen: <strong>${cardsToExport.length}</strong>. Aprobado para gestión de scouting técnico y permisos de rodaje.
        </div>

        <div class="grid">
          ${cardsToExport.map((c, i) => {
            const likes = this.favoritesService.getLikes(c.id);
            const note = this.favoritesService.getNote(c.id);
            return `
              <div class="card">
                <img src="${c.src}" alt="${c.title}"/>
                <div class="card-content">
                  <div class="loc-name"><span class="rank-tag">#${i + 1} • ${likes} VOTOS</span> ${c.locationName}</div>
                  <div class="loc-title">${c.title}</div>
                  <div class="specs"><strong>Proyecto:</strong> ${c.projectTitle || this.currentProjectTitle()}</div>
                  <div class="specs"><strong>Detalles:</strong> ${c.specs}</div>
                  <div class="specs"><strong>Superficie:</strong> ${c.areaText} • <strong>Sonido:</strong> ${c.soundCheck ? 'Direct Sound OK' : 'Aislamiento Parcial'}</div>
                  ${note ? `
                    <div class="dp-box">
                      <strong>Nota DP [${note.category}]:</strong> "${note.noteText}" — <em>${note.author}</em>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="footer">
          <span>PFE Production Facilities • Documento Confidencial Protegido por NDA</span>
          <span>Página 1 de 1</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      // Si el navegador bloquea el pop-up, descargar el HTML directamente
      const link = document.createElement('a');
      link.href = url;
      link.download = `PFE_Resumen_Ejecutivo_Seleccionadas_${new Date().getFullYear()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Lightbox controls
  public zoomLevel = signal<number>(1);
  public isNativeFullscreen = signal<number | boolean>(false);

  openLightbox(idx: number) {
    this.lightboxIdx.set(idx);
    this.zoomLevel.set(1);
    const card = this.rankedCards()[idx];
    if (card) {
      this.favoritesService.recordMediaClick(card.id);
    }
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
    const total = this.rankedCards().length;
    if (total === 0) return;
    const current = this.lightboxIdx() ?? 0;
    const newIdx = (current - 1 + total) % total;
    this.lightboxIdx.set(newIdx);
    this.zoomLevel.set(1);
    const card = this.rankedCards()[newIdx];
    if (card) this.favoritesService.recordMediaClick(card.id);
  }

  nextLightbox() {
    const total = this.rankedCards().length;
    if (total === 0) return;
    const current = this.lightboxIdx() ?? 0;
    const newIdx = (current + 1) % total;
    this.lightboxIdx.set(newIdx);
    this.zoomLevel.set(1);
    const card = this.rankedCards()[newIdx];
    if (card) this.favoritesService.recordMediaClick(card.id);
  }

  // DP Notes Modal & Chat Social
  public isDpNoteModalOpen = signal<boolean>(false);
  public noteInputText: string = '';
  public noteCategory = signal<string>('Lentes / Óptica');
  public noteAuthor: string = 'Director de Fotografía (DP)';
  public quickReplyText: string = '';

  public currentNote = computed<DpNote | undefined>(() => {
    const cur = this.currentLightboxCard();
    if (!cur) return undefined;
    return this.favoritesService.getNote(cur.id);
  });

  hasNote(id: string): boolean {
    return this.favoritesService.hasNote(id);
  }

  getNote(id: string): DpNote | undefined {
    return this.favoritesService.getNote(id);
  }

  openDpNoteModal() {
    const cur = this.currentLightboxCard();
    if (!cur) return;
    const existing = this.favoritesService.getNote(cur.id);
    if (existing) {
      this.noteInputText = existing.noteText;
      this.noteCategory.set(existing.category || 'Lentes / Óptica');
      this.noteAuthor = existing.author || 'Director de Fotografía (DP)';
    } else {
      this.noteInputText = '';
      this.noteCategory.set('Lentes / Óptica');
      this.noteAuthor = 'Director de Fotografía (DP)';
    }
    this.quickReplyText = '';
    this.isDpNoteModalOpen.set(true);
  }

  closeDpNoteModal() {
    this.isDpNoteModalOpen.set(false);
  }

  appendPreset(text: string) {
    if (this.noteInputText) {
      this.noteInputText += ` • ${text}`;
    } else {
      this.noteInputText = text;
    }
  }

  saveDpNote() {
    const cur = this.currentLightboxCard();
    if (!cur) return;
    if (!this.noteInputText || !this.noteInputText.trim()) {
      this.favoritesService.triggerToast('Por favor escribe el requerimiento técnico para la nota.', 'warning');
      return;
    }
    this.favoritesService.saveNote(
      cur.id, 
      this.noteInputText, 
      this.noteCategory(), 
      this.noteAuthor,
      {
        locationName: cur.locationName,
        mediaTitle: cur.title,
        mediaThumbnailUrl: cur.src,
        projectId: cur.projectId
      }
    );
    this.isDpNoteModalOpen.set(false);
  }

  sendQuickReply() {
    const cur = this.currentLightboxCard();
    if (!cur || !this.quickReplyText.trim()) return;
    this.favoritesService.addReplyToNote(cur.id, this.quickReplyText, this.noteAuthor || 'DP', 'DP');
    this.quickReplyText = '';
  }

  deleteDpNote() {
    const cur = this.currentLightboxCard();
    if (!cur) return;
    this.favoritesService.deleteNote(cur.id);
    this.isDpNoteModalOpen.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.lightboxIdx() !== null) {
      if (event.key === 'Escape') {
        if (this.isDpNoteModalOpen()) {
          this.closeDpNoteModal();
          return;
        }
        this.closeLightbox();
      }
      if (this.isDpNoteModalOpen()) return;
      if (event.key === 'ArrowRight') this.nextLightbox();
      if (event.key === 'ArrowLeft') this.prevLightbox();
      if (event.key === 'z' || event.key === 'Z') this.cycleZoom();
      if (event.key === 'f' || event.key === 'F') this.toggleFullscreen();
    }
  }
}
