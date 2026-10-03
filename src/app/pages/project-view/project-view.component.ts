import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { FavoritesService } from '../../services/favorites.service';
import { MediaItem } from '../../models/media.model';

@Component({
  selector: 'app-project-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Barra Superior Fija (Header) -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm border-b border-surface-container-high">
      <div class="h-16 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <!-- Logo y Proyecto -->
        <div class="flex items-center gap-3">
          <div (click)="goToAccess()" class="flex items-center gap-2 cursor-pointer">
            <span class="material-symbols-outlined text-primary text-2xl font-bold">location_city</span>
            <span class="text-lg font-bold text-on-surface tracking-tight hidden sm:inline">PFE Locaciones</span>
          </div>
          <div class="h-5 w-px bg-surface-container-highest hidden md:block"></div>
          <div class="hidden md:flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-full text-xs">
            <span class="text-on-surface-variant font-medium">Proyecto:</span>
            <span class="text-on-surface font-semibold max-w-[160px] truncate">{{ project()?.title }}</span>
          </div>
        </div>

        <!-- Navegación Central -->
        <nav class="flex items-center gap-1 bg-surface-container-low/70 p-1 rounded-full text-xs">
          <button class="px-3.5 py-1 rounded-full bg-surface-container-lowest text-on-surface font-semibold shadow-sm">
            Galería
          </button>
          <button (click)="goToFavorites()" class="px-3.5 py-1 rounded-full text-on-surface-variant hover:text-on-surface font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer">
            <span>Seleccionadas</span>
            <span class="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
              {{ favCount() }}
            </span>
          </button>
        </nav>

        <!-- Estado y Acceso Admin -->
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-on-surface-variant font-medium">Supabase Realtime</span>
          </div>
          <button (click)="goToAdmin()" class="px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">admin_panel_settings</span>
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="w-full pt-16 bg-surface min-h-screen">
      <!-- Super-Header Ejecutivo del Proyecto -->
      <section class="w-full bg-surface-container-low px-4 sm:px-6 lg:px-8 py-8 border-b border-surface-container-high">
        <div class="max-w-[1680px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div class="flex flex-col gap-2 max-w-3xl text-left">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider font-semibold">
                Revisión v{{ project()?.revision }}.0 (Inmutable)
              </span>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-emerald-600 text-xs shadow-sm font-medium">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Selección Compartida Activa</span>
              </div>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mt-1">
              {{ project()?.title }}
            </h1>
            <p class="text-sm text-on-surface-variant">
              {{ project()?.description }}
            </p>
          </div>

          <!-- Acciones Rápidas del Cliente -->
          <div class="flex items-center gap-3">
            <button (click)="goToFavorites()" class="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg shadow-sm font-semibold text-sm hover:brightness-105 transition-all cursor-pointer">
              <span class="material-symbols-outlined text-lg">star</span>
              <span>Ver Seleccionadas ({{ favCount() }})</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Barra de Filtros -->
      <section class="sticky top-16 z-30 w-full bg-surface-container-lowest shadow-sm px-4 sm:px-6 lg:px-8 py-3 border-b border-surface-container-high">
        <div class="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
          <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              (click)="selectedCategory.set('all')"
              [class.bg-on-surface]="selectedCategory() === 'all'"
              [class.text-surface]="selectedCategory() === 'all'"
              [class.bg-surface-container-low]="selectedCategory() !== 'all'"
              class="px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Todas las Locaciones
            </button>
            <button
              (click)="selectedCategory.set('pedregal')"
              [class.bg-on-surface]="selectedCategory() === 'pedregal'"
              [class.text-surface]="selectedCategory() === 'pedregal'"
              [class.bg-surface-container-low]="selectedCategory() !== 'pedregal'"
              class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
            >
              Villa Pedregal
            </button>
            <button
              (click)="selectedCategory.set('hangar')"
              [class.bg-on-surface]="selectedCategory() === 'hangar'"
              [class.text-surface]="selectedCategory() === 'hangar'"
              [class.bg-surface-container-low]="selectedCategory() !== 'hangar'"
              class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
            >
              Hangar San Telmo
            </button>
          </div>

          <div class="text-xs text-on-surface-variant font-medium hidden sm:block">
            Haz clic en la estrella para marcar como favorita para todo el equipo
          </div>
        </div>
      </section>

      <!-- Listado de Locaciones y Secciones -->
      <div class="w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 max-w-[1680px] mx-auto">
        <div *ngFor="let loc of filteredLocations(); let i = index" class="bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-sm border border-outline/10 text-left">
          
          <!-- Encabezado de Locación -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-low p-4 rounded-xl mb-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full">LOCACIÓN #0{{ i + 1 }}</span>
                <span class="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  Permiso Aprobado
                </span>
              </div>
              <h2 class="text-2xl font-bold text-on-surface">{{ loc.title }}</h2>
              <p class="text-xs text-on-surface-variant mt-0.5">{{ loc.description }}</p>
            </div>
            <div class="text-right">
              <span class="text-xs text-on-surface-variant bg-surface-container-lowest px-3 py-1.5 rounded-lg font-medium shadow-xs">
                {{ loc.sections.length }} Secciones Técnicas
              </span>
            </div>
          </div>

          <!-- Portada Hero de la Locación -->
          <div class="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden shadow-sm mb-6 group">
            <img [src]="loc.coverUrl" [alt]="loc.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer" (click)="openLightbox(loc.coverUrl || '')">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
              <span class="text-[10px] uppercase font-bold tracking-wider text-primary-fixed block">Portada de Locación</span>
              <p class="text-lg sm:text-xl font-bold mt-0.5">{{ loc.title }}</p>
            </div>
          </div>

          <!-- Secciones y Fotos -->
          <div *ngFor="let sec of loc.sections" class="mb-6 last:mb-0">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-2 h-2 rounded-full bg-primary"></span>
              <h3 class="text-base font-bold text-on-surface">{{ sec.title }}</h3>
              <span class="text-xs text-on-surface-variant">({{ sec.media?.length || 0 }} activos)</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let item of sec.media" class="group relative rounded-xl overflow-hidden bg-surface-container border border-outline/10 shadow-xs">
                <div class="h-56 w-full relative overflow-hidden bg-surface-container-low cursor-pointer" (click)="openLightbox(item.url || '')">
                  <img [src]="item.url" [alt]="item.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                </div>

                <!-- Barra de Información de Foto y Botón Favorito -->
                <div class="p-3 flex items-center justify-between bg-surface-container-lowest">
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-on-surface line-clamp-1">{{ item.title }}</span>
                    <span class="text-[11px] text-on-surface-variant">{{ item.width }}x{{ item.height }} • {{ item.mime }}</span>
                  </div>

                  <!-- Botón Favorito Coral -->
                  <button
                    type="button"
                    (click)="toggleFav(item.id)"
                    [class.bg-primary]="isFav(item.id)"
                    [class.text-on-primary]="isFav(item.id)"
                    [class.bg-surface-container-low]="!isFav(item.id)"
                    [class.text-on-surface-variant]="!isFav(item.id)"
                    class="w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
                    [title]="isFav(item.id) ? 'Quitar de seleccionadas' : 'Marcar como seleccionada'"
                  >
                    <span class="material-symbols-outlined text-lg" [class.text-amber-300]="isFav(item.id)">
                      star
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Lightbox -->
    <div *ngIf="activePhoto()" (click)="closeLightbox()" class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div class="relative max-w-5xl max-h-[90vh] overflow-hidden" (click)="$event.stopPropagation()">
        <img [src]="activePhoto()" class="max-w-full max-h-[85vh] rounded-lg object-contain mx-auto shadow-2xl">
        <button (click)="closeLightbox()" class="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  `
})
export class ProjectViewComponent {
  private projectsService = inject(ProjectsService);
  private favoritesService = inject(FavoritesService);
  private router = inject(Router);

  project = this.projectsService.currentProject;
  favCount = computed(() => this.favoritesService.count());
  selectedCategory = signal<string>('all');
  activePhoto = signal<string | null>(null);

  filteredLocations = computed(() => {
    const p = this.project();
    if (!p || !p.locations) return [];
    const cat = this.selectedCategory();
    if (cat === 'pedregal') {
      return p.locations.filter(l => l.title.includes('Pedregal'));
    }
    if (cat === 'hangar') {
      return p.locations.filter(l => l.title.includes('Hangar'));
    }
    return p.locations;
  });

  constructor() {}

  isFav(mediaId: string): boolean {
    return this.favoritesService.isFavorite(mediaId);
  }

  toggleFav(mediaId: string) {
    this.favoritesService.toggleFavorite(mediaId);
  }

  openLightbox(url: string) {
    this.activePhoto.set(url);
  }

  closeLightbox() {
    this.activePhoto.set(null);
  }

  goToFavorites() {
    this.router.navigate(['/seleccionadas']);
  }

  goToAccess() {
    this.router.navigate(['/']);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }
}
