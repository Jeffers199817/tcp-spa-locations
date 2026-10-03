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

  // Proyecto maestro enriquecido con todos los datos y fotos del prototipo Stitch
  private demoProject: Project = {
    id: '10000000-0000-4000-8000-000000000001',
    title: 'Campaña Global Verano 2026',
    description: 'Selección de locaciones contemporáneas, industriales y coloniales para rodaje de campaña internacional comercial y catálogo editorial.',
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
        description: 'Jardines del Pedregal, CDMX • 680 m² interiores • Techo doble altura 6.2m • Acometida trifásica 80A • Permiso Municipal Aprobado',
        order: 0,
        coverMediaId: 'm-ped-hero',
        coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoPdw6Ah2CCawFhTG2RY1TikZ_30fDY0vIe2jzYIresWo0wbjAz0jG7ZQ6U1s0Xuv-vnmaZwCnuYIGFF0q_in44ASyoxRSIsKf--ZC1xxsfNXIJV9_9UgCDGXlQ0dgodsWKSNBfxYIscPKqF_oSF356GWpJo8nCT0vpGpMboVxYnJnbAg6OGqBE5b61hrrNX3AtTBm6zyWhZ5qIjziJonIh3HcgT_fJGpsluOyuui89c8ITVx3vr7X',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000001',
            title: '01. Fachada & Entrada Principal',
            description: 'Acceso vehicular, muros de piedra volcánica negra, portón pivotante de acero y espejo de agua.',
            order: 0,
            details: [],
            mediaIds: ['m-ped-1', 'm-ped-2', 'm-ped-3'],
            media: [
              {
                id: 'm-ped-1',
                type: 'image',
                title: 'Acceso Peatonal & Muro Volcánico',
                alt: 'Muro exterior de piedra volcánica con portón pivotante y vegetación endémica',
                mime: 'image/webp',
                bytes: 2850000,
                width: 3840,
                height: 2400,
                url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABw4Kz7IZuYnINFzNM24XEk_NGT7nZZpsdRUCKvuczlN_K52kpHPGGUiq0G-yveLbOW2b1NofVNVAeQYdB8_2hpZhU4fmYykTySVwf1HjzhF5LdsqiEcxBAJ-dyDyThH-IHXKyCPD9g5jx7tR7EE4sYZwt6Oz-G1j2VlKaDr38XsI_sBpfpokmKgounFIkgKb24U6hLSIyXBYcEMDgMUkUZ72OXECjM58YC-SEePIKaeHl7QQ6oo-Z'
              },
              {
                id: 'm-ped-2',
                type: 'image',
                title: 'Perspectiva Entrada Lateral & Jardinería',
                alt: 'Jardín escultórico desértico con olivos y reflejos de cristal',
                mime: 'image/webp',
                bytes: 2600000,
                width: 3840,
                height: 2400,
                url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9EMuNJ2GaP_hzO-fFen3OUMamZcxEqADXl9d3Uvs7F9K8wenkBoy7Zp5rjlLrapMYx-v2AbpewwN7a9kCGz5o3ABk8_sIhYMGnbRHCDmwUbVfSmmIWAAA7lhY-HTw1xQWJcVw7jxXgDDtQeXJe2hRS5u9HG5iGsBK6CWH6bsJDm6qpH4tWkhmYzJEPuvo6qoCcIRMt9HE-0ie1-EVj8MeqRGCcrp2ayNJUuyfzlGJuRL7DnMtj8Y'
              },
              {
                id: 'm-ped-3',
                type: 'image',
                title: 'Volumetría Exterior Atardecer',
                alt: 'Luz rasante en fachada de concreto aparente',
                mime: 'image/webp',
                bytes: 3100000,
                width: 3840,
                height: 2400,
                url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcskZKxBu72IFBBaOLdefF6pieyAKeg5aPIWbviZuCtdZl4xrwsv1a1MeaLDUU-K99ka7TJGso9CB2d-Q75Y-1leigvQWhv9urJxsAg2o_uqZyfyy9DwcFSvSsB689fmvEB4C3PXai75YKPnKtOrlRTl2cxQn6Iv37nd-4PllCLJCRLPHlF3t6bpqUt4RpbjoXmuLrJJbQ_zDFctJJgVYiuseEEGF9JDzVP2iAM7-rGMra4bVjQIzl'
              }
            ]
          },
          {
            id: '30000000-0000-4000-8000-000000000002',
            title: '02. Living & Cocina Abierta',
            description: 'Salón principal con altura de 5.0m, tragaluz cenital, piso de granito desbastado e isla de cocina contemporánea.',
            order: 1,
            details: [],
            mediaIds: ['m-ped-4', 'm-ped-5', 'm-ped-vid'],
            media: [
              {
                id: 'm-ped-4',
                type: 'image',
                title: 'Salón Principal & Estanque',
                alt: 'Living con sillones modulares, espejo de agua interior y ventanales corredizos',
                mime: 'image/webp',
                bytes: 3450000,
                width: 3840,
                height: 2400,
                url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm6rC8AUnQx1TpaKQ47eqzWwB9WoyNbRLfdOa6Yd-_FeV8173wmRqe1_uoZVCCYHZThznl6Rk6zUr3O4lAOLsWpSpDwjs_XY0L9yIm1vgUInRa9vJXVdyzxC32Ku5N8VGeeAwMGKQLDzvyB3-oCrpc3zZavpPrK_AJFnUb1dEA0Sayhmv5Qhmk485Al4QavEWAmhdb2eugeZeusbvJuFBioENo3yz1EmCLgMAoP9qoSqMW21m4w501'
              },
              {
                id: 'm-ped-5',
                type: 'image',
                title: 'Galería de Concreto & Tragaluz',
                alt: 'Corredor con iluminación cenital filtrada y sombras geométricas',
                mime: 'image/webp',
                bytes: 2900000,
                width: 3840,
                height: 2400,
                url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe7k0BeMVrh_AzDXykrDAgC5nslus1lOvPKMjyES3bj0OlMI74DKNSLW0XP7b9rFU_g6wDeBvVE0_OsQd5y4mM1Hpih5MuVz6Fvqg4ZQCPWHfJzCVmkZklLqqYoDlAYySIPsRBANm0sHcyT1jOjM6JOeJGR2aUSQwHRz7AuirQKu0pcVVCUV-Ufb76dImB-eBDiUZA9v0X59YO6ZQ-lbdBIgmNfjt0YRQuLF-ZXnOQdoN85nnevxH3'
              },
              {
                id: 'm-ped-vid',
                type: 'video',
                title: 'Barrido Cámara Living & Cocina (ProRes Proxy)',
                alt: 'Video clip técnico de movimiento de steadycam a través del salón principal',
                mime: 'video/mp4',
                bytes: 42000000,
                width: 3840,
                height: 2160,
                url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
              }
            ]
          },
          {
            id: '30000000-0000-4000-8000-000000000003',
            title: '03. Terrazas & Espejo de Agua',
            description: 'Área exterior con alberca rectangular, deck de teca y vista panorámica a la reserva ecológica.',
            order: 2,
            details: [],
            mediaIds: ['m-ped-6', 'm-ped-7'],
            media: [
              {
                id: 'm-ped-6',
                type: 'image',
                title: 'Terraza Panorámica & Deck de Madera',
                alt: 'Terraza con tumbonas de diseño y alberca infinita',
                mime: 'image/webp',
                bytes: 3200000,
                width: 3840,
                height: 2400,
                url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxBkxaGoY0Jcgbk7niYgO-MpbH3j0yql5rjFHA9xMrb8CU0fKv4fDbIb-UlJY9zGnXTIOHF_pC37DIMFwoRBYtPhtBflRoNW4ju0GvvzZUu2Cmr8z1TdYqU_1I86FXvKLDGuiA0jeslQPz9GcQ831CiPinE3fheYgc0KjtulXdTfMtxbkWCk5W_fcNGB1t3bkIB4OTZ2X2BTiMVSvYTi7Yau9_Z3eVjO4EM35nVJXjl15TfjW3scsI'
              },
              {
                id: 'm-ped-7',
                type: 'image',
                title: 'Suite Master & Vestidor',
                alt: 'Habitación minimalista con baño en suite y carpintería en roble',
                mime: 'image/webp',
                bytes: 2750000,
                width: 3840,
                height: 2400,
                url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANTRn6Jabv7G8DI7CBT0y6qx6nPZ8MZBCcehfzRcyyXqcU3XAOW7Tnh5OjtNl5OlOqG3u2pRWa9E3VX--sUhHQTgKNaiD2qd-Ypgs6yp_j3d_rBNaXRukeYfOYOZzt4vhl5jrddCz9Zll8dsNZQlK6JlC2ZgiT1006bDOz_bJMtHhEHpIQSatKqy-oEdklHP-4IkWiD6NAoy2sxru6l4EM84fdaySHUCu0lhMynfAHO1nOV4_usEH4'
              }
            ]
          }
        ]
      },
      {
        id: '20000000-0000-4000-8000-000000000002',
        title: 'Hangar Industrial San Telmo',
        description: 'San Telmo / Vallejo • 1,200 m² diáfanos • Altura libre 9.0m a cumbrera • Trifásica 125A industrial • Acceso para camiones de 10T directo al set',
        order: 1,
        coverMediaId: 'm-hang-1',
        coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3w_F6sEyCIH4qWyI6kQX-RlXoVaUo2HtLiJUugLYP4V3u0LeFQez4Uk5_HRen6iUMXza6-wL_jhVrSiUYLV4z30oY1CGMwl0WGMOMUM8z5vRN2Zh7WR0CfRFP-DkNbWrxTMU9_XoRHMJw9ey6wq3vPWNGhLdYchxJxviXcUbfV7dd8iBHtYodWj47O3umLXuxoHhmN_NuXoNGWhJpw8_q120npfFZjc4w28pyqH-b1lMce9YegsX2',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000004',
            title: '01. Nave Principal & Estructuras de Acero',
            description: 'Vigas reticuladas expuestas, piso pulido de alto impacto y amplios portones para iluminación cenital.',
            order: 0,
            details: [],
            mediaIds: ['m-hang-1', 'm-hang-2'],
            media: [
              {
                id: 'm-hang-1',
                type: 'image',
                title: 'Nave Principal Industrial Diáfana',
                alt: 'Estructura monumental de hangar industrial con tragaluces',
                mime: 'image/webp',
                bytes: 3800000,
                width: 3840,
                height: 2400,
                url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3w_F6sEyCIH4qWyI6kQX-RlXoVaUo2HtLiJUugLYP4V3u0LeFQez4Uk5_HRen6iUMXza6-wL_jhVrSiUYLV4z30oY1CGMwl0WGMOMUM8z5vRN2Zh7WR0CfRFP-DkNbWrxTMU9_XoRHMJw9ey6wq3vPWNGhLdYchxJxviXcUbfV7dd8iBHtYodWj47O3umLXuxoHhmN_NuXoNGWhJpw8_q120npfFZjc4w28pyqH-b1lMce9YegsX2'
              },
              {
                id: 'm-hang-2',
                type: 'image',
                title: 'Mezzanine & Rampa Técnica',
                alt: 'Vista superior desde el mezzanine metálico hacia la pista de rodaje',
                mime: 'image/webp',
                bytes: 3100000,
                width: 3840,
                height: 2400,
                url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq-UcK-XhS5gT17ltdoHS7fkjzGAuS0AF1cnj-j6xkfGJ_mlzEziAP5vtnAk6nIWD6DXwDeYWdoFIXDw-c0WQ3pNL6qDRcBvc2AfL7DkVl3mfiy5LtsohMdk7j8lZRL-bR6it3DUm6p8PZdTFStE_3LeAHfQYqoo3W54ZtpmjSO4SYoGbJeYoTbIUvkTT-vaOnF7c7oIzW9_FXoUEiW7hWvItCBbNdbILa_eRZhwPzh7npnNykkd3V'
              }
            ]
          }
        ]
      },
      {
        id: '20000000-0000-4000-8000-000000000003',
        title: 'Casa Colonial Coyoacán',
        description: 'Centro Histórico Coyoacán • Residencia colonial catalogada del siglo XVIII • Patio central con arquería de cantera • Fuente barroca • Techos de vigas 4.2m',
        order: 2,
        coverMediaId: 'm-col-1',
        coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpo0oR3fnz9lpS_RgyVwDGPtebCF1WXCFfL_0Kx9Y47SSh0KHH927XVVOp4dQCU6-Z_tENgbvO3IgnicC8GE3RuQDMGxgS3GvhuUFqLxnpVJektX49KeEkgQadm0mI6lRXEqLuO9xXlsBqhb6vMdAojUhETBx_WqJxS-Y1J32RBCSsoJsi1pLDhuwMwXgYRueoTET-95Kbq0RNwJYAVIjmKTk4yVME3bPdtOrmcrCHzeHAq305gOI6',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000005',
            title: '01. Patio Central & Arquería de Cantera',
            description: 'Arcos coloniales, piso de adoquín original, fuente de cantera y enredaderas centenarias.',
            order: 0,
            details: [],
            mediaIds: ['m-col-1'],
            media: [
              {
                id: 'm-col-1',
                type: 'image',
                title: 'Patio de Arcos & Fuente Colonial',
                alt: 'Patio con arquería de piedra volcánica y cantera barroca',
                mime: 'image/webp',
                bytes: 3500000,
                width: 3840,
                height: 2400,
                url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpo0oR3fnz9lpS_RgyVwDGPtebCF1WXCFfL_0Kx9Y47SSh0KHH927XVVOp4dQCU6-Z_tENgbvO3IgnicC8GE3RuQDMGxgS3GvhuUFqLxnpVJektX49KeEkgQadm0mI6lRXEqLuO9xXlsBqhb6vMdAojUhETBx_WqJxS-Y1J32RBCSsoJsi1pLDhuwMwXgYRueoTET-95Kbq0RNwJYAVIjmKTk4yVME3bPdtOrmcrCHzeHAq305gOI6'
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
        title: 'Campaña Primavera-Verano 2026',
        description: 'Colección internacional de moda exterior en locaciones costeras y residencias minimalistas.',
        status: 'published',
        revision: 2,
        publishedRevision: 2,
        accessCode: 'LOC-8821',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locations: []
      },
      {
        id: '10000000-0000-4000-8000-000000000003',
        title: 'Comercial Fragancia Noir Q3',
        description: 'Palacetes clásicos, escaleras de mármol y salones dorados para spot publicitario premium.',
        status: 'published',
        revision: 1,
        publishedRevision: 1,
        accessCode: 'LOC-NOIR-88',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locations: []
      },
      {
        id: '10000000-0000-4000-8000-000000000004',
        title: 'Serie Streaming T2 - Interiores Urbanos',
        description: 'Lofts contemporáneos, departamentos brutalistas y estudios en CDMX.',
        status: 'draft',
        revision: 1,
        publishedRevision: null,
        accessCode: 'LOC-T2-2026',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locations: []
      },
      {
        id: '10000000-0000-4000-8000-000000000005',
        title: 'Lanzamiento Automotriz Eléctrico 2026',
        description: 'Carreteras escénicas desérticas, hangares aeroportuarios y puentes modernos.',
        status: 'published',
        revision: 3,
        publishedRevision: 3,
        accessCode: 'LOC-AUTO-99',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locations: []
      },
      {
        id: '10000000-0000-4000-8000-000000000006',
        title: 'Shooting Editorial Arquitectura Sostenible',
        description: 'Invernaderos botánicos, casas de adobe contemporáneas y pérgolas bioclimáticas.',
        status: 'draft',
        revision: 1,
        publishedRevision: null,
        accessCode: 'LOC-ECO-44',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locations: []
      }
    ]);
  }

  // Obtener proyecto por código de acceso
  async verifyCodeAndLoad(code: string): Promise<Project | null> {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'LOC-2026-X' || cleanCode === 'LOC-8821' || cleanCode === 'LOC-NOIR-88' || cleanCode === 'LOC-AUTO-99') {
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
        return this.demoProject;
      }
    } catch {
      // Fallback local garantizado
    }

    return null;
  }

  // Crear nuevo proyecto
  async createProject(title: string, accessCode: string, description?: string): Promise<Project> {
    const newProj: Project = {
      id: 'proj-' + Date.now(),
      title,
      description: description || 'Proyecto de locaciones audiovisuales registrado en PFE Core.',
      status: 'draft',
      revision: 1,
      publishedRevision: null,
      accessCode: accessCode.toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      locations: []
    };

    this.allProjects.update(list => [newProj, ...list]);
    return newProj;
  }
}
