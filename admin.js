/* ============================================================
   MAMI EVENTS — Admin Panel JavaScript
   Handles: Login (Supabase Auth), Panel nav, Albums CRUD,
            Photo upload → Supabase Storage, Suppliers view
   Backend: Supabase (cuando está configurado)
            localStorage (modo demo sin configurar)
   ============================================================ */

'use strict';

// ============================================================
// CREDENCIALES DEMO (solo para modo sin Supabase)
// Cuando Supabase esté activo, el login real usa Auth de Supabase
// ============================================================
const DEMO_CREDENTIALS = {
  email: 'mamievents752@gmail.com',
  password: 'Mami.events77'
};

// ============================================================
// ESTADO
// ============================================================
let currentPanel = 'dashboard';
let albums = JSON.parse(localStorage.getItem('mamiAdminAlbums') || 'null') || getDemoAlbums();
let pendingPhotos = [];

// ============================================================
// UTILS
// ============================================================
function saveAlbumsLocal() {
  try {
    localStorage.setItem('mamiAdminAlbums', JSON.stringify(albums));
  } catch(e) { /* localStorage lleno */ }
}

// type: 'ok' | 'error' | 'warn' | 'party' | 'trash' | 'download' | 'share'
function showAdminToast(msg, type = 'ok', ms = 3000) {
  const t = document.getElementById('adminToast');
  const iconMap = { ok: 'check', error: 'x', warn: 'warn', party: 'party', trash: 'trash', download: 'download', share: 'share' };
  document.getElementById('adminToastMsg').textContent = msg;
  document.getElementById('adminToastIcon').innerHTML = window.MAMI_ICONS ? MAMI_ICONS[iconMap[type] || 'check'] : '';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
}

function formatDate(monthStr) {
  if (!monthStr) return '—';
  const [y, m] = monthStr.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return m ? `${months[parseInt(m) - 1]} ${y}` : monthStr;
}

function getSupabase() {
  return window.supabaseClient || null;
}

function isSupabaseReady() {
  return !!window.supabaseClient;
}

// ============================================================
// ALBUMS DEMO (usados cuando Supabase no está configurado)
// ============================================================
function getDemoAlbums() {
  return [
    {
      id: 'album-001',
      title: 'Quinceañera de Valentina',
      type: 'quinceañera',
      date: '2025-06',
      coverImage: 'assets/gallery_quincea.jpg',
      photoCount: 48,
      isPrivate: false,
      isPublished: true,
      pin: null,
      photos: [
        { url: 'assets/gallery_quincea.jpg', caption: 'Quinceañera', name: 'foto1.jpg' },
        { url: 'assets/gallery_wedding.jpg', caption: 'Arreglos', name: 'foto2.jpg' }
      ]
    },
    {
      id: 'album-002',
      title: 'Boda de Andrea & Luis',
      type: 'boda',
      date: '2025-05',
      coverImage: 'assets/gallery_wedding.jpg',
      photoCount: 120,
      isPrivate: false,
      isPublished: true,
      pin: null,
      photos: [
        { url: 'assets/gallery_wedding.jpg', caption: 'Boda', name: 'foto1.jpg' },
        { url: 'assets/gallery_corporate.jpg', caption: 'Mesa', name: 'foto2.jpg' }
      ]
    },
    {
      id: 'album-003',
      title: 'Gala Corporativa Tech 2025',
      type: 'corporativo',
      date: '2025-04',
      coverImage: 'assets/gallery_corporate.jpg',
      photoCount: 35,
      isPrivate: false,
      isPublished: true,
      pin: null,
      photos: [{ url: 'assets/gallery_corporate.jpg', caption: 'Gala', name: 'foto1.jpg' }]
    },
    {
      id: 'album-004',
      title: 'Quinceañera de Isabella',
      type: 'quinceañera',
      date: '2025-02',
      coverImage: 'assets/gallery_quincea.jpg',
      photoCount: 89,
      isPrivate: true,
      isPublished: true,
      pin: '1234',
      photos: [{ url: 'assets/gallery_quincea.jpg', caption: 'Isabella', name: 'foto1.jpg' }]
    }
  ];
}

