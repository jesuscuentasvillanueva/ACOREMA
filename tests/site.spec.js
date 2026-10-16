import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('desktop: navigation, learning content and accessible dialogs', async ({ page }) => {
  const errors=[]; page.on('pageerror', e=>errors.push(e.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/ACOREMA/);
  await expect(page.locator('h1')).toContainText('Un mar de vida.');
  await page.getByRole('link',{name:/Descubre nuestro trabajo/}).click();
  await expect(page).toHaveURL(/#trabajo$/);
  await page.getByRole('button',{name:'Conoce la vida marina'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Un océano lleno de vecinos'})).toBeVisible();
  const dialogResults=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(dialogResults.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button',{name:'Conoce la vida marina'})).toBeFocused();
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  expect(errors).toEqual([]);
  await page.goto('/'); await page.screenshot({path:'/tmp/acorema-desktop.png',fullPage:true});
});

test('mobile: menu, content, contact and no horizontal overflow',async ({page})=>{
  await page.setViewportSize({width:390,height:844}); await page.goto('/');
  const menu=page.getByRole('button',{name:'Menú'});
  await expect(menu).toHaveAttribute('aria-expanded','false');
  await menu.click(); await expect(menu).toHaveAttribute('aria-expanded','true');
  await page.getByRole('navigation').getByRole('link',{name:'Participa',exact:true}).click();
  await expect(menu).toHaveAttribute('aria-expanded','false');
  await page.getByRole('button',{name:/Quiero participar/}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('link')).toHaveAttribute('href','https://www.acorema.org.pe/');
  await page.getByRole('button',{name:'Cerrar ventana'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.goto('/'); await page.screenshot({path:'/tmp/acorema-mobile.png',fullPage:true});
});

test('every content action opens its own content and can close', async ({page})=>{
  await page.goto('/');
  const buttons=page.locator('[data-dialog]');
  for(let i=0;i<await buttons.count();i++){
    await buttons.nth(i).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#dialog-title')).not.toBeEmpty();
    await page.getByRole('button',{name:'Entendido'}).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
});
