import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu(); toggle.focus();
  }
});
window.matchMedia('(min-width: 1051px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const dialog = document.querySelector('#detail-dialog');
let opener;
document.querySelectorAll('[data-dialog="habits"]').forEach(button => button.addEventListener('click', () => {
  opener = button;
  document.querySelector('#dialog-title').textContent = 'Tu próxima acción puede ser pequeña';
  document.querySelector('#dialog-content').innerHTML = '<ul><li><strong>Reduce residuos:</strong> lleva una botella y una bolsa reutilizables.</li><li><strong>Deja la playa mejor:</strong> retira tus residuos y sepáralos cuando sea posible.</li><li><strong>Respeta la fauna:</strong> observa sin tocar, alimentar ni alterar su entorno.</li><li><strong>Comparte con cuidado:</strong> verifica la información antes de difundirla.</li></ul><p>Si encuentras un animal herido o varado, mantén la distancia y comunícate con la autoridad local competente.</p><a class="text-link" href="./materiales.html">Consulta los materiales de ACOREMA →</a>';
  dialog.showModal();
}));
document.querySelector('.close-dialog')?.addEventListener('click', () => dialog.close());
document.querySelector('.dialog-done')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
dialog?.addEventListener('close', () => opener?.focus());
document.querySelector('#year').textContent = new Date().getFullYear();
