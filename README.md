# PFE Locaciones — Plataforma de Gestión de Locaciones & Scouting Cinematográfico

Plataforma corporativa de preproducción y curaduría técnica de locaciones para productoras de cine, comerciales internacionales y series de televisión. Diseñada para operar bajo estrictos acuerdos de confidencialidad (NDA), aislamiento de proyectos, metadatos técnicos de Dirección de Fotografía (DP), logística de rodaje y geolocalización satelital independiente por proyecto.

---

## 🚀 Arquitectura & Tecnologías Principales

- **Frontend Core**: [Angular 19](https://angular.dev/) con arquitectura 100% **Standalone Components**, **Signals** reactivos y **Computed State**.
- **Backend & Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL con Row Level Security, Storage Buckets para WebP 4K / ProRes Proxy y WebSockets Realtime).
- **Estilos & Diseño UI**: Design System cinemático de alto contraste (Material Symbols, Tokens tipográficos y visuales corporativos PFE).
- **Control de Acceso**: Guardias de ruta (`ClientGuard`, `AdminGuard`), Tokens con expiración y aislamiento estricto de sesión en `sessionStorage`.

---

## 🔐 Modelo de Seguridad & Aislamiento Estricto por Proyecto

El sistema implementa un modelo de control de acceso corporativo diseñado para evitar filtraciones de propiedad intelectual y proteger material inédito:

### 1. Solo el Administrador puede Generar Enlaces
- **Restricción total para clientes**: Los usuarios normales/clientes **no tienen acceso a botones para generar o compartir enlaces**. 
- Todas las opciones de generación y copiado de enlaces están restringidas exclusivamente al Administrador autenticado en su panel de mando y en el visor de proyecto.

### 2. Flujo Forzado por Pantalla de Acreditación (Login)
- Cuando el Administrador genera y comparte un enlace para un cliente, el enlace apunta directamente a la pantalla de acreditación:
  ```
  https://plataforma.com/?project=<ID_PROYECTO>&code=<CODIGO_ACCESO>
  ```
- El cliente **nunca ingresa directamente a la galería sin autenticación**. Al abrir el enlace:
  1. Aterriza en la pantalla de login con el código y el nombre del proyecto precargados.
  2. Revisa el aviso de confidencialidad (NDA).
  3. Hace clic en **"Ingresar a la Galería"** para validar su acreditación e iniciar su sesión segura.

### 3. Aislamiento Estricto y Bloqueo de Otros Proyectos
- Una vez acreditado, la sesión del cliente queda ligada **única y exclusivamente al proyecto asignado**:
  - **Selector de Proyectos**: Cuando el cliente abre el menú de proyectos en la cabecera, **los demás proyectos aparecen bloqueados** con icono de candado (`lock`) y la etiqueta `"Bloqueado • Requiere NDA específico"`. Al intentar pulsar sobre ellos, el sistema muestra una notificación de acceso denegado.
  - **Protección de Navegación por URL**: Si el cliente intenta alterar la dirección del navegador hacia `/p/<otro-proyecto>`, el `ClientGuard` intercepta la petición, verifica que el ID no corresponde a su sesión autorizada, bloquea el acceso y lo redirige a la pantalla de login con aviso de restricción.

---

## 🗺️ Mapas y Logística de Rodaje Diferenciados por Proyecto

Cada producción audiovisual requiere condiciones geográficas, viales y eléctricas distintas. PFE Locaciones permite configurar un mapa independiente para cada proyecto:

### Configuración al Crear y Editar Proyectos
- **Presets Geográficos Rápidos**:
  - **CDMX Sur**: Jardines del Pedregal & San Telmo (Zona volcánica, residencias modernas).
  - **Oaxaca Costa**: Puerto Escondido, Zicatela & Mazunte (Costa Esmeralda).
  - **CDMX Polanco**: Polanco, Mansiones Reforma & Bosque de Chapultepec.
  - **Valle de Bravo**: Circuito automotriz, autopistas y pistas de alta velocidad.
  - **Quito (Ecuador)**: Centro Histórico Patrimonial & Cumbayá.
  - **Guayaquil (Ecuador)**: Samborondón & Estuarios Náuticos.
  - **Medellín (Colombia)**: El Poblado & Llanogrande.
  - **Personalizado**: Coordenadas GPS latitud/longitud exactas y zoom configurable.
