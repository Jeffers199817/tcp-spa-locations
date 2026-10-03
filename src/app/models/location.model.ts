import { MediaItem } from './media.model';

export interface SectionDetail {
  id: string;
  sectionId?: string;
  title: string;
  description: string;
  order: number;
  mediaIds: string[];
}

export interface Section {
  id: string;
  locationId?: string;
  title: string;
  description: string;
  order: number;
  details: SectionDetail[];
  mediaIds: string[];
  media?: MediaItem[];
}

export interface Location {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  order: number;
  coverMediaId: string | null;
  coverUrl?: string;
  sections: Section[];
}
