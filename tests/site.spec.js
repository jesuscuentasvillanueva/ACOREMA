import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const pages=JSON.parse(fs.readFileSync('content/official-pages.json','utf8'));

test('official identity, real navigation and keyboard dialog',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('header .brand img')).toHaveAttribute('src','./images/official/acorema-symbol.png');
 await page.getByRole('link',{name:'Más sobre nosotros'}).click();
 await expect(page).toHaveURL(/nosotros.html$/);
 await expect(page.locator('.prose')).toContainText('1995');
 await page.getByRole('link',{name:'Misión y visión',exact:true}).first().click();
 await expect(page.locator('main')).toContainText('Contribuir a la sostenibilidad marino-costera');
 await page.goto('/');
 await page.locator('.faq-list summary').filter({hasText:'¿Qué puedo hacer hoy por el mar?'}).click();
 await page.getByRole('button',{name:'Pequeñas acciones, gran cambio'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'Pequeñas acciones, gran cambio'})).toBeFocused();
 expect(errors).toEqual([]);
});

test('all pages load, all internal links and images exist, mobile layouts fit',async({page,request})=>{
 const localLinks=new Set();const assets=new Set();
 for(const slug of ['index',...pages.map(p=>p.slug),'juegos','fuentes']){
  const response=await page.goto(`/${slug}.html`);
  expect(response.status(),slug).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
  expect((await page.locator('main').innerText()).length,slug).toBeGreaterThan(100);
  for(const href of await page.locator('a[href]').evaluateAll(links=>links.map(a=>a.getAttribute('href')))){
   if(href.startsWith('./')&&!href.includes('/images/'))localLinks.add(href.split('#')[0]);
  }
  for(const src of await page.locator('img').evaluateAll(imgs=>imgs.map(img=>img.getAttribute('src'))))assets.add(src);
  await page.setViewportSize({width:320,height:800});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),slug).toBe(true);
 }
 for(const href of [...localLinks,...assets]){
  const response=await request.get(new URL(href,'http://127.0.0.1:5173/').href);
  expect(response.status(),href).toBe(200);
 }
});

test('resource search, accents, format filter, zero results and restored catalog',async({page})=>{
 await page.goto('/materiales.html');
 const all=await page.locator('.resource-card:visible').count();expect(all).toBeGreaterThan(25);
 await page.getByLabel('Buscar en esta colección').fill('pinguino');
 const filtered=await page.locator('.resource-card:visible').count();expect(filtered).toBeGreaterThan(0);expect(filtered).toBeLessThan(all);
 await page.getByLabel('Buscar en esta colección').fill('noexistezzzz');
 await expect(page.locator('.no-results')).toBeVisible();
 await expect(page.locator('#result-number')).toHaveText('0');
 await page.getByLabel('Buscar en esta colección').fill('');
 await expect(page.locator('.resource-card:visible')).toHaveCount(all);
 await page.goto('/clima.html');
 await page.getByLabel('Formato', {exact:true}).selectOption('Vídeo');
 expect(await page.locator('.resource-card:visible').count()).toBe(15);
 await expect(page.locator('.resource-card:visible').first()).toContainText('Conoce el Humedal de Pisco Playa');
 await page.goto('/boletines.html');await expect(page.locator('.resource-card')).toHaveCount(86);
});

test('gallery navigation, full image loading, Escape and focus return',async({page})=>{
 await page.goto('/galeria.html');
 const first=page.locator('.gallery-photo').first();await first.click();
 await expect(page.locator('#image-dialog')).toBeVisible();
 await expect(page.locator('#image-counter')).toHaveText('1 / 9');
 await expect.poll(()=>page.locator('#lightbox-image').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 await page.keyboard.press('ArrowRight');await expect(page.locator('#image-counter')).toHaveText('2 / 9');
 await page.keyboard.press('ArrowLeft');await expect(page.locator('#image-counter')).toHaveText('1 / 9');
 await page.keyboard.press('Escape');await expect(first).toBeFocused();
});

test('mobile menu, direct institutional contact and playable audio',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const menu=page.getByRole('button',{name:'Menú'});await menu.click();
 await expect(menu).toHaveAttribute('aria-expanded','true');
 await page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Conversemos'}).click();
 await expect(page).toHaveURL(/contacto.html$/);
 await expect(page.locator('.contact-grid a[href="mailto:acoremabiodiverso@yahoo.com"]').first()).toBeVisible();
 await expect(page.locator('.contact-grid a[href="tel:+5156534094"]')).toBeVisible();
 await page.goto('/spots.html');await expect(page.locator('audio')).toHaveCount(4);
 await page.locator('audio').first().evaluate(audio=>audio.load());
 await expect.poll(()=>page.locator('audio').first().evaluate(audio=>Number.isFinite(audio.duration)&&audio.duration>0)).toBe(true);
});

test('memory game can be completed, reset and quiz grades actual answers',async({page})=>{
 await page.goto('/juegos.html');
 const known=new Map();
 for(let i=0;i<12;i+=2){
  for(const j of [i,i+1]){
   const card=page.locator('#memory-board button').nth(j);
   await card.click();
   const value=await card.innerText();
   if(!known.has(value))known.set(value,[]);
   known.get(value).push(j);
  }
  if(await page.locator('#memory-continue').isVisible())await page.locator('#memory-continue').click();
 }
 for(const indices of known.values()){
  const first=page.locator('#memory-board button').nth(indices[0]);
  if(await first.getAttribute('aria-disabled')==='true')continue;
  await first.click();
  await page.locator('#memory-board button').nth(indices[1]).click();
 }
 await expect(page.locator('#memory-status')).toContainText('6 de 6 parejas');
 await page.getByRole('button',{name:'Reiniciar juego'}).click();
 await expect(page.locator('#memory-status')).toHaveText('0 de 6 parejas · 0 intentos');
 await page.getByLabel('1995',{exact:true}).check();
 await page.getByLabel('En la provincia de Pisco').check();
 await page.getByLabel('Investigación y conservación',{exact:true}).check();
 await page.getByRole('button',{name:'Comprobar respuestas'}).click();
 await expect(page.locator('#quiz-result')).toContainText('3 de 3 respuestas correctas');
});