- **Ficha Logística Integrada**:
  - Radio de giro para camiones de rodaje de 10 Toneladas.
  - Capacidad de acometida eléctrica (Trifásica 80A, 125A o plantas generadoras móviles de 100kW+).
  - Enlace directo a Google Maps para cálculo de tiempos de traslado desde el Base Camp.

### Visualización para el Cliente
- Al hacer clic en el botón **"Mapa"** en la cabecera del proyecto, se despliega un radar/mapa satelital interactivo renderizado con las coordenadas, pines de locación, direcciones y notas logísticas exclusivas del proyecto activo.

---

## 🖼️ Gestión de Activos & Edición de Descripciones para Clientes

En el Editor de Proyecto (`/admin/projects/:id/edit`), el Administrador tiene control total sobre el material fotográfico y de video:

### Edición de Descripciones que ve el Cliente
- Cada tarjeta de imagen o video cuenta con un botón **"Editar"** (`edit_note`) en la grilla y en la barra de herramientas superior del activo.
- Al abrir el modal de edición, el Administrador puede definir:
  - **Título del Activo**: Nombre descriptivo del encuadre o área.
  - **Descripción Artística / Técnica (Visible para el Cliente)**: Notas detalladas sobre iluminación natural, dirección de arte, horario óptimo de sol (golden hour), capacidad acústica (Direct Sound) y accesibilidad.
  - **Especificaciones Técnicas**: Lente utilizado, resolución nativa (ej. `4K WebP • 24mm • f/2.8`).
- **Visibilidad Inmediata**:
  - En la galería del proyecto, cada tarjeta muestra la descripción debajo del título.
  - En el Lightbox inmersivo a pantalla completa, la descripción se destaca tanto en la cabecera como en la barra técnica inferior.

### Gestión de Medios & Storage
- Carga de imágenes con compresión y optimización automática a formato WebP 4K.
- Soporte para streaming de video en ProRes Proxy 422.
- Selección de portadas maestras por sección y recinto con un solo clic.

---

## 📊 Dashboard de Métricas & Chat Social de Notas DP

El panel de administración (`/admin`) incluye herramientas avanzadas de analítica y comunicación técnica:

1. **Dashboard de Métricas por Activo**:
   - Monitoreo en vivo de clics e inspecciones en alta resolución por cada fotografía y video.
   - Ranking de me gusta y veces guardado en selección.
2. **Centro de Notas DP & Chat Social**:
   - Visualización de todas las notas técnicas dejadas por Directores de Fotografía (DP) y Directores de Arte.
   - Categorización por especialidad: *Lentes / Óptica*, *Iluminación / Sol*, *Grip / Cámara*, *Eléctrico / Planta*, *Arte & Set*.
   - **Chat de Rodaje Bidireccional**: El Administrador puede responder a las notas directamente en el panel; las respuestas quedan visibles para el equipo de producción dentro del modal de nota.
3. **Generador de Tokens de Sesión**:
   - Emisión de tokens con límite de días (15, 30 o 45 días) y roles asignados (DP, Director de Arte, Productor Ejecutivo).
   - Revocación instantánea de credenciales en un clic.

---

## 🎬 Experiencia de Curaduría para el Cliente

- **Lightbox 4K Inmersivo**: Zoom multinivel (1x, 1.6x, 2.5x), navegación con teclado (flechas, `Z`, `F`, `Esc`) y modo pantalla completa nativo.
- **Descargas Multi-Resolución**: Descarga del master en 4K RAW (3840×2400), Full HD 1080p, WebP Proxy y ProRes Proxy 422.
- **Dossier Ejecutivo PDF**: Generación y descarga instantánea de fichas técnicas en formato para impresión o PDF ejecutivo.
- **Bandeja de Seleccionadas**: Gestión de favoritos del equipo con exportación a PDF y hoja de cálculo CSV con métricas de scouting.

---

