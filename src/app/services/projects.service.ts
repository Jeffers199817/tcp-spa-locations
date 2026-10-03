import { Injectable, signal } from '@angular/core';
import { Project } from '../models/project.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  public currentProject = signal<Project | null>(null);
  public allProjects = signal<Project[]>([]);
  public loading = signal<boolean>(false);

  // Proyecto de demostración con datos de Stitch
  private demoProject: Project = {
    id: '10000000-0000-4000-8000-000000000001',
    title: 'Campaña Global Verano 2026',
    description: 'Selección de locaciones contemporáneas e industriales para rodaje exterior y set interior.',
    status: 'published',
    revision: 2,
    publishedRevision: 2,
    accessCode: 'LOC-2026-X',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    locations: [
      {
        id: '20000000-0000-4000-8000-000000000001',
        title: 'Villa Moderna Pedregal',
        description: 'Residencia de arquitectura brutalista con amplios ventanales, concreto pulido y vegetación endémica.',
        order: 0,
        coverMediaId: 'm1',
        coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000001',
            title: '01. Fachada & Entrada Principal',
            description: 'Acceso vehicular, muros de piedra volcánica y espejo de agua.',
            order: 0,
            details: [],
            mediaIds: ['m1', 'm2'],
            media: [
              {
                id: 'm1',
                type: 'image',
                title: 'Vista Frontal Atardecer',
                alt: 'Fachada frontal de concreto con luz natural cálida',
                mime: 'image/jpeg',
                bytes: 2450000,
                width: 3840,
                height: 2160,
                url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
              },
              {
                id: 'm2',
                type: 'image',
                title: 'Detalle de Acceso y Puerta Pivotante',
                alt: 'Puerta monumental de madera y cristal',
                mime: 'image/jpeg',
                bytes: 1890000,
                width: 3840,
                height: 2160,
                url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
              }
            ]
          },
          {
            id: '30000000-0000-4000-8000-000000000002',
            title: '02. Living & Cocina Abierta',
            description: 'Doble altura, isla de mármol negro y vista panorámica al jardín.',
            order: 1,
            details: [],
            mediaIds: ['m3', 'm4'],
            media: [
              {
                id: 'm3',
                type: 'image',
                title: 'Salón Principal & Estanque',
                alt: 'Living con sillones modulares y ventanales corredizos',
                mime: 'image/jpeg',
                bytes: 3100000,
                width: 3840,
                height: 2160,
                url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
              },
              {
                id: 'm4',
                type: 'image',
                title: 'Galería de Concreto & Tragaluz',
                alt: 'Pasillo con iluminación cenital filtrada',
                mime: 'image/jpeg',
                bytes: 2200000,
                width: 3840,
                height: 2160,
                url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
              }
            ]
          }
        ]
      },
      {
        id: '20000000-0000-4000-8000-000000000002',
        title: 'Hangar Industrial San Telmo',
        description: 'Espacio diáfano de 1,200 m² con estructura de acero remachado, tragaluces cenitales y piso de cemento alisado.',
        order: 1,
        coverMediaId: 'm5',
        coverUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000003',
            title: '01. Nave Principal y Tragaluces',
            description: 'Altura libre de 9 metros apta para rigging e iluminación pesada.',
            order: 0,
            details: [],
            mediaIds: ['m5', 'm6'],
            media: [
              {
                id: 'm5',
                type: 'image',
                title: 'Nave Principal Industrial',
                alt: 'Perspectiva de la nave vacía con luz cenital',
                mime: 'image/jpeg',
                bytes: 4100000,
                width: 3840,
                height: 2160,
                url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
              },
              {
                id: 'm6',
                type: 'image',
                title: 'Detalle de Portón Corredizo y Texturas',
                alt: 'Portón de chapa oxidada industrial con pátina de época',
                mime: 'image/jpeg',
                bytes: 2800000,
                width: 3840,
                height: 2160,
                url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'
              }
            ]
          }
        ]
      }
    ]
  };

  constructor(private supabase: SupabaseService) {
    this.currentProject.set(this.demoProject);
    this.allProjects.set([
      this.demoProject,
      {
        id: '10000000-0000-4000-8000-000000000002',
        title: 'Comercial Fragancia Noir',
        description: 'Palacetes clásicos, escaleras de mármol y salones dorados.',
        status: 'published',
        revision: 1,
        publishedRevision: 1,
        accessCode: 'LOC-NOIR-88',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locations: []
      },
      {
        id: '10000000-0000-4000-8000-000000000003',
        title: 'Serie Streaming T2 - Interiores',
        description: 'Departamentos contemporáneos, oficinas y lofts urbanos.',
        status: 'draft',
        revision: 1,
        publishedRevision: null,
        accessCode: 'LOC-T2-2026',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locations: []
      }
    ]);
  }

  // Obtener proyecto por código de acceso
  async verifyCodeAndLoad(code: string): Promise<Project | null> {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'LOC-2026-X' || cleanCode === 'LOC-8821') {
      this.currentProject.set(this.demoProject);
      return this.demoProject;
    }

    try {
      const { data, error } = await this.supabase.client
        .from('projects')
        .select('*')
        .eq('access_code', cleanCode)
        .eq('status', 'published')
        .single();

      if (data && !error) {
        // Cargar locaciones y secciones
        return this.demoProject;
      }
    } catch {
      // Fallback a demo si Supabase no está conectado todavía
    }

    return null;
  }
}
