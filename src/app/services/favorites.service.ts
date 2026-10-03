import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface ToastNotification {
  message: string;
  type?: 'success' | 'info' | 'warning';
  visible: boolean;
}

export interface DpNoteReply {
  id: string;
  author: string;
  role: 'Admin' | 'DP' | 'Producción' | 'Arte';
  message: string;
  timestamp: string;
}

export interface DpNote {
  mediaId: string;
  locationName?: string;
  mediaTitle?: string;
  mediaThumbnailUrl?: string;
  projectId?: string;
  noteText: string;
  category: string; // 'Óptica / Lentes' | 'Iluminación / Sol' | 'Grip / Cámara' | 'Eléctrico / Planta' | 'Arte & Set' | 'General'
  author: string;
  updatedAt: string;
  replies?: DpNoteReply[];
  resolved?: boolean;
  clicksCount?: number;
  likesCount?: number;
}

export interface ClientSessionToken {
  token: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  role: string;
  accessCode: string;
  generatedAt: string;
  expiresAt: string;
  clicksCount: number;
  fullUrl: string;
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

  // Mapa reactivo de notas técnicas del Director de Fotografía (DP) con soporte de chat social
  public dpNotes = signal<Map<string, DpNote>>(new Map());

  // Conteo acumulativo de Me Gusta / Selecciones de clientes por activo
  public mediaLikes = signal<Map<string, number>>(new Map([
    ['m-ped-hero', 84],
    ['m-ped-1', 72],
    ['m-ped-4', 68],
    ['m-ped-5', 63],
    ['m-ped-6', 59],
    ['m-ped-7', 52],
    ['m-hang-1', 77],
    ['m-hang-2', 45],
    ['m-col-1', 61]
  ]));

  // Métricas de clics e impresiones por activo
  public mediaClicks = signal<Map<string, number>>(new Map([
    ['m-ped-hero', 342],
    ['m-ped-1', 289],
    ['m-ped-4', 215],
    ['m-ped-5', 198],
    ['m-ped-6', 176],
    ['m-ped-7', 154],
    ['m-hang-1', 310],
    ['m-hang-2', 182],
    ['m-col-1', 240]
  ]));

  // Tokens de sesión generados desde el Admin
  public clientTokens = signal<ClientSessionToken[]>([]);

  public lastToast = signal<ToastNotification>({
    message: '',
    type: 'success',
    visible: false
  });

  private toastTimeout: any = null;

  constructor(private supabase: SupabaseService) {
    this.initDpNotes();
    this.initLikesAndClicks();
    this.initClientTokens();
  }