## 🛠️ Instalación y Ejecución Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18+ o v20+
- [Angular CLI](https://angular.dev/) v19+ (`npm install -g @angular/cli`)

### Pasos de Instalación

1. **Clonar e ingresar al proyecto**:
   ```bash
   cd tcp-spa-galery/tcp-spa-locations
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm start
   # o bien: ng serve
   ```
   La aplicación se ejecutará en: `http://localhost:4200/`

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## 🔑 Credenciales de Acceso Demo

| Perfil | Ruta | Credenciales / Código |
|---|---|---|
| **Administrador Master** | `http://localhost:4200/admin/login` | **Usuario:** `admin@pfe-locations.com`<br>**Contraseña:** `Pf3_Adm!n_2026#`<br>*(Botón "Autocompletar Demo" disponible)* |
| **Cliente — Proyecto 1** | `http://localhost:4200/` | **Código:** `LOC-2026-X`<br>*(Campaña Global Verano 2026 • CDMX Sur)* |
| **Cliente — Proyecto 2** | `http://localhost:4200/` | **Código:** `LOC-8821`<br>*(Campaña Primavera-Costa 2026 • Oaxaca)* |
| **Cliente — Proyecto 3** | `http://localhost:4200/` | **Código:** `LOC-DARK-55`<br>*(Campaña High Fashion Nocturna • Polanco)* |
| **Cliente — Proyecto 4** | `http://localhost:4200/` | **Código:** `LOC-AUTO-99`<br>*(Lanzamiento Automotriz Eléctrico • Valle de Bravo)* |

---

## 📂 Estructura del Código Fuente

```
src/app/
├── components/
│   ├── pfe-header/          # Cabecera con selector de proyecto aislado, enlaces y mapa
│   ├── pfe-footer/          # Pie de página corporativo sobrio y formal
│   └── pfe-logo/            # Isotipo e imagotipo vectorial PFE
├── guards/
│   ├── admin.guard.ts       # Protección de rutas /admin
│   └── client.guard.ts      # Aislamiento estricto de proyecto para clientes
├── models/
│   ├── location.model.ts    # Modelo de recinto y locación
│   ├── media.model.ts       # Modelo de activo (título, descripción, specs, URLs)
│   └── project.model.ts     # Modelo de proyecto y ProjectMapConfig
├── pages/
│   ├── admin-dashboard/     # Mando central, creación de proyectos con mapa, analítica y tokens
│   ├── admin-login/         # Autenticación segura de administradores
│   ├── admin-project-editor/# Editor jerárquico, edición de descripciones y mapa
│   ├── client-access/       # Pantalla de login de acreditación y validación NDA
│   ├── project-view/        # Galería de locaciones para clientes y Lightbox 4K
│   └── selected-media/      # Bandeja de seleccionadas y exportación de reportes
└── services/
    ├── admin-auth.service.ts# Gestión de sesiones administrativas
    ├── favorites.service.ts # Métricas de clics, notas DP, chat y tokens
    ├── projects.service.ts  # Catálogo de proyectos, persistencia y mapas
    └── supabase.service.ts  # Conexión cliente a Supabase PostgreSQL y Storage
```

---

## ☁️ Despliegue en Producción (Vercel)

El proyecto incluye el archivo de configuración `vercel.json` optimizado para Angular SPA (Single Page Application):

1. **Vincular el Repositorio de GitHub**:
   - Ingresa a [Vercel](https://vercel.com/new).
   - Importa el repositorio: `https://github.com/Jeffers199817/tcp-spa-locations`.
2. **Configuración de Proyecto**:
   - **Framework Preset**: Angular
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/tcp-spa-locations/browser` *(ya viene configurado automáticamente en `vercel.json`)*
3. **Variables de Entorno (Opcional si usas Supabase)**:
   - Configura las variables de Supabase si deseas conectar a tu base de datos remota.
4. **Deploy**:
   - Haz clic en **Deploy**. ¡Tu plataforma estará lista en producción en menos de 2 minutos!

---

© 2026 PFE Locaciones — Producción y scouting de locaciones para cine y publicidad. Todos los derechos reservados.
