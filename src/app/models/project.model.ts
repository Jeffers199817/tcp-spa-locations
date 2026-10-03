import { Location } from './location.model';
import { MediaItem } from './media.model';

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
}
