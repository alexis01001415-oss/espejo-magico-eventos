# Lúmina — espejo mágico para eventos

Prototipo de landing para renta en Ciudad de México y Estado de México. La marca **Lúmina** es provisional hasta confirmar el nombre comercial. El sitio está preparado para publicarse en GitHub Pages.

## Vista local

```bash
npm ci
npm run dev
```

Para verificar el paquete de producción:

```bash
npm run lint
npm run build
npm run preview
```

La construcción copia a `site-public/` únicamente favicon, imagen social y los assets web del espejo. Los archivos `.blend`, scripts de modelado e imágenes de referencia no se publican.

Las tipografías Unbounded y Albert Sans se sirven localmente como fuentes variables latinas precargadas. Los iconos se importan individualmente desde Google Material Symbols SVG, sin descargar la fuente completa de iconos.

## Contacto

El formulario prepara una solicitud. Sin un número real configurado, la copia al portapapeles y explica que el canal de reservas está pendiente. Para conectar WhatsApp, define `VITE_WHATSAPP_NUMBER` con el número internacional **sin `+`**, espacios ni guiones en el entorno de construcción o como variable del repositorio en GitHub Actions. Entonces el botón abre `wa.me` con el texto preparado.

Antes de anunciar la web como servicio activo, confirma el nombre de marca, número de contacto, alcance de la renta, si cámara e impresora están incluidas y fotos del equipo final. La ficha de Amazon presenta variantes distintas y no permite atribuir esos accesorios a la renta de forma automática.

## Modelo 3D

- [`public/models/espejo-magico.blend`](public/models/espejo-magico.blend): fuente Blender editable.
- [`public/models/espejo-magico.glb`](public/models/espejo-magico.glb): modelo WebGL de 1,2 MB con piezas independientes.
- [`public/models/espejo-magico-poster.webp`](public/models/espejo-magico-poster.webp): respaldo con transparencia para la carga inicial o dispositivos sin WebGL.
- [`public/models/README.md`](public/models/README.md): pivotes, medidas orientativas y límites de fidelidad.

La escena 3D carga en un bloque separado: en móvil cuando la persona comienza a desplazarse y en escritorio después del primer momento de lectura. Se mueve con el scroll, detiene el render cuando queda estable y limita la densidad de píxeles. Con `prefers-reduced-motion` se muestra el poster y no se descargan Three.js ni el GLB. Las apariciones de contenido usan `IntersectionObserver` y CSS. No se usó Draco porque el GLB ya es pequeño y un decodificador adicional aumentaría el tiempo de carga.

## GitHub Pages

Al publicar un `push` a `main`, [el flujo de Pages](.github/workflows/pages.yml) compila y despliega `dist/`. Calcula la ruta base para repositorios de proyecto o de usuario y genera `canonical`, metadatos sociales, `robots.txt` y `sitemap.xml` con la URL del repositorio.

Configura en el repositorio **Settings → Pages → Build and deployment → Source: GitHub Actions**. La variable opcional `VITE_WHATSAPP_NUMBER` se debe exponer en el paso de build si quieres activar el contacto directo.

El SEO técnico, los datos estructurados, el contenido local y la imagen social están preparados; ningún prototipo puede garantizar una posición concreta en Google. GitHub Pages no permite definir cabeceras HTTP propias, por lo que las cabeceras de seguridad avanzadas requerirían otro hosting o una capa CDN.

## QA

Los scripts `node scripts/visual-check.mjs` y `node scripts/quality-check.mjs` usan Chrome instalado en Windows y un servidor local en `http://127.0.0.1:5173/`. Verifican composición, consola, desbordamiento, menú, formulario y WCAG A/AA con Axe. No forman parte del despliegue.
