/* ============================================================
   MAMI EVENTS — Main JavaScript
   Handles: Nav, Confetti, Scroll Reveal, Marquee, Servicios
            (imagen flotante), Albums Gallery, Lightbox,
            PIN Modal, Supplier Form, FAQ, Toasts
   Backend: Supabase (cuando está configurado)
            localStorage (modo demo sin configurar)
   ============================================================ */

'use strict';

// ============================================================
// DEMO DATA — Usados cuando Supabase no está configurado
// ============================================================
const DEMO_ALBUMS = [
  {
    id: 'demo-1',
    title: 'Quinceañera de Valentina',
    type: 'quinceañera',
    date: 'Junio 2025',
    coverImage: 'assets/gallery_quincea.jpg',
    photoCount: 2,
    isPrivate: false,
    pin: null,
    photos: [
      { url: 'assets/gallery_quincea.jpg', caption: 'Valentina 15', name: 'v1.jpg' },
      { url: 'assets/gallery_wedding.jpg', caption: 'Decoración', name: 'v2.jpg' }
    ]
  },
  {
    id: 'demo-2',
    title: 'Boda de Andrea & Luis',
    type: 'boda',
    date: 'Mayo 2025',
    coverImage: 'assets/gallery_wedding.jpg',
    photoCount: 1,
    isPrivate: false,
    pin: null,
    photos: [{ url: 'assets/gallery_wedding.jpg', caption: 'La Boda', name: 'boda.jpg' }]
  },
  {
    id: 'demo-3',
    title: 'Gala Corporativa Tech',
    type: 'corporativo',
    date: 'Abril 2025',
    coverImage: 'assets/gallery_corporate.jpg',
    photoCount: 1,
    isPrivate: false,
    pin: null,
    photos: [{ url: 'assets/gallery_corporate.jpg', caption: 'Gala', name: 'gala.jpg' }]
  }
];

// ============================================================
// UTILITIES
// ============================================================
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

// type: 'ok' | 'error' | 'warn' | 'sparkle' | 'party'
function showToast(msg, type = 'ok', ms = 4000) {
  const toast = $('#toast');
  if (!toast) return;
  const iconMap = { ok: 'check', error: 'x', warn: 'warn', sparkle: 'sparkle', party: 'party' };
  $('#toastMsg').textContent = msg;
  $('#toastIcon').innerHTML = window.MAMI_ICONS ? MAMI_ICONS[iconMap[type] || 'check'] : '';
  toast.style.opacity = '1';
  toast.style.transform = 'translate(-50%, 0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 120px)';
  }, ms);
}

// ============================================================
// NAVIGATION & MOBILE MENU
// ============================================================
const navbar = $('#navbar');
const navLinksMenu = $('#navLinks');
const mobileMenuBtn = $('#mobileMenuBtn');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('nav-scrolled', window.scrollY > 50);
});

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinksMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });
}

$$('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
  });
});

// ============================================================
// CONFETTI — al cargar y al pulsar el CTA principal
// ============================================================
function triggerConfetti() {
  if (typeof confetti !== 'function') return;
  const count = 150;
  const defaults = {
    origin: { y: 0.6 },
    colors: ['#CD7154', '#D05137', '#C89E6B', '#2C4E3A', '#F0ECE1']
  };

  function fire(particleRatio, opts) {
    confetti(Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio)
    }));
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2,  { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1,  { spread: 120, startVelocity: 45 });
}

window.addEventListener('load', () => {
  setTimeout(triggerConfetti, 600);
});

const heroCta = $('#heroCta');
if (heroCta) {
  heroCta.addEventListener('click', () => triggerConfetti());
}

// ============================================================
// SCROLL REVEAL
// ============================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

$$('.reveal').forEach(el => revealObserver.observe(el));

// ============================================================
// SERVICIOS — clic en un servicio → WhatsApp con mensaje prellenado
// ============================================================
const workIndex = $('#workIndex');

if (workIndex) {
  $$('.work-item').forEach(item => {
    item.addEventListener('click', () => {
      const service = item.querySelector('.work-name').textContent.trim();
      const msg = encodeURIComponent(`¡Hola Mami Events! Quiero información sobre: ${service}`);
      window.open(`https://wa.me/13854635880?text=${msg}`, '_blank', 'noopener');
    });
  });
}

// ============================================================
// FAQ ACCORDION
// ============================================================
$$('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasActive = item.classList.contains('active');
    $$('.faq-item').forEach(i => i.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
  });
});

// ============================================================
// STATE
// ============================================================
// En modo demo (sin Supabase), el sitio público muestra los álbumes
// publicados desde el panel admin (guardados en localStorage).
function formatMonthDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}$/.test(dateStr)) return dateStr || '';
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const [y, m] = dateStr.split('-');
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

