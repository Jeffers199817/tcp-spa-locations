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

  // ==================== PROYECTO 1: Campaña Global Verano 2026 ====================
  private p1: Project = {
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
                title: 'Clip Steadycam Living & Cocina',
                alt: 'Recorrido técnico en estabilizador mostrando proporciones y acústica',
                mime: 'video/mp4',
                bytes: 18500000,
                width: 1920,
                height: 1080,
                url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
              }
            ]
          },
          {
            id: '30000000-0000-4000-8000-000000000003',
            title: '03. Terrazas & Alberca',
            description: 'Deck perimetral de madera de teca con alberca rectangular y vistas panorámicas despejadas hacia el sur.',
            order: 2,
            details: [],
            mediaIds: ['m-ped-6', 'm-ped-7'],
            media: [
              {
                id: 'm-ped-6',
                type: 'image',
                title: 'Terraza Panorámica & Deck',
                alt: 'Deck exterior con piscina y asoleadero',
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
                alt: 'Dormitorio principal con revestimientos de roble natural y luz rasante f/1.4',
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
        description: 'San Telmo / Vallejo • 1,200 m² diáfanos • Altura libre 9.0m a cumbrera • Trifásica 125A industrial • Acceso directo camiones 10 toneladas',
        order: 1,
        coverMediaId: 'm-hang-1',
        coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3w_F6sEyCIH4qWyI6kQX-RlXoVaUo2HtLiJUugLYP4V3u0LeFQez4Uk5_HRen6iUMXza6-wL_jhVrSiUYLV4z30oY1CGMwl0WGMOMUM8z5vRN2Zh7WR0CfRFP-DkNbWrxTMU9_XoRHMJw9ey6wq3vPWNGhLdYchxJxviXcUbfV7dd8iBHtYodWj47O3umLXuxoHhmN_NuXoNGWhJpw8_q120npfFZjc4w28pyqH-b1lMce9YegsX2',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000004',
            title: '01. Nave Principal & Vigas',
            description: 'Espacio continuo sin columnas intermedias, piso de concreto pulido de alta resistencia para grúas y dolly.',
            order: 0,
            details: [],
            mediaIds: ['m-hang-1', 'm-hang-2'],
            media: [
              {
                id: 'm-hang-1',
                type: 'image',
                title: 'Nave Principal Industrial Diáfana',
                alt: 'Hangar industrial con estructura metálica y ventanales cenitales',
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
                alt: 'Estructura superior de pasarelas técnicas para iluminación cenital',
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

  // ==================== PROYECTO 2: Campaña Primavera-Costa 2026 ====================
  private p2: Project = {
    id: '10000000-0000-4000-8000-000000000002',
    title: 'Campaña Primavera-Costa 2026',
    description: 'Colección internacional de moda exterior en residencias costeras minimalistas y acantilados de roca volcánica sobre el Pacífico.',
    status: 'published',
    revision: 2,
    publishedRevision: 2,
    accessCode: 'LOC-8821',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    locations: [
      {
        id: '20000000-0000-4000-8000-000000000004',
        title: 'Residencia Brutalista Punta Mita',
        description: 'Punta de Mita, Nayarit • 520 m² sobre risco • Alberca infinity de 25m • Muros de concreto blanco desbastado y madera tropical • Vistas 270° al mar abierto',
        order: 0,
        coverMediaId: 'm-costa-1',
        coverUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000006',
            title: '01. Plataforma Volada & Alberca Infinity',
            description: 'Terraza principal volada hacia el horizonte, orientación poniente para golden hour pura y reflejos marinos.',
            order: 0,
            details: [],
            mediaIds: ['m-costa-1', 'm-costa-2'],
            media: [
              {
                id: 'm-costa-1',
                type: 'image',
                title: 'Alberca Infinity & Horizonte del Pacífico',
                alt: 'Línea de agua infinita con el mar de fondo al atardecer',
                mime: 'image/webp',
                bytes: 3200000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80'
              },
              {
                id: 'm-costa-2',
                type: 'image',
                title: 'Muros de Concreto Blanco & Sombra de Celosía',
                alt: 'Fachada con patrones geométricos de sombra y palma escultórica',
                mime: 'image/webp',
                bytes: 2900000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'
              }
            ]
          },
          {
            id: '30000000-0000-4000-8000-000000000007',
            title: '02. Living Abierto & Ventanales Corredizos',
            description: 'Salón interior con ventilación cruzada natural, piso de mármol travertino arena y muebles de lino crudo.',
            order: 1,
            details: [],
            mediaIds: ['m-costa-3'],
            media: [
              {
                id: 'm-costa-3',
                type: 'image',
                title: 'Salón Diáfano & Mármol Travertino',
                alt: 'Espacio interior sin columnas con vista directa al oleaje',
                mime: 'image/webp',
                bytes: 3100000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'
              }
            ]
          }
        ]
      },
      {
        id: '20000000-0000-4000-8000-000000000005',
        title: 'Casa de Playa Litibú',
        description: 'Litibú, Bahía de Banderas • 380 m² sobre duna natural • Estructura de vigas laminadas y deck de teca • Acceso privado directo a playa virgen',
        order: 1,
        coverMediaId: 'm-costa-4',
        coverUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000008',
            title: '01. Deck de Teca & Dunas Naturales',
            description: 'Pasarela de madera elevada sobre arena y vegetación costera protegida.',
            order: 0,
            details: [],
            mediaIds: ['m-costa-4', 'm-costa-5'],
            media: [
              {
                id: 'm-costa-4',
                type: 'image',
                title: 'Pasarela Elevada & Acceso al Mar',
                alt: 'Deck de madera clara enmarcado por dunas y palmeras',
                mime: 'image/webp',
                bytes: 2800000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80'
              },
              {
                id: 'm-costa-5',
                type: 'image',
                title: 'Pérgola de Sombras & Lounge Exterior',
                alt: 'Estructura minimalista de bambú y madera con luz tamizada',
                mime: 'image/webp',
                bytes: 2600000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80'
              }
            ]
          }
        ]
      }
    ]
  };

  // ==================== PROYECTO 3: Comercial Fragancia Noir Q3 ====================
  private p3: Project = {
    id: '10000000-0000-4000-8000-000000000003',
    title: 'Comercial Fragancia Noir Q3',
    description: 'Palacetes clásicos, escalinatas de mármol Carrara y salones dorados para spot publicitario premium internacional.',
    status: 'published',
    revision: 1,
    publishedRevision: 1,
    accessCode: 'LOC-NOIR-88',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    locations: [
      {
        id: '20000000-0000-4000-8000-000000000006',
        title: 'Palacio Porfiriano Juárez',
        description: 'Colonia Juárez, CDMX • 850 m² útiles • Gran escalinata de mármol de Carrara • Techos con molduras doradas de 7.5m • Aislamiento acústico de alto calibre',
        order: 0,
        coverMediaId: 'm-noir-1',
        coverUrl: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1600&q=80',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000009',
            title: '01. Gran Escalinata de Mármol Carrara',
            description: 'Escalera imperial simétrica con balaustrada de bronce fundido e iluminación dramática lateral.',
            order: 0,
            details: [],
            mediaIds: ['m-noir-1', 'm-noir-2'],
            media: [
              {
                id: 'm-noir-1',
                type: 'image',
                title: 'Escalinata Imperial & Vitral Central',
                alt: 'Escalera señorial de mármol blanco con luz cenital de vitral',
                mime: 'image/webp',
                bytes: 3400000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1600&q=80'
              },
              {
                id: 'm-noir-2',
                type: 'image',
                title: 'Detalle Pasamanos & Molduras de Escayola',
                alt: 'Close-up de detalles dorados y textura de mármol clásico',
                mime: 'image/webp',
                bytes: 2950000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80'
              }
            ]
          },
          {
            id: '30000000-0000-4000-8000-000000000010',
            title: '02. Salón de Baile & Espejos Dorados',
            description: 'Salón de recepción con espejos franceses de 4m, parquet Versalles encerado y candelabros de cristal.',
            order: 1,
            details: [],
            mediaIds: ['m-noir-3'],
            media: [
              {
                id: 'm-noir-3',
                type: 'image',
                title: 'Salón de Espejos & Candelabros Baccarat',
                alt: 'Salón dorado iluminado por velas y arañas de cristal',
                mime: 'image/webp',
                bytes: 3600000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80'
              }
            ]
          }
        ]
      },
      {
        id: '20000000-0000-4000-8000-000000000007',
        title: 'Mansión Neo-Clásica Roma Norte',
        description: 'Roma Norte, CDMX • Residencia catalogada INBAL 1910 • Biblioteca de cedro tallado, vitrales modernistas y chimenea de cantera verde',
        order: 1,
        coverMediaId: 'm-noir-4',
        coverUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000011',
            title: '01. Biblioteca & Galería de Arte',
            description: 'Ambiente íntimo con estanterías de cedro hasta el techo y luz cálida filtrada.',
            order: 0,
            details: [],
            mediaIds: ['m-noir-4'],
            media: [
              {
                id: 'm-noir-4',
                type: 'image',
                title: 'Biblioteca de Cedro & Sofás Chéster',
                alt: 'Biblioteca antigua con iluminación cálida claroscuro',
                mime: 'image/webp',
                bytes: 3100000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80'
              }
            ]
          }
        ]
      }
    ]
  };

  // ==================== PROYECTO 4: Lanzamiento Automotriz Eléctrico 2026 ====================
  private p4: Project = {
    id: '10000000-0000-4000-8000-000000000005',
    title: 'Lanzamiento Automotriz Eléctrico 2026',
    description: 'Carreteras escénicas privadas, hangares aeronáuticos de alta tecnología y túneles brutalistas para rodaje de vehículos.',
    status: 'published',
    revision: 3,
    publishedRevision: 3,
    accessCode: 'LOC-AUTO-99',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    locations: [
      {
        id: '20000000-0000-4000-8000-000000000008',
        title: 'Hangar Aeroespacial Toluca',
        description: 'Aeropuerto Toluca • 2,400 m² libres de columnas • Piso epóxico blanco ultrabrillante con reflejo especular • Trifásica 200A • Portón corredizo de 30m',
        order: 0,
        coverMediaId: 'm-auto-1',
        coverUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1600&q=80',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000012',
            title: '01. Nave Blanca & Reflejo Especular',
            description: 'Piso espejo blanco impoluto para destacar las líneas aerodinámicas de vehículos prototipo.',
            order: 0,
            details: [],
            mediaIds: ['m-auto-1', 'm-auto-2'],
            media: [
              {
                id: 'm-auto-1',
                type: 'image',
                title: 'Hangar Blanco & Reflexión Infinita',
                alt: 'Espacio aeroespacial blanco con iluminación cenital difusa',
                mime: 'image/webp',
                bytes: 3500000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1600&q=80'
              },
              {
                id: 'm-auto-2',
                type: 'image',
                title: 'Portón Gigante & Pista de Pruebas',
                alt: 'Vista hacia la pista exterior con luz de atardecer',
                mime: 'image/webp',
                bytes: 3000000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80'
              }
            ]
          }
        ]
      },
      {
        id: '20000000-0000-4000-8000-000000000009',
        title: 'Túnel Brutalista Santa Fe',
        description: 'Santa Fe, CDMX • Acceso subterráneo privado con arquería de concreto armado y líneas de iluminación LED continua en techo',
        order: 1,
        coverMediaId: 'm-auto-3',
        coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
        sections: [
          {
            id: '30000000-0000-4000-8000-000000000013',
            title: '01. Arquería de Concreto & Luces Lineales',
            description: 'Perspectiva infinita ideal para tomas car-to-car con estabilizador y luces de persecución.',
            order: 0,
            details: [],
            mediaIds: ['m-auto-3'],
            media: [
              {
                id: 'm-auto-3',
                type: 'image',
                title: 'Túnel de Concreto & Perspectiva de Velocidad',
                alt: 'Túnel de arquitectura moderna con luces lineales',
                mime: 'image/webp',
                bytes: 3200000,
                width: 3840,
                height: 2400,
                url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80'
              }
            ]
          }
        ]
      }
    ]
  };

  constructor(private supabase: SupabaseService) {
    this.allProjects.set([this.p1, this.p2, this.p3, this.p4]);
    this.checkInitialProjectFromSession();
  }

  private checkInitialProjectFromSession() {
    try {
      const code = sessionStorage.getItem('pfe_client_auth_code');
      if (code) {
        const found = this.allProjects().find(p => p.accessCode.toUpperCase() === code.toUpperCase());
        if (found) {
          this.currentProject.set(found);
        }
      }
    } catch {}
  }

  // Obtener proyecto por ID
  getProjectById(id: string): Project | undefined {
    return this.allProjects().find(p => p.id === id);
  }

  // Seleccionar proyecto activo por ID (navegación y persistencia)
  selectProjectById(id: string): Project | null {
    const found = this.allProjects().find(p => p.id === id);
    if (found) {
      this.currentProject.set(found);
      try {
        sessionStorage.setItem('pfe_client_auth_code', found.accessCode);
      } catch {}
      return found;
    }
    return null;
  }

  // Obtener y validar proyecto por código de acceso NDA
  async verifyCodeAndLoad(code: string): Promise<Project | null> {
    const cleanCode = code.trim().toUpperCase();
    
    // Buscar en los proyectos maestros en memoria
    const found = this.allProjects().find(p => p.accessCode.toUpperCase() === cleanCode);
    if (found) {
      this.currentProject.set(found);
      try {
        sessionStorage.setItem('pfe_client_auth_code', found.accessCode);
      } catch {}
      return found;
    }

    // Consulta de respaldo en Supabase
    try {
      const { data, error } = await this.supabase.client
        .from('projects')
        .select('*')
        .eq('access_code', cleanCode)
        .eq('status', 'published')
        .single();

      if (data && !error) {
        const remoteProj: Project = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status,
          revision: data.revision || 1,
          publishedRevision: data.published_revision || 1,
          accessCode: data.access_code,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          locations: this.p1.locations
        };
        this.currentProject.set(remoteProj);
        try {
          sessionStorage.setItem('pfe_client_auth_code', remoteProj.accessCode);
        } catch {}
        return remoteProj;
      }
    } catch {
      // Fallback local seguro
    }

    return null;
  }

  // Crear nuevo proyecto desde panel de administración
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
      locations: [
        {
          id: 'loc-' + Date.now(),
          title: 'Espacio Principal a Documentar',
          description: 'Recinto inicial creado automáticamente para scouting técnico.',
          order: 0,
          coverMediaId: null,
          coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
          sections: []
        }
      ]
    };

    this.allProjects.update(list => [newProj, ...list]);
    return newProj;
  }
}
