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
function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });
window.matchMedia('(min-width: 1051px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
const content = {
  about: ['Una conexión que nos mueve', '<p>ACOREMA significa Áreas Costeras y Recursos Marinos. Esta propuesta presenta a la organización desde una idea sencilla: acercar a las personas a la conservación de la biodiversidad marino-costera del Perú.</p><p>La investigación, la educación ambiental y la participación son caminos para comprender nuestro entorno y cuidarlo juntos.</p><p class="editorial-note">La historia institucional, el equipo y los hitos se incorporarán cuando se verifiquen con ACOREMA.</p>'],
  research: ['Conocer para proteger', '<p>Entender la vida marina y las presiones sobre sus hábitats permite tomar mejores decisiones para su conservación.</p><ul><li>Conocimiento de especies y ecosistemas marino-costeros.</li><li>Comprensión de las amenazas que afectan a la biodiversidad.</li><li>Comunicación de la ciencia para acercarla a las personas.</li></ul><p class="editorial-note">Las fichas de proyectos y sus resultados están pendientes de validación institucional.</p>'],
  education: ['Aprender para cuidar', '<p>La educación ambiental nos invita a mirar el mar con curiosidad, comprender sus conexiones con nuestra vida y actuar de forma responsable.</p><p>Para empezar: conversa sobre el origen de los residuos, descubre las especies de tu costa y comparte lo que aprendas con tu comunidad.</p><p class="editorial-note">No se anuncian talleres ni inscripciones activas en esta versión.</p>'],
  community: ['La conservación empieza cerca', '<p>Las personas son parte esencial de un océano sano. Familias, educadores, comunidades y organizaciones pueden aportar desde su experiencia y su relación con el entorno.</p><p>Escuchar, compartir conocimientos y colaborar nos ayuda a construir una cultura de cuidado del mar.</p>'],
  species: ['Un océano lleno de vecinos', '<p>La costa peruana es hogar de una gran diversidad de vida. Conocerla es una invitación a respetarla.</p><ul><li><strong>Delfines:</strong> mamíferos marinos que suben a la superficie para respirar.</li><li><strong>Tortugas marinas:</strong> reptiles que necesitan salir a respirar y pueden recorrer grandes distancias.</li><li><strong>Aves marinas:</strong> parte de la vida del litoral y de sus redes de alimentación.</li></ul><p>Obsérvalos a distancia. Evita alimentarlos, perseguirlos o acercarte para tocarlos.</p>'],
  habits: ['Tu próxima acción puede ser pequeña', '<ul><li><strong>Reduce residuos:</strong> lleva una botella y una bolsa reutilizables.</li><li><strong>Deja la playa mejor:</strong> retira tus residuos y sepáralos cuando sea posible.</li><li><strong>Respeta la fauna:</strong> observa sin tocar, alimentar ni alterar su entorno.</li><li><strong>Comparte con cuidado:</strong> verifica la información antes de difundirla.</li></ul><p>Si encuentras un animal herido o varado, mantén la distancia y comunícate con la autoridad local competente.</p>'],
  classroom: ['Una pregunta para abrir el aula', '<p><strong>¿Cómo llega a conectarse nuestra vida diaria con el mar?</strong></p><ol><li>Elijan un objeto cotidiano, como una botella.</li><li>Conversen sobre su recorrido después de usarlo y cómo podría llegar a un río o al océano.</li><li>Propongan una acción concreta para reducir ese impacto en la escuela.</li><li>Compartan lo aprendido con otra clase.</li></ol><p class="editorial-note">Actividad introductoria de esta propuesta web; no es un material oficial de ACOREMA.</p>'],
  participate: ['Tu interés es el primer paso', '<p>Puedes empezar hoy compartiendo lo que aprendes, cuidando las playas y respetando la vida silvestre.</p><p>Para consultar oportunidades de participación en ACOREMA, visita su sitio institucional. Esta propuesta todavía no recibe solicitudes ni anuncia convocatorias.</p><a class="button" href="https://www.acorema.org.pe/" target="_blank" rel="noopener noreferrer">Visitar el sitio institucional <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></a><p class="editorial-note">Se abre en una pestaña nueva. La disponibilidad del sitio externo depende de ACOREMA.</p>'],
  alliance: ['Conectemos por un océano sano', '<p>La educación, la investigación y el compromiso de las comunidades pueden fortalecerse a través de la colaboración.</p><p>Si representas a una institución, escuela u organización, consulta los canales oficiales de ACOREMA para explorar una posible alianza.</p><a class="button" href="https://www.acorema.org.pe/" target="_blank" rel="noopener noreferrer">Ir al sitio institucional <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></a><p class="editorial-note">Se abre en una pestaña nueva. Los canales de contacto están pendientes de verificación; este sitio no recoge datos.</p>'],
  site: ['Una nueva forma de acercarnos al mar', '<p>Esta es una propuesta de rediseño en español para ACOREMA. Prioriza una navegación sencilla, lectura clara, acceso con teclado y una experiencia adaptable a móviles.</p><p>Los textos institucionales, los proyectos y los canales de contacto requieren revisión antes de publicar. La imagen principal es una representación conceptual generada para esta propuesta, no un registro de campo de ACOREMA.</p><p>No usamos formularios de captación, cookies de seguimiento ni cifras de impacto sin verificar.</p>']
};
const dialog = document.querySelector('#detail-dialog');
let opener;
document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => {
  const [title, html] = content[button.dataset.dialog];
  opener = button;
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('#dialog-content').innerHTML = html;
  dialog.showModal();
}));
function closeDialog() { dialog.close(); }
document.querySelector('.close-dialog').addEventListener('click', closeDialog);
document.querySelector('.dialog-done').addEventListener('click', closeDialog);
dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) closeDialog(); } });
dialog.addEventListener('close', () => opener?.focus());
document.querySelector('#year').textContent = new Date().getFullYear();
