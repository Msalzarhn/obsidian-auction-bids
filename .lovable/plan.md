# Plan: Logo Gran Logia + Dashboard admin de artículos

## 1. Logos en el hero
- Esperar la subida del logo de la **Gran Logia de Honduras** y guardarlo como asset (`src/assets/gran-logia-honduras.png.asset.json`).
- Rediseñar el encabezado del hero en `src/routes/index.tsx`:
  - **Logo Capítulo Daga de Obsidiana** grande y centrado como protagonista (con halo/brillo dorado, tamaño ~180–220px).
  - Debajo, una fila más pequeña con los 3 logos de apoyo: **Logia Igualdad No. 1**, **Gran Logia de Honduras**, **DeMolay** (cada uno ~72px, separados con divisor sutil y etiqueta corta).

## 2. Roles y acceso admin
- Migración: crear enum `app_role`, tabla `user_roles` (con GRANTs), función `has_role()` SECURITY DEFINER (patrón estándar anti-recursión).
- Asignar rol `admin` al primer usuario que designemos por email (te pediré el correo al pasar a build, o lo insertaré vía `supabase--insert` después del signup).
- Nueva ruta protegida `src/routes/_authenticated/admin.tsx` gated con `has_role` (redirige a `/` si no es admin).
- Enlace "Admin" visible en el header solo cuando `has_role('admin')` sea true.

## 3. Storage para fotos
- Crear bucket público `auction-images` (via `storage_create_bucket`).
- Policies en `storage.objects`: lectura pública; INSERT/UPDATE/DELETE solo para admins (`has_role`).
- El componente admin sube el archivo con `supabase.storage.from('auction-images').upload(...)` y guarda la URL pública en `auction_items.image_url`.

## 4. Ampliar RLS en `auction_items`
- Policies nuevas: `INSERT/UPDATE/DELETE` solo para admins vía `has_role(auth.uid(),'admin')`. Mantener SELECT público.

## 5. Insertar 3 nuevos artículos (sin borrar los 8 actuales)
Via `supabase--insert` con `sort_order` continuando después de los existentes:
- **Busto de Francisco Morazán** — descripción placeholder, precio base placeholder.
- **Pin de la Orden DeMolay** — placeholder.
- **Pinza de corbata masónica** — placeholder.
Editables desde el dashboard.

## 6. Dashboard admin (`/admin`)
Página con tabla/tarjetas de todos los `auction_items`:
- Editar in-place: título, descripción, precio inicial, `sort_order`.
- Subida de foto (drag & drop o input file) → sube a Storage → actualiza `image_url`.
- Botón "Nuevo artículo" y "Eliminar".
- Preview de imagen actual.
- Toasts de éxito/error.

## 7. Mostrar imagen real en `ItemCard`
En `src/components/AuctionItem.tsx`: si `item.image_url` existe, mostrarla como `<img>` en el aspect-ratio del card; si no, mantener el placeholder actual del ícono Gavel.

---

### Detalles técnicos
- Todo cliente-side con `supabase` browser client + RLS (no hacen falta server functions).
- `use-auth.ts` se extiende para exponer `isAdmin` (consulta `user_roles` una vez al login).
- Se aplicará `pnpm`-nada; sin nuevas dependencias.

### Lo que necesito de ti al aprobar
1. Adjuntar el **logo de la Gran Logia de Honduras**.
2. Confirmar el **email del admin inicial** (o me dices que lo asignas tú después desde el panel de Cloud).
