import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { FavoritesService } from '../../services/favorites.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { Project } from '../../models/project.model';
import { PfeFooterComponent } from '../../components/pfe-footer/pfe-footer.component';
import { PfeLogoComponent } from '../../components/pfe-logo/pfe-logo.component';

@Component({
  selector: 'app-admin-dashboard',
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

      <!-- ASIDE SIDEBAR (Navegación Fija Izquierda) -->
      <aside class="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-space-md hidden lg:flex border-r border-surface-container-high/80">
        <div class="flex flex-col gap-space-md">
          
          <!-- Logo Brand -->
          <div class="flex items-center px- space-md px-4 h-12">
            <app-pfe-logo size="sm" [showText]="true" linkTo="/admin"></app-pfe-logo>
          </div>

          <!-- Contexto Activo -->
          <div class="px-space-md px-4 text-left">
            <div class="bg-surface-container-low p-2.5 rounded-lg border border-surface-container-high">
              <p class="font-label-md text-label-md text-on-surface-variant text-[10px] uppercase font-bold">Contexto Activo</p>
              <p class="font-label-lg text-label-lg text-on-surface truncate text-xs font-semibold mt-0.5">Campaña Global Verano 2026</p>
            </div>
          </div>

          <!-- Enlaces de navegación -->
          <nav class="flex flex-col gap-1 px-space-sm px-3 text-left">
            <a routerLink="/admin" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container text-on-surface font-semibold text-xs shadow-xs">
              <span class="material-symbols-outlined text-[20px] text-primary">dashboard</span>
              <span>Panel General</span>
            </a>
            <a routerLink="/admin/projects/10000000-0000-4000-8000-000000000001/edit" class="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant font-label-lg hover:bg-surface-container-low hover:text-on-surface transition-colors text-xs">
              <span class="material-symbols-outlined text-[20px]">add_business</span>
              <span>Locaciones & Medios</span>
            </a>
            <button (click)="notifyInfo('Sección de permisos municipales y contratos de producción')" class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant font-label-lg hover:bg-surface-container-low hover:text-on-surface transition-colors text-xs cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">gavel</span>
              <span>Permisos CDMX</span>
            </button>
            <button (click)="notifyInfo('Gestión de colaboradores con acceso por RLS')" class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant font-label-lg hover:bg-surface-container-low hover:text-on-surface transition-colors text-xs cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">group</span>
              <span>Equipo y Acceso</span>
            </button>
            <button (click)="forceSync()" class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant font-label-lg hover:bg-surface-container-low hover:text-on-surface transition-colors text-xs cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">sync_alt</span>
              <span>Sincronización</span>
            </button>
          </nav>
        </div>

        <!-- Footer Sidebar -->
        <div class="px-space-md px-4 flex flex-col gap-space-sm">
          <div class="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low text-xs border border-surface-container-high">
            <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span class="font-label-md text-label-md text-on-surface-variant">Supabase Live Sync</span>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-surface-container">
            <div class="flex items-center gap-2 text-left">
              <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                CP
              </div>
              <span class="font-label-md text-label-md text-on-surface text-xs font-semibold">Admin Master</span>
            </div>
            <button (click)="logoutAdmin()" class="font-label-md text-label-md text-error hover:underline text-xs font-bold cursor-pointer">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <!-- ÁREA DE CONTENIDO (Desplazada para el sidebar en lg) -->
      <div class="lg:pl-64 flex-grow flex flex-col">
        
        <!-- Header Superior del Admin -->
        <header class="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-surface-container-high/80">
          <div class="flex items-center gap-space-md gap-3">
            <app-pfe-logo size="sm" [showText]="false" linkTo="/admin" class="lg:hidden"></app-pfe-logo>
            <div class="flex items-center gap-space-xs text-xs">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase font-medium">Entorno:</span>
              <span class="font-label-lg text-label-lg text-on-surface font-bold">Panel Administrador Seguro</span>
            </div>
          </div>

          <div class="flex items-center gap-2.5 sm:gap-4">
            <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-xs">
              <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span class="font-label-md text-label-md text-on-surface-variant font-medium">Supabase Realtime</span>
            </div>

            <!-- Seleccionadas Counter -->
            <a routerLink="/seleccionadas" class="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold">
              <span class="material-symbols-outlined text-[16px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="hidden sm:inline">Seleccionadas</span>
              <span class="bg-primary text-on-primary font-spec-numeral text-xs px-2 py-0.5 rounded-full font-bold">
                {{ favCount() }}
              </span>
            </a>

            <!-- Mode Switcher -->
            <div class="flex items-center bg-surface-container-low p-1 rounded-lg text-xs">
              <a [routerLink]="activeClientUrl()" class="px-2.5 py-1 rounded font-label-md text-label-md text-on-surface-variant hover:text-on-surface font-medium transition-colors flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">visibility</span>
                <span>Vista Cliente</span>
              </a>
              <span class="px-2.5 py-1 rounded font-label-md text-label-md bg-surface-container-lowest text-on-surface shadow-xs font-bold">
                Admin
              </span>
            </div>

            <!-- Logout Button -->
            <button (click)="logoutAdmin()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-container/20 hover:bg-error-container text-error text-xs font-semibold transition-colors cursor-pointer" title="Cerrar Sesión de Administrador">
              <span class="material-symbols-outlined text-[16px]">logout</span>
              <span class="hidden md:inline">Salir</span>
            </button>
          </div>
        </header>

        <!-- MAIN DASHBOARD CONTENT -->
        <main class="relative pt-20 px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          <div class="flex flex-col w-full gap-space-lg max-w-[1680px] mx-auto text-left">
            
            <!-- Welcome & KPI Overview Section -->
            <section class="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="font-label-md text-label-md uppercase tracking-wider text-secondary font-bold text-xs">PFE Core Admin</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span class="font-label-md text-label-md text-on-surface-variant text-xs">v3.4 Production Ready</span>
                </div>
                <h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight text-3xl sm:text-4xl font-extrabold mt-1">
                  Gestión Maestra de Proyectos
                </h1>
                <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl text-xs sm:text-sm">
                  Supervise la disponibilidad de espacios, cuotas de almacenamiento en Supabase Storage y el flujo de curaduría colaborativa con directores y agencias en tiempo real.
                </p>
              </div>

              <!-- Quick CTAs -->
              <div class="flex items-center gap-space-sm shrink-0">
                <button (click)="forceSync()" class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container transition-all text-xs font-semibold active:scale-95 border border-surface-container-high cursor-pointer">
                  <span class="material-symbols-outlined text-[18px] text-secondary">sync</span>
                  <span>Forzar Sincro</span>
                </button>
                <button (click)="openCreateModal()" class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary shadow-md hover:bg-primary-container transition-all text-xs font-bold active:scale-98 cursor-pointer">
                  <span class="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>+ Nuevo Proyecto</span>
                </button>
              </div>
            </section>

            <!-- Live Metrics Ribbon (Bento Minimal) -->
            <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              <!-- Active Projects Card -->
              <div class="bg-surface-container-lowest rounded-xl p-space-md p-4 shadow-sm border border-surface-container-high flex flex-col justify-between relative overflow-hidden group">
                <div class="absolute -right-3 -bottom-3 w-20 h-20 bg-secondary/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                <div class="flex items-center justify-between">
                  <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">Proyectos Activos</span>
                  <span class="p-2 rounded-lg bg-surface-container-low text-secondary material-symbols-outlined text-[18px]">folder_special</span>
                </div>
                <div class="mt-4 flex items-baseline gap-2">
                  <span class="font-spec-numeral text-headline-xl text-on-surface leading-none text-3xl font-extrabold">{{ projects().length }}</span>
                  <span class="font-label-lg text-label-lg text-on-surface-variant text-xs font-semibold">/ 20 asignados</span>
                </div>
                <div class="mt-3 w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div class="bg-secondary h-full rounded-full transition-all" [style.width.%]="(projects().length / 20) * 100"></div>
                </div>
              </div>

              <!-- Storage Bucket Metrics -->
              <div class="bg-surface-container-lowest rounded-xl p-space-md p-4 shadow-sm border border-surface-container-high flex flex-col justify-between relative overflow-hidden group">
                <div class="absolute -right-3 -bottom-3 w-20 h-20 bg-tertiary/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                <div class="flex items-center justify-between">
                  <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">Storage Supabase</span>
                  <span class="p-2 rounded-lg bg-surface-container-low text-tertiary material-symbols-outlined text-[18px]">cloud_sync</span>
                </div>
                <div class="mt-4 flex items-baseline gap-2">
                  <span class="font-spec-numeral text-headline-xl text-on-surface leading-none text-3xl font-extrabold">84%</span>
                  <span class="font-label-lg text-label-lg text-on-surface-variant text-xs font-semibold">de 100 GB</span>
                </div>
                <div class="mt-3 flex items-center justify-between font-label-md text-label-md text-on-surface-variant text-[11px]">
                  <span class="flex items-center gap-1 font-semibold text-tertiary"><span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span>58.4 GB</span>
                  <span>Bucket pfe-raw-prod</span>
                </div>
              </div>

              <!-- Published Count -->
              <div class="bg-surface-container-lowest rounded-xl p-space-md p-4 shadow-sm border border-surface-container-high flex flex-col justify-between relative overflow-hidden group">
                <div class="absolute -right-3 -bottom-3 w-20 h-20 bg-secondary-fixed/30 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                <div class="flex items-center justify-between">
                  <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">Publicados (Live)</span>
                  <span class="p-2 rounded-lg bg-surface-container-low text-secondary material-symbols-outlined text-[18px]">visibility</span>
                </div>
                <div class="mt-4 flex items-baseline gap-2">
                  <span class="font-spec-numeral text-headline-xl text-on-surface leading-none text-3xl font-extrabold">{{ publishedCount() }}</span>
                  <span class="font-label-lg text-label-lg text-secondary text-xs font-semibold">Acceso Directo OK</span>
                </div>
                <div class="mt-3 flex items-center gap-1 font-label-md text-label-md text-secondary text-[11px] font-semibold">
                  <span class="material-symbols-outlined text-[14px]">cell_tower</span>
                  <span>Sincronizando con clientes</span>
                </div>
              </div>

              <!-- Drafts Count -->
              <div class="bg-surface-container-lowest rounded-xl p-space-md p-4 shadow-sm border border-surface-container-high flex flex-col justify-between relative overflow-hidden group">
                <div class="absolute -right-3 -bottom-3 w-20 h-20 bg-primary/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                <div class="flex items-center justify-between">
                  <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">En Borrador</span>
                  <span class="p-2 rounded-lg bg-surface-container-low text-primary material-symbols-outlined text-[18px]">edit_note</span>
                </div>
                <div class="mt-4 flex items-baseline gap-2">
                  <span class="font-spec-numeral text-headline-xl text-on-surface leading-none text-3xl font-extrabold">{{ draftCount() }}</span>
                  <span class="font-label-lg text-label-lg text-on-surface-variant text-xs font-semibold">revisión interna</span>
                </div>
                <div class="mt-3 flex items-center gap-1 font-label-md text-label-md text-on-surface-variant text-[11px]">
                  <span class="material-symbols-outlined text-[14px]">lock</span>
                  <span>Sin acceso público</span>
                </div>
              </div>
            </section>

            <!-- Filter & Search Toolbar -->
            <section class="bg-surface-container-lowest p-space-md p-4 rounded-xl shadow-sm border border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              
              <!-- Search Bar -->
              <div class="relative flex-1 max-w-md">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery" 
                  placeholder="Buscar por proyecto, cliente o código (ej: LOC-8821)..." 
                  class="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary text-xs transition-colors"
                />
              </div>

              <!-- Segmented Tabs for Filtering -->
              <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg overflow-x-auto text-xs font-semibold">
                <button (click)="activeTab.set('all')" 
                        [class.bg-surface-container-lowest]="activeTab() === 'all'" 
                        [class.text-on-surface]="activeTab() === 'all'" 
                        [class.shadow-xs]="activeTab() === 'all'" 
                        class="px-3.5 py-1.5 rounded transition-all cursor-pointer">
                  Todos <span class="ml-1 opacity-70">{{ projects().length }}</span>
                </button>
                <button (click)="activeTab.set('published')" 
                        [class.bg-surface-container-lowest]="activeTab() === 'published'" 
                        [class.text-on-surface]="activeTab() === 'published'" 
                        [class.shadow-xs]="activeTab() === 'published'" 
                        class="px-3.5 py-1.5 rounded transition-all cursor-pointer">
                  Publicados <span class="ml-1 opacity-70">{{ publishedCount() }}</span>
                </button>
                <button (click)="activeTab.set('draft')" 
                        [class.bg-surface-container-lowest]="activeTab() === 'draft'" 
                        [class.text-on-surface]="activeTab() === 'draft'" 
                        [class.shadow-xs]="activeTab() === 'draft'" 
                        class="px-3.5 py-1.5 rounded transition-all cursor-pointer">
                  Borrador <span class="ml-1 opacity-70">{{ draftCount() }}</span>
                </button>
                <button (click)="activeTab.set('archived')" 
                        [class.bg-surface-container-lowest]="activeTab() === 'archived'" 
                        [class.text-on-surface]="activeTab() === 'archived'" 
                        [class.shadow-xs]="activeTab() === 'archived'" 
                        class="px-3.5 py-1.5 rounded transition-all cursor-pointer">
                  Archivados <span class="ml-1 opacity-70">0</span>
                </button>
              </div>
            </section>

            <!-- Projects Grid / Cards Feed -->
            <section class="flex flex-col gap-space-md gap-4">
              @for (proj of filteredProjects(); track proj.id) {
                <article class="project-card bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high hover:shadow-md transition-shadow p-space-lg p-5 flex flex-col xl:flex-row gap-space-lg gap-4 justify-between items-start xl:items-center">
                  
                  <div class="flex flex-col md:flex-row gap-space-md gap-4 items-start md:items-center">
                    
                    <!-- Thumbnail with +3 Badge -->
                    <div class="relative w-28 h-24 rounded-lg overflow-hidden bg-surface-container shrink-0 shadow-inner">
                      <img class="w-full h-full object-cover" 
                           [src]="getThumbnailFor(proj.id)" 
                           alt="Thumbnail"/>
                      <div class="absolute bottom-1 right-1 bg-surface/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-spec-numeral font-bold text-on-surface">
                        +3
                      </div>
                    </div>

                    <!-- Project Details -->
                    <div class="flex flex-col gap-1 min-w-0">
                      <div class="flex flex-wrap items-center gap-2 text-xs">
                        <span class="px-2.5 py-0.5 rounded-full font-label-md text-label-md font-semibold flex items-center gap-1"
                              [class.bg-secondary-fixed]="proj.status === 'published'"
                              [class.text-on-secondary-fixed]="proj.status === 'published'"
                              [class.bg-primary-fixed]="proj.status === 'draft'"
                              [class.text-on-primary-fixed]="proj.status === 'draft'">
                          <span class="w-1.5 h-1.5 rounded-full" [class.bg-secondary]="proj.status === 'published'" [class.bg-primary]="proj.status === 'draft'" [class.animate-pulse]="proj.status === 'published'"></span>
                          {{ proj.status === 'published' ? 'Publicado (v' + proj.revision + '.0)' : 'Borrador en Edición' }}
                        </span>
                        <span class="font-label-md text-label-md text-on-surface-variant font-mono bg-surface-container-low px-2 py-0.5 rounded border border-surface-container-high">
                          Código: <strong class="text-on-surface">{{ proj.accessCode }}</strong>
                        </span>
                        <span class="font-label-md text-label-md text-on-surface-variant">Actualizado hace 15m</span>
                      </div>

                      <h2 class="font-headline-md text-headline-md text-on-surface truncate text-lg sm:text-xl font-bold mt-1">
                        {{ proj.title }}
                      </h2>
                      <p class="font-body-md text-body-md text-on-surface-variant text-xs line-clamp-1 max-w-xl">
                        {{ proj.description }}
                      </p>

                      <!-- Specs Mini-Tags -->
                      <div class="flex flex-wrap items-center gap-x-space-md gap-x-3 gap-y-1 text-xs text-on-surface-variant pt-1">
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-[16px] text-secondary">domain</span>
                          3 Locaciones
                        </span>
                        <span>•</span>
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-[16px] text-primary">photo_library</span>
                          46 Medios
                        </span>
                        <span>•</span>
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-[16px] text-tertiary">cloud_done</span>
                          42.6 GB RAW
                        </span>
                      </div>
                    </div>

                  </div>

                  <!-- Actions -->
                  <div class="flex flex-wrap items-center gap-2 shrink-0 w-full xl:w-auto justify-end border-t xl:border-t-0 pt-3 xl:pt-0 border-surface-container-high">
                    <button (click)="copyCode(proj.accessCode)" class="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-xs font-semibold flex items-center gap-1 cursor-pointer" title="Copiar Solo Código">
                      <span class="material-symbols-outlined text-[18px]">key</span>
                    </button>
                    
                    <!-- Direct Link with Code Copy Button -->
                    <button (click)="copyDirectClientLink(proj)" class="px-3 py-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs" title="Copiar Enlace Directo con Código para el Cliente">
                      <span class="material-symbols-outlined text-[16px]">link</span>
                      <span>Copiar Link Cliente</span>
                    </button>

                    <a [routerLink]="['/p', proj.id]" class="px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs">
                      <span class="material-symbols-outlined text-[16px]">visibility</span>
                      <span>Ver Cliente</span>
                    </a>
                    
                    <a [routerLink]="['/admin/projects', proj.id, 'edit']" class="px-3.5 py-2 rounded-lg bg-primary hover:brightness-105 text-on-primary font-bold text-xs shadow-sm transition-all flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px]">edit</span>
                      <span>Editar</span>
                    </a>
                  </div>

                </article>
              }
            </section>

          </div>
        </main>

        <!-- Professional Footer -->
        <app-pfe-footer></app-pfe-footer>

      </div>

      <!-- MODAL CREAR NUEVO PROYECTO -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div class="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4 text-left">
            
            <div class="flex items-center justify-between pb-2 border-b border-surface-container">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[24px]">create_new_folder</span>
                <h3 class="font-headline-sm text-lg font-bold text-on-surface">Crear Nuevo Proyecto de Locaciones</h3>
              </div>
              <button (click)="closeCreateModal()" class="text-on-surface-variant hover:text-on-surface cursor-pointer">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-on-surface mb-1">Nombre del Proyecto *</label>
                <input 
                  type="text" 
                  [(ngModel)]="newProjectTitle" 
                  placeholder="Ej: Comercial Bebida Energética Q4" 
                  class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label class="block font-bold text-on-surface mb-1">Código de Acceso Privado (NDA) *</label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    [(ngModel)]="newProjectCode" 
                    placeholder="LOC-XXXX" 
                    class="w-full h-10 px-3 uppercase font-mono tracking-wider rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                  />
                  <button (click)="generateRandomCode()" class="px-3 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-lg font-semibold whitespace-nowrap cursor-pointer">
                    Generar
                  </button>
                </div>
              </div>

              <div>
                <label class="block font-bold text-on-surface mb-1">Director de Arte / Productor Asignado</label>
                <input 
                  type="text" 
                  [(ngModel)]="newProjectLead" 
                  placeholder="Ej: Mateo Valenzuela / Laura Morales" 
                  class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label class="block font-bold text-on-surface mb-1">Descripción / Ficha de Rodaje</label>
                <textarea 
                  [(ngModel)]="newProjectDescription" 
                  rows="3" 
                  placeholder="Detalla los requerimientos técnicos, fechas estimadas de shooting y perfil de recintos buscados..." 
                  class="w-full p-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
              <button (click)="closeCreateModal()" class="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high cursor-pointer">
                Cancelar
              </button>
              <button (click)="submitCreateProject()" [disabled]="!newProjectTitle || !newProjectCode" class="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm hover:brightness-105 disabled:opacity-50 cursor-pointer">
                Crear y Abrir Estructura
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class AdminDashboardComponent {
  private projectsService = inject(ProjectsService);
  private favoritesService = inject(FavoritesService);
  private adminAuth = inject(AdminAuthService);
  private router = inject(Router);

  public projects = computed(() => this.projectsService.allProjects());
  public favCount = computed(() => this.favoritesService.count());
  public lastToast = computed(() => this.favoritesService.lastToast());

  public searchQuery: string = '';
  public activeTab = signal<'all' | 'published' | 'draft' | 'archived'>('all');
  public showCreateModal = signal<boolean>(false);

  public newProjectTitle: string = '';
  public newProjectCode: string = 'LOC-2026-N';
  public newProjectLead: string = 'Mateo Valenzuela';
  public newProjectDescription: string = '';

  public activeClientUrl = computed(() => {
    const curr = this.projectsService.currentProject();
    if (curr) {
      return `/p/${curr.id}?code=${curr.accessCode}`;
    }
    return '/p/10000000-0000-4000-8000-000000000001?code=LOC-2026-X';
  });

  public publishedCount = computed(() => {
    return this.projects().filter(p => p.status === 'published').length;
  });

  public draftCount = computed(() => {
    return this.projects().filter(p => p.status === 'draft').length;
  });

  public filteredProjects = computed(() => {
    let list = this.projects();
    const tab = this.activeTab();
    if (tab === 'published') {
      list = list.filter(p => p.status === 'published');
    } else if (tab === 'draft') {
      list = list.filter(p => p.status === 'draft');
    } else if (tab === 'archived') {
      list = [];
    }

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.accessCode.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      );
    }

    return list;
  });

  getThumbnailFor(projId: string): string {
    if (projId.endsWith('0001')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoPdw6Ah2CCawFhTG2RY1TikZ_30fDY0vIe2jzYIresWo0wbjAz0jG7ZQ6U1s0Xuv-vnmaZwCnuYIGFF0q_in44ASyoxRSIsKf--ZC1xxsfNXIJV9_9UgCDGXlQ0dgodsWKSNBfxYIscPKqF_oSF356GWpJo8nCT0vpGpMboVxYnJnbAg6OGqBE5b61hrrNX3AtTBm6zyWhZ5qIjziJonIh3HcgT_fJGpsluOyuui89c8ITVx3vr7X';
    }
    if (projId.endsWith('0002')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcskZKxBu72IFBBaOLdefF6pieyAKeg5aPIWbviZuCtdZl4xrwsv1a1MeaLDUU-K99ka7TJGso9CB2d-Q75Y-1leigvQWhv9urJxsAg2o_uqZyfyy9DwcFSvSsB689fmvEB4C3PXai75YKPnKtOrlRTl2cxQn6Iv37nd-4PllCLJCRLPHlF3t6bpqUt4RpbjoXmuLrJJbQ_zDFctJJgVYiuseEEGF9JDzVP2iAM7-rGMra4bVjQIzl';
    }
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3w_F6sEyCIH4qWyI6kQX-RlXoVaUo2HtLiJUugLYP4V3u0LeFQez4Uk5_HRen6iUMXza6-wL_jhVrSiUYLV4z30oY1CGMwl0WGMOMUM8z5vRN2Zh7WR0CfRFP-DkNbWrxTMU9_XoRHMJw9ey6wq3vPWNGhLdYchxJxviXcUbfV7dd8iBHtYodWj47O3umLXuxoHhmN_NuXoNGWhJpw8_q120npfFZjc4w28pyqH-b1lMce9YegsX2';
  }

  copyCode(code: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    this.favoritesService.triggerToast(`Código ${code} copiado al portapapeles.`);
  }

  copyDirectClientLink(proj: Project) {
    const origin = window.location.origin;
    const directUrl = `${origin}/p/${proj.id}?code=${proj.accessCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(directUrl);
    }
    this.favoritesService.triggerToast(`Enlace directo con código para "${proj.title}" copiado al portapapeles.`);
  }

  logoutAdmin() {
    this.adminAuth.logout();
    this.favoritesService.triggerToast('Sesión de administrador cerrada correctamente.');
    this.router.navigate(['/admin/login']);
  }

  forceSync() {
    this.favoritesService.triggerToast('Sincronización forzada completada con Supabase PostgreSQL.');
  }

  notifyInfo(msg: string) {
    this.favoritesService.triggerToast(msg);
  }

  openCreateModal() {
    this.generateRandomCode();
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  generateRandomCode() {
    const num = Math.floor(1000 + Math.random() * 9000);
    this.newProjectCode = `LOC-${num}`;
  }

  async submitCreateProject() {
    if (!this.newProjectTitle || !this.newProjectCode) return;
    const proj = await this.projectsService.createProject(this.newProjectTitle, this.newProjectCode, this.newProjectDescription);
    this.showCreateModal.set(false);
    this.favoritesService.triggerToast(`Proyecto "${proj.title}" creado exitosamente.`);
    this.router.navigate(['/admin/projects', proj.id, 'edit']);
  }
}
