// Shared enhancements are progressive: content and navigation stay usable without them.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('.site-header');
const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);
const topButton = document.createElement('button');
topButton.type = 'button';
topButton.className = 'back-top';
topButton.setAttribute('aria-label', 'Volver al inicio de la página');
topButton.textContent = '↑';
topButton.hidden = true;
topButton.addEventListener('click', () => {
  window.scrollTo({top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth'});
  document.querySelector('.brand').focus({preventScroll: true});
});
document.body.append(topButton);
let scheduled = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
  header.classList.toggle('is-scrolled', window.scrollY > 20);
  topButton.hidden = window.scrollY < 600;
  scheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scheduled) { requestAnimationFrame(updateScroll); scheduled = true; }
}, {passive: true});
window.addEventListener('resize', updateScroll);
updateScroll();

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const targets = document.querySelectorAll('.about-intro, .about-copy, .work-card, .learn-visual, .learn-copy, .explore-grid>a, .faq-section>div, .join-inner, .topic-grid>a');
  document.documentElement.classList.add('reveal-enabled');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, {threshold: 0.08, rootMargin: '0px 0px 20px 0px'});
  targets.forEach(target => { target.classList.add('reveal'); observer.observe(target); });
  reduceMotion.addEventListener('change', event => {
    if (event.matches) { document.documentElement.classList.remove('reveal-enabled'); observer.disconnect(); }
  });
}

// Accessible species tabs support pointer, arrow keys, Home and End.
const tabs = [...document.querySelectorAll('.species-tabs [role="tab"]')];
function selectSpecies(index, focus = false) {
  tabs.forEach((tab, i) => {
    const active = index === i;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tabs[index].focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectSpecies(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectSpecies(next, true); }
  });
});

