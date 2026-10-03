import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { FavoritesService } from '../../services/favorites.service';
import { MediaItem } from '../../models/media.model';

@Component({
  selector: 'app-selected-media',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Barra Superior -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm border-b border-surface-container-high">
      <div class="h-16 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button (click)="goBack()" class="flex items-center gap-2 text-on-surface hover:text-primary font-bold transition-colors cursor-pointer">
            <span class="material-symbols-outlined">arrow_back</span>
            <span class="text-sm hidden sm:inline">Volver al Proyecto</span>
          </button>
          <div class="h-5 w-px bg-surface-container-highest"></div>
          <span class="text-xs text-on-surface-variant font-medium">Selección Compartida de Equipo</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-sm">star</span>
            <span>{{ selectedItems().length }} Seleccionadas</span>
          </span>
        </div>
      </div>
    </header>

    <main class="w-full pt-20 px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-surface">
      <div class="max-w-[1680px] mx-auto text-left">
        <!-- Encabezado de la página -->
        <div class="mb-8 p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
              <span class="material-symbols-outlined text-sm">how_to_reg</span>
              <span>Consenso de Producción</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-on-surface">
              Locaciones Seleccionadas por el Equipo
            </h1>
            <p class="text-xs sm:text-sm text-on-surface-variant mt-1">
              Todos los miembros autorizados con acceso al proyecto comparten esta selección en tiempo real.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button (click)="goBack()" class="px-4 py-2 bg-surface-container-low text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container transition-all cursor-pointer">
              Explorar más fotos
            </button>
          </div>
        </div>

        <!-- Estado vacío si no hay favoritas -->
        <div *ngIf="selectedItems().length === 0" class="py-16 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline/30 p-8">
          <span class="material-symbols-outlined text-5xl text-outline mb-2">star_border</span>
          <h2 class="text-lg font-bold text-on-surface">No hay locaciones seleccionadas todavía</h2>
          <p class="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
            Regresa al catálogo del proyecto y haz clic en la estrella de cualquier fotografía para añadirla a la selección compartida.
          </p>
          <button (click)="goBack()" class="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:brightness-105 transition-all">
            Ir al Catálogo
          </button>
        </div>

        <!-- Grilla de Favoritas -->
        <div *ngIf="selectedItems().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div *ngFor="let item of selectedItems()" class="group rounded-xl overflow-hidden bg-surface-container-lowest border border-outline/10 shadow-sm flex flex-col">
            <div class="h-60 w-full relative overflow-hidden bg-surface-container-low cursor-pointer" (click)="openLightbox(item.url || '')">
              <img [src]="item.url" [alt]="item.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
              <div class="absolute top-2.5 right-2.5">
                <span class="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  FAVORITA
                </span>
              </div>
            </div>

            <div class="p-3.5 flex items-center justify-between bg-surface-container-lowest mt-auto">
              <div class="flex flex-col text-left">
                <span class="text-xs font-bold text-on-surface line-clamp-1">{{ item.title }}</span>
                <span class="text-[11px] text-on-surface-variant">{{ item.width }}x{{ item.height }} • WebP</span>
              </div>

              <button
                type="button"
                (click)="removeFavorite(item.id)"
                class="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
                title="Quitar de seleccionadas"
              >
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Lightbox -->
    <div *ngIf="activePhoto()" (click)="closeLightbox()" class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div class="relative max-w-5xl max-h-[90vh]" (click)="$event.stopPropagation()">
        <img [src]="activePhoto()" class="max-w-full max-h-[85vh] rounded-lg object-contain mx-auto shadow-2xl">
        <button (click)="closeLightbox()" class="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  `
})
export class SelectedMediaComponent {
  private projectsService = inject(ProjectsService);
  private favoritesService = inject(FavoritesService);
  private router = inject(Router);

  activePhoto = signal<string | null>(null);

  selectedItems = computed(() => {
    const p = this.projectsService.currentProject();
    if (!p || !p.locations) return [];
    const favIds = this.favoritesService.selectedMediaIds();

    const result: MediaItem[] = [];
    for (const loc of p.locations) {
      for (const sec of loc.sections) {
        if (sec.media) {
          for (const m of sec.media) {
            if (favIds.has(m.id)) {
              result.push(m);
            }
          }
        }
      }
    }
    return result;
  });

  constructor() {}

  removeFavorite(mediaId: string) {
    this.favoritesService.toggleFavorite(mediaId);
  }

  openLightbox(url: string) {
    this.activePhoto.set(url);
  }

  closeLightbox() {
    this.activePhoto.set(null);
  }

  goBack() {
    const p = this.projectsService.currentProject();
    if (p) {
      this.router.navigate(['/p', p.id]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
