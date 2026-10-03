import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  // Lista reactiva de IDs de fotos seleccionadas
  public selectedMediaIds = signal<Set<string>>(new Set(['m1', 'm3']));

  constructor(private supabase: SupabaseService) {}

  isFavorite(mediaId: string): boolean {
    return this.selectedMediaIds().has(mediaId);
  }

  toggleFavorite(mediaId: string): boolean {
    const current = new Set(this.selectedMediaIds());
    const isNowSelected = !current.has(mediaId);

    if (isNowSelected) {
      current.add(mediaId);
    } else {
      current.delete(mediaId);
    }

    this.selectedMediaIds.set(current);
    return isNowSelected;
  }

  count(): number {
    return this.selectedMediaIds().size;
  }
}
