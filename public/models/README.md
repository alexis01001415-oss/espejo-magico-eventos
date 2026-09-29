# Espejo mágico 3D

Modelo original para la landing. Archivos finales:

- `espejo-magico.glb` — asset WebGL/glTF, aproximadamente 1.2 MB.
- `espejo-magico-poster.webp` — render 900 × 1200, canal alfa, para carga inicial y fallback sin WebGL.
- `espejo-magico.blend` — fuente editable en Blender 5.1.
- `build_model.py` — generador reproducible (`blender -b --python public/models/build_model.py`).

## Contrato para Three.js

- Unidades: metros. Alto del equipo sin paraguas: aproximadamente **1.63 m**. Ancho máximo de la base: **0.46 m**. La referencia comercial indica 163 × 45 cm, pero no proporciona planos CAD.
- Frente del equipo: **+Z** tras exportar a glTF. Eje vertical: **+Y**. `MagicMirror_Root` tiene su origen en el centro de la base, a nivel de piso.
- Grupos de primer nivel, cada uno con pivote propio para animación: `Chassis`, `MirrorGlass`, `TouchDisplay`, `LED_Frame`, `Camera`, `RearHousing`, `Stand`, `PrinterShelf`, `Wheels`, `SoftboxUmbrella`.
- `SoftboxUmbrella` está en el GLB como accesorio separado y visible por defecto. Para el hero sin paraguas: `scene.getObjectByName('SoftboxUmbrella').visible = false`.
- Se puede animar el despiece moviendo esos grupos sin dividir geometría en tiempo de ejecución.
- La cara del espejo usa PBR oscuro; un `environmentMap` de estudio mejora la reflexión en WebGL. El poster ya trae iluminación de estudio.
- El soporte de impresora aparece en el modelo; **no se incluye una impresora**, pues el listado comercial muestra variantes y accesorios.

## Referencia y fidelidad

La silueta se modeló a partir del [anuncio de Amazon México, ASIN B0GCBZPJ5D](https://www.amazon.com.mx/dp/B0GCBZPJ5D) y sus [fotografía frontal](https://m.media-amazon.com/images/I/71yP+sDTl-L._AC_SL1500_.jpg), [diagrama de piezas](https://m.media-amazon.com/images/I/71hoaI5JCPL._AC_SL1500_.jpg) y [lámina de medidas](https://m.media-amazon.com/images/I/61G7cDXiy0L._AC_SL1500_.jpg). Las imágenes no se redistribuyen aquí.

El listado mezcla medidas de pantalla entre sus láminas (21.5 y 32 pulgadas). El modelo respeta la silueta externa y representa una pantalla interna aproximada; no es una copia CAD ni avala especificaciones de hardware. Los materiales, detalles de cierre, rueda y ventilación son interpretaciones visuales para la experiencia web.

## Optimización

El GLB no usa Draco porque ya pesa alrededor de 1.2 MB y se carga con `GLTFLoader` estándar; añadir Draco incrementaría dependencias y tiempo de decodificación. La ventilación trasera y las varillas del paraguas se agrupan en pocas mallas, mientras las piezas útiles para animación permanecen separadas.
