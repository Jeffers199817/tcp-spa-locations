import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PfeLogoComponent } from '../pfe-logo/pfe-logo.component';

@Component({
  selector: 'app-pfe-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, PfeLogoComponent],
  template: `
    <footer class="w-full bg-surface-container-lowest border-t border-surface-container-high shadow-[0_-1px_12px_rgba(0,0,0,0.03)] mt-auto">
      <!-- Main Footer Columns -->
      <div class="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 text-left">
          
          <!-- Column 1: Brand & Certification (5 cols) -->
          <div class="lg:col-span-5 flex flex-col gap-4">
            <app-pfe-logo size="lg"></app-pfe-logo>

            <p class="font-body-sm text-body-sm text-on-surface-variant max-w-md leading-relaxed text-xs">
              Plataforma privada de curaduría de recintos cinematográficos, publicidad de alta gama y scouting técnico para directores de arte, fotógrafos y productores ejecutivos. Acceso restringido con cifrado integral y protección estricta por acuerdos de confidencialidad (NDA).
            </p>

            <div class="flex flex-wrap items-center gap-2 pt-1">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-tertiary text-xs font-semibold">
                <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                Supabase Realtime Sync
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-xs font-medium">
                <span class="material-symbols-outlined text-[14px] text-secondary">shield</span>
                Seguridad RLS PostgreSQL
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-xs font-medium">
                <span class="material-symbols-outlined text-[14px] text-primary">verified</span>
                Permisos Oficiales CDMX
              </span>
            </div>
          </div>

          <!-- Column 2: Navigation & Quick Links (3 cols) -->
          <div class="lg:col-span-3 flex flex-col gap-3">
            <h4 class="font-label-lg text-label-lg text-on-surface font-bold tracking-wide uppercase text-xs">
              Navegación & Producción
            </h4>
            <ul class="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant text-xs">
              <li>
                <a routerLink="/p/10000000-0000-4000-8000-000000000001" class="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">grid_view</span>
                  Catálogo Maestro de Locaciones
                </a>
              </li>
              <li>
                <a routerLink="/seleccionadas" class="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">bookmark</span>
                  Selección Compartida del Equipo
                </a>
              </li>
              <li>
                <a routerLink="/admin/login" class="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  Acceso de Administrador PFE Core
                </a>
              </li>
              <li>
                <a routerLink="/" class="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">lock</span>
                  Acceso Seguro con Código (NDA)
                </a>
              </li>
            </ul>
          </div>

          <!-- Column 3: Professional Contact & Set Support (4 cols) -->
          <div class="lg:col-span-4 flex flex-col gap-3">
            <h4 class="font-label-lg text-label-lg text-on-surface font-bold tracking-wide uppercase text-xs">
              Contacto de Producción & Soporte en Set
            </h4>
            <div class="flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant text-xs">
              <div class="flex items-start gap-2.5">
                <span class="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">mail</span>
                <div>
                  <span class="block font-semibold text-on-surface">Mesa de Coordinación de Locaciones:</span>
                  <a href="mailto:produccion@pfe-locations.com" class="text-secondary hover:underline">
                    produccion&#64;pfe-locations.com
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <span class="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">phone_in_talk</span>
                <div>
                  <span class="block font-semibold text-on-surface">Guardia Telefónica de Rodaje (24/7):</span>
                  <a href="tel:+525584325627" class="hover:text-on-surface transition-colors font-spec-numeral font-bold">
                    +52 (55) 8432-LOCS (5627)
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <span class="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">location_on</span>
                <div>
                  <span class="block font-semibold text-on-surface">Base de Operaciones & Scouting:</span>
                  <span>Pedregal & Roma Norte, Ciudad de México, CP 01900</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Bottom Line Sub-Footer -->
        <div class="mt-10 pt-6 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant text-xs">
          <div class="flex items-center gap-3">
            <span>© 2026 PFE Locaciones S.A. de C.V. Todos los derechos reservados.</span>
            <span class="hidden md:inline">•</span>
            <span class="hidden md:inline">Revisión v2.1 Inmutable</span>
          </div>

          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1.5 text-tertiary font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              Servidor Seguro • Nodo PFE-01 (24ms)
            </span>
            <span class="text-on-surface-variant/80">
              Protegido por Ley de Propiedad Intelectual
            </span>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class PfeFooterComponent {}