// ============================================================
// LOGIN
// ============================================================
const loginScreen  = document.getElementById('loginScreen');
const adminLayout  = document.getElementById('adminLayout');
const loginForm    = document.getElementById('loginForm');
const loginError   = document.getElementById('loginError');
const loginBtn     = document.getElementById('loginBtn');

function checkExistingSession() {
  const session = sessionStorage.getItem('mamiAdminLoggedIn');
  if (session === 'true') showAdminPanel(sessionStorage.getItem('mamiAdminEmail'));
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  loginBtn.disabled = true;
  document.getElementById('loginBtnText').textContent = 'Verificando...';
  loginError.style.display = 'none';

  let success = false;

  // --- Intento 1: Supabase Auth (cuando está configurado) ---
  if (isSupabaseReady()) {
    try {
      const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (!error && data.user) success = true;
    } catch (err) { /* sigue al demo */ }
  }

  // --- Intento 2: Demo credentials (modo sin Supabase) ---
  if (!success) {
    await new Promise(r => setTimeout(r, 600)); // simula latencia
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      success = true;
    }
  }

  if (success) {
    sessionStorage.setItem('mamiAdminLoggedIn', 'true');
    sessionStorage.setItem('mamiAdminEmail', email);
    showAdminPanel(email);
  } else {
    loginError.style.display = 'block';
    loginBtn.disabled = false;
    document.getElementById('loginBtnText').textContent = 'Ingresar al panel';
  }
});

function showAdminPanel(email) {
  loginScreen.style.display = 'none';
  adminLayout.classList.add('visible');

  const userEmail = email || sessionStorage.getItem('mamiAdminEmail') || DEMO_CREDENTIALS.email;
  document.getElementById('userEmail').textContent = userEmail;
  document.getElementById('userAvatar').textContent = userEmail.charAt(0).toUpperCase();

  // Si Supabase está listo, cargar álbumes desde DB
  if (isSupabaseReady()) loadAlbumsFromDB();

  initDashboard();
  renderAlbumsTable('dashboardAlbumsBody', albums.slice(0, 5));
  renderAlbumsTable('fullAlbumsBody', albums);
  updateBadges();
  loadSuppliers();
}

// ============================================================
// LOGOUT
// ============================================================
document.getElementById('logoutBtn').addEventListener('click', async () => {
  if (isSupabaseReady()) {
    await getSupabase().auth.signOut();
  }
  sessionStorage.removeItem('mamiAdminLoggedIn');
  sessionStorage.removeItem('mamiAdminEmail');
  loginScreen.style.display = '';
  adminLayout.classList.remove('visible');
  loginForm.reset();
});

// ============================================================
// CARGAR ÁLBUMES DESDE SUPABASE
// ============================================================
async function loadAlbumsFromDB() {
  try {
    const { data, error } = await getSupabase()
      .from('albums')
      .select('*, photos(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      albums = data.map(a => ({
        id:          a.id,
        title:       a.title,
        type:        a.type,
        date:        a.date || '',
        coverImage:  a.cover_image || (a.photos?.[0]?.url) || 'assets/gallery_quincea.jpg',
        photoCount:  a.photo_count || a.photos?.length || 0,
        isPrivate:   a.is_private,
        isPublished: a.is_published,
        pin:         a.pin,
        photos:      (a.photos || []).map(p => ({
          url:     p.url,
          caption: p.caption || a.title,
          name:    p.file_name || 'foto.jpg'
        }))
      }));

      renderAlbumsTable('dashboardAlbumsBody', albums.slice(0, 5));
      renderAlbumsTable('fullAlbumsBody', albums);
      initDashboard();
      updateBadges();
    }
  } catch (err) {
    console.warn('Error cargando álbumes:', err.message);
  }
}

// ============================================================
// PANEL NAVIGATION
// ============================================================
const adminSidebar = document.getElementById('adminSidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => adminSidebar.classList.toggle('open'));
}

