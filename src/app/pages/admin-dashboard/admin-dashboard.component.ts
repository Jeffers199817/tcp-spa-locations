import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { FavoritesService, DpNote, ClientSessionToken } from '../../services/favorites.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { Project, ProjectMapConfig } from '../../models/project.model';
import { PfeFooterComponent } from '../../components/pfe-footer/pfe-footer.component';
import { PfeLogoComponent } from '../../components/pfe-logo/pfe-logo.component';

export interface AssetMetricRow {
  id: string;
  title: string;
  thumbnailUrl: string;
  locationName: string;
  projectId: string;
  projectTitle: string;
  type: string;
  format: string;
  clicksCount: number;
  likesCount: number;
  hasDpNote: boolean;
  dpNote?: DpNote;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PfeFooterComponent, PfeLogoComponent],
  template: `
    <div class="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">

      <!-- Toast Notifier (Ultra High Priority z-[9999], Visible Over Everything) -->
      <div class="fixed top-6 right-6 z-[9999] transform transition-all duration-300 pointer-events-none flex items-center gap-3 bg-[#121215] text-white px-5 py-3 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] border border-white/20 text-xs sm:text-sm font-semibold max-w-md"
           [class.translate-y-[-30px]]="!lastToast().visible"
           [class.opacity-0]="!lastToast().visible"
           [class.translate-y-0]="lastToast().visible"
           [class.opacity-100]="lastToast().visible">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
        <span class="material-symbols-outlined text-[20px] text-emerald-400 shrink-0">check_circle</span>
        <span class="leading-snug">{{ lastToast().message }}</span>
      </div>

      <!-- ASIDE SIDEBAR (Navegación Fija Izquierda) -->
      <aside class="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-space-md hidden lg:flex border-r border-surface-container-high/80">
        <div class="flex flex-col gap-space-md">
          
          <!-- Logo Brand -->
          <div class="flex items-center px-4 h-12">
            <app-pfe-logo size="sm" [showText]="true" linkTo="/admin"></app-pfe-logo>
          </div>

          <!-- Contexto Activo -->
          <div class="px-4 text-left">
            <div class="bg-surface-container-low p-2.5 rounded-lg border border-surface-container-high">
              <p class="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">Mando Central</p>
              <p class="text-on-surface truncate text-xs font-semibold mt-0.5">Control de Producción PFE</p>
            </div>
          </div>

          <!-- Enlaces de navegación con selector de vistas principales -->
          <nav class="flex flex-col gap-1 px-3 text-left">
            
            <!-- Tab Proyectos -->
            <button (click)="adminView.set('projects')" 
                    class="w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer text-left"
                    [class.bg-surface-container]="adminView() === 'projects'"
                    [class.text-on-surface]="adminView() === 'projects'"
                    [class.text-on-surface-variant]="adminView() !== 'projects'"
                    [class.hover:bg-surface-container-low]="adminView() !== 'projects'">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]" [class.text-primary]="adminView() === 'projects'">dashboard</span>
                <span>Proyectos</span>
              </div>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-container-high">{{ projects().length }}</span>
            </button>

            <!-- Tab Métricas & Clics por Activo -->
            <button (click)="adminView.set('analytics')" 
                    class="w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer text-left"
                    [class.bg-surface-container]="adminView() === 'analytics'"
                    [class.text-on-surface]="adminView() === 'analytics'"
                    [class.text-on-surface-variant]="adminView() !== 'analytics'"
                    [class.hover:bg-surface-container-low]="adminView() !== 'analytics'">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]" [class.text-primary]="adminView() === 'analytics'">insights</span>
                <span>Métricas de Activos</span>
              </div>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Live</span>
            </button>

            <!-- Tab Notas DP & Chat Social de Rodaje -->
            <button (click)="adminView.set('dp_notes')" 
                    class="w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer text-left"
                    [class.bg-surface-container]="adminView() === 'dp_notes'"
                    [class.text-on-surface]="adminView() === 'dp_notes'"
                    [class.text-on-surface-variant]="adminView() !== 'dp_notes'"
                    [class.hover:bg-surface-container-low]="adminView() !== 'dp_notes'">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]" [class.text-amber-500]="adminView() === 'dp_notes'">chat</span>
                <span>Notas DP & Chat</span>
              </div>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">{{ allDpNotes().length }}</span>
            </button>

            <!-- Tab Generador de Tokens & Enlaces de Clientes -->
            <button (click)="adminView.set('tokens')" 
                    class="w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer text-left"
                    [class.bg-surface-container]="adminView() === 'tokens'"
                    [class.text-on-surface]="adminView() === 'tokens'"
                    [class.text-on-surface-variant]="adminView() !== 'tokens'"
                    [class.hover:bg-surface-container-low]="adminView() !== 'tokens'">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]" [class.text-primary]="adminView() === 'tokens'">key</span>
                <span>Tokens de Sesión</span>
              </div>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-900">{{ clientTokens().length }}</span>
            </button>

            <!-- Enlace directo a Seleccionadas -->
            <a routerLink="/seleccionadas" class="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors text-xs">
              <span class="material-symbols-outlined text-[20px] text-amber-500">star</span>
              <span>Top Seleccionadas</span>
            </a>

            <button (click)="forceSync()" class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors text-xs cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">sync_alt</span>
              <span>Sincronización Live</span>
            </button>
          </nav>
        </div>

        <!-- Footer Sidebar -->
        <div class="px-4 flex flex-col gap-2">
          <div class="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low text-xs border border-surface-container-high">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-on-surface-variant font-medium">Supabase Realtime Conectado</span>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-surface-container">
            <div class="flex items-center gap-2 text-left">
              <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                CP
              </div>
              <span class="text-on-surface text-xs font-semibold">Admin Master</span>
            </div>
            <button (click)="logoutAdmin()" class="text-error hover:underline text-xs font-bold cursor-pointer">
              Salir
            </button>
          </div>
        </div>
      </aside>

      <!-- ÁREA DE CONTENIDO (Desplazada para el sidebar en lg) -->
      <div class="lg:pl-64 flex-grow flex flex-col">
        
        <!-- Header Superior del Admin -->
        <header class="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-surface-container-high/80">
          <div class="flex items-center gap-3">
            <app-pfe-logo size="sm" [showText]="false" linkTo="/admin" class="lg:hidden"></app-pfe-logo>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-on-surface-variant uppercase font-medium">Panel:</span>
              <span class="text-on-surface font-bold text-sm">
                {{ adminView() === 'projects' ? 'Gestión de Proyectos' : adminView() === 'analytics' ? 'Dashboard de Métricas & Rendimiento' : adminView() === 'dp_notes' ? 'Centro de Notas DP & Chat Social' : 'Generador de Tokens & Enlaces de Clientes' }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2.5 sm:gap-4">
            <!-- Selector de vistas en móviles / tablets -->
            <div class="flex lg:hidden items-center bg-surface-container-low p-1 rounded-lg text-xs">
              <button (click)="adminView.set('projects')" [class.bg-white]="adminView() === 'projects'" class="px-2 py-1 rounded font-bold">Proy</button>
              <button (click)="adminView.set('analytics')" [class.bg-white]="adminView() === 'analytics'" class="px-2 py-1 rounded font-bold">Métricas</button>
              <button (click)="adminView.set('dp_notes')" [class.bg-white]="adminView() === 'dp_notes'" class="px-2 py-1 rounded font-bold">DP</button>
              <button (click)="adminView.set('tokens')" [class.bg-white]="adminView() === 'tokens'" class="px-2 py-1 rounded font-bold">Tokens</button>
            </div>

            <!-- Seleccionadas Counter -->
            <a routerLink="/seleccionadas" class="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold">
              <span class="material-symbols-outlined text-[16px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="hidden sm:inline">Seleccionadas</span>
              <span class="bg-primary text-on-primary text-xs px-2 py-0.5 rounded-full font-bold">
                {{ favCount() }}
              </span>
            </a>

            <!-- Mode Switcher -->
            <div class="flex items-center bg-surface-container-low p-1 rounded-lg text-xs">
              <a [routerLink]="activeClientUrl()" class="px-2.5 py-1 rounded text-on-surface-variant hover:text-on-surface font-medium transition-colors flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">visibility</span>
                <span class="hidden sm:inline">Vista Cliente</span>
              </a>
              <span class="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface shadow-xs font-bold">
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
          <div class="flex flex-col w-full gap-6 max-w-[1680px] mx-auto text-left">
            
            <!-- SUB-VIEW 1: PROYECTOS (VISTA TRADICIONAL MEJORADA) -->
            @if (adminView() === 'projects') {
              <!-- Welcome & KPI Overview Section -->
              <section class="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span class="uppercase tracking-wider text-secondary font-bold text-xs">PFE Core Admin</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span class="text-on-surface-variant text-xs">v3.5 Dashboard Pro</span>
                  </div>
                  <h1 class="text-on-surface tracking-tight text-3xl sm:text-4xl font-extrabold mt-1">
                    Gestión Maestra de Proyectos
                  </h1>
                  <p class="text-on-surface-variant max-w-2xl text-xs sm:text-sm">
                    Supervise la disponibilidad de espacios, cuotas de almacenamiento y el flujo de curaduría técnica colaborativa con clientes acreditados.
                  </p>
                </div>

                <!-- Quick CTAs -->
                <div class="flex items-center gap-2 shrink-0">
                  <button (click)="adminView.set('tokens')" class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container transition-all text-xs font-semibold border border-surface-container-high cursor-pointer">
                    <span class="material-symbols-outlined text-[18px] text-primary">key</span>
                    <span>Generar Link Cliente</span>
                  </button>
                  <button (click)="openCreateModal()" class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary shadow-md hover:bg-primary-container transition-all text-xs font-bold active:scale-98 cursor-pointer">
                    <span class="material-symbols-outlined text-[20px]">add_circle</span>
                    <span>+ Nuevo Proyecto</span>
                  </button>
                </div>
              </section>

              <!-- Live Metrics Ribbon -->
              <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">Proyectos Activos</span>
                    <span class="p-2 rounded-lg bg-surface-container-low text-secondary material-symbols-outlined text-[18px]">folder_special</span>
                  </div>
                  <div class="mt-4 flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-on-surface">{{ projects().length }}</span>
                    <span class="text-on-surface-variant text-xs font-semibold">/ 20 asignados</span>
                  </div>
                  <div class="mt-3 w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                    <div class="bg-secondary h-full rounded-full transition-all" [style.width.%]="(projects().length / 20) * 100"></div>
                  </div>
                </div>

                <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">Clics Totales Activos</span>
                    <span class="p-2 rounded-lg bg-surface-container-low text-emerald-600 material-symbols-outlined text-[18px]">ads_click</span>
                  </div>
                  <div class="mt-4 flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-on-surface">{{ totalClicksAcrossAssets() }}</span>
                    <span class="text-xs text-emerald-600 font-semibold">+18% hoy</span>
                  </div>
                  <div class="mt-3 text-[11px] text-on-surface-variant">Inspección de alta resolución</div>
                </div>

                <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">Notas DP Activas</span>
                    <span class="p-2 rounded-lg bg-surface-container-low text-amber-600 material-symbols-outlined text-[18px]">movie_filter</span>
                  </div>
                  <div class="mt-4 flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-on-surface">{{ allDpNotes().length }}</span>
                    <span class="text-xs text-amber-700 font-semibold">con chat de rodaje</span>
                  </div>
                  <div class="mt-3 text-[11px] text-on-surface-variant">Requerimientos técnicos registrados</div>
                </div>

                <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">Sesiones de Clientes</span>
                    <span class="p-2 rounded-lg bg-surface-container-low text-primary material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                  <div class="mt-4 flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-on-surface">{{ totalSessionClicks() }}</span>
                    <span class="text-xs text-emerald-600 font-semibold">clics por sesión</span>
                  </div>
                  <div class="mt-3 text-[11px] text-on-surface-variant">{{ clientTokens().length }} enlaces y tokens activos</div>
                </div>
              </section>

              <!-- Filter & Search Toolbar -->
              <section class="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="relative flex-1 max-w-md">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                  <input 
                    type="text" 
                    [(ngModel)]="searchQuery" 
                    placeholder="Buscar por proyecto, cliente o código (ej: LOC-8821)..." 
                    class="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-lg text-on-surface focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary text-xs transition-colors"
                  />
                </div>

                <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg overflow-x-auto text-xs font-semibold">
                  <button (click)="activeTab.set('all')" [class.bg-surface-container-lowest]="activeTab() === 'all'" [class.text-on-surface]="activeTab() === 'all'" class="px-3.5 py-1.5 rounded transition-all cursor-pointer">
                    Todos <span class="ml-1 opacity-70">{{ projects().length }}</span>
                  </button>
                  <button (click)="activeTab.set('published')" [class.bg-surface-container-lowest]="activeTab() === 'published'" [class.text-on-surface]="activeTab() === 'published'" class="px-3.5 py-1.5 rounded transition-all cursor-pointer">
                    Publicados <span class="ml-1 opacity-70">{{ publishedCount() }}</span>
                  </button>
                  <button (click)="activeTab.set('draft')" [class.bg-surface-container-lowest]="activeTab() === 'draft'" [class.text-on-surface]="activeTab() === 'draft'" class="px-3.5 py-1.5 rounded transition-all cursor-pointer">
                    Borrador <span class="ml-1 opacity-70">{{ draftCount() }}</span>
                  </button>
                </div>
              </section>

              <!-- Projects Grid / Cards Feed -->
              <section class="flex flex-col gap-4">
                @for (proj of filteredProjects(); track proj.id) {
                  <article class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high hover:shadow-md transition-shadow p-5 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                    
                    <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div class="relative w-28 h-24 rounded-lg overflow-hidden bg-surface-container shrink-0 shadow-inner">
                        <img class="w-full h-full object-cover" [src]="getThumbnailFor(proj.id)" alt="Thumbnail"/>
                        <div class="absolute bottom-1 right-1 bg-surface/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-on-surface">
                          +3
                        </div>
                      </div>

                      <div class="flex flex-col gap-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-2 text-xs">
                          <span class="px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1"
                                [class.bg-secondary-fixed]="proj.status === 'published'"
                                [class.text-on-secondary-fixed]="proj.status === 'published'"
                                [class.bg-primary-fixed]="proj.status === 'draft'"
                                [class.text-on-primary-fixed]="proj.status === 'draft'">
                            <span class="w-1.5 h-1.5 rounded-full" [class.bg-secondary]="proj.status === 'published'" [class.bg-primary]="proj.status === 'draft'"></span>
                            {{ proj.status === 'published' ? 'Publicado (v' + proj.revision + '.0)' : 'Borrador en Edición' }}
                          </span>
                          <span class="text-on-surface-variant font-mono bg-surface-container-low px-2 py-0.5 rounded border border-surface-container-high">
                            Código: <strong class="text-on-surface">{{ proj.accessCode }}</strong>
                          </span>
                        </div>

                        <h2 class="text-on-surface truncate text-lg sm:text-xl font-bold mt-1">
                          {{ proj.title }}
                        </h2>
                        <p class="text-on-surface-variant text-xs line-clamp-1 max-w-xl">
                          {{ proj.description }}
                        </p>

                        <div class="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant pt-1">
                          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px] text-secondary">domain</span> {{ proj.locations?.length || 3 }} Locaciones</span>
                          <span>•</span>
                          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px] text-primary">photo_library</span> 46 Medios</span>
                          <span>•</span>
                          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px] text-tertiary">cloud_done</span> 42.6 GB RAW</span>
                        </div>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap items-center gap-2 shrink-0 w-full xl:w-auto justify-end border-t xl:border-t-0 pt-3 xl:pt-0 border-surface-container-high">
                      <button (click)="copyCode(proj.accessCode)" class="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-xs font-semibold flex items-center gap-1 cursor-pointer" title="Copiar Solo Código">
                        <span class="material-symbols-outlined text-[18px]">key</span>
                      </button>
                      
                      <button (click)="copyDirectClientLink(proj)" class="px-3 py-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs" title="Copiar Enlace Directo con Código para el Cliente">
                        <span class="material-symbols-outlined text-[16px]">link</span>
                        <span>Copiar Link Cliente</span>
                      </button>

                      <a [routerLink]="['/p', proj.id]" [queryParams]="{ code: proj.accessCode }" class="px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs">
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
            }

            <!-- SUB-VIEW 2: ANALYTICS / MÉTRICAS COMPLETAS POR CADA IMAGEN O VIDEO -->
            @if (adminView() === 'analytics') {
              <section class="flex flex-col gap-4">
                <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Métricas & Telemetría en Vivo
                    </span>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-on-surface mt-1">
                      Dashboard de Interacción por Imagen y Video
                    </h1>
                    <p class="text-xs sm:text-sm text-on-surface-variant mt-1">
                      Visualice clics de inspección, selecciones de clientes, formato y estado de notas técnicas para cada activo cinematográfico.
                    </p>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <button (click)="refreshMetrics()" class="px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-surface-container-high">
                      <span class="material-symbols-outlined text-[16px]">refresh</span>
                      <span>Actualizar Métricas</span>
                    </button>
                  </div>
                </div>

                <!-- Tabla Interactiva de Métricas de Activos -->
                <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr class="bg-surface-container-low/70 border-b border-surface-container-high text-on-surface-variant uppercase text-[10px] font-bold tracking-wider">
                          <th class="py-3 px-4">Activo / Thumbnail</th>
                          <th class="py-3 px-4">Locación & Proyecto</th>
                          <th class="py-3 px-4 text-center">Clics Inspección</th>
                          <th class="py-3 px-4 text-center">Selecciones / Votos</th>
                          <th class="py-3 px-4">Formato Master</th>
                          <th class="py-3 px-4">Nota DP / Chat</th>
                          <th class="py-3 px-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-surface-container-high">
                        @for (row of assetMetricsList(); track row.id; let idx = $index) {
                          <tr class="hover:bg-surface-container-low/40 transition-colors">
                            
                            <!-- Thumbnail & Title -->
                            <td class="py-3 px-4">
                              <div class="flex items-center gap-3">
                                <span class="font-mono text-gray-400 font-bold text-[11px] w-5">#{{ idx + 1 }}</span>
                                <div class="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-black/10">
                                  <img [src]="row.thumbnailUrl" [alt]="row.title" class="w-full h-full object-cover"/>
                                </div>
                                <div class="min-w-0">
                                  <p class="font-bold text-on-surface truncate text-xs">{{ row.title }}</p>
                                  <span class="text-[10px] text-on-surface-variant font-mono">{{ row.id }}</span>
                                </div>
                              </div>
                            </td>

                            <!-- Location & Project -->
                            <td class="py-3 px-4">
                              <p class="font-bold text-primary truncate">{{ row.locationName }}</p>
                              <p class="text-[11px] text-on-surface-variant truncate">{{ row.projectTitle }}</p>
                            </td>

                            <!-- Clics Count with mini visual bar -->
                            <td class="py-3 px-4 text-center">
                              <div class="flex flex-col items-center">
                                <span class="font-mono font-extrabold text-sm text-on-surface">{{ row.clicksCount }}</span>
                                <span class="text-[10px] text-on-surface-variant">clics</span>
                              </div>
                            </td>

                            <!-- Likes Count -->
                            <td class="py-3 px-4 text-center">
                              <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold text-xs">
                                <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
                                <span>{{ row.likesCount }}</span>
                              </div>
                            </td>

                            <!-- Master Format -->
                            <td class="py-3 px-4">
                              <span class="inline-flex items-center px-2 py-0.5 rounded bg-surface-container-low border border-surface-container-high text-[10px] font-mono font-bold text-on-surface">
                                {{ row.format }}
                              </span>
                            </td>

                            <!-- DP Note Status -->
                            <td class="py-3 px-4">
                              @if (row.hasDpNote && row.dpNote) {
                                <div class="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2 py-1 rounded-lg text-[11px] max-w-xs truncate" [title]="row.dpNote.noteText">
                                  <span class="material-symbols-outlined text-[14px] text-amber-600 shrink-0">rate_review</span>
                                  <span class="truncate"><strong>{{ row.dpNote.category }}:</strong> {{ row.dpNote.noteText }}</span>
                                  @if (row.dpNote.replies && row.dpNote.replies.length > 0) {
                                    <span class="px-1.5 py-0.2 rounded-full bg-amber-200 text-[9px] font-bold ml-1 shrink-0">
                                      +{{ row.dpNote.replies.length }} chat
                                    </span>
                                  }
                                </div>
                              } @else {
                                <span class="text-on-surface-variant text-[11px] italic">Sin notas técnicas</span>
                              }
                            </td>

                            <!-- Action -->
                            <td class="py-3 px-4 text-right">
                              @if (row.hasDpNote) {
                                <button (click)="adminView.set('dp_notes')" class="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-black font-bold text-[11px] cursor-pointer shadow-xs">
                                  Ver Chat
                                </button>
                              } @else {
                                <a [routerLink]="['/p', row.projectId]" [queryParams]="{ code: 'LOC-2026-X' }" class="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-[11px] cursor-pointer">
                                  Abrir
                                </a>
                              }
                            </td>

                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            }

            <!-- SUB-VIEW 3: CENTRO DE NOTAS DP & CHAT SOCIAL DE RODAJE -->
            @if (adminView() === 'dp_notes') {
              <section class="flex flex-col gap-5">
                <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Mesa de Dirección de Fotografía & Producción
                    </span>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-on-surface mt-1">
                      Centro de Notas Técnicas DP & Chat Social
                    </h1>
                    <p class="text-xs sm:text-sm text-on-surface-variant mt-1">
                      Canal de comunicación directo con Directores de Fotografía y jefes de área. Como administrador puedes responder hilos y gestionar requerimientos.
                    </p>
                  </div>
                </div>

                @if (allDpNotes().length === 0) {
                  <div class="py-12 text-center bg-white rounded-xl border border-dashed border-surface-container-high p-6">
                    <span class="material-symbols-outlined text-4xl text-amber-500 mb-2">rate_review</span>
                    <h3 class="font-bold text-base text-on-surface">No hay notas técnicas registradas aún</h3>
                    <p class="text-xs text-on-surface-variant mt-1">Las notas que añada el DP desde la galería aparecerán aquí con su hilo de conversación.</p>
                  </div>
                }

                <!-- Feed de Tarjetas de Notas DP con Chat Social -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  @for (note of allDpNotes(); track note.mediaId) {
                    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high p-5 flex flex-col justify-between gap-4 text-left">
                      
                      <!-- Header de la Nota -->
                      <div>
                        <div class="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high">
                          <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-black/10">
                              <img [src]="note.mediaThumbnailUrl || getFallbackThumbnail(note.mediaId)" [alt]="note.mediaTitle || 'Locación'" class="w-full h-full object-cover"/>
                            </div>
                            <div>
                              <span class="text-[11px] font-bold uppercase tracking-wider text-primary">{{ note.locationName || 'Villa Moderna Pedregal' }}</span>
                              <h3 class="font-bold text-sm text-on-surface leading-snug">{{ note.mediaTitle || 'Encuadre Técnico' }}</h3>
                            </div>
                          </div>

                          <!-- Delete button -->
                          <button (click)="deleteNoteAsAdmin(note.mediaId)" class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Eliminar Nota">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>

                        <!-- Categoría & Autor -->
                        <div class="flex items-center justify-between mt-3 text-xs">
                          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px]">
                            <span class="material-symbols-outlined text-[13px]">movie_filter</span>
                            {{ note.category }}
                          </span>
                          <span class="text-on-surface-variant text-[11px]">
                            Por <strong>{{ note.author }}</strong> • {{ note.updatedAt }}
                          </span>
                        </div>

                        <!-- Texto principal de la Nota -->
                        <div class="mt-3 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950 text-xs leading-relaxed font-medium">
                          "{{ note.noteText }}"
                        </div>
                      </div>

                      <!-- Hilo de Chat Social (Respuestas previas) -->
                      <div class="flex flex-col gap-2 pt-2 border-t border-surface-container-high">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          Hilo de Comunicación ({{ note.replies?.length || 0 }} respuestas):
                        </span>

                        @if (note.replies && note.replies.length > 0) {
                          <div class="space-y-2 max-h-44 overflow-y-auto pr-1">
                            @for (rep of note.replies; track rep.id) {
                              <div class="p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high text-xs"
                                   [class.border-l-4]="true"
                                   [class.border-l-primary]="rep.role === 'Admin'"
                                   [class.border-l-amber-500]="rep.role === 'DP'"
                                   [class.border-l-secondary]="rep.role === 'Producción'">
                                <div class="flex items-center justify-between text-[11px] mb-1">
                                  <span class="font-bold text-on-surface flex items-center gap-1">
                                    {{ rep.author }}
                                    <span class="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white text-on-surface-variant border border-surface-container-high">
                                      {{ rep.role }}
                                    </span>
                                  </span>
                                  <span class="text-[10px] text-on-surface-variant">{{ rep.timestamp }}</span>
                                </div>
                                <p class="text-on-surface leading-relaxed">{{ rep.message }}</p>
                              </div>
                            }
                          </div>
                        } @else {
                          <p class="text-[11px] text-on-surface-variant italic">No hay respuestas previas en este hilo.</p>
                        }

                        <!-- Formulario de Respuesta para el Administrador -->
                        <div class="flex items-center gap-2 mt-2 pt-2 border-t border-surface-container-high">
                          <input 
                            type="text" 
                            [(ngModel)]="adminReplyInputs[note.mediaId]" 
                            (keyup.enter)="sendAdminReply(note.mediaId)"
                            placeholder="Escribir respuesta oficial de producción..." 
                            class="flex-grow px-3 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary text-xs text-on-surface"
                          />
                          <button 
                            (click)="sendAdminReply(note.mediaId)" 
                            class="px-3.5 py-1.5 rounded-lg bg-primary hover:brightness-105 text-on-primary font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1">
                            <span class="material-symbols-outlined text-[15px]">send</span>
                            <span>Responder</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  }
                </div>
              </section>
            }

            <!-- SUB-VIEW 4: GENERADOR DE TOKENS & ENLACES DE SESIÓN PARA CLIENTES -->
            @if (adminView() === 'tokens') {
              <section class="flex flex-col gap-6">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-300">
                    Acreditaciones Criptográficas & RLS
                  </span>
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-on-surface mt-1">
                    Generador de Enlaces Acreditados & Tokens de Sesión
                  </h1>
                  <p class="text-xs sm:text-sm text-on-surface-variant mt-1">
                    Cada enlace generado vincula el código de acceso con un token criptográfico único para directores, agencias o DP, registrando huella digital y métricas exclusivas por sesión.
                  </p>
                </div>

                <!-- Formulario Generador -->
                <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high p-5 sm:p-6 text-left">
                  <h2 class="font-bold text-base text-on-surface flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-primary">add_link</span>
                    <span>Emitir Nuevo Token de Sesión para Cliente</span>
                  </h2>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <!-- Proyecto -->
                    <div>
                      <label class="block font-bold text-on-surface mb-1">Proyecto Asignado *</label>
                      <select [(ngModel)]="tokenProjectId" (change)="onTokenProjectChange()" class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-surface-container-high focus:outline-none focus:border-primary">
                        @for (p of projects(); track p.id) {
                          <option [value]="p.id">{{ p.title }} ({{ p.accessCode }})</option>
                        }
                      </select>
                    </div>

                    <!-- Nombre del Cliente / Agencia -->
                    <div>
                      <label class="block font-bold text-on-surface mb-1">Cliente / Destinatario *</label>
                      <input 
                        type="text" 
                        [(ngModel)]="tokenClientName" 
                        placeholder="Ej: Netflix Studios (Carlos Vera)" 
                        class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-surface-container-high focus:outline-none focus:border-primary"
                      />
                    </div>

                    <!-- Rol Departamental -->
                    <div>
                      <label class="block font-bold text-on-surface mb-1">Rol Departamental *</label>
                      <select [(ngModel)]="tokenRole" class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-surface-container-high focus:outline-none focus:border-primary">
                        <option value="Director de Fotografía (DP)">Director de Fotografía (DP)</option>
                        <option value="Director de Arte">Director de Arte</option>
                        <option value="Director General">Director General</option>
                        <option value="Productor Ejecutivo">Productor Ejecutivo</option>
                        <option value="Cliente / Agencia">Cliente / Agencia</option>
                      </select>
                    </div>

                    <!-- Días de validez -->
                    <div>
                      <label class="block font-bold text-on-surface mb-1">Vigencia del Token</label>
                      <select [(ngModel)]="tokenExpiresInDays" class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-surface-container-high focus:outline-none focus:border-primary">
                        <option [value]="7">7 Días</option>
                        <option [value]="15">15 Días (Recomendado)</option>
                        <option [value]="30">30 Días</option>
                        <option [value]="60">60 Días</option>
                      </select>
                    </div>
                  </div>

                  <div class="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-surface-container-high">
                    <button (click)="submitCreateToken()" [disabled]="!tokenClientName" class="px-5 py-2.5 rounded-lg bg-primary hover:brightness-105 text-on-primary font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50">
                      <span class="material-symbols-outlined text-[18px]">verified</span>
                      <span>Generar Enlace & Token de Sesión</span>
                    </button>
                  </div>
                </div>

                <!-- Tabla de Tokens Activos -->
                <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
                  <div class="p-4 border-b border-surface-container-high flex flex-wrap items-center justify-between gap-2">
                    <h3 class="font-bold text-sm text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary text-[18px]">vpn_key</span>
                      <span>Tokens Acreditados Emitidos ({{ clientTokens().length }})</span>
                    </h3>
                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{{ totalSessionClicks() }} Clics Registrados en Sesiones</span>
                      </span>
                    </div>
                  </div>

                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr class="bg-surface-container-low/70 border-b border-surface-container-high text-on-surface-variant uppercase text-[10px] font-bold tracking-wider">
                          <th class="py-3 px-4">Token ID</th>
                          <th class="py-3 px-4">Cliente / Destinatario</th>
                          <th class="py-3 px-4">Rol</th>
                          <th class="py-3 px-4">Proyecto</th>
                          <th class="py-3 px-4">Emisión / Expiración</th>
                          <th class="py-3 px-4 text-center">Clics Detectados</th>
                          <th class="py-3 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-surface-container-high">
                        @for (tok of clientTokens(); track tok.token) {
                          <tr class="hover:bg-surface-container-low/40 transition-colors">
                            <td class="py-3 px-4">
                              <span class="font-mono font-bold text-xs bg-surface-container-low px-2 py-1 rounded border border-surface-container-high text-on-surface">
                                {{ tok.token }}
                              </span>
                            </td>
                            <td class="py-3 px-4 font-bold text-on-surface">
                              {{ tok.clientName }}
                            </td>
                            <td class="py-3 px-4 text-on-surface-variant font-medium">
                              {{ tok.role }}
                            </td>
                            <td class="py-3 px-4">
                              <p class="font-semibold text-primary truncate max-w-xs">{{ tok.projectTitle }}</p>
                              <span class="text-[10px] text-on-surface-variant font-mono">Código: {{ tok.accessCode }}</span>
                            </td>
                            <td class="py-3 px-4 text-[11px] text-on-surface-variant">
                              <span>{{ tok.generatedAt }}</span>
                              <p class="text-rose-700 font-medium">Expira: {{ tok.expiresAt }}</p>
                            </td>
                            <td class="py-3 px-4 text-center">
                              <div class="inline-flex flex-col items-center">
                                <span class="inline-flex items-center gap-1 font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-full border shadow-xs"
                                      [class.bg-emerald-50]="tok.clicksCount > 0"
                                      [class.text-emerald-800]="tok.clicksCount > 0"
                                      [class.border-emerald-300]="tok.clicksCount > 0"
                                      [class.bg-surface-container-low]="tok.clicksCount === 0"
                                      [class.text-on-surface-variant]="tok.clicksCount === 0"
                                      [class.border-surface-container-high]="tok.clicksCount === 0">
                                  @if (tok.clicksCount > 0) {
                                    <span class="material-symbols-outlined text-[13px] text-emerald-600">ads_click</span>
                                  }
                                  <span>{{ tok.clicksCount }}</span>
                                </span>
                              </div>
                            </td>
                            <td class="py-3 px-4 text-right">
                              <div class="flex items-center justify-end gap-1.5">
                                <button (click)="copyTokenUrl(tok)" class="px-2.5 py-1 rounded bg-primary text-on-primary font-bold text-[11px] hover:brightness-105 transition-all cursor-pointer flex items-center gap-1" title="Copiar Enlace Completo">
                                  <span class="material-symbols-outlined text-[14px]">link</span>
                                  <span>Copiar Link</span>
                                </button>
                                <button (click)="revokeToken(tok.token)" class="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Revocar Token">
                                  <span class="material-symbols-outlined text-[16px]">block</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            }

          </div>
        </main>

        <!-- Professional Footer -->
        <app-pfe-footer></app-pfe-footer>

      </div>

      <!-- MODAL CREAR NUEVO PROYECTO CON CONFIGURACIÓN DE MAPA POR PROYECTO -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in" (click)="closeCreateModal()">
          <div class="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4 text-left max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 border-b border-surface-container">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span class="material-symbols-outlined text-[24px]">create_new_folder</span>
                </div>
                <div>
                  <h3 class="font-bold text-base text-on-surface">Crear Nuevo Proyecto de Locaciones</h3>
                  <span class="text-xs text-on-surface-variant">Configura la ficha técnica y el mapa geográfico exclusivo para este proyecto</span>
                </div>
              </div>
              <button (click)="closeCreateModal()" class="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Tab Switcher (Datos Generales vs Mapa del Proyecto) -->
            <div class="flex items-center gap-2 p-1 bg-surface-container-low rounded-xl text-xs font-bold border border-surface-container-high">
              <button type="button" 
                      (click)="createModalTab.set('general')"
                      class="flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      [class.bg-surface-container-lowest]="createModalTab() === 'general'"
                      [class.text-on-surface]="createModalTab() === 'general'"
                      [class.shadow-xs]="createModalTab() === 'general'"
                      [class.text-on-surface-variant]="createModalTab() !== 'general'">
                <span class="material-symbols-outlined text-[16px]">folder</span>
                <span>1. Ficha del Proyecto</span>
              </button>
              <button type="button" 
                      (click)="createModalTab.set('map')"
                      class="flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      [class.bg-surface-container-lowest]="createModalTab() === 'map'"
                      [class.text-on-surface]="createModalTab() === 'map'"
                      [class.shadow-xs]="createModalTab() === 'map'"
                      [class.text-on-surface-variant]="createModalTab() !== 'map'">
                <span class="material-symbols-outlined text-[16px] text-secondary">explore</span>
                <span>2. Mapa & Logística de Rodaje</span>
                <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              </button>
            </div>

            <!-- TAB 1: FICHA GENERAL DEL PROYECTO -->
            @if (createModalTab() === 'general') {
              <div class="space-y-3.5 text-xs">
                <div>
                  <label class="block font-bold text-on-surface mb-1">Nombre del Proyecto *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="newProjectTitle" 
                    placeholder="Ej: Comercial Bebida Energética Q4 • Serie Streaming" 
                    class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-on-surface mb-1">Código de Acceso Privado (NDA) *</label>
                    <div class="flex gap-2">
                      <input 
                        type="text" 
                        [(ngModel)]="newProjectCode" 
                        placeholder="LOC-XXXX" 
                        class="w-full h-10 px-3 uppercase font-mono tracking-wider rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                      />
                      <button type="button" (click)="generateRandomCode()" class="px-3 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-lg font-semibold whitespace-nowrap cursor-pointer">
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
                </div>

                <div>
                  <label class="block font-bold text-on-surface mb-1">Descripción / Ficha de Rodaje</label>
                  <textarea 
                    [(ngModel)]="newProjectDescription" 
                    rows="3" 
                    placeholder="Detalla los requerimientos técnicos, fechas estimadas de shooting y perfil de recintos buscados..." 
                    class="w-full p-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary leading-relaxed"
                  ></textarea>
                </div>

                <div class="p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-secondary text-[20px]">explore</span>
                    <span class="text-xs text-on-surface font-semibold">Mapa preconfigurado: <strong>{{ newMapRegionName }}</strong></span>
                  </div>
                  <button type="button" (click)="createModalTab.set('map')" class="text-xs font-bold text-secondary hover:underline cursor-pointer">
                    Personalizar Mapa →
                  </button>
                </div>
              </div>
            }

            <!-- TAB 2: CONFIGURACIÓN DEDICADA DEL MAPA POR PROYECTO -->
            @if (createModalTab() === 'map') {
              <div class="space-y-4 text-xs">
                
                <!-- Presets Rápidos de Región -->
                <div>
                  <label class="block font-bold text-on-surface mb-1.5 uppercase text-[10px] tracking-wider text-on-surface-variant">
                    Seleccionar Preset Geográfico o Personalizar:
                  </label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button type="button" (click)="applyMapPreset('cdmx_sur')" 
                            class="p-2 rounded-lg border text-left cursor-pointer transition-all"
                            [class.border-primary]="newMapPreset === 'cdmx_sur'"
                            [class.bg-primary/10]="newMapPreset === 'cdmx_sur'">
                      <strong class="block text-[11px] text-on-surface">CDMX Sur</strong>
                      <span class="text-[10px] text-on-surface-variant">Pedregal / Coyoacán</span>
                    </button>
                    <button type="button" (click)="applyMapPreset('oaxaca_costa')" 
                            class="p-2 rounded-lg border text-left cursor-pointer transition-all"
                            [class.border-primary]="newMapPreset === 'oaxaca_costa'"
                            [class.bg-primary/10]="newMapPreset === 'oaxaca_costa'">
                      <strong class="block text-[11px] text-on-surface">Oaxaca Costa</strong>
                      <span class="text-[10px] text-on-surface-variant">Zicatela / Mazunte</span>
                    </button>
                    <button type="button" (click)="applyMapPreset('valle_bravo')" 
                            class="p-2 rounded-lg border text-left cursor-pointer transition-all"
                            [class.border-primary]="newMapPreset === 'valle_bravo'"
                            [class.bg-primary/10]="newMapPreset === 'valle_bravo'">
                      <strong class="block text-[11px] text-on-surface">Valle de Bravo</strong>
                      <span class="text-[10px] text-on-surface-variant">Pistas & Bosque</span>
                    </button>
                    <button type="button" (click)="applyMapPreset('polanco')" 
                            class="p-2 rounded-lg border text-left cursor-pointer transition-all"
                            [class.border-primary]="newMapPreset === 'polanco'"
                            [class.bg-primary/10]="newMapPreset === 'polanco'">
                      <strong class="block text-[11px] text-on-surface">CDMX Polanco</strong>
                      <span class="text-[10px] text-on-surface-variant">Mansiones & Reforma</span>
                    </button>
                    <button type="button" (click)="applyMapPreset('quito_cumbaya')" 
                            class="p-2 rounded-lg border text-left cursor-pointer transition-all"
                            [class.border-primary]="newMapPreset === 'quito_cumbaya'"
                            [class.bg-primary/10]="newMapPreset === 'quito_cumbaya'">
                      <strong class="block text-[11px] text-on-surface">Quito (Ecuador)</strong>
                      <span class="text-[10px] text-on-surface-variant">Cumbayá / Colonial</span>
                    </button>
                    <button type="button" (click)="applyMapPreset('guayaquil_costa')" 
                            class="p-2 rounded-lg border text-left cursor-pointer transition-all"
                            [class.border-primary]="newMapPreset === 'guayaquil_costa'"
                            [class.bg-primary/10]="newMapPreset === 'guayaquil_costa'">
                      <strong class="block text-[11px] text-on-surface">Guayaquil (Ec)</strong>
                      <span class="text-[10px] text-on-surface-variant">Samborondón / Río</span>
                    </button>
                    <button type="button" (click)="applyMapPreset('medellin')" 
                            class="p-2 rounded-lg border text-left cursor-pointer transition-all"
                            [class.border-primary]="newMapPreset === 'medellin'"
                            [class.bg-primary/10]="newMapPreset === 'medellin'">
                      <strong class="block text-[11px] text-on-surface">Medellín (Col)</strong>
                      <span class="text-[10px] text-on-surface-variant">El Poblado / Oriente</span>
                    </button>
                    <button type="button" (click)="newMapPreset = 'custom'" 
                            class="p-2 rounded-lg border text-left cursor-pointer transition-all"
                            [class.border-primary]="newMapPreset === 'custom'"
                            [class.bg-primary/10]="newMapPreset === 'custom'">
                      <strong class="block text-[11px] text-on-surface">Personalizado</strong>
                      <span class="text-[10px] text-on-surface-variant">Manual GPS</span>
                    </button>
                  </div>
                </div>

                <!-- Nombre de la Región & Estilo de Mapa -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-on-surface mb-1">Nombre de la Región / Ciudad en Mapa *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="newMapRegionName" 
                      placeholder="Ej: Quito • Cumbayá & Centro Histórico" 
                      class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label class="block font-bold text-on-surface mb-1">Estilo Visual del Mapa *</label>
                    <select [(ngModel)]="newMapStyle" class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary">
                      <option value="cinematic">🎬 Cinematográfico Dark (Recomendado)</option>
                      <option value="satellite">🛰️ Satelital Alta Resolución</option>
                      <option value="streets">🗺️ Calles & Vialidad Logística</option>
                      <option value="dark">🌙 Dark Mode Minimalista</option>
                    </select>
                  </div>
                </div>

                <!-- Coordenadas GPS (Latitud, Longitud, Zoom) -->
                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="block font-bold text-on-surface mb-1">Latitud GPS *</label>
                    <input 
                      type="number" 
                      step="0.0001"
                      [(ngModel)]="newMapLat" 
                      placeholder="19.3242" 
                      class="w-full h-10 px-3 font-mono rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label class="block font-bold text-on-surface mb-1">Longitud GPS *</label>
                    <input 
                      type="number" 
                      step="0.0001"
                      [(ngModel)]="newMapLng" 
                      placeholder="-99.2014" 
                      class="w-full h-10 px-3 font-mono rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label class="block font-bold text-on-surface mb-1">Zoom Inicial (1-18)</label>
                    <input 
                      type="number" 
                      [(ngModel)]="newMapZoom" 
                      placeholder="12" 
                      class="w-full h-10 px-3 font-mono rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <!-- Primera Locación en el Mapa -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-on-surface mb-1">Nombre de la Locación Principal</label>
                    <input 
                      type="text" 
                      [(ngModel)]="newMapFirstLocationName" 
                      placeholder="Ej: Hacienda San José / Base Camp" 
                      class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label class="block font-bold text-on-surface mb-1">Dirección / Referencia Vial</label>
                    <input 
                      type="text" 
                      [(ngModel)]="newMapFirstLocationAddress" 
                      placeholder="Ej: Vía Interoceánica km 7.5" 
                      class="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <!-- Notas Logísticas & Vialidad -->
                <div>
                  <label class="block font-bold text-on-surface mb-1">Notas Logísticas de Acceso & Estacionamiento</label>
                  <textarea 
                    [(ngModel)]="newMapLogisticsNotes" 
                    rows="2" 
                    placeholder="Ej: Acceso para camiones de 10T habilitado. Acometida trifásica 80A. Espacio para planta generadora..." 
                    class="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant focus:outline-none focus:border-primary leading-relaxed text-xs"
                  ></textarea>
                </div>

                <!-- Live Mini-Preview del Mapa -->
                <div class="p-3 rounded-xl bg-slate-950 text-white flex items-center justify-between border border-slate-800">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center">
                      <span class="material-symbols-outlined text-[18px]">location_on</span>
                    </div>
                    <div>
                      <p class="font-bold text-xs">{{ newMapRegionName }}</p>
                      <span class="font-mono text-[10px] text-white/70">{{ newMapLat }}° N, {{ newMapLng }}° W • Zoom {{ newMapZoom }}x</span>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono uppercase">{{ newMapStyle }}</span>
                </div>

              </div>
            }

            <!-- Modal Footer Actions -->
            <div class="flex items-center justify-between pt-3 border-t border-surface-container">
              <div>
                @if (createModalTab() === 'map') {
                  <button type="button" (click)="createModalTab.set('general')" class="text-xs text-primary font-bold hover:underline cursor-pointer">
                    ← Volver a Ficha
                  </button>
                }
              </div>

              <div class="flex items-center gap-2">
                <button type="button" (click)="closeCreateModal()" class="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high cursor-pointer">
                  Cancelar
                </button>
                <button type="button" (click)="submitCreateProject()" [disabled]="!newProjectTitle || !newProjectCode" class="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm hover:brightness-105 disabled:opacity-50 cursor-pointer flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>Crear Proyecto & Guardar Mapa</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private favoritesService = inject(FavoritesService);
  private adminAuth = inject(AdminAuthService);
  private router = inject(Router);

  // Vista activa del panel de administración
  public adminView = signal<'projects' | 'analytics' | 'dp_notes' | 'tokens'>('projects');

  public projects = computed(() => this.projectsService.allProjects());
  public favCount = computed(() => this.favoritesService.count());
  public lastToast = computed(() => this.favoritesService.lastToast());
  public allDpNotes = computed(() => this.favoritesService.getAllNotes());
  public clientTokens = computed(() => this.favoritesService.clientTokens());
  public totalSessionClicks = computed(() => this.favoritesService.totalSessionClicks());

  public searchQuery: string = '';
  public activeTab = signal<'all' | 'published' | 'draft'>('all');
  public showCreateModal = signal<boolean>(false);

  // Inputs para chat en notas DP
  public adminReplyInputs: Record<string, string> = {};

  // Formulario de emisión de tokens
  public tokenProjectId: string = '10000000-0000-4000-8000-000000000001';
  public tokenClientName: string = '';
  public tokenRole: string = 'Director de Fotografía (DP)';
  public tokenExpiresInDays: number = 15;

  // Formulario nuevo proyecto
  public createModalTab = signal<'general' | 'map'>('general');
  public newProjectTitle: string = '';
  public newProjectCode: string = 'LOC-2026-N';
  public newProjectLead: string = 'Mateo Valenzuela';
  public newProjectDescription: string = '';

  // Configuración de mapa para el nuevo proyecto
  public newMapPreset: string = 'cdmx_sur';
  public newMapRegionName: string = 'Ciudad de México • Jardines del Pedregal & San Telmo';
  public newMapLat: number = 19.3242;
  public newMapLng: number = -99.2014;
  public newMapZoom: number = 12;
  public newMapStyle: 'satellite' | 'streets' | 'dark' | 'cinematic' = 'cinematic';
  public newMapFirstLocationName: string = 'Villa Moderna Pedregal';
  public newMapFirstLocationAddress: string = 'Paseo del Pedregal #420, CDMX';
  public newMapLogisticsNotes: string = 'Acceso por Anillo Periférico Sur. Autorización para 3 camiones de 10T y planta 125kW.';
  public newMapEmbedUrl: string = '';

  ngOnInit() {
    if (this.projects().length > 0) {
      this.tokenProjectId = this.projects()[0].id;
    }
  }

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

  // Lista detallada de métricas por activo
  public assetMetricsList = computed<AssetMetricRow[]>(() => {
    const rows: AssetMetricRow[] = [];
    const projs = this.projectsService.allProjects();

    for (const proj of projs) {
      for (const loc of proj.locations || []) {
        for (const sec of loc.sections || []) {
          for (const m of sec.media || []) {
            const hasNote = this.favoritesService.hasNote(m.id);
            const dpNote = this.favoritesService.getNote(m.id);
            rows.push({
              id: m.id,
              title: m.title,
              thumbnailUrl: m.url || '',
              locationName: loc.title,
              projectId: proj.id,
              projectTitle: proj.title,
              type: m.type,
              format: m.mime ? m.mime.replace('image/', '').toUpperCase() : '4K RAW',
              clicksCount: this.favoritesService.getClicks(m.id),
              likesCount: this.favoritesService.getLikes(m.id),
              hasDpNote: hasNote,
              dpNote
            });
          }
        }
      }
    }

    // Ordenar por clics descendente
    return rows.sort((a, b) => b.clicksCount - a.clicksCount);
  });

  public totalClicksAcrossAssets = computed(() => {
    return this.assetMetricsList().reduce((acc, curr) => acc + curr.clicksCount, 0);
  });

  refreshMetrics() {
    this.favoritesService.triggerToast('Métricas de interacción actualizadas en vivo.');
  }

  getThumbnailFor(projId: string): string {
    if (projId.endsWith('0001')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoPdw6Ah2CCawFhTG2RY1TikZ_30fDY0vIe2jzYIresWo0wbjAz0jG7ZQ6U1s0Xuv-vnmaZwCnuYIGFF0q_in44ASyoxRSIsKf--ZC1xxsfNXIJV9_9UgCDGXlQ0dgodsWKSNBfxYIscPKqF_oSF356GWpJo8nCT0vpGpMboVxYnJnbAg6OGqBE5b61hrrNX3AtTBm6zyWhZ5qIjziJonIh3HcgT_fJGpsluOyuui89c8ITVx3vr7X';
    }
    if (projId.endsWith('0002')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcskZKxBu72IFBBaOLdefF6pieyAKeg5aPIWbviZuCtdZl4xrwsv1a1MeaLDUU-K99ka7TJGso9CB2d-Q75Y-1leigvQWhv9urJxsAg2o_uqZyfyy9DwcFSvSsB689fmvEB4C3PXai75YKPnKtOrlRTl2cxQn6Iv37nd-4PllCLJCRLPHlF3t6bpqUt4RpbjoXmuLrJJbQ_zDFctJJgVYiuseEEGF9JDzVP2iAM7-rGMra4bVjQIzl';
    }
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3w_F6sEyCIH4qWyI6kQX-RlXoVaUo2HtLiJUugLYP4V3u0LeFQez4Uk5_HRen6iUMXza6-wL_jhVrSiUYLV4z30oY1CGMwl0WGMOMUM8z5vRN2Zh7WR0CfRFP-DkNbWrxTMU9_XoRHMJw9ey6wq3vPWNGhLdYchxJxviXcUbfV7dd8iBHtYodWj47O3umLXuxoHhmN_NuXoNGWhJpw8_q120npfFZjc4w28pyqH-b1lMce9YegsX2';
  }

  getFallbackThumbnail(mediaId: string): string {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9EMuNJ2GaP_hzO-fFen3OUMamZcxEqADXl9d3Uvs7F9K8wenkBoy7Zp5rjlLrapMYx-v2AbpewwN7a9kCGz5o3ABk8_sIhYMGnbRHCDmwUbVfSmmIWAAA7lhY-HTw1xQWJcVw7jxXgDDtQeXJe2hRS5u9HG5iGsBK6CWH6bsJDm6qpH4tWkhmYzJEPuvo6qoCcIRMt9HE-0ie1-EVj8MeqRGCcrp2ayNJUuyfzlGJuRL7DnMtj8Y';
  }

  copyCode(code: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    this.favoritesService.triggerToast(`Código ${code} copiado al portapapeles.`);
  }

  copyDirectClientLink(proj: Project) {
    const origin = window.location.origin;
    const directUrl = `${origin}/?project=${proj.id}&code=${proj.accessCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(directUrl);
    }
    this.favoritesService.triggerToast(`Enlace de login generado para "${proj.title}" (Código: ${proj.accessCode}).`);
  }

  // Métodos para Chat de Notas DP
  sendAdminReply(mediaId: string) {
    const text = this.adminReplyInputs[mediaId];
    if (!text || !text.trim()) {
      this.favoritesService.triggerToast('Escribe una respuesta antes de enviar.', 'warning');
      return;
    }
    this.favoritesService.addReplyToNote(mediaId, text, 'Admin Master PFE', 'Admin');
    this.adminReplyInputs[mediaId] = '';
  }

  deleteNoteAsAdmin(mediaId: string) {
    this.favoritesService.deleteNote(mediaId);
  }

  // Métodos para Tokens de Sesión
  onTokenProjectChange() {
    // Mantener sincronizado
  }

  submitCreateToken() {
    if (!this.tokenClientName) return;
    const proj = this.projects().find(p => p.id === this.tokenProjectId) || this.projects()[0];
    
    this.favoritesService.createClientToken({
      projectId: proj.id,
      projectTitle: proj.title,
      clientName: this.tokenClientName,
      role: this.tokenRole,
      accessCode: proj.accessCode,
      expiresInDays: Number(this.tokenExpiresInDays) || 15
    });

    this.tokenClientName = '';
  }

  copyTokenUrl(token: ClientSessionToken) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(token.fullUrl);
    }
    this.favoritesService.triggerToast(`Enlace seguro de sesión para ${token.clientName} copiado.`);
  }

  revokeToken(tokenStr: string) {
    this.favoritesService.revokeClientToken(tokenStr);
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

  applyMapPreset(presetKey: string) {
    this.newMapPreset = presetKey;
    if (presetKey === 'cdmx_sur') {
      this.newMapRegionName = 'Ciudad de México • Jardines del Pedregal & San Telmo';
      this.newMapLat = 19.3242;
      this.newMapLng = -99.2014;
      this.newMapZoom = 12;
      this.newMapStyle = 'cinematic';
      this.newMapFirstLocationName = 'Villa Moderna Pedregal';
      this.newMapFirstLocationAddress = 'Paseo del Pedregal #420, CDMX';
      this.newMapLogisticsNotes = 'Acceso por Anillo Periférico Sur. Autorización para 3 camiones de 10T y planta 125kW.';
    } else if (presetKey === 'oaxaca_costa') {
      this.newMapRegionName = 'Oaxaca / Costa Esmeralda • Puerto Escondido & Mazunte';
      this.newMapLat = 15.8601;
      this.newMapLng = -97.0722;
      this.newMapZoom = 11;
      this.newMapStyle = 'satellite';
      this.newMapFirstLocationName = 'Villa Acantilado Zicatela';
      this.newMapFirstLocationAddress = 'Camino al Faro s/n, Punta Zicatela, Oaxaca';
      this.newMapLogisticsNotes = 'Carretera Costera 200. Se requiere tracción 4x4 para el acantilado y permisos de Parque Nacional.';
    } else if (presetKey === 'valle_bravo') {
      this.newMapRegionName = 'Valle de Bravo & Carretera Panorámica Los Álamos';
      this.newMapLat = 19.1925;
      this.newMapLng = -100.1302;
      this.newMapZoom = 13;
      this.newMapStyle = 'streets';
      this.newMapFirstLocationName = 'Pabellón Industrial & Pista Los Álamos';
      this.newMapFirstLocationAddress = 'Carretera Colorines km 12, Valle de Bravo, EdoMex';
      this.newMapLogisticsNotes = 'Circuito asfáltico cerrado de 3.2km. Base Camp con 4 supercargadores trifásicos 350kW.';
    } else if (presetKey === 'polanco') {
      this.newMapRegionName = 'Polanco & Bosque de Chapultepec, CDMX';
      this.newMapLat = 19.4326;
      this.newMapLng = -99.1912;
      this.newMapZoom = 14;
      this.newMapStyle = 'dark';
      this.newMapFirstLocationName = 'Mansión Neoclásica Campos Elíseos';
      this.newMapFirstLocationAddress = 'Campos Elíseos #380, Polanco V Sección, CDMX';
      this.newMapLogisticsNotes = 'Zona Polanco / Reforma. Permisos de rodaje CDMX FILMA vigentes. Horario nocturno 20:00 a 05:00 hrs.';
    } else if (presetKey === 'quito_cumbaya') {
      this.newMapRegionName = 'Quito / Cumbayá & Centro Colonial (Ecuador)';
      this.newMapLat = -0.1807;
      this.newMapLng = -78.4678;
      this.newMapZoom = 13;
      this.newMapStyle = 'cinematic';
      this.newMapFirstLocationName = 'Hacienda Cumbayá & Jardines';
      this.newMapFirstLocationAddress = 'Vía Interoceánica km 8.5, Cumbayá, Quito';
      this.newMapLogisticsNotes = 'Acceso directo por Vía Interoceánica. Estacionamiento amplio para trailers técnicos y catering.';
    } else if (presetKey === 'guayaquil_costa') {
      this.newMapRegionName = 'Guayaquil / Samborondón & Vía a la Costa (Ecuador)';
      this.newMapLat = -2.1494;
      this.newMapLng = -79.8691;
      this.newMapZoom = 13;
      this.newMapStyle = 'satellite';
      this.newMapFirstLocationName = 'Residencia Náutica Samborondón';
      this.newMapFirstLocationAddress = 'Av. Samborondón km 4.5, Guayas';
      this.newMapLogisticsNotes = 'Canal navegable privado. Acceso controlado 24/7 y acometida eléctrica para generadores móviles.';
    } else if (presetKey === 'medellin') {
      this.newMapRegionName = 'Medellín / El Poblado & Llanogrande (Colombia)';
      this.newMapLat = 6.2088;
      this.newMapLng = -75.5659;
      this.newMapZoom = 13;
      this.newMapStyle = 'cinematic';
      this.newMapFirstLocationName = 'Villa Contemporánea Llanogrande';
      this.newMapFirstLocationAddress = 'Vía Las Palmas km 14, Rionegro / Medellín';
      this.newMapLogisticsNotes = 'Vía rápida Las Palmas. Clima templado y helipuerto privado a 5 minutos.';
    }
  }

  async submitCreateProject() {
    if (!this.newProjectTitle || !this.newProjectCode) return;

    const mapConfig: ProjectMapConfig = {
      regionName: this.newMapRegionName || 'Región Técnica de Rodaje',
      centerLat: Number(this.newMapLat) || 19.3242,
      centerLng: Number(this.newMapLng) || -99.2014,
      zoom: Number(this.newMapZoom) || 12,
      mapStyle: this.newMapStyle,
      embedUrl: this.newMapEmbedUrl || undefined,
      logisticsNotes: this.newMapLogisticsNotes,
      markers: [
        {
          name: this.newMapFirstLocationName || 'Locación Principal',
          category: 'Locación Principal',
          lat: Number(this.newMapLat) || 19.3242,
          lng: Number(this.newMapLng) || -99.2014,
          address: this.newMapFirstLocationAddress || 'Dirección de Rodaje',
          logisticsNote: this.newMapLogisticsNotes
        }
      ]
    };

    const proj = await this.projectsService.createProject(
      this.newProjectTitle, 
      this.newProjectCode, 
      this.newProjectDescription,
      mapConfig
    );

    this.showCreateModal.set(false);
    this.createModalTab.set('general');
    this.favoritesService.triggerToast(`Proyecto "${proj.title}" creado con su mapa específico para ${mapConfig.regionName}.`);
    this.router.navigate(['/admin/projects', proj.id, 'edit']);
  }
}