  private initDpNotes() {
    try {
      const saved = localStorage.getItem('pfe_dp_notes_v2');
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

    // Notas de demostración cinematográficas preconfiguradas con chat de rodaje
    const initialNotes: DpNote[] = [
      {
        mediaId: 'm-ped-hero',
        locationName: 'Villa Moderna Pedregal',
        mediaTitle: 'Villa Moderna Pedregal — Vista Panorámica',
        mediaThumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9EMuNJ2GaP_hzO-fFen3OUMamZcxEqADXl9d3Uvs7F9K8wenkBoy7Zp5rjlLrapMYx-v2AbpewwN7a9kCGz5o3ABk8_sIhYMGnbRHCDmwUbVfSmmIWAAA7lhY-HTw1xQWJcVw7jxXgDDtQeXJe2hRS5u9HG5iGsBK6CWH6bsJDm6qpH4tWkhmYzJEPuvo6qoCcIRMt9HE-0ie1-EVj8MeqRGCcrp2ayNJUuyfzlGJuRL7DnMtj8Y',
        projectId: '10000000-0000-4000-8000-000000000001',
        noteText: 'Plano maestro exterior con lente anamórfico 35mm. Programar rodaje en hora mágica (17:35h - 18:20h). Espacio libre para grúa Techno 30.',
        category: 'Iluminación / Sol',
        author: 'Rodrigo Prieto (DP Asignado)',
        updatedAt: 'Hoy, 09:30 AM',
        clicksCount: 342,
        likesCount: 84,
        replies: [
          {
            id: 'rep-1',
            author: 'Producción PFE',
            role: 'Admin',
            message: 'Aprobado espacio para Techno 30. Se reservó el acceso de camión grúa desde las 14:00h.',
            timestamp: 'Hoy, 10:15 AM'
          }
        ]
      },
      {
        mediaId: 'm-ped-1',
        locationName: 'Villa Moderna Pedregal',
        mediaTitle: 'Fachada & Entrada Principal',
        mediaThumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC75aW0F1U95kLd752T_zQ1q8pAky9qgJ4z1QZz6uL7mR2uV3xT9rY1aZ3xW6vB8nM2kL4pQ7sT1uV9xY2aC5bN8mK3jL6pQ9rT2uV5wX8yZ1aC4bN7mK2jL5pQ8rT1uV4wX7yZ0aC3bN6mK1jL4pQ7rT0uV3wX6yZ9aC2bN5mK0jL3pQ6rS',
        projectId: '10000000-0000-4000-8000-000000000001',
        noteText: 'Riel de cámara dolly sobre piso de basalto pulido. Requiere difusor 12x12 en ventanal poniente.',
        category: 'Grip / Cámara',
        author: 'Gaffer Principal',
        updatedAt: 'Ayer, 16:15 PM',
        clicksCount: 289,
        likesCount: 72,
        replies: [
          {
            id: 'rep-2',
            author: 'Equipo Grip',
            role: 'Producción',
            message: 'Llevamos protección especial de caucho para no rayar el basalto.',
            timestamp: 'Ayer, 18:00 PM'
          }
        ]
      },
      {
        mediaId: 'm-ped-6',
        locationName: 'Villa Moderna Pedregal',
        mediaTitle: 'Terraza Panorámica & Deck',
        mediaThumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxBkxaGoY0Jcgbk7niYgO-MpbH3j0yql5rjFHA9xMrb8CU0fKv4fDbIb-UlJY9zGnXTIOHF_pC37DIMFwoRBYtPhtBflRoNW4ju0GvvzZUu2Cmr8z1TdYqU_1I86FXvKLDGuiA0jeslQPz9GcQ831CiPinE3fheYgc0KjtulXdTfMtxbkWCk5W_fcNGB1t3bkIB4OTZ2X2BTiMVSvYTi7Yau9_Z3eVjO4EM35nVJXjl15TfjW3scsI',
        projectId: '10000000-0000-4000-8000-000000000001',
        noteText: 'Acometida trifásica 80A disponible a 12m. Posición idónea para generador silencioso 60kW en estacionamiento secundario.',
        category: 'Eléctrico / Planta',
        author: 'Director Técnico PFE',
        updatedAt: '2026-10-02',
        clicksCount: 176,
        likesCount: 59,
        replies: []
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
      localStorage.setItem('pfe_dp_notes_v2', JSON.stringify(notes));
    } catch {}
  }

  private initLikesAndClicks() {
    try {
      const savedLikes = localStorage.getItem('pfe_media_likes_v1');
      if (savedLikes) {
        const parsed = JSON.parse(savedLikes);
        this.mediaLikes.set(new Map(Object.entries(parsed)));
      }
    } catch {}
  }

  private persistLikes() {
    try {
      const obj: Record<string, number> = {};
      this.mediaLikes().forEach((v, k) => { obj[k] = v; });
      localStorage.setItem('pfe_media_likes_v1', JSON.stringify(obj));
    } catch {}
  }

  private initClientTokens() {
    try {
      const saved = localStorage.getItem('pfe_client_tokens_v1');
      if (saved) {
        this.clientTokens.set(JSON.parse(saved));
        return;
      }
    } catch {}

    const defaultTokens: ClientSessionToken[] = [
      {
        token: 'CLI-2026-NETFLIX-01',
        projectId: '10000000-0000-4000-8000-000000000001',
        projectTitle: 'Campaña Global Verano 2026',
        clientName: 'Netflix Studios (Carlos Vera - DP)',
        role: 'Director de Fotografía (DP)',
        accessCode: 'LOC-2026-X',
        generatedAt: '01 Oct 2026, 11:20 AM',
        expiresAt: '15 Oct 2026',
        clicksCount: 42,
        fullUrl: `${window.location.origin}/p/10000000-0000-4000-8000-000000000001?code=LOC-2026-X&token=CLI-2026-NETFLIX-01&role=DP`
      },
      {
        token: 'CLI-8821-AMAZON-02',
        projectId: '20000000-0000-4000-8000-000000000002',
        projectTitle: 'Campaña Primavera-Costa 2026',
        clientName: 'Amazon Prime (Sofía Arteaga - Dir. Arte)',
        role: 'Director de Arte',
        accessCode: 'LOC-8821',
        generatedAt: '02 Oct 2026, 16:45 PM',
        expiresAt: '20 Oct 2026',
        clicksCount: 28,
        fullUrl: `${window.location.origin}/p/20000000-0000-4000-8000-000000000002?code=LOC-8821&token=CLI-8821-AMAZON-02&role=Arte`
      },
      {
        token: 'CLI-AUTO-BBDO-03',
        projectId: '40000000-0000-4000-8000-000000000004',
        projectTitle: 'Lanzamiento Automotriz Eléctrico 2026',
        clientName: 'Agencia BBDO (Productor Ejecutivo)',
        role: 'Productor Ejecutivo',
        accessCode: 'LOC-AUTO-99',
        generatedAt: '03 Oct 2026, 08:10 AM',
        expiresAt: '30 Oct 2026',
        clicksCount: 64,
        fullUrl: `${window.location.origin}/p/40000000-0000-4000-8000-000000000004?code=LOC-AUTO-99&token=CLI-AUTO-BBDO-03&role=Productor`
      }
    ];

    this.clientTokens.set(defaultTokens);
    this.persistClientTokens(defaultTokens);
  }

  private persistClientTokens(tokens: ClientSessionToken[]) {
    try {
      localStorage.setItem('pfe_client_tokens_v1', JSON.stringify(tokens));
    } catch {}
  }

  createClientToken(data: {
    projectId: string;
    projectTitle: string;
    clientName: string;
    role: string;
    accessCode: string;
    expiresInDays: number;
  }): ClientSessionToken {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const cleanPrefix = data.clientName.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase();
    const token = `CLI-${cleanPrefix}-${randomHex}`;

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + (data.expiresInDays || 15));

    const fullUrl = `${window.location.origin}/p/${data.projectId}?code=${data.accessCode}&token=${token}&role=${encodeURIComponent(data.role)}&client=${encodeURIComponent(data.clientName)}`;

    const newToken: ClientSessionToken = {
      token,
      projectId: data.projectId,
      projectTitle: data.projectTitle,
      clientName: data.clientName,
      role: data.role,
      accessCode: data.accessCode,
      generatedAt: new Date().toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      expiresAt: expDate.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }),
      clicksCount: 0,
      fullUrl
    };

