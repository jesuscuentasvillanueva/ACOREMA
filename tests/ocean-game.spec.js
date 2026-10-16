import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function state(page){
 return page.locator('#ocean-board').evaluate(board=>[...board.querySelectorAll('[role=gridcell]')].map(b=>({x:Number(b.dataset.x),y:Number(b.dataset.y),label:b.getAttribute('aria-label'),selected:b.getAttribute('aria-selected')==='true'})));
}
function route(cells,start,target){
 const blocked=new Set(cells.filter(c=>c.label.includes('Dale espacio')).map(c=>`${c.x},${c.y}`));
 const queue=[{...start,path:[]}],seen=new Set([`${start.x},${start.y}`]);
 while(queue.length){
  const cur=queue.shift();if(cur.x===target.x&&cur.y===target.y)return cur.path;
  for(const [key,dx,dy] of [['ArrowUp',0,-1],['ArrowDown',0,1],['ArrowLeft',-1,0],['ArrowRight',1,0]]){
   const x=cur.x+dx,y=cur.y+dy,id=`${x},${y}`;
   if(x<0||x>5||y<0||y>4||blocked.has(id)||seen.has(id))continue;
   seen.add(id);queue.push({x,y,path:[...cur.path,key]});
  }
 }
 throw Error('A game objective is unreachable');
}
async function collectLevel(page){
 for(let i=0;i<8;i++){
  const cells=await state(page),target=cells.find(c=>c.label.includes('Residuo:'));
  if(!target)return;
  const start=cells.find(c=>c.selected);const keys=route(cells,start,target);
  await page.locator('#ocean-board [aria-selected=true]').focus();
  for(const key of keys)await page.keyboard.press(key);
 }
 throw Error('Level did not finish');
}

test('three complete missions, educational choices, rewards, local badges and replay',async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/guardianes.html');
 await page.getByRole('button',{name:'¡Vamos al mar!'}).click();
 await expect(page.locator('#ocean-game')).toHaveAttribute('data-phase','playing');
 const answers=['Botellas, bolsas y otros residuos.','Lo observo a distancia.','Con una persona adulta y protección.'];
 for(let level=0;level<3;level++){
  await collectLevel(page);
  await expect(page.locator('#ocean-game')).toHaveAttribute('data-phase','question');
  if(level===0){const check=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(check.violations).toEqual([]);}
  if(level===0){
   await page.getByRole('button',{name:'Los animales que encontramos.'}).click();
   await expect(page.locator('#question-feedback')).toContainText('Puedes intentarlo');
  }
  await page.getByRole('button',{name:answers[level],exact:false}).click();
  await expect(page.locator('.ocean-fact')).toBeVisible();
  if(level===0){const check=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(check.violations).toEqual([]);}
  await expect(page.locator('#badge-count')).toHaveText(`${level+1} / 3`);
  await expect(page.locator('.reward-stars')).toHaveAttribute('aria-label','3 de 3 estrellas');
  await page.getByRole('button',{name:level===2?'Ver mi aventura':'Siguiente misión'}).click();
 }
 await expect(page.locator('#ocean-game')).toHaveAttribute('data-phase','finished');
 await expect(page.locator('.final-panel')).toContainText('150 puntos');
 await expect(page.locator('.badge-collection>div')).toHaveCount(3);
 const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(a11y.violations).toEqual([]);
 await page.getByRole('button',{name:'Jugar otra aventura'}).click();
 await expect(page.locator('#game-points')).toHaveText('0');
 await expect(page.locator('#mission-number')).toHaveText('MISIÓN 1 DE 3');
 await page.reload();await expect(page.locator('#badge-count')).toHaveText('3 / 3');
 expect(errors).toEqual([]);
});

test('movement, animal protection, pause and resume preserve the mission',async({page})=>{
 await page.goto('/guardianes.html');await page.getByRole('button',{name:'¡Vamos al mar!'}).click();
 const cells=await state(page);const animal=cells.find(c=>c.label.includes('Dale espacio'));
 const adjacent={x:animal.x-1,y:animal.y};
 for(const key of route(cells,cells.find(c=>c.selected),adjacent))await page.keyboard.press(key);
 await page.keyboard.press('Control+a');
 await expect(page.locator('#ocean-board [aria-selected=true]')).toHaveAttribute('data-x',String(adjacent.x));
 const before=await page.locator('#trash-count').innerText();
 await page.keyboard.press('ArrowRight');
 await expect(page.locator('#ocean-status')).toContainText('¡Dale espacio al bufeo!');
 await expect(page.locator('#ocean-board [aria-selected=true]')).toHaveAttribute('data-x',String(adjacent.x));
 await page.getByRole('button',{name:'Pausar'}).click();
 await expect(page.locator('#ocean-game')).toHaveAttribute('data-phase','paused');
 await expect(page.getByRole('button',{name:'Mover arriba'})).toBeDisabled();
 await page.getByRole('button',{name:'Seguir explorando'}).click();
 await expect(page.locator('#trash-count')).toHaveText(before);
 await expect(page.locator('#ocean-board [aria-selected=true]')).toHaveAttribute('data-x',String(adjacent.x));
 await page.keyboard.press('Escape');await expect(page.locator('#ocean-game')).toHaveAttribute('data-phase','paused');
 await page.getByRole('button',{name:'Empezar de nuevo',exact:true}).click();
 await expect(page.locator('#ocean-board [aria-selected=true]')).toHaveAttribute('data-x','0');
 await expect(page.locator('#trash-count')).toHaveText('0 / 4');
 const fresh=await state(page);
 for(const key of route(fresh,fresh.find(c=>c.selected),adjacent))await page.keyboard.press(key);
 for(let i=0;i<3;i++)await page.keyboard.press('ArrowRight');
 await collectLevel(page);await page.getByRole('button',{name:'Botellas, bolsas y otros residuos.'}).click();
 await expect(page.locator('.reward-stars')).toHaveAttribute('aria-label','2 de 3 estrellas');
});

for(const width of [320,390,1280])test(`touch controls, layout and accessibility at ${width}px`,async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width,height:900});await page.goto('/guardianes.html');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 let results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations).toEqual([]);
 await page.getByRole('button',{name:'¡Vamos al mar!'}).click();
 await page.getByRole('button',{name:'Mover arriba'}).click();
 await expect(page.locator('#ocean-board [aria-selected=true]')).toHaveAttribute('data-y','3');
 await page.locator('#ocean-board [data-x="1"][data-y="3"]').click();
 await expect(page.locator('#ocean-board [aria-selected=true]')).toHaveAttribute('data-x','1');
 results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations).toEqual([]);
 expect(await page.locator('.animal-tile svg').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('blocked or corrupt browser storage does not prevent playing',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('Storage blocked')};Storage.prototype.setItem=()=>{throw Error('Storage blocked')};});
 await page.goto('/guardianes.html');await expect(page.locator('#badge-count')).toHaveText('0 / 3');
 await page.getByRole('button',{name:'¡Vamos al mar!'}).click();await collectLevel(page);
 await page.getByRole('button',{name:'Botellas, bolsas y otros residuos.'}).click();
 await expect(page.locator('#next-mission')).toBeVisible();
});

test('game can be discovered from the existing games section',async({page})=>{
 await page.goto('/juegos.html');await page.getByRole('link',{name:/NUEVO · VIDEOJUEGO PARA NIÑOS/}).click();
 await expect(page).toHaveURL(/guardianes.html$/);
 await expect(page.getByRole('button',{name:'¡Vamos al mar!'})).toBeVisible();
});