document.querySelectorAll('.sidebar-link[data-panel]').forEach(link => {
  link.addEventListener('click', () => {
    switchPanel(link.dataset.panel);
    adminSidebar.classList.remove('open'); // cerrar en móvil
  });
});

document.getElementById('seeAllAlbums').addEventListener('click', () => switchPanel('albums'));
document.getElementById('newAlbumTopBtn').addEventListener('click', openNewAlbumModal);
document.getElementById('newAlbumBtn2').addEventListener('click', openNewAlbumModal);

function switchPanel(panelId) {
  currentPanel = panelId;
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`panel${panelId.charAt(0).toUpperCase() + panelId.slice(1)}`);
  if (target) target.classList.add('active');
  document.querySelectorAll('.sidebar-link[data-panel]').forEach(l => {
    l.classList.toggle('active', l.dataset.panel === panelId);
  });
  const titles = { dashboard: 'Dashboard', albums: 'Álbumes de Fotos', upload: 'Subir Fotos', suppliers: 'Proveedores' };
  document.getElementById('topbarTitle').textContent = titles[panelId] || 'Admin';
}

// ============================================================
// DASHBOARD — Stats
// ============================================================
function initDashboard() {
  const published = albums.filter(a => a.isPublished).length;
  const totalPhotos = albums.reduce((sum, a) => sum + (a.photoCount || a.photos?.length || 0), 0);
  const privateAlbums = albums.filter(a => a.isPrivate).length;
  const suppliers = JSON.parse(localStorage.getItem('mamiEvents_suppliers') || '[]');

  document.getElementById('statAlbums').textContent   = published;
  document.getElementById('statPhotos').textContent   = totalPhotos;
  document.getElementById('statSuppliers').textContent = suppliers.length;
  document.getElementById('statPrivate').textContent  = privateAlbums;
}

function updateBadges() {
  document.getElementById('albumCountBadge').textContent = albums.length;
  const suppliers = JSON.parse(localStorage.getItem('mamiEvents_suppliers') || '[]');
  document.getElementById('supplierCountBadge').textContent = suppliers.length;
}

// ============================================================
// ALBUMS TABLE
// ============================================================
function renderAlbumsTable(tbodyId, albumList) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = '';

  albumList.forEach(album => {
    const statusBadge = album.isPrivate
      ? `<span class="status-badge private">Privado · PIN ${album.pin || '—'}</span>`
      : album.isPublished
        ? '<span class="status-badge published">Publicado</span>'
        : '<span class="status-badge draft">Borrador</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img class="album-thumb-small" src="${album.coverImage}" alt="${album.title}" /></td>
      <td><strong style="font-size:.9rem;color:var(--forest);">${album.title}</strong></td>
      <td style="text-transform:capitalize;font-size:.85rem;color:var(--gray-soft);">${album.type}</td>
      <td style="font-size:.85rem;color:var(--gray-soft);">${formatDate(album.date)}</td>
      <td style="font-size:.85rem;color:var(--gray-soft);">${album.photoCount || album.photos?.length || 0}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="table-actions">
          <button class="icon-btn" title="Compartir con el cliente (copia link + PIN)" data-action="share" data-id="${album.id}">${MAMI_ICONS.share}</button>
          <button class="icon-btn" title="Subir fotos" data-action="upload" data-id="${album.id}">${MAMI_ICONS.upload}</button>
          <button class="icon-btn" title="Editar" data-action="edit" data-id="${album.id}">${MAMI_ICONS.pencil}</button>
          <button class="icon-btn" title="${album.isPublished ? 'Ocultar' : 'Publicar'}" data-action="toggle" data-id="${album.id}">${album.isPublished ? MAMI_ICONS.eye : MAMI_ICONS.eyeOff}</button>
          <button class="icon-btn delete" title="Eliminar" data-action="delete" data-id="${album.id}">${MAMI_ICONS.trash}</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handleAlbumAction(btn.dataset.action, btn.dataset.id));
  });
}

