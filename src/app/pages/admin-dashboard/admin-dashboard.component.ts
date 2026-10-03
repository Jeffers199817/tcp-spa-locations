import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header Admin -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm border-b border-surface-container-high">
      <div class="h-16 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div (click)="goToClient()" class="flex items-center gap-2 cursor-pointer">
            <span class="material-symbols-outlined text-primary text-2xl font-bold">admin_panel_settings</span>
            <span class="text-lg font-bold text-on-surface tracking-tight">PFE Admin</span>
          </div>
          <div class="h-5 w-px bg-surface-container-highest"></div>
          <span class="text-xs text-on-surface-variant font-medium">Gestión Maestra de Locaciones</span>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="openCreateModal()" class="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 transition-all cursor-pointer">
            <span class="material-symbols-outlined text-base">add</span>
            <span>Nuevo Proyecto</span>
          </button>
          <button (click)="goToClient()" class="px-3 py-1.5 bg-surface-container text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer">
            <span class="material-symbols-outlined text-sm">visibility</span>
            <span>Vista Cliente</span>
          </button>
        </div>
      </div>
    </header>

    <main class="w-full pt-20 px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-surface">
      <div class="max-w-[1680px] mx-auto text-left">
        <!-- Banner de Métricas -->
        <div class="mb-8 p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline/10">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-on-surface">Gestión Maestra de Proyectos</h1>
              <p class="text-xs sm:text-sm text-on-surface-variant mt-1">
                Organiza hasta 20 proyectos independientes con control de acceso por código y revisiones inmutables.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold px-3 py-1 bg-surface-container-low text-on-surface-variant rounded-full">
                Capacidad: {{ projects().length }} / 20 Proyectos
              </span>
            </div>
          </div>

          <!-- Cards de Métricas -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 bg-surface-container-low rounded-xl">
              <span class="text-xs text-on-surface-variant">Proyectos Totales</span>
              <p class="text-2xl font-bold text-on-surface mt-1">{{ projects().length }}</p>
            </div>
            <div class="p-4 bg-surface-container-low rounded-xl">
              <span class="text-xs text-on-surface-variant">Locaciones Activas</span>
              <p class="text-2xl font-bold text-secondary mt-1">14</p>
            </div>
            <div class="p-4 bg-surface-container-low rounded-xl">
              <span class="text-xs text-on-surface-variant">Fotografías Almacenadas</span>
              <p class="text-2xl font-bold text-on-surface mt-1">46</p>
            </div>
            <div class="p-4 bg-surface-container-low rounded-xl">
              <span class="text-xs text-on-surface-variant">Storage Supabase</span>
              <p class="text-2xl font-bold text-primary mt-1">182 MB</p>
            </div>
          </div>
        </div>

        <!-- Listado de Proyectos -->
        <div class="space-y-4">
          <div *ngFor="let p of projects()" class="p-5 bg-surface-container-lowest rounded-xl shadow-sm border border-outline/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-outline/30 transition-all">
            <div class="flex flex-col gap-1 max-w-2xl">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  [class.bg-emerald-100]="p.status === 'published'"
                  [class.text-emerald-800]="p.status === 'published'"
                  [class.bg-amber-100]="p.status === 'draft'"
                  [class.text-amber-800]="p.status === 'draft'"
                  class="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase"
                >
                  {{ p.status === 'published' ? 'Publicado' : 'Borrador' }}
                </span>
                <span class="text-xs text-on-surface-variant font-mono bg-surface-container px-2 py-0.5 rounded">
                  Código: <strong class="text-on-surface">{{ p.accessCode }}</strong>
                </span>
                <span class="text-xs text-on-surface-variant">Revisión v{{ p.revision }}.0</span>
              </div>
              <h2 class="text-xl font-bold text-on-surface mt-1">{{ p.title }}</h2>
              <p class="text-xs text-on-surface-variant">{{ p.description }}</p>
            </div>

            <!-- Acciones -->
            <div class="flex items-center gap-2 shrink-0">
              <button
                (click)="copyClientLink(p)"
                class="px-3 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Copiar enlace con código para el cliente"
              >
                <span class="material-symbols-outlined text-sm">content_copy</span>
                <span>Copiar Enlace</span>
              </button>
              <button
                (click)="editProject(p.id)"
                class="px-3.5 py-2 bg-secondary text-on-secondary rounded-lg text-xs font-semibold flex items-center gap-1 hover:brightness-105 transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-sm">edit</span>
                <span>Editar Estructura</span>
              </button>
              <button
                (click)="viewAsClient(p.id)"
                class="px-3.5 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold flex items-center gap-1 hover:brightness-105 transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-sm">visibility</span>
                <span>Ver Galería</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Crear Proyecto -->
    <div *ngIf="showModal()" (click)="closeModal()" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-2xl relative text-left" (click)="$event.stopPropagation()">
        <h3 class="text-xl font-bold text-on-surface mb-1">Crear Nuevo Proyecto</h3>
        <p class="text-xs text-on-surface-variant mb-4">Ingresa los datos para configurar un nuevo deck de locaciones.</p>

        <form (ngSubmit)="saveNewProject()" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-on-surface block mb-1">Título del Proyecto</label>
            <input [(ngModel)]="newTitle" name="title" required placeholder="Ej: Comercial Bebida Energética 2026" class="w-full h-10 px-3 text-sm bg-surface-container-low rounded-lg border border-outline/20 focus:outline-none focus:border-primary">
          </div>
          <div>
            <label class="text-xs font-semibold text-on-surface block mb-1">Descripción / Brief</label>
            <textarea [(ngModel)]="newDescription" name="desc" rows="3" placeholder="Brief visual, requerimientos de espacios..." class="w-full p-3 text-sm bg-surface-container-low rounded-lg border border-outline/20 focus:outline-none focus:border-primary"></textarea>
          </div>
          <div>
            <label class="text-xs font-semibold text-on-surface block mb-1">Código de Acceso Cliente</label>
            <input [(ngModel)]="newCode" name="code" required placeholder="LOC-2026-N" class="w-full h-10 px-3 text-sm font-mono uppercase bg-surface-container-low rounded-lg border border-outline/20 focus:outline-none focus:border-primary">
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" (click)="closeModal()" class="px-4 py-2 bg-surface-container text-on-surface rounded-lg text-xs font-semibold">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:brightness-105">Crear Proyecto</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  private projectsService = inject(ProjectsService);
  private router = inject(Router);

  projects = this.projectsService.allProjects;
  showModal = signal<boolean>(false);

  newTitle: string = '';
  newDescription: string = '';
  newCode: string = '';

  constructor() {}

  openCreateModal() {
    this.newTitle = '';
    this.newDescription = '';
    this.newCode = `LOC-${Math.floor(1000 + Math.random() * 9000)}`;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveNewProject() {
    if (!this.newTitle.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: this.newTitle,
      description: this.newDescription,
      status: 'draft',
      revision: 1,
      publishedRevision: null,
      accessCode: this.newCode || 'LOC-DEMO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      locations: []
    };

    this.projectsService.allProjects.set([newProj, ...this.projectsService.allProjects()]);
    this.closeModal();
  }

  copyClientLink(p: Project) {
    const link = `${window.location.origin}/?code=${p.accessCode}`;
    navigator.clipboard.writeText(link);
    alert(`Enlace copiado al portapapeles:\n${link}`);
  }

  editProject(id: string) {
    this.router.navigate(['/admin/projects', id, 'edit']);
  }

  viewAsClient(id: string) {
    this.router.navigate(['/p', id]);
  }

  goToClient() {
    this.router.navigate(['/']);
  }
}