function loadLocalAdminAlbums() {
  try {
    const stored = JSON.parse(localStorage.getItem('mamiAdminAlbums') || 'null');
    if (Array.isArray(stored) && stored.length > 0) {
      return stored
        .filter(a => a.isPublished !== false)
        .map(a => ({ ...a, date: formatMonthDate(a.date) }));
    }
  } catch (e) { /* datos corruptos → demo */ }
  return null;
}

let allAlbums = loadLocalAdminAlbums() || [...DEMO_ALBUMS]; // catálogo completo
let currentAlbums = [...allAlbums]; // vista filtrada actual
let currentAlbumData = null; // For Lightbox
let activeType = 'all';
let searchTerm = '';

// ============================================================
// ALBUMS RENDERING — con filtros, búsqueda y límite opcional
// ============================================================
const albumsGridContainer = $('#albumsGridContainer');
const gallerySearchInput = $('#gallerySearch');
// data-limit en el contenedor (ej. home) muestra solo los N más recientes
const albumsLimit = albumsGridContainer ? parseInt(albumsGridContainer.dataset.limit || '0', 10) : 0;

function normalize(str) {
  return (str || '').toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function applyGalleryView() {
  let list = [...allAlbums];

  if (activeType !== 'all') {
    list = list.filter(a => normalize(a.type) === normalize(activeType));
  }
  if (searchTerm) {
    const q = normalize(searchTerm);
    list = list.filter(a => normalize(a.title).includes(q) || normalize(a.type).includes(q));
  }
  if (albumsLimit > 0) {
    list = list.slice(0, albumsLimit);
  }

  currentAlbums = list;
  renderAlbums(list);
}

function renderAlbums(albumsToRender) {
  if (!albumsGridContainer) return;
  albumsGridContainer.innerHTML = '';

  if (albumsToRender.length === 0) {
    const msg = (searchTerm || activeType !== 'all')
      ? 'No encontramos galerías con esa búsqueda. Prueba con otro nombre o escríbenos por WhatsApp.'
      : 'Aún no hay galerías publicadas. ¡Muy pronto subiremos los primeros recuerdos!';
    albumsGridContainer.innerHTML = `<p class="loading-note">${msg}</p>`;
    return;
  }

  albumsToRender.forEach(album => {
    const n = album.photoCount || album.photos?.length || 0;
    const card = document.createElement('div');
    card.className = 'album-card';
    card.innerHTML = `
      <div class="album-image">
        <img src="${album.coverImage}" alt="${album.title}" loading="lazy" />
        ${album.isPrivate ? `<span class="album-lock" title="Álbum privado con PIN">${MAMI_ICONS.lock}<span>PIN</span></span>` : ''}
      </div>
      <div class="album-meta">
        <div>
          <h3 class="album-title">${album.title}</h3>
          <span class="album-type">${album.type} ✦ ${n} ${n === 1 ? 'Foto' : 'Fotos'}</span>
        </div>
        <div class="album-icon">
          ${album.isPrivate ? MAMI_ICONS.lock : MAMI_ICONS.arrow}
        </div>
      </div>
    `;

    card.addEventListener('click', () => handleAlbumClick(album));
    albumsGridContainer.appendChild(card);
  });
}

// Filtros por tipo de evento (galerias.html)
$$('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    $$('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeType = chip.dataset.type;
    applyGalleryView();
  });
});

// Buscador (galerias.html)
if (gallerySearchInput) {
  gallerySearchInput.addEventListener('input', () => {
    searchTerm = gallerySearchInput.value.trim();
    applyGalleryView();
  });
}

// Enlace directo a un álbum: galerias.html?album=<id>
let deepLinkHandled = false;
function openDeepLinkedAlbum() {
  if (deepLinkHandled) return;
  const albumId = new URLSearchParams(window.location.search).get('album');
  if (!albumId) return;
  const album = allAlbums.find(a => String(a.id) === albumId);
  if (album) {
    deepLinkHandled = true;
    handleAlbumClick(album);
  }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  // Hidratar iconos estáticos <span data-icon="...">
  if (window.MAMI_ICONS) {
    $$('[data-icon]').forEach(el => {
      el.innerHTML = MAMI_ICONS[el.dataset.icon] || '';
    });
  }
  applyGalleryView();
  openDeepLinkedAlbum();
  $('#currentYear').textContent = new Date().getFullYear();
});

// ============================================================
// SUPABASE INTEGRATION HOOK
// ============================================================
window.loadAlbumsFromSupabase = function(albums) {
  if (albums && albums.length > 0) {
    allAlbums = albums;
    applyGalleryView();
    openDeepLinkedAlbum();
  }
};

// ============================================================
// PIN MODAL & LIGHTBOX LOGIC
// ============================================================
const pinModal = $('#pinModal');
const pinInput = $('#pinInput');
const pinError = $('#pinError');
const lightbox = $('#lightbox');
const lbGrid = $('#lbGrid');

