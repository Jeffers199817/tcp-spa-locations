import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-client-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-center min-h-screen p-4 bg-surface">
      <main class="w-full max-w-md p-6 bg-surface-container-lowest rounded-xl shadow-lg relative overflow-hidden">
        <div class="absolute -top-16 -left-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -right-16 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

        <!-- VISTA DE INGRESO -->
        <div *ngIf="!unlocked" class="relative z-10 flex flex-col items-center justify-center py-2 w-full">
          <div class="flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full mb-4 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Servidor Seguro • Nodo PFE-01</span>
          </div>

          <div class="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 shadow-sm text-primary">
            <span class="material-symbols-outlined text-4xl">location_city</span>
          </div>

          <div class="text-center mb-6 w-full">
            <h1 class="text-2xl font-bold text-on-surface mb-1">
              Acceso Privado a Locaciones
            </h1>
            <p class="text-xs text-on-surface-variant">
              Proyecto: <span class="font-semibold text-on-surface">Campaña Global Verano 2026</span> • PFE Scouting
            </p>
          </div>

          <div class="w-full bg-surface-container-low rounded-xl p-4 shadow-sm relative mb-4">
            <div class="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-lg mb-4">
              <span class="material-symbols-outlined text-secondary text-lg shrink-0">verified_user</span>
              <div class="flex flex-col text-left">
                <span class="text-xs font-bold text-on-surface">Contrato de Confidencialidad Activo</span>
                <span class="text-[11px] text-on-surface-variant">Deck con locaciones inéditas protegidas por NDA. Acceso auditado.</span>
              </div>
            </div>

            <form (ngSubmit)="handleAuth()" class="space-y-4">
              <div>
                <div class="flex justify-between items-center mb-1.5">
                  <label class="text-xs font-semibold text-on-surface" for="passcode">Código de Acreditación</label>
                  <button type="button" (click)="fillDemoCode()" class="text-xs text-secondary hover:text-primary transition-colors font-medium">
                    Autocompletar Demo (LOC-2026-X)
                  </button>
                </div>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">key</span>
                  <input
                    id="passcode"
                    type="text"
                    [(ngModel)]="passcode"
                    name="passcode"
                    maxlength="12"
                    (input)="formatInput()"
                    placeholder="LOC-2026-X"
                    class="w-full h-11 pl-10 pr-4 font-mono text-base tracking-widest uppercase bg-surface-container-lowest text-on-surface rounded-lg border border-outline/20 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <!-- Mensaje de error -->
              <div *ngIf="errorMessage" class="p-2.5 bg-error/10 text-error rounded-lg flex items-center gap-2 text-xs">
                <span class="material-symbols-outlined text-sm">warning</span>
                <span>{{ errorMessage }}</span>
              </div>

              <!-- Spinner de validación -->
              <div *ngIf="loading" class="flex items-center gap-2 p-2 bg-surface-container rounded-lg text-xs">
                <div class="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0"></div>
                <span class="text-on-surface">Validando credenciales en Supabase...</span>
              </div>

              <button
                type="submit"
                [disabled]="loading"
                class="w-full h-11 bg-primary text-on-primary font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-lg">lock_open</span>
                <span>Ingresar al Scouting</span>
              </button>
            </form>

            <div class="mt-4 pt-3 border-t border-outline/10 grid grid-cols-1 gap-1.5 text-left text-xs text-on-surface-variant">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-secondary text-sm">shield</span>
                <span>Aislamiento estricto por RLS</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-secondary text-sm">group</span>
                <span>Favoritos compartidos en tiempo real</span>
              </div>
            </div>
          </div>

          <!-- Acceso Administrador Directo -->
          <div class="text-center mt-2">
            <button (click)="goToAdmin()" class="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">admin_panel_settings</span>
              <span>Acceso Administrador (Dashboard)</span>
            </button>
          </div>
        </div>

        <!-- VISTA DE ACCESO CONFIRMADO -->
        <div *ngIf="unlocked" class="flex flex-col w-full py-2 space-y-4">
          <div class="p-3 bg-secondary/10 text-secondary rounded-xl flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                <span class="material-symbols-outlined text-lg">done_all</span>
              </div>
              <div class="flex flex-col text-left">
                <span class="text-sm font-bold text-on-surface">Acceso Confirmado</span>
                <span class="text-xs text-on-surface-variant">Sesión activa • Verano 2026</span>
              </div>
            </div>
            <button (click)="lockAgain()" class="text-xs bg-surface-container-lowest text-on-surface px-2.5 py-1 rounded-lg border border-outline/20 hover:bg-surface-container">
              Salir
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2 text-left">
            <div class="p-3 bg-surface-container-low rounded-lg flex flex-col">
              <span class="text-xs text-on-surface-variant">Locaciones</span>
              <span class="text-lg font-bold text-on-surface">2 Recintos</span>
            </div>
            <div class="p-3 bg-surface-container-low rounded-lg flex flex-col">
              <span class="text-xs text-on-surface-variant">Fotografías</span>
              <span class="text-lg font-bold text-on-surface">6 Activos</span>
            </div>
          </div>

          <div class="h-44 rounded-xl bg-surface-container relative overflow-hidden flex items-end p-3 shadow-sm bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80')">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div class="relative z-10 text-white text-left">
              <span class="text-[10px] uppercase font-bold tracking-wider opacity-80 block">Locación Primaria</span>
              <span class="text-base font-bold block">Villa Moderna Pedregal</span>
              <span class="text-xs opacity-80">Brutalismo contemporáneo • Concreto & Cristal</span>
            </div>
          </div>

          <button
            (click)="goToProject()"
            class="w-full h-11 bg-primary text-on-primary font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Explorar Scouting Completo</span>
            <span class="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </main>
    </div>
  `
})
export class ClientAccessComponent {
  passcode: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  unlocked: boolean = false;

  constructor(private projectsService: ProjectsService, private router: Router) {}

  formatInput() {
    let val = this.passcode.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (val.length === 3 && !val.includes('-')) {
      val = val + '-';
    }
    this.passcode = val;
  }

  fillDemoCode() {
    this.passcode = 'LOC-2026-X';
    this.errorMessage = '';
  }

  async handleAuth() {
    if (!this.passcode || this.passcode.length < 5) {
      this.errorMessage = 'Ingresa un código válido (ej. LOC-2026-X).';
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    const project = await this.projectsService.verifyCodeAndLoad(this.passcode);
    this.loading = false;

    if (project) {
      this.unlocked = true;
    } else {
      this.errorMessage = 'Código no encontrado o revocado. Intenta con LOC-2026-X';
    }
  }

  lockAgain() {
    this.unlocked = false;
    this.passcode = '';
  }

  goToProject() {
    const proj = this.projectsService.currentProject();
    if (proj) {
      this.router.navigate(['/p', proj.id]);
    }
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }
}
