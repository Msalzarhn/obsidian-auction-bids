# Carga completa de artículos de la subasta

Se reemplazan los lotes actuales por los 34 artículos que tienen fotos en el ZIP, con galería de múltiples imágenes, usando el Excel como fuente oficial de título, descripción, precio inicial y número de lote. El registro de usuarios y las pujas en vivo siguen funcionando igual que hoy.

## Qué cambia para el visitante

- 34 lotes publicados, ordenados por su número de lote del Excel (se conservan los números originales, con huecos donde faltan fotos).
- Cada lote muestra una galería con todas sus fotos (hasta 5), navegables con flechas y puntos indicadores.
- Título, descripción completa (botón "Descripción") y precio inicial tomados del Excel.
- Registro, inicio de sesión y pujas en tiempo real sin cambios: se sigue viendo nombre, logia y monto de cada puja al instante.

## Qué cambia para el administrador

En `/admin`, cada lote pasa de dos casillas fijas de foto a una galería:
- Subir varias fotos a la vez.
- Reordenar (mover izquierda/derecha) y definir cuál es la portada.
- Eliminar fotos individuales.
- El resto (título, descripción, precio, orden, duplicar, eliminar, nuevo) se mantiene igual.

## Detalles técnicos

**Base de datos**
- Nueva tabla `auction_item_images` (`id`, `item_id` con FK en cascada, `url`, `sort_order`, `created_at`), con GRANTs (`SELECT` a `anon` y `authenticated`; escritura solo a admin vía política con `has_role`) y RLS habilitado.
- Se conservan `image_url` / `image_url_2` en `auction_items` por compatibilidad: `image_url` se sincroniza con la primera imagen de la galería (usada como portada y para SEO/OG).
- Migración que borra los 3 lotes actuales y sus pujas de prueba, e inserta los 34 lotes con `sort_order` = número de lote del Excel.

**Carga de imágenes**
- Se extraen las fotos del ZIP y se suben al CDN de assets del proyecto (se descartan los archivos "Captura de pantalla ..." que son capturas de referencia, no fotos del artículo).
- Orden dentro de cada lote según el prefijo numérico del archivo (01, 02, 03...).
- Emparejamiento carpeta → fila del Excel por coincidencia de título (normalizando acentos, comillas y signos); los casos con nombre distinto se mapean manualmente, por ejemplo:
  - "Emblema Masónico Metálico Premium para Vehículo" → lote 3
  - "Bolsa estilo Maletín Ejecutivo Porta Laptop Masónico Serie Freestyle" → lote 8
  - "Lote Exclusivo 20 Pines con Emblema Masónico" → lote 7
  - "Set de 4 Emblemas Masónicos Metálicos para Vehículo" → lote 18
  - "Gorra Clásica Vintage con Emblema Masónico" → lote 6 (y su variante beige, lote 60, queda pendiente hasta tener fotos propias)
- Precios: se limpia el formato `L. 1,200.00` a número entero de Lempiras.

**Frontend**
- `AuctionItem.tsx`: el carrusel pasa de dos imágenes fijas a la lista de la galería (1:1, indicadores cuando hay 3 o más).
- `index.tsx`: la consulta de lotes incluye las imágenes relacionadas; se mantiene la suscripción realtime de `bids`.
- `admin.tsx`: editor de galería (subida múltiple, reordenar, portada, eliminar).

## Pendiente para después

Los 26 artículos del Excel sin fotos no se publican. Cuando envíes sus imágenes, se agregan con su número de lote correspondiente sin tocar los ya cargados.
