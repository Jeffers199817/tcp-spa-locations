import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface ToastNotification {
  message: string;
  type?: 'success' | 'info' | 'warning';
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  // Lista reactiva de IDs de fotos seleccionadas (iniciada con los 7 elementos del prototipo Stitch)
  public selectedMediaIds = signal<Set<string>>(new Set([
    'm-ped-hero',
    'm-ped-1',
    'm-ped-4',
    'm-ped-5',
    'm-ped-6',
    'm-ped-7',
    'm-hang-1'
  ]));

  public lastToast = signal<ToastNotification>({
    message: '',
    type: 'success',
    visible: false
  });

  private toastTimeout: any = null;

  constructor(private supabase: SupabaseService) {}

  isFavorite(mediaId: string): boolean {
    return this.selectedMediaIds().has(mediaId);
  }

  toggleFavorite(mediaId: string, itemName?: string): boolean {
    const current = new Set(this.selectedMediaIds());
    const isNowSelected = !current.has(mediaId);

    if (isNowSelected) {
      current.add(mediaId);
      this.triggerToast(`Añadido a selección compartida: ${itemName || 'Activo técnico'}`);
    } else {
      current.delete(mediaId);
      this.triggerToast(`Removido de selección: ${itemName || 'Activo técnico'}`);
    }

    this.selectedMediaIds.set(current);

    // Si Supabase está conectado, sincronizar en tiempo real
    this.syncWithSupabase(mediaId, isNowSelected);

    return isNowSelected;
  }

  removeFavorite(mediaId: string, itemName?: string): void {
    const current = new Set(this.selectedMediaIds());
    if (current.has(mediaId)) {
      current.delete(mediaId);
      this.selectedMediaIds.set(current);
      this.triggerToast(`Removido de selección: ${itemName || 'Activo técnico'}`);
      this.syncWithSupabase(mediaId, false);
    }
  }

  count(): number {
    return this.selectedMediaIds().size;
  }

  triggerToast(message: string, type: 'success' | 'info' | 'warning' = 'success'): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.lastToast.set({ message, type, visible: true });
    this.toastTimeout = setTimeout(() => {
      this.lastToast.set({ message: '', type: 'success', visible: false });
    }, 3200);
  }

  private async syncWithSupabase(mediaId: string, isFav: boolean) {
    try {
      // Intentar persistir o notificar por broadcast en canal Supabase
      const channel = this.supabase.client.channel('public:favorites');
      await channel.send({
        type: 'broadcast',
        event: 'favorite_toggled',
        payload: { mediaId, isFav, timestamp: new Date().toISOString() }
      });
    } catch {
      // Sincronización transparente
    }
  }
}
