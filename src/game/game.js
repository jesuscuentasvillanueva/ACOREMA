import '../main.js';
import {sprites, labels} from './sprites.js';
import {levels, COLS, ROWS} from './levels.js';
const root = document.querySelector('#ocean-game');
const board = root.querySelector('#ocean-board');
const overlay = root.querySelector('#mission-overlay');
const player = root.querySelector('#submarine');
const status = root.querySelector('#ocean-status');
const pauseButton = root.querySelector('#pause-game');
const soundButton = root.querySelector('#sound-game');
const arrows = [...root.querySelectorAll('[data-move]')];
const STORE = 'acorema-ocean-badges-v1';
const directions = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};
let phase = 'intro', levelIndex = 0, position = {x:0,y:4}, trash = [], collected = 0, bumps = 0, stars = 0, points = 0;
let sound = false, audio, feedbackTimer, lastEncounter = '';
let records = [0,0,0];
try {
  const saved = JSON.parse(localStorage.getItem(STORE));
  if (Array.isArray(saved) && saved.length === 3 && saved.every(n=>Number.isInteger(n)&&n>=0&&n<=3)) records = saved;
} catch { /* Progress is optional; the game also works without browser storage. */ }
player.innerHTML = sprites.sub;
root.querySelectorAll('[data-sprite]').forEach(el => el.innerHTML = sprites[el.dataset.sprite]);
function save() { try {localStorage.setItem(STORE, JSON.stringify(records));} catch {} }
function collection() { root.querySelector('#badge-count').textContent = `${records.filter(Boolean).length} / 3`; }
function chime(success=true) {
  if (!sound || !audio) return;
  try {
    const t=audio.currentTime;
    [success?523:330,success?784:392].forEach((f,i)=>{
      const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;
      g.gain.setValueAtTime(0,t+i*.10);g.gain.linearRampToValueAtTime(.045,t+i*.10+.015);g.gain.exponentialRampToValueAtTime(.001,t+i*.10+.16);
      o.connect(g);g.connect(audio.destination);o.start(t+i*.10);o.stop(t+i*.10+.18);
    });
  } catch { /* Sound must never interrupt a mission. */ }
}
function message(text) {
  clearTimeout(feedbackTimer); status.textContent=text;
  status.classList.add('new-message');
  feedbackTimer=setTimeout(()=>status.classList.remove('new-message'),350);
}
function setPhase(next) {
  phase=next;root.dataset.phase=next;
  const active=next==='playing';
  board.inert=!active;
  arrows.forEach(b=>b.disabled=!active);
  pauseButton.disabled=!['playing','paused'].includes(next);
  pauseButton.textContent=next==='paused'?'Continuar':'Pausar';
  pauseButton.setAttribute('aria-pressed', String(next==='paused'));
}
function showPanel(html, focusId) {
  overlay.innerHTML=html;overlay.hidden=false;
  requestAnimationFrame(()=>root.querySelector(focusId)?.focus({preventScroll:true}));
}
function hidePanel() { overlay.hidden=true;overlay.replaceChildren(); }
function shuffle(items) {
  for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  return items;
}
function animalAt(x,y) { return levels[levelIndex].animals.find(a=>a.x===x&&a.y===y); }
function tile(x,y) { return board.querySelector(`[data-x="${x}"][data-y="${y}"]`); }
function renderBoard(focus=false) {
  board.replaceChildren();
  for(let y=0;y<ROWS;y++) {
    const row=document.createElement('div');row.className='ocean-row';row.setAttribute('role','row');
    for(let x=0;x<COLS;x++) {
      const b=document.createElement('button');b.type='button';b.className='ocean-tile';b.setAttribute('role','gridcell');b.dataset.x=x;b.dataset.y=y;
      const a=animalAt(x,y), t=trash.find(t=>t.x===x&&t.y===y), here=position.x===x&&position.y===y;
      b.tabIndex=here?0:-1;
      const name=here?'Tu minisubmarino':a?`${labels[a.type]}. Dale espacio`:t?`Residuo: ${labels[t.type]}`:'Agua libre';
      b.setAttribute('aria-label',`Fila ${y+1}, columna ${x+1}: ${name}`);
      b.setAttribute('aria-selected',String(here));
      if(a){b.innerHTML=sprites[a.type];b.classList.add('animal-tile');}
      if(t){b.innerHTML=sprites[t.type];b.classList.add('trash-tile');}
      if(Math.abs(position.x-x)+Math.abs(position.y-y)===1)b.classList.add('reachable');
      if(here)b.classList.add('player-tile');
      b.addEventListener('click',()=>{
        if(phase!=='playing')return;
        if(here){message('Elige una casilla vecina o usa las flechas para nadar.');return;}
        if(Math.abs(position.x-x)+Math.abs(position.y-y)!==1){message('¡Un paso a la vez! Toca una casilla vecina o usa las flechas.');tile(position.x,position.y).focus({preventScroll:true});return;}
        move(x-position.x,y-position.y,true);
      });
      row.append(b);
    }
    board.append(row);
  }
  player.style.left=`${(position.x+.5)*100/COLS}%`;player.style.top=`${(position.y+.5)*100/ROWS}%`;
  if(focus&&phase==='playing')tile(position.x,position.y)?.focus({preventScroll:true});
}
function updateHud() {
  const level=levels[levelIndex];
  root.querySelector('#mission-number').textContent=`MISIÓN ${levelIndex+1} DE 3`;
  root.querySelector('#mission-name').textContent=level.name;
  root.querySelector('#mission-place').textContent=level.place;
  root.querySelector('#trash-count').textContent=`${collected} / ${level.goal}`;
  root.querySelector('#game-points').textContent=points;
  const meter=root.querySelector('#mission-progress');meter.max=level.goal;meter.value=collected;
  meter.setAttribute('aria-label',`${collected} de ${level.goal} residuos recogidos`);
  root.querySelectorAll('.mission-step').forEach((step,i)=>{step.classList.toggle('current',i===levelIndex);step.classList.toggle('done',i<levelIndex);if(i===levelIndex)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');});
}
function beginLevel() {
  position={x:0,y:4};collected=0;bumps=0;lastEncounter='';
  const available=[];
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(!animalAt(x,y)&&!(x===0&&y===4))available.push({x,y});
  const types=['bottle','bag','can','cup'];
  trash=shuffle(available).slice(0,levels[levelIndex].goal).map((p,i)=>({...p,type:types[i%types.length]}));
  root.dataset.biome=levelIndex;
  hidePanel();setPhase('playing');renderBoard();updateHud();message(levels[levelIndex].tip);
  tile(0,4).focus({preventScroll:true});
  root.querySelector('.game-mission-head').scrollIntoView({block:'start',behavior:'auto'});
}
function move(dx,dy,focus=false) {
  if(phase!=='playing')return;
  const x=position.x+dx,y=position.y+dy;
  if(x<0||x>=COLS||y<0||y>=ROWS){message('Ese es el borde. ¡Prueba otra dirección!');return;}
  const animal=animalAt(x,y);
  if(animal){const encounter=`${x},${y}`;if(lastEncounter!==encounter)bumps++;lastEncounter=encounter;const name={dolphin:'al bufeo',penguin:'al pingüino de Humboldt',otter:'a la nutria marina',turtle:'a la tortuga marina'}[animal.type];message(`¡Dale espacio ${name}! Busca un camino por el agua libre.`);chime(false);if(focus)tile(position.x,position.y).focus({preventScroll:true});return;}
  lastEncounter='';position={x,y};player.classList.toggle('facing-left',dx<0?true:dx>0?false:player.classList.contains('facing-left'));
  const index=trash.findIndex(t=>t.x===x&&t.y===y);
  if(index>=0){const [item]=trash.splice(index,1);collected++;points+=10;chime();message(`¡Bien! Un residuo menos. ${collected} de ${levels[levelIndex].goal} recogidos.`);}
  else message(`Fila ${y+1}, columna ${x+1}. ${surroundings()}`);
  renderBoard(focus);updateHud();
  if(collected===levels[levelIndex].goal)completeLevel();
}
function surroundings() {
  const near=Object.entries(directions).map(([dir,[dx,dy]])=>{
    const x=position.x+dx,y=position.y+dy;
    const t=trash.find(t=>t.x===x&&t.y===y),a=animalAt(x,y);
    const names={up:'Arriba',down:'Abajo',left:'Izquierda',right:'Derecha'};
    return t?`${names[dir]}: ${labels[t.type]}.`:a?`${names[dir]}: ${labels[a.type]}, dale espacio.`:'';
  }).filter(Boolean);
  return near.join(' ')||'Sigue explorando con las flechas.';
}
board.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.metaKey||event.altKey)return;
  const key={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'}[event.key];
  if(key){event.preventDefault();move(...directions[key],true);}
});
arrows.forEach(b=>b.addEventListener('click',()=>move(...directions[b.dataset.move])));
function completeLevel() {
  setPhase('question');stars=bumps===0?3:bumps===1?2:1;
  const level=levels[levelIndex];
  showPanel(`<div class="mission-panel"><div class="reward-icon">${sprites.shell}</div><p class="game-kicker">¡MISIÓN COMPLETADA!</p><h2 id="panel-title">¡El mar está más limpio!</h2><p>Recogiste ${level.goal} residuos. Ahora, un pequeño reto:</p><fieldset class="ocean-question"><legend>${level.question}</legend>${level.answers.map((answer,i)=>`<button type="button" data-answer="${i}">${answer}<span aria-hidden="true">→</span></button>`).join('')}</fieldset><p id="question-feedback" role="status" aria-live="polite"></p></div>`, '[data-answer="0"]');
  overlay.querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>{
    if(Number(button.dataset.answer)!==level.correct){button.classList.add('try-again');root.querySelector('#question-feedback').textContent='Casi. Piensa en lo que ayuda al mar y a sus animales. Puedes intentarlo otra vez.';return;}
    chime();records[levelIndex]=Math.max(records[levelIndex],stars);save();collection();
    showPanel(`<div class="mission-panel"><div class="reward-stars" role="img" aria-label="${stars} de 3 estrellas">${Array.from({length:3},(_,i)=>`<span class="${i<stars?'earned':''}" aria-hidden="true">${sprites.star}</span>`).join('')}</div><p class="game-kicker">INSIGNIA DESBLOQUEADA</p><h2 id="panel-title">${level.badge}</h2><p>${level.explanation}</p><p class="star-explanation">${stars===3?'¡Dejaste espacio a los animales y ganaste las tres estrellas!':'Para ganar más estrellas, busca un camino que deje espacio a los animales.'}</p><div class="ocean-fact"><strong>¿Sabías que…?</strong><p>${level.fact}</p></div><button type="button" id="next-mission" class="game-primary">${levelIndex===2?'Ver mi aventura':'Siguiente misión'} <span aria-hidden="true">→</span></button></div>`, '#next-mission');
    root.querySelector('#next-mission').addEventListener('click',()=>{if(levelIndex===2)finish();else{levelIndex++;beginLevel();}});
  }));
}
function pause() {
  if(phase!=='playing')return;
  setPhase('paused');
  showPanel('<div class="mission-panel pause-panel"><p class="game-kicker">TU AVENTURA TE ESPERA</p><h2 id="panel-title">Un respiro.</h2><p>El mar puede esperar. Vuelve cuando quieras.</p><button type="button" id="resume-game" class="game-primary">Seguir explorando ▶</button><button type="button" id="restart-game" class="game-secondary">Empezar de nuevo</button></div>', '#resume-game');
  root.querySelector('#resume-game').addEventListener('click',resume);
  root.querySelector('#restart-game').addEventListener('click',start);
}
function resume(){if(phase!=='paused')return;hidePanel();setPhase('playing');tile(position.x,position.y).focus({preventScroll:true});message('¡Seguimos! '+surroundings());}
pauseButton.addEventListener('click',()=>phase==='paused'?resume():pause());
root.addEventListener('keydown',event=>{if(event.key==='Escape'&&phase==='playing'){event.preventDefault();pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&phase==='playing')pause();});
soundButton.addEventListener('click',async()=>{
  if(sound){sound=false;soundButton.setAttribute('aria-pressed','false');soundButton.textContent='Sonido: no';return;}
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio){message('Este navegador no reproduce sonidos. ¡Puedes jugar igual!');return;}
  try{audio ||= new Audio();await audio.resume();sound=true;soundButton.setAttribute('aria-pressed','true');soundButton.textContent='Sonido: sí';chime();}catch{message('No se pudo activar el sonido. Puedes seguir jugando sin él.');}
});
function finish() {
  setPhase('finished');chime();
  showPanel(`<div class="mission-panel final-panel"><div class="reward-icon">${sprites.star}</div><p class="game-kicker">TRES MISIONES. UN MISMO MAR.</p><h2 id="panel-title">¡Eres parte del cambio!</h2><p>Recogiste 15 residuos en esta aventura y ganaste <strong>${points} puntos</strong>. Cada pequeño gesto cuenta.</p><div class="badge-collection">${levels.map((l,i)=>`<div>${sprites.shell}<span>${l.badge}</span><small>${records[i]} de 3 estrellas</small></div>`).join('')}</div><p class="real-world-tip">En la vida real, cuida la playa con una persona adulta y protección. Observa a los animales sin tocarlos ni darles comida.</p><button type="button" id="play-again" class="game-primary">Jugar otra aventura ↻</button><a class="game-secondary" href="./galeria.html">Conocer a los animales reales →</a></div>`, '#play-again');
  root.querySelector('#play-again').addEventListener('click',start);
}
function start(){levelIndex=0;points=0;beginLevel();}
root.querySelector('#start-game').addEventListener('click',start);
collection();updateHud();setPhase('intro');
