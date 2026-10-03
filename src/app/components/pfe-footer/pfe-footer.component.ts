import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PfeLogoComponent } from '../pfe-logo/pfe-logo.component';

@Component({
  selector: 'app-pfe-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, PfeLogoComponent],
  template: `
    <footer class="w-full bg-surface-container-lowest border-t border-surface-container-high/80 shadow-[0_-1px_10px_rgba(0,0,0,0.02)] mt-auto text-left">
      <!-- Main Footer Columns -->
      <div class="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <!-- Column 1: Brand & Confidentiality (5 cols) -->
          <div class="lg:col-span-5 flex flex-col gap-3.5">
            <app-pfe-logo size="md"></app-pfe-logo>

            <p class="font-body-sm text-body-sm text-on-surface-variant max-w-md leading-relaxed text-xs">
              Servicio especializado de localización técnica, gestión de permisos oficiales y curaduría de recintos cinematográficos para directores de arte, cinefotógrafos y casas productoras internacionales.
            </p>

            <div class="p-3 rounded-lg bg-surface-container-low border border-surface-container-high max-w-md text-[11px] text-on-surface-variant leading-relaxed">
              <span class="font-bold text-on-surface block mb-0.5">Aviso de Confidencialidad (NDA):</span>
              Los recintos, especificaciones técnicas y material audiovisual contenidos en este portal están protegidos por acuerdos de reserva industrial. Queda prohibida su reproducción o distribución sin autorización previa por escrito.
            </div>
          </div>

          <!-- Column 2: Navegación de Proyecto (3 cols) -->
          <div class="lg:col-span-3 flex flex-col gap-3">
            <h4 class="font-label-lg text-label-lg text-on-surface font-bold tracking-wider uppercase text-xs">
              Locaciones & Proyecto
            </h4>
            <ul class="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant text-xs">
              <li>
                <a routerLink="/" class="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px] text-primary">key</span>
                  <span>Portal de Ingreso con Código</span>
                </a>
              </li>
              <li>
                <a routerLink="/seleccionadas" class="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px] text-primary">bookmark</span>
                  <span>Selección Compartida de Rodaje</span>
                </a>
              </li>
              <li>
                <span class="text-on-surface-variant/90 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
                  <span>Permisos Oficiales de Filmación</span>
                </span>
              </li>
              <li>
                <a routerLink="/admin/login" class="hover:text-primary transition-colors flex items-center gap-1.5 text-on-surface-variant/70">
                  <span class="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                  <span>Portal de Producción (Admin)</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Column 3: Contacto Formal de Producción (4 cols) -->
          <div class="lg:col-span-4 flex flex-col gap-3">
            <h4 class="font-label-lg text-label-lg text-on-surface font-bold tracking-wider uppercase text-xs">
              Coordinación & Mesa de Rodaje
            </h4>
            <div class="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant text-xs">
              <div class="flex items-start gap-2">
                <span class="material-symbols-outlined text-primary text-[17px] mt-0.5 shrink-0">mail</span>
                <div>
                  <span class="block font-semibold text-on-surface">Dirección de Producción:</span>
                  <a href="mailto:produccion@pfe-locations.com" class="text-secondary hover:underline">
                    produccion&#64;pfe-locations.com
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-2">
                <span class="material-symbols-outlined text-primary text-[17px] mt-0.5 shrink-0">call</span>
                <div>
                  <span class="block font-semibold text-on-surface">Atención a Rodajes en Curso:</span>
                  <a href="tel:+525584325627" class="hover:text-on-surface transition-colors font-mono font-semibold">
                    +52 (55) 8432-5627
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-2">
                <span class="material-symbols-outlined text-primary text-[17px] mt-0.5 shrink-0">location_city</span>
                <div>
                  <span class="block font-semibold text-on-surface">Oficinas Principales:</span>
                  <span>Ciudad de México • Guadalajara • Madrid</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Bottom Line Sub-Footer -->
        <div class="mt-8 pt-5 border-t border-surface-container-high/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div>
            <span>© 2026 PFE Locaciones Audiovisuales S.A. de C.V. Todos los derechos reservados.</span>
          </div>

          <div class="flex items-center gap-4 text-[11px]">
            <span class="text-on-surface-variant">Protocolo de Confidencialidad y Tratamiento de Datos</span>
            <span class="hidden md:inline text-surface-container-highest">•</span>
            <span class="text-on-surface-variant">Plataforma Técnica de Producción</span>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class PfeFooterComponent {}
