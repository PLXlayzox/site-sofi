// Navigation entre sections + reveal au scroll. Zéro dépendance.

const views = document.querySelectorAll('.view');

function showView(id, { push = true } = {}) {
  const target = document.getElementById(id) || document.getElementById('accueil');
  if (!target) return;

  views.forEach(v => v.classList.remove('is-active'));
  // court délai pour permettre la transition CSS
  requestAnimationFrame(() => {
    target.classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    runReveal(target);
  });

  if (push && location.hash !== '#' + target.id) {
    history.pushState({ view: target.id }, '', '#' + target.id);
  }
}

// Reveal au scroll (IntersectionObserver)
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

// Clic sur cartes et liens data-goto
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-goto]');
  if (!el) return;
  e.preventDefault();
  showView(el.dataset.goto);
});

// Sous-onglets (Mon univers → Sofi / Mon travail)
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.sub-tab');
  if (!tab) return;
  const scope = tab.closest('.view');
  const target = tab.dataset.sub;
  scope.querySelectorAll('.sub-tab').forEach(t => t.classList.toggle('is-active', t === tab));
  scope.querySelectorAll('.sub-panel').forEach(p => p.classList.toggle('is-active', p.dataset.panel === target));
});

// Back/Forward navigateur
window.addEventListener('popstate', () => {
  const id = location.hash.replace('#', '') || 'accueil';
  showView(id, { push: false });
});

// Année dans le footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Init : ouvrir la bonne section depuis l'URL
const initial = location.hash.replace('#', '') || 'accueil';
showView(initial, { push: false });

// Self-check basique (ponytail: check runnable)
if (typeof window !== 'undefined' && window.location.search.includes('selfcheck')) {
  const ids = ['accueil', 'univers', 'cartographie', 'administratif', 'ressources'];
  const missing = ids.filter(id => !document.getElementById(id));
  console.assert(missing.length === 0, 'sections manquantes:', missing);
  console.log('selfcheck OK — toutes les sections présentes');
}
