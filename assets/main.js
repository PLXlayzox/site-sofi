// Navigation + sous-onglets + reveal + carte Leaflet + galerie œuvres + lightbox
const views = document.querySelectorAll('.view');

// Liste des œuvres (générée à partir du dossier assets/oeuvres/)
const OEUVRES_COUNT = 28;

function showView(id, { push = true } = {}) {
  const target = document.getElementById(id) || document.getElementById('accueil');
  if (!target) return;
  views.forEach(v => v.classList.remove('is-active'));
  requestAnimationFrame(() => {
    target.classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    runReveal(target);
    if (id === 'cartographie') initMap();
    if (id === 'univers') buildGallery();
  });
  if (push && location.hash !== '#' + target.id) {
    history.pushState({ view: target.id }, '', '#' + target.id);
  }
}

// --- Reveal au scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

function runReveal(root) {
  root.querySelectorAll('.reveal').forEach(el => {
    el.classList.remove('is-visible');
    io.observe(el);
  });
}

// --- Navigation cartes
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-goto]');
  if (!el) return;
  e.preventDefault();
  showView(el.dataset.goto);
});

// --- Sous-onglets
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.sub-tab');
  if (!tab) return;
  const scope = tab.closest('.view');
  const target = tab.dataset.sub;
  scope.querySelectorAll('.sub-tab').forEach(t => t.classList.toggle('is-active', t === tab));
  scope.querySelectorAll('.sub-panel').forEach(p => p.classList.toggle('is-active', p.dataset.panel === target));
});

// --- Back/Forward
window.addEventListener('popstate', () => {
  const id = location.hash.replace('#', '') || 'accueil';
  showView(id, { push: false });
});

// --- Année
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Galerie œuvres (peuple #galerie-oeuvres au premier passage)
let galleryReady = false;
function buildGallery() {
  if (galleryReady) return;
  const el = document.getElementById('galerie-oeuvres');
  if (!el) return;
  const frag = document.createDocumentFragment();
  for (let i = 1; i <= OEUVRES_COUNT; i++) {
    const num = String(i).padStart(2, '0');
    const img = document.createElement('img');
    img.src = `assets/oeuvres/oeuvre-${num}.jpg`;
    img.alt = `Œuvre ${num} — Sofi`;
    img.loading = 'lazy';
    frag.appendChild(img);
  }
  el.appendChild(frag);
  galleryReady = true;
}

// --- Lightbox (clic sur image de galerie ou article-figure)
const lb = document.getElementById('lightbox');
const lbImg = lb?.querySelector('.lightbox-img');
const lbClose = lb?.querySelector('.lightbox-close');

document.addEventListener('click', (e) => {
  const img = e.target.closest('.gallery img, .article-figure img');
  if (!img || !lb || !lbImg) return;
  lbImg.src = img.src;
  lbImg.alt = img.alt || '';
  lb.classList.add('is-open');
  lb.setAttribute('aria-hidden', 'false');
});
function closeLb() {
  if (!lb) return;
  lb.classList.remove('is-open');
  lb.setAttribute('aria-hidden', 'true');
  if (lbImg) lbImg.src = '';
}
lbClose?.addEventListener('click', closeLb);
lb?.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });

// --- Carte Leaflet
let mapReady = false;
const anchors = [
  { n: '001', name: 'Le Dragon de Fromentières', lat: 47.86369, lng: -0.66603 },
  { n: '002', name: "L'arche des possibles",     lat: 47.80819, lng: -0.70767 },
];

function initMap() {
  if (mapReady) return;
  const el = document.getElementById('carte-mayenne');
  if (!el || typeof L === 'undefined') return;
  const map = L.map(el, { scrollWheelZoom: false }).setView([47.83, -0.68], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18,
  }).addTo(map);
  const icon = L.divIcon({
    className: 'sofi-pin',
    html: '<div style="width:28px;height:28px;border-radius:50%;background:#b8443a;border:3px solid #f4efe6;box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
  anchors.forEach(a => {
    L.marker([a.lat, a.lng], { icon })
      .addTo(map)
      .bindPopup(`<strong>${a.name}</strong><em>Point d'ancrage n°${a.n}</em>`);
  });
  mapReady = true;
  setTimeout(() => map.invalidateSize(), 200);
}

// --- Init : ouvrir la bonne section depuis l'URL
const initial = location.hash.replace('#', '') || 'accueil';
showView(initial, { push: false });