async function handleAlbumAction(action, albumId) {
  const album = albums.find(a => a.id === albumId);
  if (!album) return;

  switch (action) {
    case 'share': {
      const url = new URL(`galerias.html?album=${album.id}`, window.location.href).href;
      let msg = `¡Hola! Las fotos de "${album.title}" ya están listas ✨\n`;
      msg += `Entra aquí para verlas y descargarlas: ${url}`;
      if (album.isPrivate && album.pin) {
        msg += `\nTu PIN de acceso es: ${album.pin}`;
      }
      try {
        await navigator.clipboard.writeText(msg);
        showAdminToast('Mensaje copiado — pégalo en el WhatsApp del cliente', 'share', 4500);
      } catch (err) {
        window.prompt('Copia este mensaje para tu cliente:', msg);
      }
      break;
    }

    case 'upload':
      switchPanel('upload');
      populateAlbumSelector();
      document.getElementById('uploadAlbumSelect').value = albumId;
      toggleNewAlbumFields();
      break;

    case 'edit':
      openEditAlbumModal(album);
      break;

    case 'toggle':
      album.isPublished = !album.isPublished;

      if (isSupabaseReady()) {
        await getSupabase().from('albums')
          .update({ is_published: album.isPublished })
          .eq('id', albumId);
      }

      saveAlbumsLocal();
      renderAlbumsTable('dashboardAlbumsBody', albums.slice(0, 5));
      renderAlbumsTable('fullAlbumsBody', albums);
      initDashboard();
      showAdminToast(album.isPublished ? `"${album.title}" publicado` : `"${album.title}" ocultado`);
      break;

    case 'delete':
      if (!confirm(`¿Eliminar "${album.title}"? Esta acción no se puede deshacer.`)) return;

      if (isSupabaseReady()) {
        // Eliminar fotos del Storage
        const photoPaths = album.photos.map(p => {
          const parts = p.url.split('/album-photos/');
          return parts[1] || null;
        }).filter(Boolean);

        if (photoPaths.length > 0) {
          await getSupabase().storage.from('album-photos').remove(photoPaths);
        }
        // Eliminar registro (cascade borra fotos también)
        await getSupabase().from('albums').delete().eq('id', albumId);
      }

      albums = albums.filter(a => a.id !== albumId);
      saveAlbumsLocal();
      renderAlbumsTable('dashboardAlbumsBody', albums.slice(0, 5));
      renderAlbumsTable('fullAlbumsBody', albums);
      initDashboard();
      updateBadges();
      showAdminToast('Álbum eliminado', 'trash');
      break;
  }
}

// ============================================================
// MODAL — Nuevo / Editar Álbum
// ============================================================
const albumModal         = document.getElementById('albumModal');
const modalClose         = document.getElementById('modalClose');
const modalCancelBtn     = document.getElementById('modalCancelBtn');
const modalSaveBtn       = document.getElementById('modalSaveBtn');
const modalTogglePrivate = document.getElementById('modalTogglePrivate');
const modalPinField      = document.getElementById('modalPinField');

let editingAlbumId = null;

function openNewAlbumModal() {
  editingAlbumId = null;
  document.getElementById('modalTitle').textContent = 'Nuevo Álbum';
  document.getElementById('modalAlbumName').value = '';
  document.getElementById('modalAlbumType').value = 'quinceañera';
  document.getElementById('modalAlbumDate').value = '';
  document.getElementById('modalTogglePublish').checked = true;
  modalTogglePrivate.checked = false;
  document.getElementById('modalPinInput').value = '';
  modalPinField.style.display = 'none';
  albumModal.classList.add('active');
  document.getElementById('modalAlbumName').focus();
}

