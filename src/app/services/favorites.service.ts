import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface ToastNotification {
  message: string;
  type?: 'success' | 'info' | 'warning';
  visible: boolean;
}

export interface DpNote {
  mediaId: string;
  noteText: string;
  category: string; // 'Óptica / Lentes' | 'Iluminación / Sol' | 'Grip / Cámara' | 'Eléctrico / Planta' | 'Arte & Set' | 'General'
  author: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  // Lista reactiva de IDs de fotos seleccionadas
  public selectedMediaIds = signal<Set<string>>(new Set([
    'm-ped-hero',
    'm-ped-1',
    'm-ped-4',
    'm-ped-5',
    'm-ped-6',
    'm-ped-7',
    'm-hang-1'
  ]));

  // Mapa reactivo de notas técnicas del Director de Fotografía (DP)
  public dpNotes = signal<Map<string, DpNote>>(new Map());

  public lastToast = signal<ToastNotification>({
    message: '',
    type: 'success',
    visible: false
  });

  private toastTimeout: any = null;

  constructor(private supabase: SupabaseService) {
    this.initDpNotes();
  }

  private initDpNotes() {
    try {
      const saved = localStorage.getItem('pfe_dp_notes_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        const map = new Map<string, DpNote>();
        for (const item of parsed) {
          map.set(item.mediaId, item);
        }
        this.dpNotes.set(map);
        return;
      }
    } catch {}

    // Notas de demostración cinematográficas preconfiguradas para scouting
    const initialNotes: DpNote[] = [
      {
        mediaId: 'm-ped-hero',
        noteText: 'Plano maestro exterior con lente anamórfico 35mm. Programar rodaje en hora mágica (17:35h - 18:20h). Espacio libre para grúa Techno 30.',
        category: 'Iluminación / Sol',
        author: 'Director de Fotografía (DP)',
        updatedAt: 'Hoy, 09:30 AM'
      },
      {
        mediaId: 'm-ped-1',
        noteText: 'Riel de cámara dolly sobre piso de basalto pulido. Requiere difusor 12x12 en ventanal poniente.',
        category: 'Grip / Cámara',
        author: 'Gaffer / DP',
        updatedAt: 'Ayer, 16:15 PM'
      },
      {
        mediaId: 'm-ped-6',
        noteText: 'Acometida trifásica 80A disponible a 12m. Posición idónea para generador silencioso 60kW en estacionamiento secundario.',
        category: 'Eléctrico / Planta',
        author: 'Director Técnico PFE',
        updatedAt: '2026-10-02'
      }
    ];

    const initialMap = new Map<string, DpNote>();
    for (const n of initialNotes) {
      initialMap.set(n.mediaId, n);
    }
    this.dpNotes.set(initialMap);
    this.persistNotes(initialNotes);
  }

  private persistNotes(notes: DpNote[]) {
    try {
      localStorage.setItem('pfe_dp_notes_v1', JSON.stringify(notes));
    } catch {}
  }

  getNote(mediaId: string): DpNote | undefined {
    return this.dpNotes().get(mediaId);
  }

  hasNote(mediaId: string): boolean {
    return this.dpNotes().has(mediaId);
  }

  saveNote(mediaId: string, noteText: string, category: string = 'General', author: string = 'Director de Fotografía (DP)'): void {
    if (!noteText || !noteText.trim()) return;

    const currentMap = new Map(this.dpNotes());
    const newNote: DpNote = {
      mediaId,
      noteText: noteText.trim(),
      category: category || 'General',
      author: author.trim() || 'Director de Fotografía (DP)',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    currentMap.set(mediaId, newNote);
    this.dpNotes.set(currentMap);
    this.persistNotes(Array.from(currentMap.values()));

    this.triggerToast('Nota técnica de DP guardada con éxito.');
  }

  deleteNote(mediaId: string): void {
    const currentMap = new Map(this.dpNotes());
    if (currentMap.has(mediaId)) {
      currentMap.delete(mediaId);
      this.dpNotes.set(currentMap);
      this.persistNotes(Array.from(currentMap.values()));
      this.triggerToast('Nota técnica de DP eliminada.');
    }
  }

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
