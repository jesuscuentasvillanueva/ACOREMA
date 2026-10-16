import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createWorld,step,WIDTH} from '../src/game/engine.js';
test('las tres expediciones se completan pilotando, recogiendo y llegando a la salida',()=>{
 for(let level=0;level<3;level++){
 const w=createWorld(level);
 const navigate=(x,y)=>{for(let i=0;i<3000;i++){const dx=x-w.x,dy=y-w.y;if(w.done||Math.hypot(dx,dy)<38)return;step(w,{x:Math.max(-1,Math.min(1,dx/55)),y:Math.max(-1,Math.min(1,dy/55)),sonar:true},1/60);}throw new Error('Destino inaccesible');};
 for(const t of w.trash){navigate(t.x,t.y);expect(t.taken).toBe(true);}expect(w.done).toBe(false);navigate(WIDTH-100,270);expect(w.done).toBe(true);expect(w.collected).toBe(8);expect(w.score).toBeGreaterThanOrEqual(800);
 }
});
test('el turbo consume y recupera energía, las rocas bloquean y el sonar tiene recarga',()=>{
 const w=createWorld();for(let i=0;i<60;i++)step(w,{x:1,boost:true,sonar:true},1/60);expect(w.energy).toBeLessThan(80);expect(w.cooldown).toBeGreaterThan(5);const energy=w.energy;for(let i=0;i<60;i++)step(w,{},1/60);expect(w.energy).toBeGreaterThan(energy);
 const r=w.rocks[0];w.x=r.x-r.r-35;w.y=r.y;for(let i=0;i<120;i++)step(w,{x:1},1/60);expect(Math.hypot(w.x-r.x,w.y-r.y)).toBeGreaterThanOrEqual(r.r+33);expect(w.hits).toBeGreaterThan(0);
});
for(const width of [320,390,1280])test(`aventura accesible y controles continuos a ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/guardianes.html');await expect(page.locator('#start-game')).toBeVisible();expect((await new AxeBuilder({page}).include('#ocean-game').analyze()).violations).toEqual([]);
 await page.locator('#start-game').click();await expect(page.locator('#ocean-game')).toHaveAttribute('data-phase','playing');await page.keyboard.down('ArrowRight');await page.waitForTimeout(1400);await page.keyboard.up('ArrowRight');await expect(page.locator('#trash-count')).toHaveText('1 / 8 residuos');
 await page.keyboard.press('Escape');await expect(page.locator('#resume-game')).toBeVisible();const before=await page.locator('#game-points').textContent();await page.waitForTimeout(200);expect(await page.locator('#game-points').textContent()).toBe(before);await page.locator('#resume-game').click();
 const boost=page.locator('#boost-game');await boost.dispatchEvent('pointerdown',{pointerId:1});await page.waitForTimeout(250);await boost.dispatchEvent('pointerup',{pointerId:1});expect(Number(await page.locator('#energy').getAttribute('value'))).toBeLessThan(100);
 await page.locator('#pause-game').click();await page.locator('#restart-game').click();await expect(page.locator('#trash-count')).toHaveText('0 / 8 residuos');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect((await new AxeBuilder({page}).include('#ocean-game').analyze()).violations).toEqual([]);expect(errors).toEqual([]);
});
test('el juego funciona con el almacenamiento bloqueado y se descubre desde juegos',async({page})=>{await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});await page.goto('/juegos.html');await page.locator('a[href="./guardianes.html"]').click();await page.locator('#start-game').click();await expect(page.locator('#ocean-game')).toHaveAttribute('data-phase','playing');});
