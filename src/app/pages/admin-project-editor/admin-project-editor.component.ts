import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { FavoritesService } from '../../services/favorites.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { PfeFooterComponent } from '../../components/pfe-footer/pfe-footer.component';
import { PfeLogoComponent } from '../../components/pfe-logo/pfe-logo.component';

interface EditableMedia {
  id: string;
  title: string;
  url: string;
  specs: string;
  isCover: boolean;
  type: 'image' | 'video';
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
                    <div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm p-1 rounded-lg">
                      <button (click)="setAsCover(item.id)" class="text-white hover:text-primary transition-colors p-1" title="Definir como Portada">
                        <span class="material-symbols-outlined text-[16px]">bookmark</span>
                      </button>
                      <button (click)="deleteMedia(item.id)" class="text-white hover:text-error transition-colors p-1" title="Eliminar de la galería">
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>

                  <div class="p-3 flex items-center justify-between text-xs">
                    <div class="flex flex-col truncate pr-2">
                      <span class="font-bold text-on-surface truncate">{{ item.title }}</span>
                      <span class="text-[10px] text-on-surface-variant font-mono">{{ item.specs }}</span>
                    </div>
                    <span class="material-symbols-outlined text-on-surface-variant/40 cursor-grab" title="Arrastrar para ordenar">drag_indicator</span>
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
    const link = `${window.location.origin}/p/${id}?code=${code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    this.favoritesService.triggerToast(`Enlace directo con código para cliente copiado al portapapeles.`);
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
                type: m.type as 'image' | 'video'
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
        type: m.type as 'image' | 'video'
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
}