function openEditAlbumModal(album) {
  editingAlbumId = album.id;
  document.getElementById('modalTitle').textContent = 'Editar Álbum';
  document.getElementById('modalAlbumName').value = album.title;
  document.getElementById('modalAlbumType').value = album.type;
  document.getElementById('modalAlbumDate').value = album.date || '';
  document.getElementById('modalTogglePublish').checked = album.isPublished;
  modalTogglePrivate.checked = album.isPrivate;
  document.getElementById('modalPinInput').value = album.pin || '';
  modalPinField.style.display = album.isPrivate ? 'block' : 'none';
  albumModal.classList.add('active');
}

function closeAlbumModal() {
  albumModal.classList.remove('active');
  editingAlbumId = null;
}

modalClose.addEventListener('click', closeAlbumModal);
modalCancelBtn.addEventListener('click', closeAlbumModal);
albumModal.addEventListener('click', (e) => { if (e.target === albumModal) closeAlbumModal(); });
modalTogglePrivate.addEventListener('change', () => {
  modalPinField.style.display = modalTogglePrivate.checked ? 'block' : 'none';
});

modalSaveBtn.addEventListener('click', async () => {
  const name        = document.getElementById('modalAlbumName').value.trim();
  const type        = document.getElementById('modalAlbumType').value;
  const date        = document.getElementById('modalAlbumDate').value;
  const isPublished = document.getElementById('modalTogglePublish').checked;
  const isPrivate   = modalTogglePrivate.checked;
  const pin         = document.getElementById('modalPinInput').value.trim();

  if (!name) { showAdminToast('El nombre es obligatorio', 'warn'); return; }
  if (isPrivate && pin.length !== 4) { showAdminToast('El PIN debe tener 4 dígitos', 'warn'); return; }

  if (editingAlbumId) {
    const idx = albums.findIndex(a => a.id === editingAlbumId);
    if (idx >= 0) {
      albums[idx] = { ...albums[idx], title: name, type, date, isPublished, isPrivate, pin: isPrivate ? pin : null };

      if (isSupabaseReady()) {
        await getSupabase().from('albums').update({
          title: name, type, date, is_published: isPublished,
          is_private: isPrivate, pin: isPrivate ? pin : null
        }).eq('id', editingAlbumId);
      }

      showAdminToast('Álbum actualizado', 'ok');
    }
  } else {
    const newAlbum = {
      id:          'album_' + Date.now(),
      title:       name,
      type,
      date,
      coverImage:  'assets/gallery_quincea.jpg',
      photoCount:  0,
      isPublished,
      isPrivate,
      pin:         isPrivate ? pin : null,
      photos:      []
    };

    if (isSupabaseReady()) {
      const { data, error } = await getSupabase().from('albums').insert([{
        title: name, type, date, cover_image: newAlbum.coverImage,
        photo_count: 0, is_published: isPublished, is_private: isPrivate,
        pin: isPrivate ? pin : null
      }]).select().single();

      if (!error && data) newAlbum.id = data.id;
    }

    albums.unshift(newAlbum);
    populateAlbumSelector();
    showAdminToast(`Álbum "${name}" creado`, 'ok');
  }

  saveAlbumsLocal();
  renderAlbumsTable('dashboardAlbumsBody', albums.slice(0, 5));
  renderAlbumsTable('fullAlbumsBody', albums);
  initDashboard();
  updateBadges();
  closeAlbumModal();
});

// ============================================================
// UPLOAD PANEL
// ============================================================
const fileInput     = document.getElementById('fileInput');
const uploadZone    = document.getElementById('uploadZone');
const uploadProgress= document.getElementById('uploadProgress');
const photosPreview = document.getElementById('photosPreview');
const previewCard   = document.getElementById('previewCard');
const previewCount  = document.getElementById('previewCount');

document.getElementById('togglePrivate').addEventListener('change', function() {
  document.getElementById('pinField').style.display = this.checked ? 'block' : 'none';
});

const uploadAlbumSelect = document.getElementById('uploadAlbumSelect');
const newAlbumFields    = document.getElementById('newAlbumFields');

