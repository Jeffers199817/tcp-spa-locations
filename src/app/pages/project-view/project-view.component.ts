import { Component, computed, signal, inject, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { FavoritesService } from '../../services/favorites.service';
import { MediaItem } from '../../models/media.model';
import { Location } from '../../models/location.model';
import { PfeHeaderComponent } from '../../components/pfe-header/pfe-header.component';
import { PfeFooterComponent } from '../../components/pfe-footer/pfe-footer.component';

interface LightboxItem {
  id: string;
  title: string;
  locationName: string;
  subSection: string;
  specs: string;
  url: string;
  isVideo?: boolean;
}

@Component({
  selector: 'app-project-view',
  standalone: true,
  imports: [CommonModule, RouterModule, PfeHeaderComponent, PfeFooterComponent],
  template: `
    <!-- Topbar Compartida -->
    <app-pfe-header></app-pfe-header>

    <!-- Main Container -->
    <main class="w-full pt-16 bg-surface min-h-[calc(100vh-80px)] font-body-md text-on-surface antialiased">
      <div class="flex flex-col w-full">

        <!-- Toast Notifier (Supabase Realtime) -->
        <div class="fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-space-sm bg-inverse-surface text-inverse-on-surface px-space-md py-3 rounded-xl shadow-xl"
             [class.translate-y-24]="!lastToast().visible"
             [class.opacity-0]="!lastToast().visible"
             [class.translate-y-0]="lastToast().visible"
             [class.opacity-100]="lastToast().visible">
          <span class="w-2.5 h-2.5 rounded-full bg-tertiary-fixed animate-ping"></span>
          <span class="material-symbols-outlined text-[18px] text-tertiary-fixed">cloud_sync</span>
          <span class="font-label-lg text-label-lg text-xs">{{ lastToast().message }}</span>
        </div>

        <!-- Project Super-Header / Executive Banner -->
        <section class="w-full bg-surface-container-low px-margin-mobile md:px-margin lg:px-margin-desktop py-space-xl py-8 px-4 sm:px-6 lg:px-8 border-b border-surface-container-high/60">
          <div class="max-w-[1680px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg gap-4">
            <div class="flex flex-col gap-space-sm gap-2 max-w-3xl text-left">
              <div class="flex flex-wrap items-center gap-space-sm gap-2">
                <span class="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md uppercase tracking-wider text-xs font-bold border border-surface-container-high">
                  Revisión Oficial v{{ project()?.revision || 2 }}.0
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-secondary shadow-xs border border-surface-container-high text-xs font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Catálogo Aprobado para Rodaje</span>
                </span>
              </div>

              <h1 class="font-display-hero text-display-hero text-on-surface tracking-tight mt-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                {{ project()?.title || 'Campaña Global Verano 2026' }}
              </h1>

              <div class="flex flex-wrap items-center gap-x-space-md gap-x-3 gap-y-1 font-body-md text-body-md text-on-surface-variant text-xs sm:text-sm">
                <span class="flex items-center gap-1 text-on-surface font-semibold">
                  <span class="material-symbols-outlined text-[18px] text-primary">person_outline</span>
                  Coordinación PFE: Mateo Valenzuela
                </span>
                <span class="opacity-40">•</span>
                <span>Locaciones: {{ project()?.locations?.length || 0 }}</span>
                <span class="opacity-40">•</span>
                <span>Activos disponibles: {{ allGalleryItems().length }} fotos y videos técnicos</span>
              </div>
            </div>

            <!-- Quick Action Deck for Clients -->
            <div class="flex flex-wrap items-center gap-space-sm gap-2">
              <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-surface-container-high text-xs font-semibold shadow-xs text-on-surface">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-on-surface-variant font-medium">Sesión Autorizada:</span>
                <strong class="font-mono text-primary font-bold text-xs">{{ currentCode() }}</strong>
              </div>
              <button (click)="copyDirectLink()" class="flex items-center gap-2 bg-surface-container-lowest px-4 py-2.5 rounded-lg shadow-sm text-on-surface font-label-lg text-xs font-bold hover:bg-surface-container transition-colors cursor-pointer border border-surface-container-high" type="button" title="Copiar enlace con código directo para compartir con tu equipo">
                <span class="material-symbols-outlined text-[18px] text-primary">link</span>
                <span>Copiar Enlace con Código</span>
              </button>
              <button (click)="openDossier()" class="flex items-center gap-2 bg-surface-container-lowest px-4 py-2.5 rounded-lg shadow-sm text-on-surface font-label-lg text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer border border-surface-container-high" type="button">
                <span class="material-symbols-outlined text-[18px]">download</span>
                <span>Exportar Dossier PDF</span>
              </button>
              <button (click)="goToFavorites()" class="flex items-center gap-2 bg-secondary px-4 py-2.5 rounded-lg text-on-secondary font-label-lg shadow-sm hover:opacity-95 transition-opacity text-xs font-semibold cursor-pointer" type="button">
                <span class="material-symbols-outlined text-[18px]">star</span>
                <span>Ver Selección ({{ favCount() }})</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Sticky View Control Bar & Filters -->
        <section class="sticky top-16 z-30 w-full bg-surface-container-lowest/95 shadow-sm backdrop-blur-md px-margin-mobile md:px-margin lg:px-margin-desktop py-space-sm py-3 px-4 sm:px-6 lg:px-8 border-b border-surface-container-high/80">
          <div class="max-w-[1680px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md gap-3">
            
            <!-- Location View Mode Tabs -->
            <div class="flex items-center gap-space-xs gap-2 overflow-x-auto pb-1 md:pb-0">
              <button 
                class="flex items-center gap-2 px-4 py-2 rounded-lg bg-inverse-surface text-inverse-on-surface font-label-lg text-label-lg whitespace-nowrap shadow-sm text-xs font-semibold cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">grid_view</span>
                <span>Catálogo Completo</span>
                <span class="bg-surface-container-highest/30 px-2 py-0.5 rounded-full text-[10px]">{{ project()?.locations?.length || 0 }} locs • {{ allGalleryItems().length }} medios</span>
              </button>

              <a routerLink="/seleccionadas" 
                 class="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-colors whitespace-nowrap text-xs font-semibold">
                <span class="material-symbols-outlined text-[18px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span>
                <span>Seleccionadas</span>
                <span class="bg-primary text-on-primary font-spec-numeral text-xs px-2 py-0.5 rounded-full font-bold">
                  {{ favCount() }}
                </span>
              </a>
            </div>

            <!-- Density Switcher -->
            <div class="flex items-center gap-3 justify-end">
              <div class="flex items-center bg-surface-container-low p-1 rounded-lg shrink-0">
                <button (click)="density.set('large')" 
                        [class.bg-surface-container-lowest]="density() === 'large'" 
                        [class.shadow-sm]="density() === 'large'"
                        [class.text-on-surface]="density() === 'large'"
                        [class.text-on-surface-variant]="density() !== 'large'"
                        class="p-1.5 rounded transition-all cursor-pointer" title="Vista Grande (3 Columnas)">
                  <span class="material-symbols-outlined text-[18px]">view_agenda</span>
                </button>
                <button (click)="density.set('comfortable')" 
                        [class.bg-surface-container-lowest]="density() === 'comfortable'" 
                        [class.shadow-sm]="density() === 'comfortable'"
                        [class.text-on-surface]="density() === 'comfortable'"
                        [class.text-on-surface-variant]="density() !== 'comfortable'"
                        class="p-1.5 rounded transition-all cursor-pointer" title="Vista Cómoda (4 Columnas)">
                  <span class="material-symbols-outlined text-[18px]">grid_on</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        <!-- Main Showcase Content: DYNAMIC LOCATIONS FOR ACTIVE PROJECT -->
        <div class="w-full px-margin-mobile md:px-margin lg:px-margin-desktop py-space-xl py-6 px-4 sm:px-6 lg:px-8 flex flex-col gap-space-xl gap-8 max-w-[1680px] mx-auto">

          @for (loc of project()?.locations; track loc.id; let locIdx = $index) {
            <article class="location-group flex flex-col gap-space-lg gap-4 bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg p-5 shadow-sm border border-surface-container-high/60">
              
              <!-- Location Header Bar -->
              <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md gap-3 bg-surface-container-low p-space-md p-4 rounded-xl text-left">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-space-sm gap-2 flex-wrap text-xs">
                    <span class="bg-primary text-on-primary font-label-md text-label-md px-2.5 py-0.5 rounded-full font-bold">
                      LOCACIÓN #0{{ locIdx + 1 }}
                    </span>
                    <span class="bg-surface-container-highest text-on-surface font-label-md text-label-md px-2.5 py-0.5 rounded-full font-semibold">
                      Recinto Curado
                    </span>
                    <span class="text-tertiary flex items-center gap-1 font-label-md text-label-md font-semibold">
                      <span class="material-symbols-outlined text-[16px]">check_circle</span>
                      Permisos Oficiales Aprobados
                    </span>
                  </div>
                  <h2 class="font-headline-xl text-headline-xl text-on-surface tracking-tight mt-1 text-2xl font-bold">
                    {{ loc.title }}
                  </h2>
                  <p class="font-body-md text-body-md text-on-surface-variant text-xs sm:text-sm">
                    {{ loc.description }}
                  </p>
                </div>

                <div class="flex items-center gap-space-sm gap-2 shrink-0">
                  <div class="bg-surface-container-lowest px-3 py-2 rounded-lg text-right hidden sm:block border border-surface-container-high">
                    <p class="font-label-md text-label-md text-on-surface-variant text-[11px]">Medios Disponibles</p>
                    <p class="font-spec-numeral text-spec-numeral text-on-surface font-bold text-sm">{{ countMediaForLoc(loc) }} activos técnicos</p>
                  </div>
                  <button (click)="openSpecsModal(loc.title)" class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md shadow-sm border border-surface-container-high text-xs font-semibold cursor-pointer" type="button">
                    <span class="material-symbols-outlined text-[18px]">description</span>
                    <span>Ver Hoja Técnica</span>
                  </button>
                </div>
              </div>

              <!-- Hero Master Preview if available -->
              @if (loc.coverUrl) {
                <div class="relative w-full h-[360px] md:h-[480px] rounded-xl overflow-hidden shadow-sm group">
                  <img 
                    (click)="openLightboxItemById(loc.coverMediaId || ('cover-' + loc.id))"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer" 
                    [alt]="loc.title" 
                    [src]="loc.coverUrl"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-on-surface/85 via-transparent to-transparent flex flex-col justify-end p-space-lg p-6 text-surface pointer-events-none">
                    <div class="flex items-end justify-between gap-space-md gap-4 pointer-events-auto">
                      <div class="text-left">
                        <span class="font-label-md text-label-md uppercase tracking-wider text-xs block text-white/80">Vista Panorámica Maestra</span>
                        <p class="font-headline-lg text-headline-lg font-bold text-white text-xl sm:text-2xl mt-0.5">{{ loc.title }}</p>
                        <p class="font-body-sm text-body-sm text-white/90 text-xs mt-1 max-w-xl line-clamp-1">{{ loc.description }}</p>
                      </div>
                      <button 
                        (click)="toggleFavorite(loc.coverMediaId || ('cover-' + loc.id), loc.title + ' — Portada')"
                        class="fav-toggle-btn w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer">
                        <span class="material-symbols-outlined text-[22px]" 
                              [class.text-primary]="isFav(loc.coverMediaId || ('cover-' + loc.id))" 
                              [class.text-gray-400]="!isFav(loc.coverMediaId || ('cover-' + loc.id))" 
                              [style.fontVariationSettings]="getFill(loc.coverMediaId || ('cover-' + loc.id))">
                          star
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              }

              <!-- Subsections Grid -->
              @for (sec of loc.sections; track sec.id) {
                <div class="flex flex-col gap-space-md gap-3 pt-space-sm pt-2 text-left">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-space-sm gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                      <h3 class="font-headline-md text-headline-md text-on-surface font-bold text-lg">{{ sec.title }}</h3>
                      <span class="text-on-surface-variant font-label-md text-label-md text-xs">({{ sec.media?.length || 0 }} medios)</span>
                    </div>
                    <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-xs font-semibold">{{ sec.description }}</span>
                  </div>

                  <!-- Cards Grid -->
                  <div class="asset-grid grid gap-space-md gap-4"
                       [class.grid-cols-1]="true"
                       [class.sm:grid-cols-2]="density() === 'large'"
                       [class.lg:grid-cols-3]="density() === 'large'"
                       [class.sm:grid-cols-3]="density() === 'comfortable'"
                       [class.lg:grid-cols-4]="density() === 'comfortable'">

                    @for (item of sec.media; track item.id) {
                      <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div class="relative aspect-[16/10] overflow-hidden bg-surface-container">
                          <img 
                            (click)="openLightboxItemById(item.id)"
                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                            [src]="item.url" 
                            [alt]="item.title"
                          />
                          
                          @if (item.type === 'video') {
                            <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors pointer-events-none">
                              <div class="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg">
                                <span class="material-symbols-outlined text-[28px]">play_arrow</span>
                              </div>
                            </div>
                            <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white font-label-md text-[10px] font-bold">ProRes Proxy</span>
                          } @else {
                            <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-md text-[10px] font-bold">4K WebP</span>
                          }

                          <button 
                            (click)="toggleFavorite(item.id, item.title)"
                            class="fav-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer">
                            <span class="material-symbols-outlined text-[18px]" 
                                  [class.text-primary]="isFav(item.id)" 
                                  [class.text-gray-400]="!isFav(item.id)" 
                                  [style.fontVariationSettings]="getFill(item.id)">
                              star
                            </span>
                          </button>
                        </div>

                        <div class="p-space-sm p-3.5 flex flex-col justify-between flex-grow gap-1">
                          <div class="flex items-center justify-between">
                            <span class="font-headline-sm text-sm font-bold text-on-surface truncate">{{ item.title }}</span>
                            <span class="font-label-md text-label-md text-primary font-semibold text-xs">{{ item.mime.includes('video') ? 'Video' : '4K' }}</span>
                          </div>
                          <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                            <span class="px-1.5 py-0.5 rounded bg-surface-container">{{ item.width }}x{{ item.height }}</span>
                            <span class="px-1.5 py-0.5 rounded bg-surface-container text-emerald-700 font-semibold">Direct Sound OK</span>
                            <button (click)="downloadMediaItem(item, '4k')" class="ml-auto text-secondary hover:text-primary transition-colors flex items-center gap-0.5 font-bold cursor-pointer" title="Descargar resolución master">
                              <span class="material-symbols-outlined text-[14px]">download</span>
                              <span>Descargar</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    }
                  </div>
                </div>
              }

            </article>
          }

        </div>

      </div>
    </main>

    <!-- Professional Footer -->
    <app-pfe-footer></app-pfe-footer>

    <!-- ULTRA-HIGH RESOLUTION IMMERSIVE LIGHTBOX MODAL WITH MULTI-RESOLUTION DOWNLOAD -->
    @if (currentLightbox()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-between bg-[#050505]/98 backdrop-blur-xl p-3 sm:p-5 animate-in fade-in select-none">
        
        <!-- Header Controls (Barra de Control con Alto Contraste) -->
        <div class="flex items-center justify-between text-white max-w-7xl mx-auto w-full z-20 bg-[#0c0c0e]/95 backdrop-blur-xl border border-white/25 p-2.5 sm:px-4 rounded-xl shadow-2xl">
          <div class="flex flex-col text-left">
            <div class="flex items-center gap-2">
              <span class="font-bold text-xs sm:text-sm text-primary uppercase tracking-wider">{{ currentLightbox()?.locationName }}</span>
              <span class="text-white/40">•</span>
              <span class="text-[11px] text-white/80 font-mono">{{ currentLightboxIndex() + 1 }} de {{ allGalleryItems().length }}</span>
            </div>
            <h3 class="text-base sm:text-lg font-bold text-white mt-0.5 truncate max-w-md sm:max-w-xl">{{ currentLightbox()?.title }}</h3>
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
                  <button (click)="triggerDownload(currentLightbox()!, '4k')" class="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 text-white flex items-center justify-between cursor-pointer">
                    <span>4K Master RAW</span>
                    <span class="text-[10px] text-white/70 font-mono">3840×2400</span>
                  </button>
                  <button (click)="triggerDownload(currentLightbox()!, '1080p')" class="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 text-white flex items-center justify-between cursor-pointer">
                    <span>Full HD 1080p</span>
                    <span class="text-[10px] text-white/70 font-mono">1920×1200</span>
                  </button>
                  <button (click)="triggerDownload(currentLightbox()!, 'proxy')" class="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 text-white flex items-center justify-between cursor-pointer">
                    <span>Proxy WebP</span>
                    <span class="text-[10px] text-white/70 font-mono">1280×800</span>
                  </button>
                  @if (currentLightbox()?.isVideo) {
                    <button (click)="triggerDownload(currentLightbox()!, 'prores')" class="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 text-primary font-bold flex items-center justify-between cursor-pointer border-t border-white/15 mt-1 pt-1.5">
                      <span>ProRes Proxy 422</span>
                      <span class="text-[10px] font-mono">1080p ProRes</span>
                    </button>
                  }
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

            <!-- Favorite button in modal -->
            <button (click)="toggleFavorite(currentLightbox()!.id, currentLightbox()!.title)" 
                    class="px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer border"
                    [class.bg-primary]="isFav(currentLightbox()!.id)"
                    [class.border-primary]="isFav(currentLightbox()!.id)"
                    [class.text-white]="isFav(currentLightbox()!.id)"
                    [class.bg-[#18181c]]="!isFav(currentLightbox()!.id)"
                    [class.border-white/30]="!isFav(currentLightbox()!.id)"
                    [class.text-white]="!isFav(currentLightbox()!.id)">
              <span class="material-symbols-outlined text-[18px]" 
                    [style.fontVariationSettings]="getFill(currentLightbox()!.id)">
                star
              </span>
              <span class="hidden sm:inline">{{ isFav(currentLightbox()!.id) ? 'En Selección' : 'Seleccionar' }}</span>
            </button>

            <!-- Close button -->
            <button (click)="closeLightbox()" 
                    class="w-9 h-9 rounded-lg bg-[#18181c] hover:bg-rose-600 text-white border border-white/30 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ml-1" 
                    title="Cerrar (Esc)">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <!-- Center Image / Video Stage with Navigation Arrows -->
        <div class="relative flex-grow flex items-center justify-center overflow-hidden my-auto w-full">
          
          <!-- Prev Arrow -->
          <button (click)="prevLightbox()" 
                  class="absolute left-2 sm:left-6 z-20 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#0c0c0e]/95 hover:bg-primary text-white border-2 border-white/40 flex items-center justify-center backdrop-blur-md transition-all shadow-[0_4px_30px_rgba(0,0,0,0.9)] hover:scale-105 active:scale-95 cursor-pointer"
                  title="Anterior (Flecha Izquierda)">
            <span class="material-symbols-outlined text-[28px]">chevron_left</span>
          </button>

          <!-- Media Element Container (Supports Pan & Dynamic Zoom) -->
          <div class="w-full h-full flex items-center justify-center p-1 sm:p-4 overflow-auto" 
               [class.cursor-grab]="zoomLevel() > 1">
            @if (currentLightbox()?.isVideo) {
              <div class="max-h-[82vh] max-w-[90vw] aspect-video bg-black rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden border border-white/15">
                <img [src]="currentLightbox()?.url" class="w-full h-full object-cover opacity-60"/>
                <div class="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div class="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl animate-pulse cursor-pointer">
                    <span class="material-symbols-outlined text-4xl">play_arrow</span>
                  </div>
                  <span class="text-white text-xs font-bold bg-black/80 px-4 py-1.5 rounded-full border border-white/20">
                    Reproduciendo Streaming ProRes Proxy 422
                  </span>
                </div>
              </div>
            } @else {
              <img [src]="currentLightbox()?.url" 
                   [alt]="currentLightbox()?.title" 
                   class="max-h-[88vh] max-w-[94vw] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-out origin-center"
                   [style.transform]="'scale(' + zoomLevel() + ')'"
              />
            }
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
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-amber-400">wb_sunny</span>
              {{ currentLightbox()?.specs }}
            </span>
            <span class="hidden md:inline text-white/30">•</span>
            <span class="hidden md:flex items-center gap-1 text-white/80">
              <span class="material-symbols-outlined text-[15px] text-tertiary-fixed">hd</span>
              <span>Ultra Alta Resolución 4K RAW WebP</span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button (click)="addDpNote()" class="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">edit_note</span>
              <span>Añadir Nota de DP</span>
            </button>
          </div>
        </div>

      </div>
    }
  `
})
export class ProjectViewComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private favoritesService = inject(FavoritesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public project = computed(() => this.projectsService.currentProject());
  public favCount = computed(() => this.favoritesService.count());
  public lastToast = computed(() => this.favoritesService.lastToast());
  public currentCode = computed(() => this.project()?.accessCode || 'LOC-2026-X');

  public density = signal<'large' | 'comfortable'>('large');
  public currentLightbox = signal<LightboxItem | null>(null);
  public zoomLevel = signal<number>(1);
  public isNativeFullscreen = signal<boolean>(false);
  public isDownloadMenuOpen = signal<boolean>(false);

  // Lista plana y dinámica de todos los elementos para navegación fluida
  public allGalleryItems = computed<LightboxItem[]>(() => {
    const proj = this.project();
    if (!proj || !proj.locations) return [];
    const items: LightboxItem[] = [];

    for (const loc of proj.locations) {
      if (loc.coverUrl) {
        items.push({
          id: loc.coverMediaId || ('cover-' + loc.id),
          title: loc.title + ' — Vista Panorámica',
          locationName: loc.title,
          subSection: 'Portada Maestra',
          specs: loc.description,
          url: loc.coverUrl
        });
      }
      for (const sec of loc.sections || []) {
        for (const med of sec.media || []) {
          items.push({
            id: med.id,
            title: med.title,
            locationName: loc.title,
            subSection: sec.title,
            specs: `${sec.title} • Resolución: ${med.width}x${med.height} • ${med.mime} • ${sec.description || 'Luz natural'}`,
            url: med.url || '',
            isVideo: med.type === 'video'
          });
        }
      }
    }
    return items;
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectsService.selectProjectById(id);
      }
    });
  }

  countMediaForLoc(loc: Location): number {
    let count = loc.coverUrl ? 1 : 0;
    for (const sec of loc.sections || []) {
      count += (sec.media || []).length;
    }
    return count;
  }

  isFav(id: string): boolean {
    return this.favoritesService.isFavorite(id);
  }

  getFill(id: string): string {
    return this.isFav(id) ? "'FILL' 1" : "'FILL' 0";
  }

  toggleFavorite(id: string, name?: string): void {
    this.favoritesService.toggleFavorite(id, name);
  }

  openLightboxItemById(id: string) {
    const item = this.allGalleryItems().find(i => i.id === id);
    if (item) {
      this.currentLightbox.set(item);
      this.zoomLevel.set(1);
      this.isDownloadMenuOpen.set(false);
      document.body.style.overflow = 'hidden';
    }
  }

  currentLightboxIndex(): number {
    const cur = this.currentLightbox();
    const items = this.allGalleryItems();
    if (!cur || items.length === 0) return 0;
    const idx = items.findIndex(i => i.id === cur.id);
    return idx >= 0 ? idx : 0;
  }

  prevLightbox() {
    const items = this.allGalleryItems();
    if (items.length === 0) return;
    const idx = this.currentLightboxIndex();
    const newIdx = (idx - 1 + items.length) % items.length;
    this.currentLightbox.set(items[newIdx]);
    this.zoomLevel.set(1);
    this.isDownloadMenuOpen.set(false);
  }

  nextLightbox() {
    const items = this.allGalleryItems();
    if (items.length === 0) return;
    const idx = this.currentLightboxIndex();
    const newIdx = (idx + 1) % items.length;
    this.currentLightbox.set(items[newIdx]);
    this.zoomLevel.set(1);
    this.isDownloadMenuOpen.set(false);
  }

  cycleZoom() {
    const current = this.zoomLevel();
    if (current === 1) {
      this.zoomLevel.set(1.6);
      this.favoritesService.triggerToast('Zoom 1.6x: Detalle arquitectónico activo');
    } else if (current === 1.6) {
      this.zoomLevel.set(2.5);
      this.favoritesService.triggerToast('Zoom 2.5x: Textura 4K en máxima resolución');
    } else {
      this.zoomLevel.set(1);
      this.favoritesService.triggerToast('Zoom 1x: Ajustado a pantalla');
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        this.isNativeFullscreen.set(true);
      }).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          this.isNativeFullscreen.set(false);
        }).catch(() => {});
      }
    }
  }

  closeLightbox() {
    this.currentLightbox.set(null);
    this.zoomLevel.set(1);
    this.isDownloadMenuOpen.set(false);
    document.body.style.overflow = '';
  }

  toggleDownloadMenu() {
    this.isDownloadMenuOpen.update(v => !v);
  }

  triggerDownload(item: LightboxItem, resolution: string) {
    this.isDownloadMenuOpen.set(false);
    this.downloadFile(item.url || '', `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${resolution}.webp`);
    this.favoritesService.triggerToast(`Descargando "${item.title}" en formato ${resolution.toUpperCase()}...`);
  }

  downloadMediaItem(item: MediaItem, resolution: string) {
    this.downloadFile(item.url || '', `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${resolution}.webp`);
    this.favoritesService.triggerToast(`Descargando "${item.title}" en formato ${resolution.toUpperCase()}...`);
  }

  private downloadFile(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  addDpNote() {
    this.favoritesService.triggerToast('Nota guardada para el Director de Fotografía.');
  }

  openSpecsModal(locName: string) {
    this.favoritesService.triggerToast(`Hoja técnica de "${locName}" lista para inspección.`);
  }

  openDossier() {
    this.favoritesService.triggerToast('Preparando Dossier PDF con ficha técnica completa...');
  }

  copyDirectLink() {
    const code = this.currentCode();
    const link = `${window.location.origin}/p/${this.project()?.id || '10000000-0000-4000-8000-000000000001'}?code=${code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    this.favoritesService.triggerToast(`Enlace directo copiado: ${link}`);
  }

  goToFavorites() {
    this.router.navigate(['/seleccionadas']);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.currentLightbox()) {
      if (event.key === 'Escape') this.closeLightbox();
      if (event.key === 'ArrowRight') this.nextLightbox();
      if (event.key === 'ArrowLeft') this.prevLightbox();
      if (event.key === 'z' || event.key === 'Z') this.cycleZoom();
      if (event.key === 'f' || event.key === 'F') this.toggleFullscreen();
    }
  }
}
