// Navigation entre sections + reveal + sous-onglets + carte Leaflet
const views = document.querySelectorAll('.view');

function showView(id, { push = true } = {}) {
  const target = document.getElementById(id) || document.getElementById('accueil');
  if (!target) return;
  views.forEach(v => v.classList.remove('is-active'));
  requestAnimationFrame(() => {
    target.classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    runReveal(target);
    if (id === 'cartographie') initMap();
  });
  if (push && location.hash !== '#' + target.id) {
    history.pushState({ view: target.id }, '', '#' + target.id);
  }
}

// Reveal au scroll
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

// Clic sur cartes / liens data-goto
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-goto]');
  if (!el) return;
  e.preventDefault();
  showView(el.dataset.goto);
});

// Sous-onglets
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.sub-tab');
  if (!tab) return;
  const scope = tab.closest('.view');
  const target = tab.dataset.sub;
  scope.querySelectorAll('.sub-tab').forEach(t => t.classList.toggle('is-active', t === tab));
  scope.querySelectorAll('.sub-panel').forEach(p => p.classList.toggle('is-active', p.dataset.panel === target));
});

// Back/Forward
window.addEventListener('popstate', () => {
  const id = location.hash.replace('#', '') || 'accueil';
  showView(id, { push: false });
});

// Année
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Carte Leaflet des points d'ancrage (init une seule fois) ---
let mapReady = false;
const anchors = [
  { n: '001', name: 'Le Dragon de Fromentières', lat: 47.86369, lng: -0.66603 },
  { n: '002', name: "Les animaux du refuge de l'Arche", lat: 47.80819, lng: -0.70767 },
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
    html: '<div style="width:28px;height:28px;border-radius:50%;background:#a68a5b;border:3px solid #f4efe6;box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
  anchors.forEach(a => {
    L.marker([a.lat, a.lng], { icon })
      .addTo(map)
      .bindPopup(`<strong>${a.name}</strong><em>Point d'ancrage n°${a.n}</em>`);
  });
  mapReady = true;
  // Fix taille si vue cachée au premier init
  setTimeout(() => map.invalidateSize(), 200);
}

// Init : ouvrir la bonne section depuis l'URL
const initial = location.hash.replace('#', '') || 'accueil';
showView(initial, { push: false });