function populateAlbumSelector() {
  uploadAlbumSelect.innerHTML = '<option value="new">+ Crear nuevo álbum</option>';
  albums.forEach(album => {
    const opt = document.createElement('option');
    opt.value = album.id;
    opt.textContent = album.title;
    uploadAlbumSelect.appendChild(opt);
  });
}

function toggleNewAlbumFields() {
  newAlbumFields.style.display = uploadAlbumSelect.value === 'new' ? 'block' : 'none';
}

uploadAlbumSelect.addEventListener('change', toggleNewAlbumFields);
populateAlbumSelector();

// Drag & Drop
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  handleFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
});
fileInput.addEventListener('change', () => {
  handleFiles(Array.from(fileInput.files));
  fileInput.value = '';
});

function handleFiles(files) {
  if (files.length === 0) return;
  pendingPhotos = [...pendingPhotos, ...files];
  previewCard.style.display = 'block';
  uploadProgress.style.display = 'block';

  files.forEach((file, i) => {
    // Barra de progreso
    const item = document.createElement('div');
    item.className = 'progress-item';
    item.innerHTML = `
      <span class="progress-filename">${file.name}</span>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" id="bar_${i}"></div></div>
      <span class="progress-pct" id="pct_${i}">0%</span>
    `;
    uploadProgress.appendChild(item);

    const bar = item.querySelector('.progress-bar-fill');
    const pct = item.querySelector('.progress-pct');
    let progress = 0;
    const timer = setInterval(() => {
      progress += Math.random() * 20 + 8;
      if (progress >= 100) { progress = 100; clearInterval(timer); pct.textContent = '✓'; }
      else pct.textContent = Math.floor(progress) + '%';
      bar.style.width = Math.min(progress, 100) + '%';
    }, 120);

    // Preview
    const reader = new FileReader();
    const fileIdx = pendingPhotos.length - files.length + i;
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${e.target.result}" alt="${file.name}" />
        <div class="preview-delete" data-idx="${fileIdx}" title="Quitar">✕</div>
      `;
      photosPreview.appendChild(div);
      div.querySelector('.preview-delete').addEventListener('click', function() {
        pendingPhotos.splice(parseInt(this.dataset.idx), 1);
        div.remove();
        updatePreviewCount();
      });
    };
    reader.readAsDataURL(file);
  });

  updatePreviewCount();
}

function updatePreviewCount() {
  previewCount.textContent = photosPreview.querySelectorAll('.preview-item').length;
}

document.getElementById('clearPhotosBtn').addEventListener('click', () => {
  pendingPhotos = [];
  photosPreview.innerHTML = '';
  uploadProgress.innerHTML = '';
  previewCard.style.display = 'none';
  uploadProgress.style.display = 'none';
});

// ============================================================
// GUARDAR ÁLBUM — con Supabase Storage real o localStorage demo
// ============================================================
document.getElementById('saveAlbumBtn').addEventListener('click', async () => {
  const previewItems = photosPreview.querySelectorAll('.preview-item img');
  if (previewItems.length === 0) { showAdminToast('Agrega al menos una foto', 'warn'); return; }

  const saveBtn = document.getElementById('saveAlbumBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = 'Guardando…';

  let targetAlbum;
  let albumId;

  try {
    if (uploadAlbumSelect.value === 'new') {
      // --- Crear nuevo álbum ---
      const name = document.getElementById('newAlbumName').value.trim();
      if (!name) { showAdminToast('Escribe el nombre del evento', 'warn'); saveBtn.disabled = false; saveBtn.innerHTML = 'Guardar álbum'; return; }
      const isPrivate = document.getElementById('togglePrivate').checked;
      const pin = document.getElementById('albumPinInput').value.trim();
      if (isPrivate && pin.length !== 4) { showAdminToast('El PIN debe tener 4 dígitos', 'warn'); saveBtn.disabled = false; saveBtn.innerHTML = 'Guardar álbum'; return; }

      const newAlbumData = {
        title:       name,
        type:        document.getElementById('newAlbumType').value,
        date:        document.getElementById('newAlbumDate').value,
        cover_image: null,
        photo_count: previewItems.length,
        is_published:document.getElementById('togglePublish').checked,
        is_private:  isPrivate,
        pin:         isPrivate ? pin : null
      };

      albumId = 'album_' + Date.now();

      if (isSupabaseReady()) {
        const { data, error } = await getSupabase()
          .from('albums').insert([newAlbumData]).select().single();
        if (!error && data) albumId = data.id;
      }

      targetAlbum = { id: albumId, ...newAlbumData, coverImage: null, photoCount: 0, isPublished: newAlbumData.is_published, isPrivate: newAlbumData.is_private, photos: [] };
      albums.unshift(targetAlbum);
      populateAlbumSelector();

    } else {
      // --- Álbum existente ---
      albumId = uploadAlbumSelect.value;
      targetAlbum = albums.find(a => a.id === albumId);
      if (!targetAlbum) { showAdminToast('Álbum no encontrado', 'error'); return; }
    }

    // --- Subir fotos ---
    let coverUrl = targetAlbum.coverImage;
    const photoRecords = [];

    for (let i = 0; i < pendingPhotos.length; i++) {
      const file = pendingPhotos[i];
      const safeFileName = `${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const storagePath  = `${albumId}/${safeFileName}`;
      let photoUrl;

      if (isSupabaseReady()) {
        // Subir a Supabase Storage real
        const { error: uploadError } = await getSupabase().storage
          .from('album-photos')
          .upload(storagePath, file, { cacheControl: '3600', upsert: false });

        if (!uploadError) {
          const { data: urlData } = getSupabase().storage
            .from('album-photos').getPublicUrl(storagePath);
          photoUrl = urlData.publicUrl;
        } else {
          // Fallback: usar base64
          photoUrl = await fileToBase64(file);
        }
      } else {
        // Demo: usar base64 en localStorage
        photoUrl = await fileToBase64(file);
      }

      if (!coverUrl || i === 0) coverUrl = photoUrl;

      photoRecords.push({ url: photoUrl, caption: `${targetAlbum.title || ''} — foto ${i + 1}`, file_name: safeFileName });

      // Actualizar barra de progreso visual
      const bars = uploadProgress.querySelectorAll('.progress-bar-fill');
      if (bars[i]) bars[i].style.width = '100%';
    }

    // Guardar fotos en Supabase DB
    if (isSupabaseReady() && photoRecords.length > 0) {
      const photosToInsert = photoRecords.map(p => ({ album_id: albumId, ...p }));
      await getSupabase().from('photos').insert(photosToInsert);
      // Actualizar cover y photo_count del álbum
      await getSupabase().from('albums').update({
        cover_image: coverUrl,
        photo_count: (targetAlbum.photoCount || 0) + photoRecords.length
      }).eq('id', albumId);
    }

    // Actualizar estado local
    targetAlbum.coverImage = coverUrl;
    targetAlbum.photos = [...(targetAlbum.photos || []), ...photoRecords.map(p => ({ url: p.url, caption: p.caption, name: p.file_name }))];
    targetAlbum.photoCount = targetAlbum.photos.length;
    saveAlbumsLocal();

    renderAlbumsTable('dashboardAlbumsBody', albums.slice(0, 5));
    renderAlbumsTable('fullAlbumsBody', albums);
    initDashboard();
    updateBadges();

    // Limpiar
    pendingPhotos = [];
    photosPreview.innerHTML = '';
    uploadProgress.innerHTML = '';
    previewCard.style.display = 'none';
    uploadProgress.style.display = 'none';
    document.getElementById('newAlbumName').value = '';

    showAdminToast(`¡${photoRecords.length} fotos guardadas en "${targetAlbum.title}"!`, 'party', 4000);

  } catch (err) {
    console.error('Error guardando álbum:', err);
    showAdminToast('Error al guardar. Revisa la consola.', 'error', 4000);
  }

  saveBtn.disabled = false;
  saveBtn.innerHTML = 'Guardar álbum';
});

