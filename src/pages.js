import './main.js';

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const search = document.querySelector('#resource-search');
const format = document.querySelector('#format-filter');
function filterResources() {
  const term = normalize(search.value.trim());
  let count = 0;
  document.querySelectorAll('.resource-card').forEach(card => {
    const matches = normalize(card.textContent).includes(term) && (!format.value || card.dataset.format === format.value);
    card.hidden = !matches;
    if (matches) count++;
  });
  document.querySelector('#result-number').textContent = count;
  document.querySelector('.no-results').hidden = count !== 0;
}
search?.addEventListener('input', filterResources);
format?.addEventListener('change', filterResources);

const photos = [...document.querySelectorAll('.gallery-photo, .photo-link')];
const lightbox = document.querySelector('#image-dialog');
let photoIndex = 0;
let photoOpener;
function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const photo = photos[photoIndex];
  const caption = photo.dataset.caption || photo.querySelector('img')?.alt || 'Fotografía de ACOREMA';
  document.querySelector('#lightbox-image').src = photo.dataset.image || photo.href;
  document.querySelector('#lightbox-image').alt = caption;
  document.querySelector('#image-caption').textContent = caption;
  document.querySelector('#image-counter').textContent = `${photoIndex + 1} / ${photos.length}`;
}
photos.forEach((photo, index) => photo.addEventListener('click', event => {
  event.preventDefault();
  photoOpener = photo;
  showPhoto(index);
  lightbox.showModal();
}));
document.querySelector('.image-close')?.addEventListener('click', () => lightbox.close());
document.querySelector('#image-prev')?.addEventListener('click', () => showPhoto(photoIndex - 1));
document.querySelector('#image-next')?.addEventListener('click', () => showPhoto(photoIndex + 1));
lightbox?.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
});
lightbox?.addEventListener('close', () => photoOpener?.focus());
lightbox?.addEventListener('click', event => {
  if (event.target !== lightbox) return;
  const rect = lightbox.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close();
});

const board = document.querySelector('#memory-board');
if (board) {
  const species = ['Bufeo', 'Pingüino de Humboldt', 'Tortuga marina', 'Nutria marina', 'Ballena', 'Tiburón'];
  let cards, selected, matched, attempts;
  const status = document.querySelector('#memory-status');
  const feedback = document.querySelector('#memory-feedback');
  const next = document.querySelector('#memory-continue');
  function updateStatus() { status.textContent = `${matched} de 6 parejas · ${attempts} intentos`; }
  function reveal(index) {
    const card = cards[index];
    card.revealed = true;
    const button = board.children[index];
    button.textContent = card.species;
    button.classList.add('revealed');
    button.setAttribute('aria-label', `Tarjeta ${index + 1}: ${card.species}`);
    button.setAttribute('aria-pressed', 'true');
  }
  function play(index) {
    if (cards[index].revealed || selected.length === 2) return;
    reveal(index); selected.push(index);
    if (selected.length !== 2) return;
    attempts++;
    if (cards[selected[0]].species === cards[selected[1]].species) {
      matched++;
      selected.forEach(i => {
        board.children[i].classList.add('matched');
        board.children[i].setAttribute('aria-label', `Pareja encontrada: ${cards[i].species}`);
        board.children[i].setAttribute('aria-disabled', 'true');
      });
      feedback.textContent = matched === 6 ? '¡Encontraste las seis parejas! Gracias por explorar la vida marina.' : `¡Encontraste la pareja de ${cards[index].species}!`;
      selected = [];
    } else {
      feedback.textContent = 'Son especies diferentes. Cuando quieras, oculta las tarjetas para continuar.';
      next.hidden = false;
    }
    updateStatus();
  }
  function reset() {
    cards = [...species, ...species].map(species => ({ species, revealed: false }));
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    selected = []; matched = 0; attempts = 0;
    board.replaceChildren(); next.hidden = true; feedback.textContent = '';
    cards.forEach((_, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = String(index + 1).padStart(2, '0');
      button.setAttribute('aria-label', `Descubrir tarjeta ${index + 1}`);
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => play(index));
      board.append(button);
    });
    updateStatus();
  }
  next.addEventListener('click', () => {
    const firstIndex = selected[0];
    selected.forEach(i => {
      cards[i].revealed = false;
      const button = board.children[i];
      button.textContent = String(i + 1).padStart(2, '0');
      button.classList.remove('revealed');
      button.setAttribute('aria-label', `Descubrir tarjeta ${i + 1}`);
      button.setAttribute('aria-pressed', 'false');
    });
    selected = []; next.hidden = true;
    feedback.textContent = 'Prueba otra pareja.';
    board.children[firstIndex].focus();
  });
  document.querySelector('#memory-reset').addEventListener('click', reset);
  reset();
}

document.querySelector('#quiz-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const score = Number(data.get('year') === '1995') + Number(data.get('place') === 'pisco') + Number(data.get('program') === 'science');
  const result = document.querySelector('#quiz-result');
  result.textContent = `${score} de 3 respuestas correctas. ${score === 3 ? '¡Muy bien! Ya conoces un poco más de ACOREMA.' : 'ACOREMA se fundó en 1995, trabaja principalmente en Pisco y desarrolla programas de investigación y conservación. Puedes cambiar tus respuestas e intentarlo de nuevo.'}`;
});
