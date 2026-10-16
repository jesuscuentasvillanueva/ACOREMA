# ACOREMA — web en español

Rediseño adaptable de la web de ACOREMA con su emblema oficial, fotografías y contenido institucional. Incluye portada y 28 páginas adicionales: 26 páginas migradas del sitio en español, juegos accesibles y créditos. Vite, JavaScript y CSS; no requiere backend ni secretos.

## Desarrollo

Node.js >=22.12 y npm (validado con Node 24).

```sh
npm ci
npm run generate
npm run dev
```

## Contenido

- `index.html`: portada.
- `content/official-pages.json`: contenido institucional migrado y sus fuentes.
- `scripts/generate-pages.mjs`: genera las páginas de contenido y comparte la cabecera y el pie de la portada. Editar el JSON o el generador en lugar de las páginas HTML generadas.
- `public/images/official/`: archivos originales de la web institucional, incluido el emblema.
- `public/media/`: cuatro spots de radio originales, reproducidos con audio HTML5.
- `content/source-assets.json`: procedencia de las imágenes.
- `content/resource-status.json`: comprobación HTTP y tipo de contenido de 158 enlaces oficiales, realizada el 16 de octubre de 2026. Los PDF respondieron como `application/pdf`.
- `content/MIGRATION.md`: alcance y equivalencias de la migración.

Los documentos y vídeos conservan sus enlaces oficiales y se abren en otra pestaña. Los archivos locales no dependen del sitio anterior para mostrarse. Los materiales históricos conservan sus fechas; no se anuncian actividades pasadas como convocatorias actuales. Los nuevos juegos de memoria y preguntas reemplazan el acceso a los antiguos interactivos que requerían complementos.

## Validación

```sh
npm run build
npm test
```

La compilación genera primero las páginas y crea el sitio estático en `dist/`. `npm run preview` sirve esa compilación. Las ocho pruebas verifican identidad, navegación entre páginas, enlaces e imágenes internos, pantallas de 320 px sin desbordamiento, búsqueda y filtros, galería con teclado, contacto, audio reproducible, memoria completa y puntuación del cuestionario. Axe revisa ocho tipos de página en escritorio y móvil. La revisión automática no certifica por sí sola conformidad completa con WCAG; no incluye una auditoría manual con lectores de pantalla ni transcripciones de los audios originales.

Playwright usa `/usr/bin/chromium` cuando existe. En otros equipos ejecutar `npx playwright install chromium` o indicar `PLAYWRIGHT_CHROMIUM_EXECUTABLE`.

## Publicación

`.github/workflows/deploy-pages.yml` instala, compila, prueba y despliega cada actualización de `main` en GitHub Pages. En el repositorio, la fuente de Pages debe ser **GitHub Actions**. Las rutas relativas admiten `/ACOREMA/`. La URL de producción es `https://jesuscuentasvillanueva.github.io/ACOREMA/`.

Fuentes: DM Sans y Manrope mediante Fontsource, con licencias incluidas en sus paquetes. Identidad, fotografías, documentos y audios: ACOREMA y los titulares indicados en los materiales. El sitio no incorpora seguimiento ni recoge formularios personales.
