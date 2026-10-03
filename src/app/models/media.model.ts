export interface MediaItem {
  id: string;
  projectId?: string;
  locationId?: string;
  sectionId?: string;
  detailId?: string | null;
  type: 'image' | 'video';
  title: string;
  alt?: string;
  mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'video/mp4';
  bytes: number;
  width: number;
  height: number;
  durationSeconds?: number | null;
  storagePath?: string;
  posterStoragePath?: string | null;
  url?: string;
  posterUrl?: string;
  order?: number;
  isFavorite?: boolean;
}