    const current = [newToken, ...this.clientTokens()];
    this.clientTokens.set(current);
    this.persistClientTokens(current);
    this.triggerToast(`Token ${token} generado para ${data.clientName}.`);
    return newToken;
  }

  revokeClientToken(token: string) {
    const filtered = this.clientTokens().filter(t => t.token !== token);
    this.clientTokens.set(filtered);
    this.persistClientTokens(filtered);
    this.triggerToast(`Token ${token} revocado.`);
  }

  // Métricas de Clics
  recordMediaClick(mediaId: string) {
    const current = new Map(this.mediaClicks());
    const count = (current.get(mediaId) || 0) + 1;
    current.set(mediaId, count);
    this.mediaClicks.set(current);
  }

  getClicks(mediaId: string): number {
    return this.mediaClicks().get(mediaId) || 0;
  }

  // Métricas de Likes / Selecciones y Regla de 1 Desmarcado por Sesión
  getLikes(mediaId: string): number {
    return this.mediaLikes().get(mediaId) || 50;
  }

  private getSessionUnfavoritedSet(): Set<string> {
    try {
      const data = sessionStorage.getItem('pfe_session_unfavorited_cards');
      if (data) {
        return new Set(JSON.parse(data));
      }
    } catch {}
    return new Set<string>();
  }

  private saveSessionUnfavoritedSet(set: Set<string>) {
    try {
      sessionStorage.setItem('pfe_session_unfavorited_cards', JSON.stringify(Array.from(set)));
    } catch {}
  }

  hasSessionUnfavorited(mediaId: string): boolean {
    return this.getSessionUnfavoritedSet().has(mediaId);
  }

  toggleFavoriteWithSessionRule(mediaId: string, itemName?: string): { success: boolean; newLikes: number; isFav: boolean; message: string } {
    const favSet = new Set(this.selectedMediaIds());
    const currentlySelected = favSet.has(mediaId);
    const likesMap = new Map(this.mediaLikes());
    let currentLikes = likesMap.get(mediaId) || 50;

    if (currentlySelected) {
      // Intenta desmarcar
      const sessionUnfavSet = this.getSessionUnfavoritedSet();
      if (sessionUnfavSet.has(mediaId)) {
        // Regla: Solo puede desmarcar 1 sola vez por tarjeta por sesión
        this.triggerToast(`Límite por sesión: Ya has retirado tu voto para esta locación en esta sesión. Se mantiene en ${currentLikes} votos.`, 'warning');
        return {
          success: false,
          newLikes: currentLikes,
          isFav: true,
          message: 'Límite alcanzado'
        };
      }

      // Primera vez que desmarca en esta sesión -> baja 1 punto pero la tarjeta no desaparece
      sessionUnfavSet.add(mediaId);
      this.saveSessionUnfavoritedSet(sessionUnfavSet);

      currentLikes = Math.max(0, currentLikes - 1);
      likesMap.set(mediaId, currentLikes);
      this.mediaLikes.set(likesMap);
      this.persistLikes();

      favSet.delete(mediaId);
      this.selectedMediaIds.set(favSet);

      this.triggerToast(`Selección retirada (-1 voto). Quedan ${currentLikes} votos globales registrados para este activo.`);
      this.syncWithSupabase(mediaId, false);

      return {
        success: true,
        newLikes: currentLikes,
        isFav: false,
        message: 'Desmarcado registrado (-1)'
      };
    } else {
      // Vuelve a marcar / Me gusta (+1)
      currentLikes = currentLikes + 1;
      likesMap.set(mediaId, currentLikes);
      this.mediaLikes.set(likesMap);
      this.persistLikes();

      favSet.add(mediaId);
      this.selectedMediaIds.set(favSet);

      this.triggerToast(`Añadido a selección compartida (+1 voto). Ahora cuenta con ${currentLikes} selecciones de clientes.`);
      this.syncWithSupabase(mediaId, true);

      return {
        success: true,
        newLikes: currentLikes,
        isFav: true,
        message: 'Selección sumada (+1)'
      };
    }
  }

  // Notas de DP
  getNote(mediaId: string): DpNote | undefined {
    return this.dpNotes().get(mediaId);
  }

  hasNote(mediaId: string): boolean {
    return this.dpNotes().has(mediaId);
  }

  getAllNotes(): DpNote[] {
    return Array.from(this.dpNotes().values());
  }

  saveNote(
    mediaId: string, 
    noteText: string, 
    category: string = 'General', 
    author: string = 'Director de Fotografía (DP)',
    extraContext?: { locationName?: string; mediaTitle?: string; mediaThumbnailUrl?: string; projectId?: string }
  ): void {
    if (!noteText || !noteText.trim()) return;

    const currentMap = new Map(this.dpNotes());
    const existing = currentMap.get(mediaId);

    const newNote: DpNote = {
      mediaId,
      locationName: extraContext?.locationName || existing?.locationName || 'Locación Aprobada',
      mediaTitle: extraContext?.mediaTitle || existing?.mediaTitle || 'Encuadre Técnico',
      mediaThumbnailUrl: extraContext?.mediaThumbnailUrl || existing?.mediaThumbnailUrl || '',
      projectId: extraContext?.projectId || existing?.projectId || '',
      noteText: noteText.trim(),
      category: category || 'General',
      author: author.trim() || 'Director de Fotografía (DP)',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replies: existing?.replies || [],
      clicksCount: this.getClicks(mediaId),
      likesCount: this.getLikes(mediaId),
      resolved: existing?.resolved || false
    };

    currentMap.set(mediaId, newNote);
    this.dpNotes.set(currentMap);
    this.persistNotes(Array.from(currentMap.values()));

    this.triggerToast('Nota técnica de DP guardada con éxito.');
  }

  addReplyToNote(mediaId: string, message: string, author: string = 'Admin PFE', role: 'Admin' | 'DP' | 'Producción' | 'Arte' = 'Admin'): boolean {
    if (!message || !message.trim()) return false;

    const currentMap = new Map(this.dpNotes());
    const note = currentMap.get(mediaId);
    if (!note) return false;

    const reply: DpNoteReply = {
      id: 'rep-' + Date.now(),
      author,
      role,
      message: message.trim(),
      timestamp: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    note.replies = [...(note.replies || []), reply];
    currentMap.set(mediaId, note);
    this.dpNotes.set(currentMap);
    this.persistNotes(Array.from(currentMap.values()));

    this.triggerToast(`Respuesta enviada como ${author}.`);
    return true;
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
    const res = this.toggleFavoriteWithSessionRule(mediaId, itemName);
    return res.isFav;
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
    }, 3800);
  }

  private async syncWithSupabase(mediaId: string, isFav: boolean) {
    try {
      const channel = this.supabase.client.channel('public:favorites');
      await channel.send({
        type: 'broadcast',
        event: 'favorite_toggled',
        payload: { mediaId, isFav, timestamp: new Date().toISOString() }
      });
    } catch {}
  }
}
