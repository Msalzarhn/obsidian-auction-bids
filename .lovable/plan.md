## Cambios

### 1. Nueva fecha de cierre: 31 de agosto de 2026, 23:59 (hora de Honduras)
- `src/components/Countdown.tsx`: cambiar `DEADLINE` a `2026-08-31T23:59:59-06:00`.
- Migración SQL: actualizar la función `validate_bid()` para usar la nueva fecha límite (`2026-08-31 23:59:59-06`).
- Revisar `src/routes/index.tsx` por si aparece la fecha en algún texto y actualizarla.

### 2. Panel de administrador — mejoras
Actualmente en `/admin` ya puedes **crear**, **editar** y **eliminar**. Añadiré:
- Botón **Duplicar** en cada tarjeta de artículo: crea una copia con el mismo título (con sufijo "(copia)"), descripción, precio, imagen y `sort_order` al final de la lista.
- El botón **Eliminar** ya existe y seguirá pidiendo confirmación.
- El botón **Nuevo** (arriba a la derecha) ya crea artículos vacíos.

### 3. Guía de uso del panel (te la explico aquí, no va al código)

**Acceso**: inicia sesión con tu correo admin y entra a `/admin` (aparece "Admin" en el header cuando tu cuenta tiene el rol).

**Por cada artículo** verás una tarjeta con:
- **Foto**: botón *Subir foto / Cambiar foto* — sube desde tu equipo, se guarda en el bucket privado y se genera URL firmada.
- **Título / Descripción / Precio base (L.) / Orden**: campos editables. "Orden" controla la posición en la página pública (menor = primero).
- **Guardar**: confirma los cambios (obligatorio después de subir foto).
- **Duplicar** *(nuevo)*: crea una copia idéntica que puedes editar.
- **Eliminar**: borra el artículo (con confirmación).

**Nuevo** (arriba): agrega un artículo en blanco al final para editar.

---

### Detalles técnicos
- Migración: `CREATE OR REPLACE FUNCTION public.validate_bid()` con el nuevo `deadline`.
- Duplicar: `supabase.from("auction_items").insert({...campos, sort_order: max+1, title: title+" (copia)"})` desde el cliente (las políticas RLS admin ya lo permiten).
