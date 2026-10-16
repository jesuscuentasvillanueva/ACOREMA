# ACOREMA — propuesta web en español

Primera versión de una web centrada en las personas: presentación de la organización, líneas de trabajo, contenidos educativos y vías para participar. Diseño adaptable, navegación con teclado, diálogos nativos y tipografías alojadas en el proyecto. Vite, JavaScript y CSS, sin backend ni credenciales.

## Desarrollo

Requisitos: Node.js 22.12 o posterior (validado con Node 24) y npm.

```sh
npm ci
npm run dev
```

## Validación

```sh
npm run build
npm test
```

Las pruebas usan Chromium del sistema cuando existe en `/usr/bin/chromium`. En otro equipo, instalar el navegador con `npx playwright install chromium` o indicar `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Comprueban la navegación, el menú móvil, todos los diálogos, retorno del foco, ausencia de desbordamiento horizontal y reglas automáticas WCAG A/AA mediante axe. Una auditoría automática no sustituye pruebas manuales con tecnologías de asistencia.

`npm run preview` sirve la compilación de producción. `dist/` puede desplegarse en un alojamiento estático. No se ha publicado esta propuesta.

## Pendiente de revisión editorial

La web original devolvió HTTP 403 desde el entorno de trabajo. Los textos son una propuesta; deben validarse con ACOREMA antes de publicar. No se han migrado el historial institucional, proyectos específicos, noticias, datos de contacto ni documentos del sitio original. El enlace institucional externo no pudo verificarse desde este entorno.

La imagen principal es conceptual, generada para la propuesta, y no representa una fotografía de campo de ACOREMA. El símbolo de marca y las ilustraciones son provisionales. Sustituirlos por el material institucional aprobado. No se inventan cifras, testimonios, donaciones procesadas ni convocatorias. Las opciones de colaboración explican el estado y remiten al sitio institucional; no recogen datos personales.

Fuentes: DM Sans y Manrope, distribuidas por Fontsource con sus respectivas licencias en `node_modules/@fontsource/`.

## GitHub Pages

El flujo `.github/workflows/deploy-pages.yml` compila y despliega automáticamente cada actualización de `main`. En GitHub, activar **Settings → Pages → Build and deployment → Source: GitHub Actions**. Después, ejecutar **Actions → Publicar en GitHub Pages → Run workflow** si el primer despliegue falló antes de activar Pages. La URL efectiva aparece en el resultado del despliegue; no asumir que está publicada hasta comprobarla. Los recursos usan rutas relativas para admitir el subdirectorio `/ACOREMA/`.
