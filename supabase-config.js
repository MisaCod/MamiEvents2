/* ============================================================
   MAMI EVENTS — Supabase Configuration
   ============================================================
   
   PASOS PARA ACTIVAR (5 minutos):
   ================================
   1. Ve a https://supabase.com y entra con mamievents752@gmail.com
   2. Clic en "New project" → Nombre: mami-events → crea contraseña DB
   3. Espera ~2 min que cargue el proyecto
   4. Ve a Settings → API y copia:
      - Project URL  → pégala en SUPABASE_URL
      - anon/public key → pégala en SUPABASE_ANON_KEY
   5. Ve a SQL Editor y ejecuta el script de abajo para crear las tablas
   6. Ve a Storage → New bucket → nombre: "album-photos" → marca "Public bucket"
   7. Ve a Authentication → Users → "Invite user" → pon mamievents752@gmail.com
   ============================================================

   SQL PARA CREAR LAS TABLAS (pégalo en SQL Editor de Supabase):
   ==============================================================

   -- Tabla de álbumes
   CREATE TABLE albums (
     id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title       TEXT NOT NULL,
     type        TEXT NOT NULL,
     date        TEXT,
     cover_image TEXT,
     photo_count INT DEFAULT 0,
     is_published BOOLEAN DEFAULT true,
     is_private  BOOLEAN DEFAULT false,
     pin         TEXT,
     created_at  TIMESTAMPTZ DEFAULT NOW()
   );

   -- Tabla de fotos
   CREATE TABLE photos (
     id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     album_id  UUID REFERENCES albums(id) ON DELETE CASCADE,
     url       TEXT NOT NULL,
     caption   TEXT,
     file_name TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Tabla de proveedores
   CREATE TABLE suppliers (
     id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     nombre        TEXT NOT NULL,
     empresa       TEXT,
     tipo_servicio TEXT NOT NULL,
     telefono      TEXT NOT NULL,
     portafolio    TEXT,
     mensaje       TEXT,
     created_at    TIMESTAMPTZ DEFAULT NOW()
   );

   -- Permisos RLS (Row Level Security)
   ALTER TABLE albums   ENABLE ROW LEVEL SECURITY;
   ALTER TABLE photos   ENABLE ROW LEVEL SECURITY;
   ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

   -- Cualquiera puede leer álbumes publicados
   CREATE POLICY "public_read_albums" ON albums
     FOR SELECT USING (is_published = true);

   -- Solo autenticados pueden escribir álbumes
   CREATE POLICY "auth_write_albums" ON albums
     FOR ALL USING (auth.role() = 'authenticated');

   -- Cualquiera puede leer fotos
   CREATE POLICY "public_read_photos" ON photos
     FOR SELECT USING (true);

   -- Solo autenticados pueden escribir fotos
   CREATE POLICY "auth_write_photos" ON photos
     FOR ALL USING (auth.role() = 'authenticated');

   -- Cualquiera puede postularse como proveedor
   CREATE POLICY "public_insert_suppliers" ON suppliers
     FOR INSERT WITH CHECK (true);

   -- Solo autenticados pueden leer proveedores
   CREATE POLICY "auth_read_suppliers" ON suppliers
     FOR SELECT USING (auth.role() = 'authenticated');

   ============================================================ */

// ============================================================
// REEMPLAZA ESTOS DOS VALORES CON LOS DE TU PROYECTO
// ============================================================
const SUPABASE_URL     = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';

// ============================================================
// ESTADO — ¿Está Supabase configurado?
// ============================================================
const SUPABASE_READY = (
  SUPABASE_URL !== 'https://TU_PROYECTO.supabase.co' &&
  SUPABASE_ANON_KEY !== 'TU_ANON_KEY_AQUI'
);

// ============================================================
// INICIALIZAR CLIENTE (solo si está configurado)
// ============================================================
if (SUPABASE_READY) {
  // Cargar el SDK de Supabase desde CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = () => initSupabase();
  document.head.appendChild(script);
} else {
  console.warn(
    '%c Supabase: MODO DEMO %c\nConfigure supabase-config.js con tu URL y clave para activar la base de datos real.\nLos datos se guardan en localStorage mientras tanto.',
    'background: #C89E6B; color: #1A1A18; padding: 3px 8px; border-radius: 4px; font-weight: bold;',
    'color: #7A7570;'
  );
}

// ============================================================
// INICIALIZACIÓN PRINCIPAL
// ============================================================
function initSupabase() {
  const { createClient } = window.supabase;
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Exponer cliente globalmente para script.js y admin.js
  window.supabaseClient = client;

  // Cargar álbumes públicos para la galería
  loadPublicAlbums(client);
}

// ============================================================
// CARGAR ÁLBUMES PÚBLICOS (galería del sitio)
// ============================================================
async function loadPublicAlbums(client) {
  try {
    // Cargar álbumes
    const { data: albums, error } = await client
      .from('albums')
      .select('*, photos(*)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (albums && albums.length > 0) {
      // Transformar al formato que usa script.js
      const formatted = albums.map(album => ({
        id:          album.id,
        title:       album.title,
        type:        album.type,
        date:        formatSupabaseDate(album.date),
        coverImage:  album.cover_image || (album.photos?.[0]?.url) || 'assets/gallery_quincea.png',
        photoCount:  album.photo_count || album.photos?.length || 0,
        isPrivate:   album.is_private,
        isPublished: album.is_published,
        pin:         album.pin,
        photos:      (album.photos || []).map(p => ({
          url:     p.url,
          caption: p.caption || album.title,
          name:    p.file_name || 'foto.jpg'
        }))
      }));

      // Llamar al hook de script.js
      if (typeof window.loadAlbumsFromSupabase === 'function') {
        window.loadAlbumsFromSupabase(formatted);
      }
    }
  } catch (err) {
    console.warn('Error cargando álbumes desde Supabase:', err.message);
    // Fallback: usa datos demo de script.js automáticamente
  }
}

// ============================================================
// GUARDAR PROVEEDOR en Supabase
// ============================================================
window.supabaseSaveSupplier = async function(data) {
  if (!window.supabaseClient) return;
  const { error } = await window.supabaseClient
    .from('suppliers')
    .insert([{
      nombre:        data.nombre,
      empresa:       data.empresa || null,
      tipo_servicio: data.tipo_servicio,
      telefono:      data.telefono,
      portafolio:    data.portafolio || null,
      mensaje:       data.mensaje || null
    }]);
  if (error) throw error;
};

// ============================================================
// HELPER: Formatear fecha
// ============================================================
function formatSupabaseDate(dateStr) {
  if (!dateStr) return '';
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const [y, m] = dateStr.split('-');
  return m ? `${months[parseInt(m) - 1]} ${y}` : dateStr;
}