for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
 test(`WCAG automatic checks across representative pages at ${viewport.width}px`,async({page})=>{
  test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize(viewport);
  for(const slug of ['index','nosotros','mision-vision','materiales','campanas','galeria','juegos','contacto','ballenas']){
   await page.goto(`/${slug}.html`);
   const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),slug).toEqual([]);
  }
 });
}

test('species explorer supports keyboard tabs and links to real campaigns',async({page})=>{
 await page.goto('/');
 const tabs=page.getByRole('tablist',{name:'Explorar especies marinas'});
 await tabs.getByRole('tab',{name:'Bufeos'}).focus();
 await page.keyboard.press('ArrowRight');
 await expect(tabs.getByRole('tab',{name:'Pingüinos'})).toBeFocused();
 await expect(tabs.getByRole('tab',{name:'Pingüinos'})).toHaveAttribute('aria-selected','true');
 await expect(page.getByRole('tabpanel',{name:'Pingüinos'})).toBeVisible();
 await expect(page.getByRole('tabpanel',{name:'Bufeos'})).not.toBeVisible();
 await page.keyboard.press('End');await expect(tabs.getByRole('tab',{name:'Aves marinas'})).toBeFocused();
 await page.keyboard.press('Home');await expect(tabs.getByRole('tab',{name:'Bufeos'})).toBeFocused();
 await page.getByRole('tabpanel',{name:'Bufeos'}).getByRole('link').click();
 await expect(page).toHaveURL(/campanas.html$/);
});

test('audience recommendations, useful FAQ and reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.getByRole('button',{name:'Soy docente',exact:true}).click();
 await expect(page.getByRole('button',{name:'Soy docente',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#route-status')).toHaveText('Recursos para acercar el mar a tu aula.');
 await expect(page.locator('#route-cards a').first()).toHaveAttribute('href','./materiales.html');
 await page.getByRole('button',{name:'Quiero colaborar',exact:true}).click();
 await expect(page.locator('#route-cards a').last()).toHaveAttribute('href','./contacto.html');
 await page.locator('.faq-list summary').nth(1).click();
 await expect(page.locator('.faq-list details').nth(1)).toHaveAttribute('open','');
 await expect(page.locator('.faq-list details').nth(1)).toContainText('indicando la fuente');
 await expect(page.locator('html')).not.toHaveClass(/reveal-enabled/);
});

test('global search finds pages and resources, supports shortcut and restores focus',async({page})=>{
 await page.goto('/');
 const open=page.getByRole('button',{name:'Buscar en ACOREMA',exact:true});await open.click();
 const search=page.getByRole('dialog',{name:'Un mar de respuestas.'});
 await expect(search).toBeVisible();
 const input=search.getByLabel('¿Qué quieres descubrir?');
 await expect(search.locator('.search-results a')).toHaveCount(12);
 await search.getByRole('button',{name:'Mostrar más resultados'}).click();
 await expect(search.locator('.search-results a')).toHaveCount(24);
 await input.fill('pinguino');
 await expect(search.locator('.search-results a').first()).toBeVisible();
 await search.getByRole('button',{name:'Páginas',exact:true}).click();
 await expect(search.locator('.search-results')).toContainText('Un futuro para el pingüino de Humboldt');
 await search.getByRole('button',{name:'Recursos',exact:true}).click();
 await expect(search.locator('.search-results a').first()).toHaveAttribute('target','_blank');
 await input.fill('ningunresultadozzzzz');await expect(search.locator('.search-status')).toContainText('No encontramos resultados');
 await page.keyboard.press('Escape');await expect(open).toBeFocused();
 await page.keyboard.press('Control+k');await expect(search).toBeVisible();
 await search.getByRole('button',{name:'Todo',exact:true}).click();
 await input.fill('Misión y visión');
 await search.getByRole('link').first().click();await expect(page).toHaveURL(/mision-vision.html$/);
 await page.getByRole('button',{name:'Buscar en ACOREMA',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Un mar de respuestas.'})).toBeVisible();
});

test('search failure offers a retry and accessible mobile dialog',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.route('**/search-index.json',route=>route.abort());
 await page.goto('/');await page.getByRole('button',{name:'Buscar en ACOREMA',exact:true}).click();
 await expect(page.locator('.search-status')).toContainText('No pudimos cargar el buscador');
 await page.getByRole('button',{name:'Cerrar búsqueda'}).click();
 await page.unroute('**/search-index.json');
 await page.getByRole('button',{name:'Buscar en ACOREMA',exact:true}).click();
 await expect(page.locator('.search-results a').first()).toBeVisible();
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 expect(results.violations).toEqual([]);
});

test('mission and vision preserve institutional text and turn principles into navigable content',async({page})=>{
 await page.goto('/mision-vision.html');
 await expect(page.locator('.purpose-mission')).toContainText('Contribuir a la sostenibilidad marino-costera');
 await expect(page.locator('.purpose-vision')).toContainText('Queremos ser reconocidos como una organización');
 const conservation=page.locator('.purpose-details details').nth(1);
 await conservation.locator('summary').focus();await page.keyboard.press('Enter');
 await expect(conservation).toHaveAttribute('open','');
 await expect(conservation.getByRole('link')).toBeVisible();
 await conservation.getByRole('link').click();await expect(page).toHaveURL(/campanas.html$/);
});
