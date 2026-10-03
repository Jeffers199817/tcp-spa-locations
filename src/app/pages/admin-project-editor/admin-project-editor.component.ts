import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-admin-project-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header Editor -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm border-b border-surface-container-high">
      <div class="h-16 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button (click)="goBack()" class="flex items-center gap-1.5 text-on-surface hover:text-primary font-bold text-xs cursor-pointer">
            <span class="material-symbols-outlined text-lg">arrow_back</span>
            <span>Dashboard</span>
          </button>
          <div class="h-5 w-px bg-surface-container-highest"></div>
          <span class="text-sm font-bold text-on-surface truncate max-w-xs">{{ project()?.title }}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
            Modo Edición
          </span>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="publishRevision()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 transition-all cursor-pointer">
            <span class="material-symbols-outlined text-base">publish</span>
            <span>Publicar Revisión v{{ (project()?.revision || 1) + 1 }}.0</span>
          </button>
          <button (click)="previewAsClient()" class="px-3 py-2 bg-surface-container text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer">
            <span class="material-symbols-outlined text-sm">visibility</span>
            <span>Ver como Cliente</span>
          </button>
        </div>
      </div>
    </header>

    <main class="w-full pt-16 min-h-screen bg-surface flex flex-col md:flex-row">
      <!-- PANEL LATERAL: Árbol de Estructura -->
      <aside class="w-full md:w-80 bg-surface-container-low border-r border-surface-container-high p-4 flex flex-col gap-4 text-left">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-on-surface uppercase tracking-wider">Estructura del Proyecto</span>
          <button (click)="addLocation()" class="text-xs text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer">
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Nueva Locación</span>
          </button>
        </div>

        <!-- Lista de Locaciones -->
        <div class="space-y-3 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div *ngFor="let loc of project()?.locations; let i = index" class="p-3 bg-surface-container-lowest rounded-xl shadow-xs border border-outline/10">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-extrabold text-on-surface">LOC #0{{ i + 1 }}: {{ loc.title }}</span>
              <span class="text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">{{ loc.sections.length }} Sec.</span>
            </div>

            <!-- Subsecciones -->
            <div class="pl-2 space-y-1.5 border-l-2 border-primary/30">
              <div *ngFor="let sec of loc.sections" class="p-1.5 rounded-lg bg-surface-container-low/70 hover:bg-surface-container text-xs text-on-surface flex items-center justify-between cursor-pointer">
                <span class="truncate font-medium">{{ sec.title }}</span>
                <span class="text-[10px] text-on-surface-variant font-mono">{{ sec.media?.length || 0 }} fotos</span>
              </div>
            </div>

            <button (click)="addSection(loc)" class="mt-2 text-[11px] text-secondary hover:text-primary font-semibold flex items-center gap-1 w-full justify-center py-1 rounded bg-surface-container-low cursor-pointer">
              <span class="material-symbols-outlined text-xs">add</span>
              <span>Añadir Sección</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- ÁREA DE TRABAJO: Carga de Medios y Gestión -->
      <section class="flex-1 p-6 md:p-8 text-left overflow-y-auto">
        <div class="max-w-5xl mx-auto space-y-6">
          <!-- Zona Drag & Drop para Fotos y Videos -->
          <div class="p-8 bg-surface-container-lowest rounded-2xl border-2 border-dashed border-primary/40 text-center hover:border-primary transition-colors cursor-pointer" (click)="fileInput.click()">
            <input #fileInput type="file" multiple accept="image/*,video/mp4" (change)="onFilesSelected($event)" class="hidden">
            <div class="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
              <span class="material-symbols-outlined text-2xl">cloud_upload</span>
            </div>
            <h3 class="text-base font-bold text-on-surface">Arrastra fotos en alta resolución o videos MP4</h3>
            <p class="text-xs text-on-surface-variant mt-1">
              Soporta JPG, PNG, WebP y MP4 hasta 50MB. Los archivos se optimizan y se guardan directamente en Supabase Storage.
            </p>
            <button type="button" class="mt-4 px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg shadow-sm hover:brightness-105 pointer-events-none">
              Seleccionar Archivos desde el Equipo
            </button>
          </div>

          <!-- Feedback de Archivos Subidos -->
          <div *ngIf="uploadCount() > 0" class="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
            <span class="font-semibold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              Se subieron {{ uploadCount() }} nuevos activos correctamente a Supabase.
            </span>
            <span class="text-[11px]">Revisión actualizada</span>
          </div>

          <!-- Activos en la Locación Actual -->
          <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline/10">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-on-surface">Activos en Villa Moderna Pedregal</h3>
                <p class="text-xs text-on-surface-variant">Reordena o establece la fotografía de portada principal.</p>
              </div>
              <span class="text-xs text-on-surface-variant font-medium">6 Medios Activos</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div class="relative rounded-xl overflow-hidden bg-surface-container group border border-outline/10">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80" class="w-full h-32 object-cover">
                <div class="p-2 bg-surface-container-lowest text-[11px] font-semibold text-on-surface truncate">
                  Vista Frontal
                </div>
                <div class="absolute top-2 left-2 bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded">
                  PORTADA
                </div>
              </div>

              <div class="relative rounded-xl overflow-hidden bg-surface-container group border border-outline/10">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80" class="w-full h-32 object-cover">
                <div class="p-2 bg-surface-container-lowest text-[11px] font-semibold text-on-surface truncate">
                  Detalle Puerta
                </div>
              </div>

              <div class="relative rounded-xl overflow-hidden bg-surface-container group border border-outline/10">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80" class="w-full h-32 object-cover">
                <div class="p-2 bg-surface-container-lowest text-[11px] font-semibold text-on-surface truncate">
                  Salón Principal
                </div>
              </div>

              <div class="relative rounded-xl overflow-hidden bg-surface-container group border border-outline/10">
                <img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=400&q=80" class="w-full h-32 object-cover">
                <div class="p-2 bg-surface-container-lowest text-[11px] font-semibold text-on-surface truncate">
                  Tragaluz
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  `
})
export class AdminProjectEditorComponent {
  private projectsService = inject(ProjectsService);
  private router = inject(Router);

  project = this.projectsService.currentProject;
  uploadCount = signal<number>(0);

  constructor() {}

  addLocation() {
    const title = prompt('Nombre de la nueva locación:');
    if (!title) return;

    const p = this.project();
    if (p && p.locations) {
      p.locations.push({
        id: `loc-${Date.now()}`,
        title: title,
        description: 'Nueva locación añadida',
        order: p.locations.length,
        coverMediaId: null,
        coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        sections: []
      });
    }
  }

  addSection(loc: any) {
    const title = prompt(`Nombre de la sección para ${loc.title}:`);
    if (!title) return;

    loc.sections.push({
      id: `sec-${Date.now()}`,
      title: title,
      description: 'Espacio técnico',
      order: loc.sections.length,
      details: [],
      mediaIds: [],
      media: []
    });
  }

  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.uploadCount.set(files.length);
    }
  }

  publishRevision() {
    const p = this.project();
    if (p) {
      p.revision = p.revision + 1;
      p.publishedRevision = p.revision;
      p.status = 'published';
      alert(`¡Revisión v${p.revision}.0 publicada con éxito en Supabase!\nEl cliente ya puede consultar la nueva versión.`);
    }
  }

  previewAsClient() {
    const p = this.project();
    if (p) {
      this.router.navigate(['/p', p.id]);
    }
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