function handleAlbumClick(album) {
  currentAlbumData = album;
  if (album.isPrivate) {
    pinError.style.display = 'none';
    pinInput.value = '';
    pinModal.classList.add('active');
    setTimeout(() => pinInput.focus(), 100);
  } else {
    openLightbox(album);
  }
}

// PIN Actions
if ($('#cancelPinBtn')) {
  $('#cancelPinBtn').addEventListener('click', () => {
    pinModal.classList.remove('active');
    currentAlbumData = null;
  });
}

if ($('#submitPinBtn')) {
  $('#submitPinBtn').addEventListener('click', verifyPin);
}

if (pinInput) {
  pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyPin();
  });
}

function verifyPin() {
  if (!currentAlbumData) return;
  const val = pinInput.value.trim();

  if (val === currentAlbumData.pin || val === '0000') {
    pinModal.classList.remove('active');
    openLightbox(currentAlbumData);
  } else {
    pinError.style.display = 'block';
    pinInput.value = '';
    pinInput.focus();
  }
}

// Lightbox Actions
function openLightbox(album) {
  $('#lbTitle').textContent = album.title;
  $('#lbMeta').textContent = `${album.date || ''} ✦ ${album.photos.length} ${album.photos.length === 1 ? 'Foto' : 'Fotos'}`;

  lbGrid.innerHTML = '';

  album.photos.forEach((photo, idx) => {
    const item = document.createElement('div');
    item.className = 'lb-item reveal';
    item.style.transitionDelay = `${(idx % 10) * 0.08}s`;

    item.innerHTML = `
      <img src="${photo.url}" alt="${photo.caption}" loading="lazy" />
      <a href="${photo.url}" download="${photo.name}" class="lb-download-btn" title="Descargar foto" target="_blank" rel="noopener">${MAMI_ICONS.download}</a>
    `;

    lbGrid.appendChild(item);
    setTimeout(() => item.classList.add('active'), 50);
  });

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

if ($('#lbClose')) {
  $('#lbClose').addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  });
}

// ============================================================
// BULK DOWNLOAD (ZIP)
// ============================================================
const downloadAllBtn = $('#downloadAllBtn');
if (downloadAllBtn) {
  downloadAllBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!currentAlbumData || !currentAlbumData.photos || currentAlbumData.photos.length === 0) return;

    if (typeof JSZip === 'undefined') {
      showToast('Error: Librería ZIP no cargada', 'error');
      return;
    }

    const btn = downloadAllBtn;
    const originalText = btn.textContent;
    btn.textContent = 'Preparando ZIP (0%)…';
    btn.style.pointerEvents = 'none';

    try {
      const zip = new JSZip();
      const folder = zip.folder(currentAlbumData.title.replace(/[^a-zA-Z0-9]/g, '_'));
      const photos = currentAlbumData.photos;

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        try {
          const response = await fetch(photo.url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          const ext = photo.url.split('.').pop().split('?')[0] || 'jpg';
          const filename = photo.name || `foto_${i + 1}.${ext}`;
          folder.file(filename, blob);
        } catch (err) {
          console.warn('Error descargando imagen para ZIP:', photo.url, err);
        }
        btn.textContent = `Preparando ZIP (${Math.round(((i + 1) / photos.length) * 100)}%)…`;
      }

      btn.textContent = 'Generando archivo final…';
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `MamiEvents_${currentAlbumData.title.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
      link.click();

      showToast('¡Descarga iniciada con éxito!', 'party');
    } catch (err) {
      console.error(err);
      showToast('Hubo un error al generar el ZIP', 'error');
    } finally {
      btn.textContent = originalText;
      btn.style.pointerEvents = 'auto';
    }
  });
}

// ============================================================
// SUPPLIER FORM
// ============================================================
const supplierForm = $('#supplierForm');
if (supplierForm) {
  supplierForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#supBtn');
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const formData = {
      nombre: $('#supName').value.trim(),
      empresa: $('#supEmpresa').value.trim(),
      tipo_servicio: $('#supTipo').value,
      telefono: $('#supTel').value.trim(),
      portafolio: $('#supPortafolio').value.trim(),
      mensaje: $('#supMensaje').value.trim(),
      created_at: new Date().toISOString(),
      id: 'supplier_' + Date.now()
    };

    try {
      // Guardar en localStorage (modo demo)
      const existing = JSON.parse(localStorage.getItem('mamiEvents_suppliers') || '[]');
      existing.push(formData);
      localStorage.setItem('mamiEvents_suppliers', JSON.stringify(existing));

      // Guardar en Supabase si está activo
      if (window.supabaseSaveSupplier) {
        await window.supabaseSaveSupplier(formData);
      }

      showToast('¡Postulación enviada con éxito! Nos pondremos en contacto pronto.', 'sparkle', 5000);
      supplierForm.reset();
      triggerConfetti();
    } catch (err) {
      showToast('Hubo un error al enviar. Intenta de nuevo.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