const journeys = {
  curious: {status: 'Ideas para empezar a conocer nuestro mar.', cards: [
    ['01 / OBSERVA', 'Un mar de vida, en imágenes.', 'Conoce la biodiversidad de la costa a través del archivo de ACOREMA.', './galeria.html'],
    ['02 / JUEGA', 'Tu primera misión por el mar.', 'Explora en un minisubmarino, recoge residuos y deja espacio a los animales.', './guardianes.html']
  ]},
  teacher: {status: 'Recursos para acercar el mar a tu aula.', cards: [
    ['01 / COMPARTE', 'Lleva el océano a tu clase.', 'Encuentra guías, cartillas y publicaciones de ACOREMA para escolares y docentes.', './materiales.html'],
    ['02 / CONECTA', 'El clima también se aprende.', 'Explora la serie El clima es mi amigo: humedales, biodiversidad y cambio climático.', './clima.html']
  ]},
  ally: {status: 'Conoce el trabajo de ACOREMA y abre una conversación.', cards: [
    ['01 / CONOCE', 'Primero, un propósito común.', 'Descubre los programas de investigación y conservación de la organización.', './programas.html'],
    ['02 / CONVERSEMOS', 'Tu idea puede ser el comienzo.', 'Utiliza los canales institucionales para consultar posibilidades de colaboración.', './contacto.html']
  ]}
};
document.querySelectorAll('[data-audience]').forEach(button => button.addEventListener('click', () => {
  const journey = journeys[button.dataset.audience];
  document.querySelectorAll('[data-audience]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('#route-status').textContent = journey.status;
  const cards = document.querySelector('#route-cards');
  cards.replaceChildren(...journey.cards.map(([number, title, description, href]) => {
    const a = document.createElement('a'); a.href = href;
    const numberEl = document.createElement('span'); numberEl.className = 'route-number'; numberEl.textContent = number;
    const heading = document.createElement('h3'); heading.textContent = title;
    const text = document.createElement('p'); text.textContent = description;
    const arrow = document.createElement('span'); arrow.className = 'round-arrow'; arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true');
    a.append(numberEl, heading, text, arrow);
    return a;
  }));
  cards.classList.remove('is-updating');
  requestAnimationFrame(() => cards.classList.add('is-updating'));
}));

// Global search: public content index loaded only when a visitor opens the dialog.
const dialog = document.createElement('dialog');
dialog.id = 'site-search';
dialog.className = 'search-dialog';
dialog.setAttribute('aria-labelledby', 'site-search-title');
dialog.innerHTML = '<div class="search-top"><h2 id="site-search-title">Un mar de respuestas.</h2><button type="button" class="search-close" aria-label="Cerrar búsqueda">×</button></div><label class="site-search-label" for="site-search-input">¿Qué quieres descubrir?</label><input id="site-search-input" class="site-search-input" type="search" placeholder="Prueba con delfines, materiales, clima…" autocomplete="off"><div class="search-filters" role="group" aria-label="Filtrar resultados de búsqueda"><button type="button" data-search-kind="" aria-pressed="true">Todo</button><button type="button" data-search-kind="Página" aria-pressed="false">Páginas</button><button type="button" data-search-kind="Recurso" aria-pressed="false">Recursos</button></div><p class="search-status" role="status" aria-live="polite"></p><ul class="search-results"></ul><button type="button" class="button search-show-more" hidden>Mostrar más resultados ↓</button><p class="search-more">Usa Tab para recorrer los resultados y Escape para cerrar. Los recursos externos se abren en otra pestaña.</p>';
document.body.append(dialog);
const input = dialog.querySelector('input');
const results = dialog.querySelector('.search-results');
const status = dialog.querySelector('.search-status');
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
let indexPromise;
let searchIndex;
let kind = '';
let resultLimit = 12;
let opener;
let closeRequested = false;
function renderSearch() {
  if (!searchIndex) return;
  const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
  const matches = searchIndex.filter(entry => (!kind || entry.kind === kind) && terms.every(term => normalize(`${entry.title} ${entry.excerpt} ${entry.group}`).includes(term)));
  const displayed = matches.slice(0, resultLimit);
  dialog.querySelector('.search-show-more').hidden = matches.length <= resultLimit;
  status.textContent = terms.length || kind ? `${matches.length} resultados${matches.length > resultLimit ? ` · mostrando ${resultLimit}` : ''}` : 'Empieza por aquí o busca un tema que te interese.';
  if (!matches.length) status.textContent = 'No encontramos resultados. Prueba otra palabra o elige otro filtro.';
  results.replaceChildren(...displayed.map(entry => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = entry.url;
    if (/^https?:/.test(entry.url)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    const type = document.createElement('span'); type.className = 'result-kind'; type.textContent = `${entry.kind} / ${entry.group}`;
    const title = document.createElement('strong'); title.textContent = entry.title;
    const excerpt = document.createElement('small'); excerpt.textContent = entry.excerpt + (link.target ? ' · Nueva pestaña' : '');
    link.append(type, title, excerpt); li.append(link); return li;
  }));
}
async function openSearch(trigger) {
  if (dialog.open) { input.focus(); return; }
  opener = trigger || document.activeElement;
  closeRequested = false;
  dialog.showModal();
  input.focus();
  status.textContent = 'Cargando el buscador…';
  try {
    indexPromise ||= fetch(`${import.meta.env.BASE_URL}search-index.json`).then(response => {
      if (!response.ok) throw Error('Search unavailable');
      return response.json();
    }).catch(error => { indexPromise = undefined; throw error; });
    searchIndex = await indexPromise;
    if (!closeRequested) renderSearch();
  } catch {
    if (!closeRequested) status.textContent = 'No pudimos cargar el buscador. Comprueba tu conexión y vuelve a abrirlo. Puedes seguir usando la navegación del sitio.';
  }
}
document.querySelectorAll('.open-search').forEach(button => button.addEventListener('click', () => openSearch(button)));
if (navigator.platform.toUpperCase().includes('MAC')) {
  document.querySelectorAll('.open-search kbd').forEach(kbd => kbd.textContent = '⌘ K');
}
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (document.querySelector('dialog[open]') && !dialog.open) return;
    openSearch();
  }
});
input.addEventListener('input', () => { resultLimit = 12; renderSearch(); });
dialog.querySelector('.search-show-more').addEventListener('click', () => {
  const previousLimit = resultLimit;
  resultLimit += 12;
  renderSearch();
  results.querySelectorAll('a')[previousLimit]?.focus();
});
dialog.querySelectorAll('[data-search-kind]').forEach(button => button.addEventListener('click', () => {
  kind = button.dataset.searchKind;
  resultLimit = 12;
  dialog.querySelectorAll('[data-search-kind]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  renderSearch();
}));
dialog.querySelector('.search-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { closeRequested = true; opener?.focus(); });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});

dialog.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dialog.close(); }
});
