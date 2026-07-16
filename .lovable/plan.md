
## Cambios a implementar

### 1. Logo Gran Logia
Reemplazar logo actual con el nuevo (se subirá vía `lovable-assets` desde el archivo que compartirás — o si ya está el actual, ajústame cuál). Se usa tanto en hero como en footer.

### 2. Evento
- Cuenta regresiva: hasta **31 de agosto de 2026, 23:59** (ya configurado).
- Bloque "Detalles del evento":
  - **Fecha:** Jueves 3 de septiembre de 2026
  - **Hora:** 6:00 p.m.
  - **Lugar:** Templo de la R:.L:.S:.M:. Igualdad No. 1
- Actualizar Event JSON-LD (`startDate: 2026-09-03T18:00:00-06:00`, `location.name`).

### 3. Footer con 4 logos
Fila con los 4 logos (Gran Logia · Logia Igualdad · DeMolay · Capítulo Obsidiana) en escala de grises, hover a color, tamaño uniforme.

### 4. Grid de lotes: 2 columnas y aspecto 1:1
- Grid fijo `sm:grid-cols-2`.
- Contenedor de imagen `aspect-square`.

### 5. Carrusel de 2 imágenes por lote
- Migration: agregar columna `image_url_2 text` a `auction_items`.
- Card: `<Carousel>` con las 2 imágenes cuando existan; single image fallback.
- Admin: dos slots independientes ("Foto 1", "Foto 2") con upload/reemplazo por separado.

### 6. Botón "Descripción" con modal
En cada tarjeta: descripción corta (2 líneas truncadas) + botón **Descripción** que abre `Dialog` con el texto completo.

### 7. Pujas en vivo (realtime)
- Habilitar Realtime en `public.bids` (`ALTER PUBLICATION supabase_realtime ADD TABLE public.bids`).
- Cada tarjeta se suscribe a INSERTs de su `item_id` y refresca sin recargar.
- Panel "Últimas pujas" visible bajo cada lote con nombre + logia + monto + hora.

### 8. Admin Mauricio A. Salazar
Insertar en `auth.users` con email `mauricio.shn@gmail.com`, password `08594499` (bcrypt), email confirmado. Perfil con logia "R:.L:.S:.M:. Igualdad No. 1" y `user_roles` = `admin`.

### 9. Cargar los 4 artículos (textos del docx)
Se **eliminan los items actuales** y se insertan estos 4 con sus 2 fotos c/u (subidas desde las imágenes extraídas del docx) y sus descripciones completas:

1. **Busto de Francisco Morazán** — L. 1,250 — Autor QH:. Emilio España Core, 48 cm, pieza única.
2. **Pin Oficial de DeMolay** — L. 500 — Pieza de colección.
3. **Pisacorbatas Masónico** — L. 500 — Accesorio formal masónico.
4. **Masones en las Letras** — L. 500 — Libro de Nicolás Brihuega, 148 págs.

*(Si el precio base de "Masones en las Letras" debe ser distinto, ajústame el valor.)*

### 10. Banner promocional
Insertar el banner "Próximamente Nuestro Sitio Web · R:.L:.S:.M:. Igualdad No. 1" (imagen que acabas de subir) como sección full-width entre "Evento" y el footer, con contenedor responsive y `alt` descriptivo.

---

## Detalles técnicos

- **Migration**: `ALTER TABLE auction_items ADD COLUMN image_url_2 text` + habilitar realtime en `bids` + `REPLICA IDENTITY FULL` en `bids`.
- **Assets vía `lovable-assets create`**: 8 fotos de producto + banner promocional.
- **Insert admin**: `supabase--insert` con `crypt('08594499', gen_salt('bf'))`, luego `profiles` + `user_roles`.
- **Carrusel**: `@/components/ui/carousel` (shadcn).
- **Modal**: `Dialog` con scroll interno.
- **Realtime**: canal por `item_id` en `AuctionItem`, cleanup en unmount.
- **Admin editor**: refactor a dos slots de imagen con handlers separados.

## Fuera de alcance
- Rediseño del banner (se usa la imagen tal cual la enviaste).
- Cambios en OAuth/MCP.
