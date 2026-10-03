import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { FavoritesService } from '../../services/favorites.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { ProjectMapConfig } from '../../models/project.model';
import { PfeFooterComponent } from '../../components/pfe-footer/pfe-footer.component';
import { PfeLogoComponent } from '../../components/pfe-logo/pfe-logo.component';

interface EditableMedia {
  id: string;
  title: string;
  url: string;
  specs: string;
  isCover: boolean;
  type: 'image' | 'video';
  description?: string;
}

@Component({
  selector: 'app-admin-project-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PfeFooterComponent, PfeLogoComponent],
  template: `
    <div class="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      
      <!-- Toast Notifier -->
      <div class="fixed top-20 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-2.5 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold border border-white/10"
           [class.translate-y-[-20px]]="!lastToast().visible"
           [class.opacity-0]="!lastToast().visible"
           [class.translate-y-0]="lastToast().visible"
           [class.opacity-100]="lastToast().visible">
        <span class="material-symbols-outlined text-primary text-[18px]">check_circle</span>
        <span>{{ lastToast().message }}</span>
      </div>

      <!-- Top Header de Edición de Proyecto -->
      <header class="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm border-b border-surface-container-high px-4 sm:px-6 lg:px-8 py-3">
        <div class="max-w-[1680px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          
          <div class="flex items-center gap-3">
            <app-pfe-logo size="sm" [showText]="false" linkTo="/admin"></app-pfe-logo>
            <div class="h-5 w-px bg-surface-container-highest"></div>
            <a routerLink="/admin" class="flex items-center gap-1.5 text-on-surface hover:text-primary font-bold text-xs transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-lg">arrow_back</span>
              <span class="hidden sm:inline">Panel Admin</span>
            </a>
            <div class="h-5 w-px bg-surface-container-highest"></div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="font-label-md text-label-md uppercase tracking-wider text-secondary font-bold text-[10px]">
                  Proyecto: {{ project()?.accessCode || 'LOC-2026-X' }}
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Borrador (Revisión {{ activeRevision() }}.0)
                </span>
              </div>
              <h1 class="text-base sm:text-lg font-extrabold text-on-surface truncate">
                {{ project()?.title || 'Campaña Global Verano 2026' }}
              </h1>
            </div>
          </div>

          <!-- Action buttons top -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Access Code Badge -->
            <span class="font-mono text-xs px-2.5 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-high text-on-surface font-bold flex items-center gap-1.5 shadow-xs" title="Código de Acceso Privado">
              <span class="material-symbols-outlined text-[15px] text-primary">key</span>
              <span>{{ project()?.accessCode || 'LOC-2026-X' }}</span>
            </span>

            <!-- Direct Client Link with Code -->
            <button (click)="copyClientLink()" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold text-xs transition-colors shadow-xs cursor-pointer" title="Copiar enlace directo con código para cliente">
              <span class="material-symbols-outlined text-[16px]">link</span>
              <span>Copiar Link Cliente</span>
            </button>

            <button (click)="openMapConfigModal()" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold shadow-xs cursor-pointer" title="Configurar mapa y logística">
              <span class="material-symbols-outlined text-[16px] text-secondary">explore</span>
              <span>Mapa</span>
            </button>

            <a [routerLink]="'/p/' + (project()?.id || '10000000-0000-4000-8000-000000000001')" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold shadow-xs">
              <span class="material-symbols-outlined text-[16px]">visibility</span>
              <span class="hidden md:inline">Previsualizar</span> Cliente
            </a>
            
            <button (click)="saveDraft()" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold shadow-xs cursor-pointer" type="button">
              <span class="material-symbols-outlined text-[16px]">save</span>
              <span>Guardar</span>
            </button>
            
            <button (click)="publishRevision()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container active:scale-[0.98] transition-all text-xs font-bold shadow-sm shadow-primary/20 cursor-pointer" type="button">
              <span class="material-symbols-outlined text-[18px]">verified</span>
              <span>Publicar v{{ activeRevision() + 1 }}.0</span>
            </button>
          </div>

        </div>
      </header>

      <!-- Main Layout: 3 Columnas Asimétricas (3 / 6 / 3) -->
      <main class="w-full pt-20 px-4 sm:px-6 lg:px-8 py-6 flex-grow max-w-[1680px] mx-auto text-left">
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          
          <!-- ==================== COLUMNA 1: Árbol Jerárquico de Locaciones (3 cols) ==================== -->
          <div class="xl:col-span-3 flex flex-col gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
            <div class="flex items-center justify-between pb-space-xs border-b border-surface-container pb-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary text-[20px]">account_tree</span>
                <h2 class="font-headline-sm text-sm font-bold text-on-surface">Estructura</h2>
              </div>
              <span class="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-spec-numeral text-[11px] font-bold">
                {{ locationsList().length }} Locaciones
              </span>
            </div>

            <!-- Locations Tree -->
            <div class="flex flex-col gap-2">
              @for (loc of locationsList(); track loc.id; let lIdx = $index) {
                <div class="flex flex-col rounded-lg p-2.5 gap-2 transition-colors border"
                     [class.bg-surface-container-low]="activeLocId() === loc.id"
                     [class.border-secondary/30]="activeLocId() === loc.id"
                     [class.bg-surface-container-lowest]="activeLocId() !== loc.id"
                     [class.border-transparent]="activeLocId() !== loc.id">
                  
                  <div (click)="selectLoc(loc.id)" class="flex items-center justify-between cursor-pointer">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="material-symbols-outlined text-[18px]" [class.text-primary]="loc.hasCover" [class.text-on-surface-variant]="!loc.hasCover">
                        domain
                      </span>
                      <span class="font-label-lg text-xs font-bold text-on-surface truncate">{{ loc.name }}</span>
                    </div>
                    @if (loc.hasCover) {
                      <span class="material-symbols-outlined text-[16px] text-primary" style="font-variation-settings: 'FILL' 1;" title="Portada Asignada">star</span>
                    }
                  </div>

                  <!-- Secciones anidadas -->
                  @if (activeLocId() === loc.id) {
                    <div class="flex flex-col gap-1 pl-4 pt-1 animate-in fade-in">
                      @for (sec of loc.sections; track sec.id) {
                        <button (click)="selectSection(sec.id, sec.name)" 
                                class="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                                [class.bg-surface-container-highest]="activeSectionId() === sec.id"
                                [class.text-on-surface]="activeSectionId() === sec.id"
                                [class.font-bold]="activeSectionId() === sec.id"
                                [class.shadow-xs]="activeSectionId() === sec.id"
                                [class.text-on-surface-variant]="activeSectionId() !== sec.id"
                                [class.hover:bg-surface-container]="activeSectionId() !== sec.id">
                          <div class="flex items-center gap-1.5 truncate pr-1">
                            <span class="material-symbols-outlined text-[16px]" [class.text-primary]="activeSectionId() === sec.id">
                              {{ activeSectionId() === sec.id ? 'folder_open' : 'folder' }}
                            </span>
                            <span class="truncate">{{ sec.name }}</span>
                          </div>
                          <span class="font-label-md text-[10px] font-mono shrink-0">{{ sec.countText }}</span>
                        </button>
                      }

                      <button (click)="addNewSection()" class="flex items-center gap-1.5 px-2.5 py-1 text-secondary hover:text-on-secondary-fixed text-xs font-semibold transition-colors mt-1 cursor-pointer" type="button">
                        <span class="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>Añadir Sección</span>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>

            <button (click)="addNewLocation()" class="mt-2 w-full flex items-center justify-center gap-2 py-2 px-space-md rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-semibold text-xs cursor-pointer" type="button">
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>Añadir Nueva Locación</span>
            </button>

            <!-- Supabase Storage Status Indicator -->
            <div class="mt-space-md p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1.5 border border-surface-container-high">
              <div class="flex items-center justify-between text-xs">
                <span class="font-label-md text-on-surface-variant font-medium">Storage Bucket</span>
                <span class="inline-flex items-center gap-1 font-semibold text-tertiary font-mono">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                  locations-media
                </span>
              </div>
              <div class="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                <div class="bg-secondary h-full rounded-full transition-all" style="width: 42%;"></div>
              </div>
              <span class="text-[11px] text-on-surface-variant text-right font-mono">4.2 GB de 10 GB</span>
            </div>
          </div>

          <!-- ==================== COLUMNA 2: Espacio de Trabajo & Gestor de Medios (6 cols) ==================== -->
          <div class="xl:col-span-6 flex flex-col gap-space-lg">
            
            <!-- Breadcrumbs & Active Title -->
            <div class="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div class="flex flex-col">
                <div class="flex items-center gap-1 text-on-surface-variant text-xs">
                  <span>{{ getActiveLocName() }}</span>
                  <span class="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span class="text-on-surface font-semibold">{{ activeSectionName() }}</span>
                </div>
                <span class="font-headline-md text-base sm:text-lg font-bold text-on-surface mt-0.5">
                  {{ activeSectionName() }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button (click)="notifyInfo('Configuración avanzada de la sección')" class="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant cursor-pointer" title="Configuración de sección" type="button">
                  <span class="material-symbols-outlined text-[18px]">tune</span>
                </button>
                <span class="font-label-md text-xs px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-bold">
                  {{ mediaItems().length }} Archivos
                </span>
              </div>
            </div>

            <!-- Zona Drag and Drop con Barra de Carga -->
            <div (click)="fileInput.click()" 
                 class="relative group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border-2 border-dashed border-primary/30 hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center text-center">
              <input #fileInput type="file" multiple accept="image/*,video/mp4" (change)="onFilesSelected($event)" class="hidden">
              <div class="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-space-sm group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[28px]">cloud_upload</span>
              </div>
              <span class="font-headline-sm text-sm font-bold text-on-surface">
                Arrastre fotografías de scouting o archivos MP4 aquí
              </span>
              <p class="font-body-sm text-xs text-on-surface-variant max-w-md mt-1">
                Optimización automática a WebP 4K y compresión ProRes Proxy para streaming fluido. Supabase Storage Bucket activo.
              </p>

              <!-- Uploading bar simulation -->
              @if (isUploading()) {
                <div class="w-full max-w-sm mt-4 p-2 bg-surface-container-low rounded-lg animate-in fade-in">
                  <div class="flex justify-between text-[11px] font-semibold text-primary mb-1">
                    <span>Cargando en Supabase...</span>
                    <span>{{ uploadProgress() }}%</span>
                  </div>
                  <div class="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div class="bg-primary h-full rounded-full transition-all duration-200" [style.width.%]="uploadProgress()"></div>
                  </div>
                </div>
              }
            </div>

            <!-- Grilla de Medios Gestionables -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              @for (item of mediaItems(); track item.id; let mIdx = $index) {
                <div class="group relative flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container-high hover:shadow-md transition-all">
                  
                  <div class="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
                    <img [src]="item.url" [alt]="item.title" class="w-full h-full object-cover"/>
                    
                    <!-- Cover Badge -->
                    @if (item.isCover) {
                      <span class="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">star</span>
                        Portada
                      </span>
                    }

                    <!-- Top right actions -->
                    <div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 backdrop-blur-sm p-1 rounded-lg">
                      <button (click)="openEditMediaModal(item)" class="text-white hover:text-amber-400 transition-colors p-1" title="Editar Título y Descripción para el Cliente">
                        <span class="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button (click)="setAsCover(item.id)" class="text-white hover:text-primary transition-colors p-1" title="Definir como Portada">
                        <span class="material-symbols-outlined text-[16px]">bookmark</span>
                      </button>
                      <button (click)="deleteMedia(item.id)" class="text-white hover:text-error transition-colors p-1" title="Eliminar de la galería">
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>

                  <div class="p-3 flex flex-col gap-1 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-on-surface truncate">{{ item.title }}</span>
                      <button (click)="openEditMediaModal(item)" class="text-primary hover:underline text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer">
                        <span class="material-symbols-outlined text-[13px]">edit_note</span>
                        <span>Editar</span>
                      </button>
                    </div>
                    @if (item.description) {
                      <p class="text-[11px] text-on-surface-variant line-clamp-2 italic leading-relaxed">
                        {{ item.description }}
                      </p>
                    }
                    <div class="flex items-center justify-between text-[10px] text-on-surface-variant font-mono pt-1 border-t border-surface-container-high/60 mt-0.5">
                      <span class="truncate">{{ item.specs }}</span>
                      <span class="material-symbols-outlined text-on-surface-variant/40 cursor-grab shrink-0" title="Arrastrar para ordenar">drag_indicator</span>
                    </div>
                  </div>

                </div>
              }
            </div>

          </div>

          <!-- ==================== COLUMNA 3: Panel de Metadatos Técnicos (3 cols) ==================== -->
          <div class="xl:col-span-3 flex flex-col gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
            <div class="flex items-center gap-2 pb-2 border-b border-surface-container">
              <span class="material-symbols-outlined text-primary text-[20px]">tune</span>
              <h3 class="font-headline-sm text-sm font-bold text-on-surface">Ficha Técnica del Set</h3>
            </div>

            <form (ngSubmit)="saveMetadata()" class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-on-surface mb-1">Nombre del Espacio *</label>
                <input 
                  type="text" 
                  [(ngModel)]="activeSectionName" 
                  name="secName"
                  class="w-full h-9 px-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary font-semibold"
                />
              </div>

              <div>
                <label class="block font-bold text-on-surface mb-1">Metros Cuadrados Útiles (m²)</label>
                <input 
                  type="text" 
                  [(ngModel)]="metaDimensions" 
                  name="metaDimensions"
                  placeholder="Ej: 450 m² libres"
                  class="w-full h-9 px-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label class="block font-bold text-on-surface mb-1">Altura Libre de Techo (m)</label>
                <input 
                  type="text" 
                  [(ngModel)]="metaCeiling" 
                  name="metaCeiling"
                  placeholder="Ej: 5.0m a cumbrera"
                  class="w-full h-9 px-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label class="block font-bold text-on-surface mb-1">Acometida Eléctrica</label>
                <select 
                  [(ngModel)]="metaPower" 
                  name="metaPower"
                  class="w-full h-9 px-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary">
                  <option value="Trifásica 80A">Trifásica 80A (Industrial Media)</option>
                  <option value="Trifásica 125A">Trifásica 125A (Set Pesado)</option>
                  <option value="Trifásica 63A">Trifásica 63A</option>
                  <option value="Monofásica 40A">Monofásica 40A Doméstica</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-on-surface mb-1">Nivel Acústico / Sonido</label>
                <select 
                  [(ngModel)]="metaSound" 
                  name="metaSound"
                  class="w-full h-9 px-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary">
                  <option value="Direct Sound OK">Direct Sound OK (Aislamiento Total)</option>
                  <option value="Control Acústico 8/10">Control Acústico 8/10 (Moderado)</option>
                  <option value="Ruido de Fondo Alto">Ruido de Fondo Alto (Requiere Foley)</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-on-surface mb-1">Permisos Municipales & Restricciones</label>
                <textarea 
                  [(ngModel)]="metaPermits" 
                  name="metaPermits"
                  rows="3" 
                  placeholder="Filming permit CDMX aprobado, estacionamiento para 3 camiones 10T..."
                  class="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary text-xs"
                ></textarea>
              </div>

              <button 
                type="submit" 
                class="w-full h-10 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <span class="material-symbols-outlined text-[18px]">check</span>
                <span>Guardar Especificaciones</span>
              </button>
            </form>
          </div>

        </div>
      </main>

      <!-- Modal Configurar Mapa de Producción del Proyecto -->
      @if (isMapModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in" (click)="closeMapConfigModal()">
          <div class="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4 text-left max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            
            <div class="flex items-start justify-between pb-3 border-b border-surface-container-high">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center border border-secondary/20">
                  <span class="material-symbols-outlined text-[24px]">explore</span>
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Geolocalización & Logística • {{ project()?.title }}
                  </span>
                  <h3 class="font-extrabold text-base text-on-surface">Configurar Mapa del Proyecto</h3>
                </div>
              </div>
              <button (click)="closeMapConfigModal()" class="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center cursor-pointer transition-colors">
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <!-- Presets rápidos -->
            <div>
              <span class="block text-xs font-bold text-on-surface-variant mb-1.5">Cargar Preset Geográfico Rápido:</span>
              <div class="flex flex-wrap gap-1.5">
                <button type="button" (click)="applyMapPreset('cdmx-sur')" class="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-[11px] font-bold text-on-surface border border-surface-container-high transition-colors">CDMX Sur / Pedregal</button>
                <button type="button" (click)="applyMapPreset('oaxaca')" class="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-[11px] font-bold text-on-surface border border-surface-container-high transition-colors">Oaxaca Costa</button>
                <button type="button" (click)="applyMapPreset('polanco')" class="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-[11px] font-bold text-on-surface border border-surface-container-high transition-colors">CDMX Polanco</button>
                <button type="button" (click)="applyMapPreset('valle-bravo')" class="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-[11px] font-bold text-on-surface border border-surface-container-high transition-colors">Valle de Bravo</button>
                <button type="button" (click)="applyMapPreset('quito')" class="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-[11px] font-bold text-on-surface border border-surface-container-high transition-colors">Quito Centro</button>
                <button type="button" (click)="applyMapPreset('guayaquil')" class="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-[11px] font-bold text-on-surface border border-surface-container-high transition-colors">Guayaquil Samborondón</button>
              </div>
            </div>

            <form (ngSubmit)="saveMapConfig()" class="space-y-3 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="sm:col-span-2">
                  <label class="block font-bold text-on-surface mb-1">Nombre de la Región / Ciudad *</label>
                  <input type="text" [(ngModel)]="editMapRegionName" name="editMapRegionName" required placeholder="Ej: Pedregal & San Ángel, CDMX" class="w-full h-9 px-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary font-semibold" />
                </div>

                <div>
                  <label class="block font-bold text-on-surface mb-1">Latitud GPS (Centro) *</label>
                  <input type="number" step="0.0001" [(ngModel)]="editMapLat" name="editMapLat" required class="w-full h-9 px-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary font-mono font-bold" />
                </div>

                <div>
                  <label class="block font-bold text-on-surface mb-1">Longitud GPS (Centro) *</label>
                  <input type="number" step="0.0001" [(ngModel)]="editMapLng" name="editMapLng" required class="w-full h-9 px-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary font-mono font-bold" />
                </div>

                <div>
                  <label class="block font-bold text-on-surface mb-1">Zoom Inicial (10 - 18)</label>
                  <input type="number" min="10" max="18" [(ngModel)]="editMapZoom" name="editMapZoom" class="w-full h-9 px-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary font-mono" />
                </div>

                <div>
                  <label class="block font-bold text-on-surface mb-1">Estilo Visual del Mapa</label>
                  <select [(ngModel)]="editMapStyle" name="editMapStyle" class="w-full h-9 px-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary">
                    <option value="cinematic">Cinematográfico Dark (Recomendado)</option>
                    <option value="satellite">Satelital Ultra HD</option>
                    <option value="dark">Nocturno Minimalista (Dark)</option>
                    <option value="streets">Calles & Rutas de Tránsito</option>
                  </select>
                </div>
              </div>

              <!-- Puntos de Acceso / Marcador Principal -->
              <div class="p-3 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2.5">
                <span class="block text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px] text-primary">pin_drop</span>
                  Punto de Rodaje / Locación Principal
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label class="block text-[11px] font-semibold text-on-surface-variant mb-0.5">Nombre del Punto</label>
                    <input type="text" [(ngModel)]="editMapFirstLocationName" name="editMapFirstLocationName" placeholder="Ej: Villa Pedregal Set A" class="w-full h-8 px-2 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant text-xs" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-on-surface-variant mb-0.5">Dirección / Referencia</label>
                    <input type="text" [(ngModel)]="editMapFirstLocationAddress" name="editMapFirstLocationAddress" placeholder="Ej: Av. de las Fuentes 240, CDMX" class="w-full h-8 px-2 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant text-xs" />
                  </div>
                </div>
              </div>

              <div>
                <label class="block font-bold text-on-surface mb-1">Instrucciones Logísticas & Acceso (Vehículos pesados, acometida)</label>
                <textarea [(ngModel)]="editMapLogisticsNotes" name="editMapLogisticsNotes" rows="2" placeholder="Acceso para camiones de 10T, estacionamiento para campers de producción, acometida trifásica 125A..." class="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary text-xs"></textarea>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-surface-container-high">
                <a [href]="'https://www.google.com/maps/search/?api=1&query=' + editMapLat + ',' + editMapLng" target="_blank" class="text-primary hover:underline font-bold text-xs flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px]">open_in_new</span>
                  <span>Probar en Google Maps</span>
                </a>
                <div class="flex items-center gap-2">
                  <button type="button" (click)="closeMapConfigModal()" class="px-3 py-1.5 rounded-lg border border-surface-container-highest text-xs font-semibold hover:bg-surface-container cursor-pointer">
                    Cancelar
                  </button>
                  <button type="submit" class="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:brightness-105 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">save</span>
                    <span>Guardar Mapa del Proyecto</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      }

      <!-- Modal Editar Descripción & Metadatos del Activo (Visible para Clientes) -->
      @if (isEditMediaModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in" (click)="closeEditMediaModal()">
          <div class="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4 text-left" (click)="$event.stopPropagation()">
            
            <div class="flex items-start justify-between pb-3 border-b border-surface-container-high">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
                  <span class="material-symbols-outlined text-[24px]">edit_note</span>
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Ficha del Activo • Visible para Clientes
                  </span>
                  <h3 class="font-extrabold text-base text-on-surface">Editar Descripción de la Imagen / Video</h3>
                </div>
              </div>
              <button (click)="closeEditMediaModal()" class="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center cursor-pointer transition-colors">
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form (ngSubmit)="saveMediaDetails()" class="space-y-3.5 text-xs">
              <div>
                <label class="block font-bold text-on-surface mb-1">Título del Activo *</label>
                <input 
                  type="text" 
                  [(ngModel)]="editMediaTitle" 
                  name="editMediaTitle" 
                  required 
                  class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary font-semibold text-sm" 
                />
              </div>

              <div>
                <label class="block font-bold text-on-surface mb-1 flex items-center justify-between">
                  <span>Descripción Artística / Técnica (Visible para el Cliente) *</span>
                  <span class="text-[10px] text-secondary font-medium">Se muestra en galería y lightbox</span>
                </label>
                <textarea 
                  [(ngModel)]="editMediaDescription" 
                  name="editMediaDescription" 
                  rows="4" 
                  placeholder="Ej: Salón principal con piso de mármol negro y ventanal de doble altura. Orientación suroeste con luz dorada a partir de las 16:30 hrs. Apta para dolly y steadycam."
                  class="w-full p-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary leading-relaxed text-xs"
                ></textarea>
              </div>

              <div>
                <label class="block font-bold text-on-surface mb-1">Especificaciones Técnicas (Lente / Resolución)</label>
                <input 
                  type="text" 
                  [(ngModel)]="editMediaSpecs" 
                  name="editMediaSpecs" 
                  placeholder="Ej: 4K WebP • 24mm • f/2.8 • 3840x2400"
                  class="w-full h-9 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary font-mono" 
                />
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-surface-container-high">
                <span class="text-[11px] text-on-surface-variant flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px] text-emerald-500">visibility</span>
                  <span>Visible de inmediato para el cliente</span>
                </span>
                <div class="flex items-center gap-2">
                  <button type="button" (click)="closeEditMediaModal()" class="px-3.5 py-2 rounded-lg border border-surface-container-highest text-xs font-semibold hover:bg-surface-container cursor-pointer">
                    Cancelar
                  </button>
                  <button type="submit" class="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:brightness-105 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">check</span>
                    <span>Guardar Descripción</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      }

      <!-- Professional Footer -->
      <app-pfe-footer></app-pfe-footer>

    </div>
  `
})
export class AdminProjectEditorComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private favoritesService = inject(FavoritesService);
  private adminAuth = inject(AdminAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public project = computed(() => this.projectsService.currentProject());
  public lastToast = computed(() => this.favoritesService.lastToast());

  copyClientLink() {
    const p = this.project();
    const id = p?.id || '10000000-0000-4000-8000-000000000001';
    const code = p?.accessCode || 'LOC-2026-X';
    const link = `${window.location.origin}/?project=${id}&code=${code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    this.favoritesService.triggerToast(`Enlace de login con código (${code}) copiado.`);
  }

  public activeRevision = signal<number>(2);
  public activeLocId = signal<string>('loc-1');
  public activeSectionId = signal<string>('sec-2');
  public activeSectionName = signal<string>('02. Living Principal & Cocina');

  public metaDimensions: string = '450 m² libres';
  public metaCeiling: string = '5.0m a plafón';
  public metaPower: string = 'Trifásica 80A';
  public metaSound: string = 'Direct Sound OK';
  public metaPermits: string = 'Permiso de rodaje CDMX en regla. Cierre parcial de calle coordinado.';

  public isUploading = signal<boolean>(false);
  public uploadProgress = signal<number>(0);

  public locationsList = signal([
    {
      id: 'loc-1',
      name: 'Villa Moderna Pedregal',
      hasCover: true,
      sections: [
        { id: 'sec-1', name: '01. Fachada & Entrada', countText: '4 fotos' },
        { id: 'sec-2', name: '02. Living & Cocina', countText: '6 f / 1 v' },
        { id: 'sec-3', name: '03. Terrazas & Alberca', countText: '2 fotos' }
      ]
    },
    {
      id: 'loc-2',
      name: 'Hangar Industrial San Telmo',
      hasCover: false,
      sections: [
        { id: 'sec-4', name: '01. Nave Principal', countText: '2 fotos' },
        { id: 'sec-5', name: '02. Mezzanine', countText: '1 foto' }
      ]
    },
    {
      id: 'loc-3',
      name: 'Casa Colonial Coyoacán',
      hasCover: false,
      sections: [
        { id: 'sec-6', name: '01. Patio de Arcos', countText: '1 foto' }
      ]
    }
  ]);

  public mediaItems = signal<EditableMedia[]>([
    {
      id: 'em-1',
      title: 'Salón Principal & Estanque',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm6rC8AUnQx1TpaKQ47eqzWwB9WoyNbRLfdOa6Yd-_FeV8173wmRqe1_uoZVCCYHZThznl6Rk6zUr3O4lAOLsWpSpDwjs_XY0L9yIm1vgUInRa9vJXVdyzxC32Ku5N8VGeeAwMGKQLDzvyB3-oCrpc3zZavpPrK_AJFnUb1dEA0Sayhmv5Qhmk485Al4QavEWAmhdb2eugeZeusbvJuFBioENo3yz1EmCLgMAoP9qoSqMW21m4w501',
      specs: '4K WebP • 24mm • f/2.8',
      isCover: true,
      type: 'image'
    },
    {
      id: 'em-2',
      title: 'Galería de Concreto & Tragaluz',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe7k0BeMVrh_AzDXykrDAgC5nslus1lOvPKMjyES3bj0OlMI74DKNSLW0XP7b9rFU_g6wDeBvVE0_OsQd5y4mM1Hpih5MuVz6Fvqg4ZQCPWHfJzCVmkZklLqqYoDlAYySIPsRBANm0sHcyT1jOjM6JOeJGR2aUSQwHRz7AuirQKu0pcVVCUV-Ufb76dImB-eBDiUZA9v0X59YO6ZQ-lbdBIgmNfjt0YRQuLF-ZXnOQdoN85nnevxH3',
      specs: '4K WebP • 35mm • Cenital',
      isCover: false,
      type: 'image'
    },
    {
      id: 'em-3',
      title: 'Barra Isla y Mármol Negro',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANTRn6Jabv7G8DI7CBT0y6qx6nPZ8MZBCcehfzRcyyXqcU3XAOW7Tnh5OjtNl5OlOqG3u2pRWa9E3VX--sUhHQTgKNaiD2qd-Ypgs6yp_j3d_rBNaXRukeYfOYOZzt4vhl5jrddCz9Zll8dsNZQlK6JlC2ZgiT1006bDOz_bJMtHhEHpIQSatKqy-oEdklHP-4IkWiD6NAoy2sxru6l4EM84fdaySHUCu0lhMynfAHO1nOV4_usEH4',
      specs: '4K WebP • 50mm • f/1.4',
      isCover: false,
      type: 'image'
    },
    {
      id: 'em-4',
      title: 'Clip de Steadycam Sala y Jardín',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      specs: 'MP4 ProRes Proxy • 00:45',
      isCover: false,
      type: 'video'
    }
  ]);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const found = this.projectsService.selectProjectById(id) || this.projectsService.getProjectById(id);
        if (found) {
          this.activeRevision.set(found.revision || 1);
          if (found.locations && found.locations.length > 0) {
            this.locationsList.set(found.locations.map(l => ({
              id: l.id,
              name: l.title,
              hasCover: !!l.coverUrl,
              sections: (l.sections || []).map(s => ({
                id: s.id,
                name: s.title,
                countText: `${s.media?.length || 0} medios`
              }))
            })));
            this.activeLocId.set(found.locations[0].id);
            if (found.locations[0].sections && found.locations[0].sections.length > 0) {
              const sec0 = found.locations[0].sections[0];
              this.activeSectionId.set(sec0.id);
              this.activeSectionName.set(sec0.title);
              this.mediaItems.set((sec0.media || []).map(m => ({
                id: m.id,
                title: m.title,
                url: m.url || '',
                specs: `${m.width}x${m.height} • ${m.mime}`,
                isCover: false,
                type: m.type as 'image' | 'video',
                description: m.description || m.alt || ''
              })));
            }
          }
        }
      }
    });
  }

  getActiveLocName(): string {
    const loc = this.locationsList().find(l => l.id === this.activeLocId());
    return loc ? loc.name : 'Espacio Principal';
  }

  selectLoc(id: string) {
    this.activeLocId.set(id);
    const p = this.project();
    const loc = p?.locations?.find(l => l.id === id);
    if (loc && loc.sections && loc.sections.length > 0) {
      this.selectSection(loc.sections[0].id, loc.sections[0].title);
    }
  }

  selectSection(id: string, name: string) {
    this.activeSectionId.set(id);
    this.activeSectionName.set(name);
    const p = this.project();
    const loc = p?.locations?.find(l => l.id === this.activeLocId());
    const sec = loc?.sections?.find(s => s.id === id);
    if (sec && sec.media) {
      this.mediaItems.set(sec.media.map(m => ({
        id: m.id,
        title: m.title,
        url: m.url || '',
        specs: `${m.width}x${m.height} • ${m.mime}`,
        isCover: false,
        type: m.type as 'image' | 'video',
        description: m.description || m.alt || ''
      })));
    }
  }

  setAsCover(id: string) {
    this.mediaItems.update(list => list.map(item => ({
      ...item,
      isCover: item.id === id
    })));
    this.favoritesService.triggerToast('Portada asignada a la sección correctamente.');
  }

  deleteMedia(id: string) {
    this.mediaItems.update(list => list.filter(item => item.id !== id));
    this.favoritesService.triggerToast('Archivo eliminado de Supabase Storage.');
  }

  saveDraft() {
    this.favoritesService.triggerToast('Borrador y cambios del proyecto guardados exitosamente.');
  }

  publishRevision() {
    const nextRev = this.activeRevision() + 1;
    this.activeRevision.set(nextRev);
    const p = this.project();
    if (p) {
      p.revision = nextRev;
      p.publishedRevision = nextRev;
      p.updatedAt = new Date().toISOString();
    }
    this.favoritesService.triggerToast(`¡Revisión v${nextRev}.0 publicada como INMUTABLE! Lista para clientes.`);
  }

  saveMetadata() {
    this.favoritesService.triggerToast('Ficha técnica actualizada en PostgreSQL.');
  }

  addNewSection() {
    const p = this.project();
    const loc = p?.locations?.find(l => l.id === this.activeLocId());
    const newSecId = 'sec-' + Date.now();
    const newSecTitle = `0${(loc?.sections?.length || 0) + 1}. Nueva Área de Rodaje`;
    this.locationsList.update(list => list.map(l => {
      if (l.id === this.activeLocId()) {
        return {
          ...l,
          sections: [...l.sections, { id: newSecId, name: newSecTitle, countText: '0 medios' }]
        };
      }
      return l;
    }));
    this.selectSection(newSecId, newSecTitle);
    this.favoritesService.triggerToast(`Sección "${newSecTitle}" agregada.`);
  }

  addNewLocation() {
    this.favoritesService.triggerToast('Abriendo asistente de registro de nueva locación.');
  }

  onFilesSelected(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.isUploading.set(true);
    this.uploadProgress.set(20);

    const timer = setInterval(() => {
      this.uploadProgress.update(p => {
        if (p >= 100) {
          clearInterval(timer);
          this.isUploading.set(false);
          this.mediaItems.update(list => [
            {
              id: 'em-' + Date.now(),
              title: files[0].name,
              url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoPdw6Ah2CCawFhTG2RY1TikZ_30fDY0vIe2jzYIresWo0wbjAz0jG7ZQ6U1s0Xuv-vnmaZwCnuYIGFF0q_in44ASyoxRSIsKf--ZC1xxsfNXIJV9_9UgCDGXlQ0dgodsWKSNBfxYIscPKqF_oSF356GWpJo8nCT0vpGpMboVxYnJnbAg6OGqBE5b61hrrNX3AtTBm6zyWhZ5qIjziJonIh3HcgT_fJGpsluOyuui89c8ITVx3vr7X',
              specs: '4K WebP • Recién Subido',
              isCover: false,
              type: 'image'
            },
            ...list
          ]);
          this.favoritesService.triggerToast(`${files.length} archivos subidos a Supabase Storage con éxito.`);
          return 100;
        }
        return p + 25;
      });
    }, 250);
  }

  notifyInfo(msg: string) {
    this.favoritesService.triggerToast(msg);
  }

  // --- Configuración Dinámica de Mapa del Proyecto ---
  public isMapModalOpen = signal<boolean>(false);
  public editMapRegionName: string = '';
  public editMapLat: number = 19.3142;
  public editMapLng: number = -99.2014;
  public editMapZoom: number = 15;
  public editMapStyle: 'satellite' | 'streets' | 'dark' | 'cinematic' = 'cinematic';
  public editMapFirstLocationName: string = '';
  public editMapFirstLocationAddress: string = '';
  public editMapLogisticsNotes: string = '';

  openMapConfigModal() {
    const p = this.project();
    const cfg = p?.mapConfig;
    if (cfg) {
      this.editMapRegionName = cfg.regionName;
      this.editMapLat = cfg.centerLat;
      this.editMapLng = cfg.centerLng;
      this.editMapZoom = cfg.zoom;
      this.editMapStyle = cfg.mapStyle;
      this.editMapLogisticsNotes = cfg.logisticsNotes || '';
      if (cfg.markers && cfg.markers.length > 0) {
        this.editMapFirstLocationName = cfg.markers[0].name;
        this.editMapFirstLocationAddress = cfg.markers[0].address || '';
      } else {
        this.editMapFirstLocationName = p?.title || '';
        this.editMapFirstLocationAddress = '';
      }
    } else {
      this.editMapRegionName = p?.title ? `${p.title} - Región Técnica` : 'Pedregal, CDMX';
      this.editMapLat = 19.3142;
      this.editMapLng = -99.2014;
      this.editMapZoom = 15;
      this.editMapStyle = 'satellite';
      this.editMapFirstLocationName = 'Locación Principal Set A';
      this.editMapFirstLocationAddress = '';
      this.editMapLogisticsNotes = 'Acceso para camiones de rodaje 10T y acometida técnica.';
    }
    this.isMapModalOpen.set(true);
  }

  closeMapConfigModal() {
    this.isMapModalOpen.set(false);
  }

  applyMapPreset(preset: string) {
    if (preset === 'cdmx-sur') {
      this.editMapRegionName = 'Pedregal & San Ángel, CDMX';
      this.editMapLat = 19.3242;
      this.editMapLng = -99.2014;
      this.editMapZoom = 15;
      this.editMapStyle = 'satellite';
      this.editMapFirstLocationName = 'Villa Moderna Pedregal Set';
      this.editMapFirstLocationAddress = 'Av. de las Fuentes 240, Álvaro Obregón, CDMX';
      this.editMapLogisticsNotes = 'Acceso controlado para camiones 10T. Planta de luz trifásica 125A.';
    } else if (preset === 'oaxaca') {
      this.editMapRegionName = 'Costa Esmeralda & Puerto Escondido, Oaxaca';
      this.editMapLat = 15.8722;
      this.editMapLng = -97.0767;
      this.editMapZoom = 14;
      this.editMapStyle = 'satellite';
      this.editMapFirstLocationName = 'Residencia Acantilado Costa';
      this.editMapFirstLocationAddress = 'Carretera Costera Km 138, Oaxaca';
      this.editMapLogisticsNotes = 'Camino de terracería compactada apto para unidades de 3.5T y 10T.';
    } else if (preset === 'polanco') {
      this.editMapRegionName = 'Polanco & Bosque de Chapultepec, CDMX';
      this.editMapLat = 19.4326;
      this.editMapLng = -99.1916;
      this.editMapZoom = 16;
      this.editMapStyle = 'dark';
      this.editMapFirstLocationName = 'Penthouse & Galería Polanco';
      this.editMapFirstLocationAddress = 'Campos Elíseos 204, Polanco, CDMX';
      this.editMapLogisticsNotes = 'Elevador de carga con capacidad de 1,500 kg. Permiso filmación CDMX vigente.';
    } else if (preset === 'valle-bravo') {
      this.editMapRegionName = 'Circuito Avándaro & Valle de Bravo';
      this.editMapLat = 19.1923;
      this.editMapLng = -100.1317;
      this.editMapZoom = 14;
      this.editMapStyle = 'dark';
      this.editMapFirstLocationName = 'Pista & Hangar Automotriz';
      this.editMapFirstLocationAddress = 'Carretera Colorines Km 12, Edo. Mex.';
      this.editMapLogisticsNotes = 'Pista cerrada de 2.8 km para rodajes de alta velocidad.';
    } else if (preset === 'quito') {
      this.editMapRegionName = 'Centro Histórico & Cumbayá, Quito';
      this.editMapLat = -0.2201;
      this.editMapLng = -78.5123;
      this.editMapZoom = 15;
      this.editMapStyle = 'satellite';
      this.editMapFirstLocationName = 'Casona Patrimonial San Francisco';
      this.editMapFirstLocationAddress = 'Calle Cuenca y Sucre, Centro Histórico, Quito';
      this.editMapLogisticsNotes = 'Permisos de Instituto Metropolitano de Patrimonio en regla. Horario de carga nocturno.';
    } else if (preset === 'guayaquil') {
      this.editMapRegionName = 'Samborondón & Puerto Santa Ana, Guayaquil';
      this.editMapLat = -2.1465;
      this.editMapLng = -79.8706;
      this.editMapZoom = 15;
      this.editMapStyle = 'satellite';
      this.editMapFirstLocationName = 'Plaza Fluvial & Helipuerto';
      this.editMapFirstLocationAddress = 'Av. Samborondón Km 4.5, Guayas';
      this.editMapLogisticsNotes = 'Muelle privado apto para barcos de cámara y grúas telescópicas.';
    }
    this.favoritesService.triggerToast(`Preset geográfico cargado.`);
  }

  saveMapConfig() {
    const p = this.project();
    if (!p) return;
    const config: ProjectMapConfig = {
      regionName: this.editMapRegionName || 'Región Técnica de Rodaje',
      centerLat: Number(this.editMapLat) || 19.3142,
      centerLng: Number(this.editMapLng) || -99.2014,
      zoom: Number(this.editMapZoom) || 15,
      mapStyle: this.editMapStyle,
      logisticsNotes: this.editMapLogisticsNotes,
      markers: [
        {
          name: this.editMapFirstLocationName || p.title,
          lat: Number(this.editMapLat) || 19.3142,
          lng: Number(this.editMapLng) || -99.2014,
          address: this.editMapFirstLocationAddress || `${this.editMapRegionName}`,
          category: 'Locación Principal',
          logisticsNote: 'Acceso para camiones de rodaje 10T y acometida técnica'
        }
      ]
    };

    this.projectsService.updateProjectMapConfig(p.id, config);
    this.isMapModalOpen.set(false);
    this.favoritesService.triggerToast(`Mapa y logística del proyecto guardados exitosamente.`);
  }

  // --- Modal de Edición de Descripción y Metadatos de Activos ---
  public isEditMediaModalOpen = signal<boolean>(false);
  public editingMediaId = signal<string>('');
  public editMediaTitle: string = '';
  public editMediaDescription: string = '';
  public editMediaSpecs: string = '';

  openEditMediaModal(item: EditableMedia) {
    this.editingMediaId.set(item.id);
    this.editMediaTitle = item.title;
    this.editMediaDescription = item.description || '';
    this.editMediaSpecs = item.specs;
    this.isEditMediaModalOpen.set(true);
  }

  closeEditMediaModal() {
    this.isEditMediaModalOpen.set(false);
  }

  saveMediaDetails() {
    const id = this.editingMediaId();
    if (!id) return;

    // 1. Actualizar señal local mediaItems
    this.mediaItems.update(list => list.map(item => {
      if (item.id === id) {
        return {
          ...item,
          title: this.editMediaTitle,
          description: this.editMediaDescription,
          specs: this.editMediaSpecs
        };
      }
      return item;
    }));

    // 2. Persistir en la locación y sección activa del proyecto
    const p = this.project();
    const loc = p?.locations?.find(l => l.id === this.activeLocId());
    const sec = loc?.sections?.find(s => s.id === this.activeSectionId());
    if (sec && sec.media) {
      const targetMedia = sec.media.find(m => m.id === id);
      if (targetMedia) {
        targetMedia.title = this.editMediaTitle;
        targetMedia.description = this.editMediaDescription;
        targetMedia.alt = this.editMediaDescription;
      }
    }

    this.isEditMediaModalOpen.set(false);
    this.favoritesService.triggerToast(`Descripción y título actualizados para "${this.editMediaTitle}". Los clientes verán estos detalles en la galería.`);
  }
}
