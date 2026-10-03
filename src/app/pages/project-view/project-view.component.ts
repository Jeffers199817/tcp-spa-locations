import { Component, computed, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { FavoritesService } from '../../services/favorites.service';
import { MediaItem } from '../../models/media.model';
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
        <section class="w-full bg-surface-container-low px-margin-mobile md:px-margin lg:px-margin-desktop py-space-xl border-b border-surface-container-high/60">
          <div class="max-w-[1680px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            <div class="flex flex-col gap-space-sm max-w-3xl text-left">
              <div class="flex flex-wrap items-center gap-space-sm">
                <span class="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md uppercase tracking-wider text-xs font-semibold">
                  Revisión publicada: v2.1 (Inmutable)
                </span>
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-tertiary shadow-sm text-xs font-semibold">
                  <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span class="font-label-md text-label-md">Supabase Realtime Activo</span>
                </div>
                <span class="font-label-md text-label-md text-on-surface-variant flex items-center gap-1 text-xs">
                  <span class="material-symbols-outlined text-[16px]">lock</span>
                  Acceso Cliente Aprobado ({{ currentCode() }})
                </span>
              </div>

              <h1 class="font-display-hero text-display-hero text-on-surface tracking-tight mt-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                {{ project()?.title || 'Campaña Global Verano 2026' }}
              </h1>

              <div class="flex flex-wrap items-center gap-x-space-md gap-y-1 font-body-md text-body-md text-on-surface-variant text-xs sm:text-sm">
                <span class="flex items-center gap-1 text-on-surface font-semibold">
                  <span class="material-symbols-outlined text-[18px] text-primary">person_outline</span>
                  Director de Arte: Mateo Valenzuela
                </span>
                <span class="opacity-40">•</span>
                <span>Locaciones asignadas: 3</span>
                <span class="opacity-40">•</span>
                <span>Total de activos técnicos: 46 (42 fotos, 4 clips)</span>
              </div>
            </div>

            <!-- Quick Action Deck for Clients -->
            <div class="flex flex-wrap items-center gap-space-sm">
              <button (click)="copyDirectLink()" class="flex items-center gap-2 bg-surface-container-lowest px-4 py-2.5 rounded-lg shadow-sm text-on-surface font-label-lg text-xs font-bold hover:bg-surface-container transition-colors cursor-pointer border border-surface-container-high" type="button" title="Copiar enlace con código directo para compartir con tu equipo">
                <span class="material-symbols-outlined text-[18px] text-primary">link</span>
                <span>Copiar Enlace con Código</span>
              </button>
              <button (click)="openDossier()" class="flex items-center gap-2 bg-surface-container-lowest px-4 py-2.5 rounded-lg shadow-sm text-on-surface font-label-lg text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer border border-surface-container-high" type="button">
                <span class="material-symbols-outlined text-[18px]">download</span>
                <span>Exportar Dossier PDF</span>
              </button>
              <button (click)="goToFavorites()" class="flex items-center gap-2 bg-secondary px-4 py-2.5 rounded-lg text-on-secondary font-label-lg shadow-sm hover:opacity-95 transition-opacity text-xs font-semibold cursor-pointer" type="button">
                <span class="material-symbols-outlined text-[18px]">gavel</span>
                <span>Validar Opciones de Rodaje ({{ favCount() }})</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Sticky View Control Bar & Filters -->
        <section class="sticky top-16 z-30 w-full bg-surface-container-lowest/95 shadow-sm backdrop-blur-md px-margin-mobile md:px-margin lg:px-margin-desktop py-space-sm border-b border-surface-container-high/80">
          <div class="max-w-[1680px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
            
            <!-- Location View Mode Tabs -->
            <div class="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0">
              <button 
                (click)="selectedCategory.set('all')"
                [class.bg-inverse-surface]="selectedCategory() === 'all'"
                [class.text-inverse-on-surface]="selectedCategory() === 'all'"
                [class.bg-surface-container-low]="selectedCategory() !== 'all'"
                [class.text-on-surface]="selectedCategory() !== 'all'"
                class="flex items-center gap-2 px-4 py-2 rounded-lg font-label-lg text-label-lg whitespace-nowrap shadow-sm text-xs font-semibold cursor-pointer transition-colors">
                <span class="material-symbols-outlined text-[18px]">grid_view</span>
                <span>Todas las Locaciones</span>
                <span class="bg-surface-container-highest/30 px-2 py-0.5 rounded-full text-[10px]">3 locs • 46 medios</span>
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

            <!-- Quick Category Chips & Density Switcher -->
            <div class="flex items-center gap-space-sm justify-between md:justify-end overflow-x-auto">
              <div class="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                <button (click)="selectedCategory.set('all')" 
                        [class.bg-on-surface]="selectedCategory() === 'all'" 
                        [class.text-surface]="selectedCategory() === 'all'" 
                        [class.bg-surface-container-low]="selectedCategory() !== 'all'" 
                        class="px-3.5 py-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer">
                  Todas
                </button>
                <button (click)="selectedCategory.set('fachadas')" 
                        [class.bg-on-surface]="selectedCategory() === 'fachadas'" 
                        [class.text-surface]="selectedCategory() === 'fachadas'" 
                        [class.bg-surface-container-low]="selectedCategory() !== 'fachadas'" 
                        class="px-3.5 py-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer">
                  Fachadas
                </button>
                <button (click)="selectedCategory.set('cocinas')" 
                        [class.bg-on-surface]="selectedCategory() === 'cocinas'" 
                        [class.text-surface]="selectedCategory() === 'cocinas'" 
                        [class.bg-surface-container-low]="selectedCategory() !== 'cocinas'" 
                        class="px-3.5 py-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer">
                  Cocinas & Living
                </button>
                <button (click)="selectedCategory.set('terrazas')" 
                        [class.bg-on-surface]="selectedCategory() === 'terrazas'" 
                        [class.text-surface]="selectedCategory() === 'terrazas'" 
                        [class.bg-surface-container-low]="selectedCategory() !== 'terrazas'" 
                        class="px-3.5 py-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer">
                  Terrazas & Jardín
                </button>
                <button (click)="selectedCategory.set('industriales')" 
                        [class.bg-on-surface]="selectedCategory() === 'industriales'" 
                        [class.text-surface]="selectedCategory() === 'industriales'" 
                        [class.bg-surface-container-low]="selectedCategory() !== 'industriales'" 
                        class="px-3.5 py-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer">
                  Naves & Hangar
                </button>
              </div>

              <div class="h-6 w-px bg-surface-container-highest hidden sm:block shrink-0"></div>

              <!-- Density Switcher -->
              <div class="hidden sm:flex items-center bg-surface-container-low p-1 rounded-lg shrink-0">
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

        <!-- Main Showcase Content -->
        <div class="w-full px-margin-mobile md:px-margin lg:px-margin-desktop py-space-xl flex flex-col gap-space-xl max-w-[1680px] mx-auto">

          <!-- ==================== LOCACIÓN 1: Villa Moderna Pedregal ==================== -->
          @if (shouldShowLocation('pedregal')) {
            <article class="location-group flex flex-col gap-space-lg bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm border border-surface-container-high/60">
              
              <!-- Location Header Bar -->
              <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded-xl text-left">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-space-sm flex-wrap text-xs">
                    <span class="bg-primary text-on-primary font-label-md text-label-md px-2.5 py-0.5 rounded-full font-bold">
                      LOCACIÓN #01
                    </span>
                    <span class="bg-surface-container-highest text-on-surface font-label-md text-label-md px-2.5 py-0.5 rounded-full font-semibold">
                      Residencia Contemporánea
                    </span>
                    <span class="text-tertiary flex items-center gap-1 font-label-md text-label-md font-semibold">
                      <span class="material-symbols-outlined text-[16px]">check_circle</span>
                      Permiso Municipal Aprobado
                    </span>
                  </div>
                  <h2 class="font-headline-xl text-headline-xl text-on-surface tracking-tight mt-1 text-2xl font-bold">
                    Villa Moderna Pedregal
                  </h2>
                  <p class="font-body-md text-body-md text-on-surface-variant text-xs sm:text-sm">
                    Jardines del Pedregal, CDMX • 680 m² interiores • Techo doble altura 6.2m • Acometida trifásica 80A
                  </p>
                </div>
                <div class="flex items-center gap-space-sm shrink-0">
                  <div class="bg-surface-container-lowest px-3 py-2 rounded-lg text-right hidden sm:block border border-surface-container-high">
                    <p class="font-label-md text-label-md text-on-surface-variant text-[11px]">Activos Totales</p>
                    <p class="font-spec-numeral text-spec-numeral text-on-surface font-bold text-sm">18 fotos • 2 videos</p>
                  </div>
                  <button (click)="openSpecsModal('Villa Moderna Pedregal')" class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md shadow-sm border border-surface-container-high text-xs font-semibold cursor-pointer" type="button">
                    <span class="material-symbols-outlined text-[18px]">description</span>
                    <span>Ver Hoja Técnica</span>
                  </button>
                </div>
              </div>

              <!-- Hero Master Preview -->
              <div class="relative w-full h-[360px] md:h-[500px] rounded-xl overflow-hidden shadow-sm group">
                <img 
                  (click)="openLightboxItemById('m-ped-hero')"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer" 
                  alt="Villa Moderna Pedregal" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoPdw6Ah2CCawFhTG2RY1TikZ_30fDY0vIe2jzYIresWo0wbjAz0jG7ZQ6U1s0Xuv-vnmaZwCnuYIGFF0q_in44ASyoxRSIsKf--ZC1xxsfNXIJV9_9UgCDGXlQ0dgodsWKSNBfxYIscPKqF_oSF356GWpJo8nCT0vpGpMboVxYnJnbAg6OGqBE5b61hrrNX3AtTBm6zyWhZ5qIjziJonIh3HcgT_fJGpsluOyuui89c8ITVx3vr7X"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent flex flex-col justify-end p-space-lg text-surface pointer-events-none">
                  <div class="flex items-end justify-between gap-space-md pointer-events-auto">
                    <div class="text-left">
                      <span class="bg-primary/90 text-on-primary font-label-md text-label-md px-2.5 py-1 rounded-full uppercase tracking-wider text-[11px] font-bold">
                        Portada Principal
                      </span>
                      <p class="font-headline-lg text-headline-lg mt-1 text-white font-bold text-xl sm:text-2xl">
                        Vista Panorámica Exterior • Terreno Volcánico y Luz Rasante
                      </p>
                      <p class="font-body-md text-body-md text-surface-container-high text-xs sm:text-sm opacity-90">
                        Alineación solar óptima entre 16:30 hrs y 18:45 hrs. Haz clic para inspeccionar en ultra resolución 4K.
                      </p>
                    </div>
                    <button 
                      (click)="toggleFavorite('m-ped-hero', 'Portada Principal • Villa Moderna Pedregal')"
                      class="fav-toggle-btn w-12 h-12 rounded-full bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform active:scale-95 text-on-surface cursor-pointer shrink-0" 
                      title="Alternar Selección">
                      <span class="material-symbols-outlined text-[24px]" 
                            [class.text-primary]="isFav('m-ped-hero')" 
                            [class.text-gray-400]="!isFav('m-ped-hero')" 
                            [style.fontVariationSettings]="getFill('m-ped-hero')">
                        star
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Subsección 01: Fachada & Entrada Principal -->
              @if (shouldShowSection('fachadas')) {
                <div class="flex flex-col gap-space-md pt-space-sm text-left">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-space-sm">
                      <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                      <h3 class="font-headline-md text-headline-md text-on-surface font-bold text-lg">01. Fachada & Entrada Principal</h3>
                      <span class="text-on-surface-variant font-label-md text-label-md text-xs">(3 fotos en catálogo)</span>
                    </div>
                    <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-xs font-semibold">Cámara sugerida: 24-70mm</span>
                  </div>

                  <div class="asset-grid grid gap-space-md"
                       [class.grid-cols-1]="true"
                       [class.sm:grid-cols-2]="density() === 'large'"
                       [class.lg:grid-cols-3]="density() === 'large'"
                       [class.sm:grid-cols-3]="density() === 'comfortable'"
                       [class.lg:grid-cols-4]="density() === 'comfortable'">

                    <!-- Card 1 -->
                    <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div class="relative aspect-[16/10] overflow-hidden bg-surface-container">
                        <img 
                          (click)="openLightboxItemById('m-ped-1')"
                          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuABw4Kz7IZuYnINFzNM24XEk_NGT7nZZpsdRUCKvuczlN_K52kpHPGGUiq0G-yveLbOW2b1NofVNVAeQYdB8_2hpZhU4fmYykTySVwf1HjzhF5LdsqiEcxBAJ-dyDyThH-IHXKyCPD9g5jx7tR7EE4sYZwt6Oz-G1j2VlKaDr38XsI_sBpfpokmKgounFIkgKb24U6hLSIyXBYcEMDgMUkUZ72OXECjM58YC-SEePIKaeHl7QQ6oo-Z" 
                          alt="Acceso Peatonal & Muro Volcánico"
                        />
                        <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-md text-label-md text-[10px] font-bold">4K WebP</span>
                        <button 
                          (click)="toggleFavorite('m-ped-1', 'Acceso Peatonal & Muro Volcánico')"
                          class="fav-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer">
                          <span class="material-symbols-outlined text-[18px]" 
                                [class.text-primary]="isFav('m-ped-1')" 
                                [class.text-gray-400]="!isFav('m-ped-1')" 
                                [style.fontVariationSettings]="getFill('m-ped-1')">
                            star
                          </span>
                        </button>
                      </div>
                      <div class="p-space-sm flex flex-col justify-between flex-grow gap-1">
                        <div class="flex items-center justify-between">
                          <span class="font-headline-sm text-sm font-bold text-on-surface truncate">Acceso Peatonal & Muro</span>
                          <span class="font-label-md text-label-md text-primary font-semibold text-xs">#01-A</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">35mm</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">f/2.8</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Acústica 9/10</span>
                        </div>
                      </div>
                    </div>

                    <!-- Card 2 -->
                    <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div class="relative aspect-[16/10] overflow-hidden bg-surface-container">
                        <img 
                          (click)="openLightboxItemById('m-ped-2')"
                          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy9EMuNJ2GaP_hzO-fFen3OUMamZcxEqADXl9d3Uvs7F9K8wenkBoy7Zp5rjlLrapMYx-v2AbpewwN7a9kCGz5o3ABk8_sIhYMGnbRHCDmwUbVfSmmIWAAA7lhY-HTw1xQWJcVw7jxXgDDtQeXJe2hRS5u9HG5iGsBK6CWH6bsJDm6qpH4tWkhmYzJEPuvo6qoCcIRMt9HE-0ie1-EVj8MeqRGCcrp2ayNJUuyfzlGJuRL7DnMtj8Y" 
                          alt="Entrada Lateral"
                        />
                        <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-md text-label-md text-[10px] font-bold">4K WebP</span>
                        <button 
                          (click)="toggleFavorite('m-ped-2', 'Entrada Lateral & Jardinería')"
                          class="fav-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer">
                          <span class="material-symbols-outlined text-[18px]" 
                                [class.text-primary]="isFav('m-ped-2')" 
                                [class.text-gray-400]="!isFav('m-ped-2')" 
                                [style.fontVariationSettings]="getFill('m-ped-2')">
                            star
                          </span>
                        </button>
                      </div>
                      <div class="p-space-sm flex flex-col justify-between flex-grow gap-1">
                        <div class="flex items-center justify-between">
                          <span class="font-headline-sm text-sm font-bold text-on-surface truncate">Entrada Lateral & Olivos</span>
                          <span class="font-label-md text-label-md text-primary font-semibold text-xs">#01-B</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">24mm</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Luz Oriente</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Acceso Camión 10T</span>
                        </div>
                      </div>
                    </div>

                    <!-- Card 3 -->
                    <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div class="relative aspect-[16/10] overflow-hidden bg-surface-container">
                        <img 
                          (click)="openLightboxItemById('m-ped-3')"
                          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcskZKxBu72IFBBaOLdefF6pieyAKeg5aPIWbviZuCtdZl4xrwsv1a1MeaLDUU-K99ka7TJGso9CB2d-Q75Y-1leigvQWhv9urJxsAg2o_uqZyfyy9DwcFSvSsB689fmvEB4C3PXai75YKPnKtOrlRTl2cxQn6Iv37nd-4PllCLJCRLPHlF3t6bpqUt4RpbjoXmuLrJJbQ_zDFctJJgVYiuseEEGF9JDzVP2iAM7-rGMra4bVjQIzl" 
                          alt="Volumetría Exterior"
                        />
                        <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-md text-label-md text-[10px] font-bold">4K WebP</span>
                        <button 
                          (click)="toggleFavorite('m-ped-3', 'Volumetría Exterior Atardecer')"
                          class="fav-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer">
                          <span class="material-symbols-outlined text-[18px]" 
                                [class.text-primary]="isFav('m-ped-3')" 
                                [class.text-gray-400]="!isFav('m-ped-3')" 
                                [style.fontVariationSettings]="getFill('m-ped-3')">
                            star
                          </span>
                        </button>
                      </div>
                      <div class="p-space-sm flex flex-col justify-between flex-grow gap-1">
                        <div class="flex items-center justify-between">
                          <span class="font-headline-sm text-sm font-bold text-on-surface truncate">Volumetría & Espejo Agua</span>
                          <span class="font-label-md text-label-md text-primary font-semibold text-xs">#01-C</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">50mm</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">f/1.8</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Golden Hour</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              }

              <!-- Subsección 02: Living Principal & Cocina Abierta (con video card) -->
              @if (shouldShowSection('cocinas')) {
                <div class="flex flex-col gap-space-md pt-space-sm text-left">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-space-sm">
                      <span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                      <h3 class="font-headline-md text-headline-md text-on-surface font-bold text-lg">02. Living & Cocina Abierta</h3>
                      <span class="text-on-surface-variant font-label-md text-label-md text-xs">(2 fotos + 1 video ProRes)</span>
                    </div>
                    <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-xs font-semibold">Altura libre 5.0m</span>
                  </div>

                  <div class="asset-grid grid gap-space-md"
                       [class.grid-cols-1]="true"
                       [class.sm:grid-cols-2]="density() === 'large'"
                       [class.lg:grid-cols-3]="density() === 'large'"
                       [class.sm:grid-cols-3]="density() === 'comfortable'"
                       [class.lg:grid-cols-4]="density() === 'comfortable'">

                    <!-- Card 4 -->
                    <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div class="relative aspect-[16/10] overflow-hidden bg-surface-container">
                        <img 
                          (click)="openLightboxItemById('m-ped-4')"
                          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm6rC8AUnQx1TpaKQ47eqzWwB9WoyNbRLfdOa6Yd-_FeV8173wmRqe1_uoZVCCYHZThznl6Rk6zUr3O4lAOLsWpSpDwjs_XY0L9yIm1vgUInRa9vJXVdyzxC32Ku5N8VGeeAwMGKQLDzvyB3-oCrpc3zZavpPrK_AJFnUb1dEA0Sayhmv5Qhmk485Al4QavEWAmhdb2eugeZeusbvJuFBioENo3yz1EmCLgMAoP9qoSqMW21m4w501" 
                          alt="Salón Principal"
                        />
                        <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-md text-label-md text-[10px] font-bold">4K WebP</span>
                        <button 
                          (click)="toggleFavorite('m-ped-4', 'Salón Principal & Estanque')"
                          class="fav-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer">
                          <span class="material-symbols-outlined text-[18px]" 
                                [class.text-primary]="isFav('m-ped-4')" 
                                [class.text-gray-400]="!isFav('m-ped-4')" 
                                [style.fontVariationSettings]="getFill('m-ped-4')">
                            star
                          </span>
                        </button>
                      </div>
                      <div class="p-space-sm flex flex-col justify-between flex-grow gap-1">
                        <div class="flex items-center justify-between">
                          <span class="font-headline-sm text-sm font-bold text-on-surface truncate">Salón Principal & Estanque</span>
                          <span class="font-label-md text-label-md text-primary font-semibold text-xs">#02-A</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">450 m²</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Techo 4.5m</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container text-emerald-700 font-semibold">Direct Sound OK</span>
                        </div>
                      </div>
                    </div>

                    <!-- Card 5 -->
                    <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div class="relative aspect-[16/10] overflow-hidden bg-surface-container">
                        <img 
                          (click)="openLightboxItemById('m-ped-5')"
                          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDe7k0BeMVrh_AzDXykrDAgC5nslus1lOvPKMjyES3bj0OlMI74DKNSLW0XP7b9rFU_g6wDeBvVE0_OsQd5y4mM1Hpih5MuVz6Fvqg4ZQCPWHfJzCVmkZklLqqYoDlAYySIPsRBANm0sHcyT1jOjM6JOeJGR2aUSQwHRz7AuirQKu0pcVVCUV-Ufb76dImB-eBDiUZA9v0X59YO6ZQ-lbdBIgmNfjt0YRQuLF-ZXnOQdoN85nnevxH3" 
                          alt="Galería de Concreto"
                        />
                        <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-md text-label-md text-[10px] font-bold">4K WebP</span>
                        <button 
                          (click)="toggleFavorite('m-ped-5', 'Galería de Concreto & Tragaluz')"
                          class="fav-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer">
                          <span class="material-symbols-outlined text-[18px]" 
                                [class.text-primary]="isFav('m-ped-5')" 
                                [class.text-gray-400]="!isFav('m-ped-5')" 
                                [style.fontVariationSettings]="getFill('m-ped-5')">
                            star
                          </span>
                        </button>
                      </div>
                      <div class="p-space-sm flex flex-col justify-between flex-grow gap-1">
                        <div class="flex items-center justify-between">
                          <span class="font-headline-sm text-sm font-bold text-on-surface truncate">Galería & Tragaluz</span>
                          <span class="font-label-md text-label-md text-primary font-semibold text-xs">#02-B</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Luz Cenital</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Techo 5.0m</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Trifásica 63A</span>
                        </div>
                      </div>
                    </div>

                    <!-- Card 6: Video ProRes Proxy -->
                    <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-secondary/20">
                      <div class="relative aspect-[16/10] overflow-hidden bg-black flex items-center justify-center">
                        <img 
                          (click)="openLightboxItemById('m-ped-vid')"
                          class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500 cursor-pointer" 
                          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" 
                          alt="Video Preview"
                        />
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                          <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span class="material-symbols-outlined text-[24px]">play_arrow</span>
                          </div>
                        </div>
                        <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white font-label-md text-label-md text-[10px] font-bold flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          00:45 • ProRes Proxy
                        </span>
                      </div>
                      <div class="p-space-sm flex flex-col justify-between flex-grow gap-1">
                        <div class="flex items-center justify-between">
                          <span class="font-headline-sm text-sm font-bold text-on-surface truncate">Clip Técnico de Recorrido</span>
                          <span class="font-label-md text-label-md text-secondary font-bold text-xs">VIDEO MP4</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Steadycam</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">4K 24fps</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Audio Directo</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              }

              <!-- Subsección 03: Terrazas & Espejo de Agua -->
              @if (shouldShowSection('terrazas')) {
                <div class="flex flex-col gap-space-md pt-space-sm text-left">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-space-sm">
                      <span class="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                      <h3 class="font-headline-md text-headline-md text-on-surface font-bold text-lg">03. Terrazas & Espejo de Agua</h3>
                      <span class="text-on-surface-variant font-label-md text-label-md text-xs">(2 fotos en catálogo)</span>
                    </div>
                    <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-xs font-semibold">Deck de Madera & Alberca</span>
                  </div>

                  <div class="asset-grid grid gap-space-md"
                       [class.grid-cols-1]="true"
                       [class.sm:grid-cols-2]="density() === 'large'"
                       [class.lg:grid-cols-3]="density() === 'large'"
                       [class.sm:grid-cols-3]="density() === 'comfortable'"
                       [class.lg:grid-cols-4]="density() === 'comfortable'">

                    <!-- Card 7 -->
                    <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div class="relative aspect-[16/10] overflow-hidden bg-surface-container">
                        <img 
                          (click)="openLightboxItemById('m-ped-6')"
                          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxBkxaGoY0Jcgbk7niYgO-MpbH3j0yql5rjFHA9xMrb8CU0fKv4fDbIb-UlJY9zGnXTIOHF_pC37DIMFwoRBYtPhtBflRoNW4ju0GvvzZUu2Cmr8z1TdYqU_1I86FXvKLDGuiA0jeslQPz9GcQ831CiPinE3fheYgc0KjtulXdTfMtxbkWCk5W_fcNGB1t3bkIB4OTZ2X2BTiMVSvYTi7Yau9_Z3eVjO4EM35nVJXjl15TfjW3scsI" 
                          alt="Terraza Panorámica"
                        />
                        <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-md text-label-md text-[10px] font-bold">4K WebP</span>
                        <button 
                          (click)="toggleFavorite('m-ped-6', 'Terraza Panorámica & Deck')"
                          class="fav-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer">
                          <span class="material-symbols-outlined text-[18px]" 
                                [class.text-primary]="isFav('m-ped-6')" 
                                [class.text-gray-400]="!isFav('m-ped-6')" 
                                [style.fontVariationSettings]="getFill('m-ped-6')">
                            star
                          </span>
                        </button>
                      </div>
                      <div class="p-space-sm flex flex-col justify-between flex-grow gap-1">
                        <div class="flex items-center justify-between">
                          <span class="font-headline-sm text-sm font-bold text-on-surface truncate">Terraza Panorámica</span>
                          <span class="font-label-md text-label-md text-primary font-semibold text-xs">#03-A</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Deck Teca</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Alberca</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Luz Tarde</span>
                        </div>
                      </div>
                    </div>

                    <!-- Card 8 -->
                    <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div class="relative aspect-[16/10] overflow-hidden bg-surface-container">
                        <img 
                          (click)="openLightboxItemById('m-ped-7')"
                          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuANTRn6Jabv7G8DI7CBT0y6qx6nPZ8MZBCcehfzRcyyXqcU3XAOW7Tnh5OjtNl5OlOqG3u2pRWa9E3VX--sUhHQTgKNaiD2qd-Ypgs6yp_j3d_rBNaXRukeYfOYOZzt4vhl5jrddCz9Zll8dsNZQlK6JlC2ZgiT1006bDOz_bJMtHhEHpIQSatKqy-oEdklHP-4IkWiD6NAoy2sxru6l4EM84fdaySHUCu0lhMynfAHO1nOV4_usEH4" 
                          alt="Suite Master"
                        />
                        <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-md text-label-md text-[10px] font-bold">4K WebP</span>
                        <button 
                          (click)="toggleFavorite('m-ped-7', 'Suite Master & Vestidor')"
                          class="fav-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer">
                          <span class="material-symbols-outlined text-[18px]" 
                                [class.text-primary]="isFav('m-ped-7')" 
                                [class.text-gray-400]="!isFav('m-ped-7')" 
                                [style.fontVariationSettings]="getFill('m-ped-7')">
                            star
                          </span>
                        </button>
                      </div>
                      <div class="p-space-sm flex flex-col justify-between flex-grow gap-1">
                        <div class="flex items-center justify-between">
                          <span class="font-headline-sm text-sm font-bold text-on-surface truncate">Suite Master & Vestidor</span>
                          <span class="font-label-md text-label-md text-primary font-semibold text-xs">#03-B</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Roble Natural</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">f/1.4</span>
                          <span class="px-1.5 py-0.5 rounded bg-surface-container">Set Íntimo</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              }

            </article>
          }

          <!-- ==================== LOCACIÓN 2: Hangar San Telmo ==================== -->
          @if (shouldShowLocation('san-telmo')) {
            <article class="location-group flex flex-col gap-space-lg bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm border border-surface-container-high/60 mt-4">
              <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded-xl text-left">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-space-sm flex-wrap text-xs">
                    <span class="bg-secondary text-on-secondary font-label-md text-label-md px-2.5 py-0.5 rounded-full font-bold">
                      LOCACIÓN #02
                    </span>
                    <span class="bg-surface-container-highest text-on-surface font-label-md text-label-md px-2.5 py-0.5 rounded-full font-semibold">
                      Complejo Industrial Diáfano
                    </span>
                    <span class="text-tertiary flex items-center gap-1 font-label-md text-label-md font-semibold">
                      <span class="material-symbols-outlined text-[16px]">check_circle</span>
                      Apto Rigging Pesado
                    </span>
                  </div>
                  <h2 class="font-headline-xl text-headline-xl text-on-surface tracking-tight mt-1 text-2xl font-bold">
                    Hangar Industrial San Telmo
                  </h2>
                  <p class="font-body-md text-body-md text-on-surface-variant text-xs sm:text-sm">
                    San Telmo / Vallejo • 1,200 m² diáfanos • Altura libre 9.0m a cumbrera • Trifásica 125A industrial
                  </p>
                </div>
                <div class="flex items-center gap-space-sm shrink-0">
                  <div class="bg-surface-container-lowest px-3 py-2 rounded-lg text-right hidden sm:block border border-surface-container-high">
                    <p class="font-label-md text-label-md text-on-surface-variant text-[11px]">Activos Totales</p>
                    <p class="font-spec-numeral text-spec-numeral text-on-surface font-bold text-sm">12 fotos • 1 video</p>
                  </div>
                  <button (click)="openSpecsModal('Hangar Industrial San Telmo')" class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md shadow-sm border border-surface-container-high text-xs font-semibold cursor-pointer" type="button">
                    <span class="material-symbols-outlined text-[18px]">description</span>
                    <span>Ver Hoja Técnica</span>
                  </button>
                </div>
              </div>

              <!-- Cards Hangar -->
              <div class="asset-grid grid gap-space-md"
                   [class.grid-cols-1]="true"
                   [class.sm:grid-cols-2]="density() === 'large'"
                   [class.lg:grid-cols-3]="density() === 'large'"
                   [class.sm:grid-cols-3]="density() === 'comfortable'"
                   [class.lg:grid-cols-4]="density() === 'comfortable'">

                <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div class="relative aspect-[16/10] overflow-hidden bg-surface-container">
                    <img 
                      (click)="openLightboxItemById('m-hang-1')"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3w_F6sEyCIH4qWyI6kQX-RlXoVaUo2HtLiJUugLYP4V3u0LeFQez4Uk5_HRen6iUMXza6-wL_jhVrSiUYLV4z30oY1CGMwl0WGMOMUM8z5vRN2Zh7WR0CfRFP-DkNbWrxTMU9_XoRHMJw9ey6wq3vPWNGhLdYchxJxviXcUbfV7dd8iBHtYodWj47O3umLXuxoHhmN_NuXoNGWhJpw8_q120npfFZjc4w28pyqH-b1lMce9YegsX2" 
                      alt="Nave Principal"
                    />
                    <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-md text-label-md text-[10px] font-bold">4K WebP</span>
                    <button 
                      (click)="toggleFavorite('m-hang-1', 'Nave Principal Hangar')"
                      class="fav-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer">
                      <span class="material-symbols-outlined text-[18px]" 
                            [class.text-primary]="isFav('m-hang-1')" 
                            [class.text-gray-400]="!isFav('m-hang-1')" 
                            [style.fontVariationSettings]="getFill('m-hang-1')">
                        star
                      </span>
                    </button>
                  </div>
                  <div class="p-space-sm flex flex-col justify-between flex-grow gap-1 text-left">
                    <div class="flex items-center justify-between">
                      <span class="font-headline-sm text-sm font-bold text-on-surface truncate">Nave Principal Industrial</span>
                      <span class="font-label-md text-label-md text-secondary font-semibold text-xs">#01-A</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                      <span class="px-1.5 py-0.5 rounded bg-surface-container">1,200 m²</span>
                      <span class="px-1.5 py-0.5 rounded bg-surface-container">Altura 9.0m</span>
                      <span class="px-1.5 py-0.5 rounded bg-surface-container">Trifásica 125A</span>
                    </div>
                  </div>
                </div>

                <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div class="relative aspect-[16/10] overflow-hidden bg-surface-container">
                    <img 
                      (click)="openLightboxItemById('m-hang-2')"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDq-UcK-XhS5gT17ltdoHS7fkjzGAuS0AF1cnj-j6xkfGJ_mlzEziAP5vtnAk6nIWD6DXwDeYWdoFIXDw-c0WQ3pNL6qDRcBvc2AfL7DkVl3mfiy5LtsohMdk7j8lZRL-bR6it3DUm6p8PZdTFStE_3LeAHfQYqoo3W54ZtpmjSO4SYoGbJeYoTbIUvkTT-vaOnF7c7oIzW9_FXoUEiW7hWvItCBbNdbILa_eRZhwPzh7npnNykkd3V" 
                      alt="Mezzanine Técnico"
                    />
                    <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-md text-label-md text-[10px] font-bold">4K WebP</span>
                    <button 
                      (click)="toggleFavorite('m-hang-2', 'Mezzanine & Rampa Técnica')"
                      class="fav-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer">
                      <span class="material-symbols-outlined text-[18px]" 
                            [class.text-primary]="isFav('m-hang-2')" 
                            [class.text-gray-400]="!isFav('m-hang-2')" 
                            [style.fontVariationSettings]="getFill('m-hang-2')">
                            star
                      </span>
                    </button>
                  </div>
                  <div class="p-space-sm flex flex-col justify-between flex-grow gap-1 text-left">
                    <div class="flex items-center justify-between">
                      <span class="font-headline-sm text-sm font-bold text-on-surface truncate">Mezzanine & Rampa</span>
                      <span class="font-label-md text-label-md text-secondary font-semibold text-xs">#02-A</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                      <span class="px-1.5 py-0.5 rounded bg-surface-container">Vista Cenital</span>
                      <span class="px-1.5 py-0.5 rounded bg-surface-container">Estructura Acero</span>
                    </div>
                  </div>
                </div>

              </div>
            </article>
          }

          <!-- ==================== LOCACIÓN 3: Casa Colonial Coyoacán ==================== -->
          @if (shouldShowLocation('coyoacan')) {
            <article class="location-group flex flex-col gap-space-lg bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm border border-surface-container-high/60 mt-4">
              <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded-xl text-left">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-space-sm flex-wrap text-xs">
                    <span class="bg-tertiary text-on-tertiary font-label-md text-label-md px-2.5 py-0.5 rounded-full font-bold">
                      LOCACIÓN #03
                    </span>
                    <span class="bg-surface-container-highest text-on-surface font-label-md text-label-md px-2.5 py-0.5 rounded-full font-semibold">
                      Patrimonio Histórico Restaurado
                    </span>
                    <span class="text-tertiary flex items-center gap-1 font-label-md text-label-md font-semibold">
                      <span class="material-symbols-outlined text-[16px]">check_circle</span>
                      Permiso INAH Vigente
                    </span>
                  </div>
                  <h2 class="font-headline-xl text-headline-xl text-on-surface tracking-tight mt-1 text-2xl font-bold">
                    Casa Colonial Coyoacán
                  </h2>
                  <p class="font-body-md text-body-md text-on-surface-variant text-xs sm:text-sm">
                    Centro Histórico Coyoacán • 520 m² • Patio de arcos con fuente de cantera • Techo vigas 4.2m
                  </p>
                </div>
                <div class="flex items-center gap-space-sm shrink-0">
                  <button (click)="openSpecsModal('Casa Colonial Coyoacán')" class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md shadow-sm border border-surface-container-high text-xs font-semibold cursor-pointer" type="button">
                    <span class="material-symbols-outlined text-[18px]">description</span>
                    <span>Ver Hoja Técnica</span>
                  </button>
                </div>
              </div>

              <!-- Card Colonial -->
              <div class="asset-grid grid gap-space-md"
                   [class.grid-cols-1]="true"
                   [class.sm:grid-cols-2]="density() === 'large'"
                   [class.lg:grid-cols-3]="density() === 'large'"
                   [class.sm:grid-cols-3]="density() === 'comfortable'"
                   [class.lg:grid-cols-4]="density() === 'comfortable'">

                <div class="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div class="relative aspect-[16/10] overflow-hidden bg-surface-container">
                    <img 
                      (click)="openLightboxItemById('m-col-1')"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpo0oR3fnz9lpS_RgyVwDGPtebCF1WXCFfL_0Kx9Y47SSh0KHH927XVVOp4dQCU6-Z_tENgbvO3IgnicC8GE3RuQDMGxgS3GvhuUFqLxnpVJektX49KeEkgQadm0mI6lRXEqLuO9xXlsBqhb6vMdAojUhETBx_WqJxS-Y1J32RBCSsoJsi1pLDhuwMwXgYRueoTET-95Kbq0RNwJYAVIjmKTk4yVME3bPdtOrmcrCHzeHAq305gOI6" 
                      alt="Patio de Arcos"
                    />
                    <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-md text-label-md text-[10px] font-bold">4K WebP</span>
                    <button 
                      (click)="toggleFavorite('m-col-1', 'Patio de Arcos & Fuente')"
                      class="fav-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer">
                      <span class="material-symbols-outlined text-[18px]" 
                            [class.text-primary]="isFav('m-col-1')" 
                            [class.text-gray-400]="!isFav('m-col-1')" 
                            [style.fontVariationSettings]="getFill('m-col-1')">
                            star
                      </span>
                    </button>
                  </div>
                  <div class="p-space-sm flex flex-col justify-between flex-grow gap-1 text-left">
                    <div class="flex items-center justify-between">
                      <span class="font-headline-sm text-sm font-bold text-on-surface truncate">Patio de Arcos & Fuente</span>
                      <span class="font-label-md text-label-md text-tertiary font-semibold text-xs">#01-A</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant text-[11px] mt-1">
                      <span class="px-1.5 py-0.5 rounded bg-surface-container">Cantera Rosa</span>
                      <span class="px-1.5 py-0.5 rounded bg-surface-container">Techo 4.2m</span>
                      <span class="px-1.5 py-0.5 rounded bg-surface-container">Siglo XVIII</span>
                    </div>
                  </div>
                </div>

              </div>
            </article>
          }

        </div>

      </div>
    </main>

    <!-- Professional Footer -->
    <app-pfe-footer></app-pfe-footer>

    <!-- ULTRA-HIGH RESOLUTION IMMERSIVE LIGHTBOX MODAL -->
    @if (currentLightbox()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-between bg-[#050505]/98 backdrop-blur-xl p-3 sm:p-5 animate-in fade-in select-none">
        
        <!-- Header Controls -->
        <div class="flex items-center justify-between text-white max-w-7xl mx-auto w-full z-20">
          <div class="flex flex-col text-left">
            <div class="flex items-center gap-2">
              <span class="font-bold text-xs sm:text-sm text-primary uppercase tracking-wider">{{ currentLightbox()?.locationName }}</span>
              <span class="text-white/40">•</span>
              <span class="text-[11px] text-white/80 font-mono">{{ currentLightboxIndex() + 1 }} de {{ allGalleryItems.length }}</span>
            </div>
            <h3 class="text-base sm:text-lg font-bold text-white mt-0.5 truncate max-w-md sm:max-w-xl">{{ currentLightbox()?.title }}</h3>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Zoom Toggle Level Button (1x -> 1.6x -> 2.5x) -->
            <button (click)="cycleZoom()" 
                    class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer"
                    title="Alternar Nivel de Zoom 4K">
              <span class="material-symbols-outlined text-[16px]">zoom_in</span>
              <span>{{ zoomLevel() }}x</span>
            </button>

            <!-- Fullscreen Native Mode -->
            <button (click)="toggleFullscreen()" 
                    class="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Modo Pantalla Completa Cinematográfico">
              <span class="material-symbols-outlined text-[18px]">
                {{ isNativeFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}
              </span>
            </button>

            <!-- Favorite button in modal -->
            <button (click)="toggleFavorite(currentLightbox()!.id, currentLightbox()!.title)" 
                    class="px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    [class.bg-primary]="isFav(currentLightbox()!.id)"
                    [class.text-white]="isFav(currentLightbox()!.id)"
                    [class.bg-white/10]="!isFav(currentLightbox()!.id)"
                    [class.text-white]="!isFav(currentLightbox()!.id)">
              <span class="material-symbols-outlined text-[18px]" 
                    [style.fontVariationSettings]="getFill(currentLightbox()!.id)">
                star
              </span>
              <span class="hidden sm:inline">{{ isFav(currentLightbox()!.id) ? 'En Selección' : 'Seleccionar' }}</span>
            </button>

            <!-- Close button -->
            <button (click)="closeLightbox()" class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer ml-1" title="Cerrar (Esc)">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <!-- Center Image / Video Stage with Navigation Arrows -->
        <div class="relative flex-grow flex items-center justify-center overflow-hidden my-auto w-full">
          
          <!-- Prev Arrow -->
          <button (click)="prevLightbox()" 
                  class="absolute left-2 sm:left-6 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-primary text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl active:scale-95 cursor-pointer"
                  title="Anterior (Flecha Izquierda)">
            <span class="material-symbols-outlined text-[24px]">chevron_left</span>
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
                    Reproduciendo Streaming ProRes Proxy 422 (H.264 Simulado)
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
                  class="absolute right-2 sm:right-6 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-primary text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl active:scale-95 cursor-pointer"
                  title="Siguiente (Flecha Derecha)">
            <span class="material-symbols-outlined text-[24px]">chevron_right</span>
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
export class ProjectViewComponent {
  private projectsService = inject(ProjectsService);
  private favoritesService = inject(FavoritesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public project = computed(() => this.projectsService.currentProject());
  public favCount = computed(() => this.favoritesService.count());
  public lastToast = computed(() => this.favoritesService.lastToast());
  public currentCode = computed(() => this.project()?.accessCode || 'LOC-2026-X');

  public selectedCategory = signal<string>('all');
  public density = signal<'large' | 'comfortable'>('large');
  public currentLightbox = signal<LightboxItem | null>(null);
  public zoomLevel = signal<number>(1);
  public isNativeFullscreen = signal<boolean>(false);

  // Lista plana de todos los elementos para navegación fluida
  public allGalleryItems: LightboxItem[] = [
    {
      id: 'm-ped-hero',
      title: 'Villa Moderna Pedregal — Vista Panorámica al Atardecer',
      locationName: 'Villa Moderna Pedregal',
      subSection: 'Fachada Principal & Terreno Volcánico',
      specs: 'Focal: 24mm • Orientación: Suroeste • Luz: Natural Rasante • Sensor: Full Frame • Techo 6.2m',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoPdw6Ah2CCawFhTG2RY1TikZ_30fDY0vIe2jzYIresWo0wbjAz0jG7ZQ6U1s0Xuv-vnmaZwCnuYIGFF0q_in44ASyoxRSIsKf--ZC1xxsfNXIJV9_9UgCDGXlQ0dgodsWKSNBfxYIscPKqF_oSF356GWpJo8nCT0vpGpMboVxYnJnbAg6OGqBE5b61hrrNX3AtTBm6zyWhZ5qIjziJonIh3HcgT_fJGpsluOyuui89c8ITVx3vr7X'
    },
    {
      id: 'm-ped-1',
      title: 'Acceso Peatonal & Muro Volcánico',
      locationName: 'Villa Moderna Pedregal',
      subSection: '01. Fachada & Entrada Principal',
      specs: 'Resolución: 4K WebP • Focal: 35mm • F/2.8 • Control Acústico: 9/10 • Luz Rasante',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABw4Kz7IZuYnINFzNM24XEk_NGT7nZZpsdRUCKvuczlN_K52kpHPGGUiq0G-yveLbOW2b1NofVNVAeQYdB8_2hpZhU4fmYykTySVwf1HjzhF5LdsqiEcxBAJ-dyDyThH-IHXKyCPD9g5jx7tR7EE4sYZwt6Oz-G1j2VlKaDr38XsI_sBpfpokmKgounFIkgKb24U6hLSIyXBYcEMDgMUkUZ72OXECjM58YC-SEePIKaeHl7QQ6oo-Z'
    },
    {
      id: 'm-ped-2',
      title: 'Perspectiva Entrada Lateral & Jardinería',
      locationName: 'Villa Moderna Pedregal',
      subSection: '01. Fachada & Entrada Principal',
      specs: 'Resolución: 4K WebP • Focal: 24mm • F/4.0 • Vegetación Endémica • Sin cables a la vista',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9EMuNJ2GaP_hzO-fFen3OUMamZcxEqADXl9d3Uvs7F9K8wenkBoy7Zp5rjlLrapMYx-v2AbpewwN7a9kCGz5o3ABk8_sIhYMGnbRHCDmwUbVfSmmIWAAA7lhY-HTw1xQWJcVw7jxXgDDtQeXJe2hRS5u9HG5iGsBK6CWH6bsJDm6qpH4tWkhmYzJEPuvo6qoCcIRMt9HE-0ie1-EVj8MeqRGCcrp2ayNJUuyfzlGJuRL7DnMtj8Y'
    },
    {
      id: 'm-ped-3',
      title: 'Volumetría Exterior Atardecer',
      locationName: 'Villa Moderna Pedregal',
      subSection: '01. Fachada & Entrada Principal',
      specs: 'Resolución: 4K WebP • Focal: 50mm • Concreto Aparente • Reflejo Agua • F/1.8',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcskZKxBu72IFBBaOLdefF6pieyAKeg5aPIWbviZuCtdZl4xrwsv1a1MeaLDUU-K99ka7TJGso9CB2d-Q75Y-1leigvQWhv9urJxsAg2o_uqZyfyy9DwcFSvSsB689fmvEB4C3PXai75YKPnKtOrlRTl2cxQn6Iv37nd-4PllCLJCRLPHlF3t6bpqUt4RpbjoXmuLrJJbQ_zDFctJJgVYiuseEEGF9JDzVP2iAM7-rGMra4bVjQIzl'
    },
    {
      id: 'm-ped-4',
      title: 'Salón Principal & Estanque Interior',
      locationName: 'Villa Moderna Pedregal',
      subSection: '02. Living & Cocina Abierta',
      specs: 'Resolución: 4K WebP • Focal: 24mm • F/2.8 • Sonido Directo Óptimo • Luz Oriente',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm6rC8AUnQx1TpaKQ47eqzWwB9WoyNbRLfdOa6Yd-_FeV8173wmRqe1_uoZVCCYHZThznl6Rk6zUr3O4lAOLsWpSpDwjs_XY0L9yIm1vgUInRa9vJXVdyzxC32Ku5N8VGeeAwMGKQLDzvyB3-oCrpc3zZavpPrK_AJFnUb1dEA0Sayhmv5Qhmk485Al4QavEWAmhdb2eugeZeusbvJuFBioENo3yz1EmCLgMAoP9qoSqMW21m4w501'
    },
    {
      id: 'm-ped-5',
      title: 'Galería de Concreto & Tragaluz Cenital',
      locationName: 'Villa Moderna Pedregal',
      subSection: '02. Living & Cocina Abierta',
      specs: 'Resolución: 4K WebP • Focal: 35mm • F/2.0 • Luz Cenital • Trifásica 63A',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe7k0BeMVrh_AzDXykrDAgC5nslus1lOvPKMjyES3bj0OlMI74DKNSLW0XP7b9rFU_g6wDeBvVE0_OsQd5y4mM1Hpih5MuVz6Fvqg4ZQCPWHfJzCVmkZklLqqYoDlAYySIPsRBANm0sHcyT1jOjM6JOeJGR2aUSQwHRz7AuirQKu0pcVVCUV-Ufb76dImB-eBDiUZA9v0X59YO6ZQ-lbdBIgmNfjt0YRQuLF-ZXnOQdoN85nnevxH3'
    },
    {
      id: 'm-ped-vid',
      title: 'Barrido Steadycam Living & Cocina (ProRes Proxy)',
      locationName: 'Villa Moderna Pedregal',
      subSection: '02. Living & Cocina Abierta',
      specs: 'Formato: Apple ProRes Proxy 422 • Duración: 00:45 • Audio Directo Estéreo • 24.000 fps',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      isVideo: true
    },
    {
      id: 'm-ped-6',
      title: 'Terraza Panorámica & Deck de Madera',
      locationName: 'Villa Moderna Pedregal',
      subSection: '03. Terrazas & Espejo de Agua',
      specs: 'Resolución: 4K WebP • Focal: 24mm • F/5.6 • Orientación Sur • Alberca Rectangular',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxBkxaGoY0Jcgbk7niYgO-MpbH3j0yql5rjFHA9xMrb8CU0fKv4fDbIb-UlJY9zGnXTIOHF_pC37DIMFwoRBYtPhtBflRoNW4ju0GvvzZUu2Cmr8z1TdYqU_1I86FXvKLDGuiA0jeslQPz9GcQ831CiPinE3fheYgc0KjtulXdTfMtxbkWCk5W_fcNGB1t3bkIB4OTZ2X2BTiMVSvYTi7Yau9_Z3eVjO4EM35nVJXjl15TfjW3scsI'
    },
    {
      id: 'm-ped-7',
      title: 'Suite Master & Vestidor Principal',
      locationName: 'Villa Moderna Pedregal',
      subSection: '03. Terrazas & Espejo de Agua',
      specs: 'Resolución: 4K WebP • Focal: 50mm • F/1.4 • Iluminación Natural Difusa • Aislamiento Acústico',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANTRn6Jabv7G8DI7CBT0y6qx6nPZ8MZBCcehfzRcyyXqcU3XAOW7Tnh5OjtNl5OlOqG3u2pRWa9E3VX--sUhHQTgKNaiD2qd-Ypgs6yp_j3d_rBNaXRukeYfOYOZzt4vhl5jrddCz9Zll8dsNZQlK6JlC2ZgiT1006bDOz_bJMtHhEHpIQSatKqy-oEdklHP-4IkWiD6NAoy2sxru6l4EM84fdaySHUCu0lhMynfAHO1nOV4_usEH4'
    },
    {
      id: 'm-hang-1',
      title: 'Nave Principal Industrial Diáfana',
      locationName: 'Hangar Industrial San Telmo',
      subSection: '01. Nave Principal & Vigas',
      specs: '1,200 m² libres • Altura: 9.0m • Capacidad Eléctrica: Trifásica 125A • Concreto Pulido',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3w_F6sEyCIH4qWyI6kQX-RlXoVaUo2HtLiJUugLYP4V3u0LeFQez4Uk5_HRen6iUMXza6-wL_jhVrSiUYLV4z30oY1CGMwl0WGMOMUM8z5vRN2Zh7WR0CfRFP-DkNbWrxTMU9_XoRHMJw9ey6wq3vPWNGhLdYchxJxviXcUbfV7dd8iBHtYodWj47O3umLXuxoHhmN_NuXoNGWhJpw8_q120npfFZjc4w28pyqH-b1lMce9YegsX2'
    },
    {
      id: 'm-hang-2',
      title: 'Mezzanine & Rampa Técnica',
      locationName: 'Hangar Industrial San Telmo',
      subSection: '02. Mezzanine & Operaciones',
      specs: 'Vista en picada • Estructura de acero remachado • Acceso seguro a rigging cenital',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq-UcK-XhS5gT17ltdoHS7fkjzGAuS0AF1cnj-j6xkfGJ_mlzEziAP5vtnAk6nIWD6DXwDeYWdoFIXDw-c0WQ3pNL6qDRcBvc2AfL7DkVl3mfiy5LtsohMdk7j8lZRL-bR6it3DUm6p8PZdTFStE_3LeAHfQYqoo3W54ZtpmjSO4SYoGbJeYoTbIUvkTT-vaOnF7c7oIzW9_FXoUEiW7hWvItCBbNdbILa_eRZhwPzh7npnNykkd3V'
    },
    {
      id: 'm-col-1',
      title: 'Patio de Arcos & Fuente Barroca',
      locationName: 'Casa Colonial Coyoacán',
      subSection: '01. Patio Central',
      specs: 'Arquería de cantera • Luz cenital filtrada • Fuente barroca • Suelo de adoquín original',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpo0oR3fnz9lpS_RgyVwDGPtebCF1WXCFfL_0Kx9Y47SSh0KHH927XVVOp4dQCU6-Z_tENgbvO3IgnicC8GE3RuQDMGxgS3GvhuUFqLxnpVJektX49KeEkgQadm0mI6lRXEqLuO9xXlsBqhb6vMdAojUhETBx_WqJxS-Y1J32RBCSsoJsi1pLDhuwMwXgYRueoTET-95Kbq0RNwJYAVIjmKTk4yVME3bPdtOrmcrCHzeHAq305gOI6'
    }
  ];

  isFav(id: string): boolean {
    return this.favoritesService.isFavorite(id);
  }

  getFill(id: string): string {
    return this.isFav(id) ? "'FILL' 1" : "'FILL' 0";
  }

  toggleFavorite(id: string, name?: string): void {
    this.favoritesService.toggleFavorite(id, name);
  }

  shouldShowLocation(locType: string): boolean {
    const cat = this.selectedCategory();
    if (cat === 'all') return true;
    if (locType === 'pedregal' && (cat === 'fachadas' || cat === 'cocinas' || cat === 'terrazas')) return true;
    if (locType === 'san-telmo' && cat === 'industriales') return true;
    if (locType === 'coyoacan' && cat === 'fachadas') return true;
    return false;
  }

  shouldShowSection(secCategory: string): boolean {
    const cat = this.selectedCategory();
    if (cat === 'all') return true;
    return cat === secCategory;
  }

  openLightboxItemById(id: string) {
    const item = this.allGalleryItems.find(i => i.id === id);
    if (item) {
      this.currentLightbox.set(item);
      this.zoomLevel.set(1);
      document.body.style.overflow = 'hidden';
    }
  }

  currentLightboxIndex(): number {
    const cur = this.currentLightbox();
    if (!cur) return 0;
    const idx = this.allGalleryItems.findIndex(i => i.id === cur.id);
    return idx >= 0 ? idx : 0;
  }

  prevLightbox() {
    const idx = this.currentLightboxIndex();
    const newIdx = (idx - 1 + this.allGalleryItems.length) % this.allGalleryItems.length;
    this.currentLightbox.set(this.allGalleryItems[newIdx]);
    this.zoomLevel.set(1);
  }

  nextLightbox() {
    const idx = this.currentLightboxIndex();
    const newIdx = (idx + 1) % this.allGalleryItems.length;
    this.currentLightbox.set(this.allGalleryItems[newIdx]);
    this.zoomLevel.set(1);
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
    document.body.style.overflow = '';
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
