import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pfe-logo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a [routerLink]="linkTo" class="group inline-flex items-center gap-2.5 cursor-pointer select-none no-underline" title="PFE Locaciones — Your story, our craft.">
      
      <!-- Vector Aperture Emblem -->
      <div class="relative w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center overflow-hidden border border-surface-container-high shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:border-primary/40">
        <!-- SVG Camera Shutter / Aperture -->
        <svg class="w-5 h-5 transition-transform duration-700 ease-out group-hover:rotate-45" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Outer circle base -->
          <circle cx="16" cy="16" r="14" stroke="#075A66" stroke-width="2.5" class="opacity-90"/>
          
          <!-- Aperture blades in petroleum and coral -->
          <path d="M16 6L23 16H9L16 6Z" fill="#075A66" opacity="0.25"/>
          <path d="M9 16L16 26V6L9 16Z" fill="#075A66" opacity="0.4"/>
          <path d="M23 16L16 26H26L23 16Z" fill="#EA5348" opacity="0.85"/>
          <circle cx="16" cy="16" r="4.5" fill="#EA5348"/>
          <circle cx="16" cy="16" r="2" fill="#FFFFFF"/>
        </svg>
      </div>

      <!-- Typography Wordmark -->
      <div class="flex flex-col text-left leading-none" *ngIf="showText">
        <div class="flex items-center gap-1.5">
          <span class="font-extrabold tracking-tight text-on-surface" [class.text-base]="size === 'sm'" [class.text-lg]="size === 'md'" [class.text-xl]="size === 'lg'">
            PFE
          </span>
          <span class="text-[10px] font-bold text-primary tracking-widest uppercase bg-primary/10 px-1.5 py-0.5 rounded">
            LOCACIONES
          </span>
        </div>
        <span class="text-[10px] font-medium text-on-surface-variant tracking-wider mt-0.5 hidden sm:inline flex items-center gap-1">
          <span class="text-secondary text-[8px]">✦</span> Your story, our craft.
        </span>
      </div>

    </a>
  `
})
export class PfeLogoComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showText: boolean = true;
  @Input() linkTo: string = '/';
}