// Convertir archivo a base64 (modo demo sin Supabase)
function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// ============================================================
// PROVEEDORES
// ============================================================
async function loadSuppliers() {
  let suppliers = [];

  // Cargar desde Supabase si está disponible
  if (isSupabaseReady()) {
    try {
      const { data, error } = await getSupabase()
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        suppliers = data;
        // Sincronizar a localStorage como cache
        localStorage.setItem('mamiEvents_suppliers', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Error cargando proveedores:', err.message);
      suppliers = JSON.parse(localStorage.getItem('mamiEvents_suppliers') || '[]');
    }
  } else {
    suppliers = JSON.parse(localStorage.getItem('mamiEvents_suppliers') || '[]');
  }

  const grid  = document.getElementById('suppliersAdminGrid');
  const noMsg = document.getElementById('noSuppliersMsg');
  grid.innerHTML = '';

  if (suppliers.length === 0) { noMsg.style.display = 'block'; return; }
  noMsg.style.display = 'none';

  suppliers.forEach(s => {
    const card = document.createElement('div');
    card.className = 'supplier-card-admin';
    const tipo = s.tipo_servicio || 'otro';
    card.innerHTML = `
      <div class="supplier-card-type">${tipo}</div>
      <div class="supplier-card-name">${s.nombre}</div>
      ${s.empresa ? `<div style="font-size:.82rem;color:var(--gray-soft);"><span class="sci">${MAMI_ICONS.building}</span> ${s.empresa}</div>` : ''}
      <div class="supplier-card-meta">
        <span><span class="sci">${MAMI_ICONS.phone}</span> ${s.telefono}</span>
        ${s.portafolio ? `<span><span class="sci">${MAMI_ICONS.link}</span> <a href="${s.portafolio}" target="_blank" rel="noopener" style="color:var(--terracotta);">Ver portafolio</a></span>` : ''}
        ${s.mensaje ? `<span style="margin-top:.25rem;font-style:italic;color:var(--gray-soft);">"${s.mensaje.slice(0,80)}${s.mensaje.length > 80 ? '...' : ''}"</span>` : ''}
      </div>
      <div style="font-size:.72rem;color:var(--gray-soft);margin-top:.25rem;">
        <span class="sci">${MAMI_ICONS.calendar}</span> ${s.created_at ? new Date(s.created_at).toLocaleDateString('es-VE') : '—'}
      </div>
    `;
    grid.appendChild(card);
  });

  document.getElementById('supplierCountBadge').textContent = suppliers.length;
  document.getElementById('statSuppliers').textContent = suppliers.length;
}

// Exportar CSV
document.getElementById('exportSuppliersBtn').addEventListener('click', () => {
  const suppliers = JSON.parse(localStorage.getItem('mamiEvents_suppliers') || '[]');
  if (suppliers.length === 0) { showAdminToast('No hay postulaciones para exportar', 'warn'); return; }

  const headers = ['Nombre','Empresa','Tipo Servicio','Teléfono','Portafolio','Mensaje','Fecha'];
  const rows = suppliers.map(s =>
    [s.nombre, s.empresa, s.tipo_servicio, s.telefono, s.portafolio, s.mensaje, s.created_at]
    .map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')
  );

  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `mami_events_proveedores_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  showAdminToast('CSV exportado', 'download');
});

// ============================================================
// KEYBOARD
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && albumModal.classList.contains('active')) closeAlbumModal();
});

// ============================================================
// INIT
// ============================================================
// Hidratar iconos estaticos <span data-icon="...">
if (window.MAMI_ICONS) {
  document.querySelectorAll('[data-icon]').forEach(el => {
    el.innerHTML = MAMI_ICONS[el.dataset.icon] || '';
  });
}

checkExistingSession();

console.log(
  '%c mami events admin %c\nModo: ' + (window.supabaseClient ? 'Supabase ✅' : 'Demo (localStorage) ⚠️'),
  'background: #2C4E3A; color: #C89E6B; padding: 4px 10px; border-radius: 4px; font-weight: bold;',
  'color: #CD7154;'
);
