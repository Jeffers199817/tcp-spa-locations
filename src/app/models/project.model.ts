import { Location } from './location.model';
import { MediaItem } from './media.model';

export interface ProjectMapLocationMarker {
  id?: string;
  name: string;
  category?: string; // 'Locación Principal' | 'Base Camp / Parqueo' | 'Unidad Móvil' | 'Punto de Encuentro'
  lat: number;
  lng: number;
  address?: string;
  logisticsNote?: string; // ej. 'Acceso camiones 10T, trifásica 80A a 15m'
}

export interface ProjectMapConfig {
  regionName: string; // ej. 'Ciudad de México • Pedregal & Coyoacán'
  centerLat: number;
  centerLng: number;
  zoom: number;
  mapStyle: 'satellite' | 'streets' | 'dark' | 'cinematic';
  embedUrl?: string; // URL iframe personalizada (Google Maps / OpenStreetMap)
  logisticsNotes?: string; // Notas de vialidad y permisos de tránsito pesado
  markers?: ProjectMapLocationMarker[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived' | 'deleting';
  revision: number;
  publishedRevision: number | null;
  accessCode: string;
  createdAt: string;
  updatedAt: string;
  locations?: Location[];
  mediaById?: Record<string, MediaItem>;
  mapConfig?: ProjectMapConfig;
}
