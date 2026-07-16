## Cambiar el favicon al logo Daga de Obsidiana

1. **Descargar el logo** desde el asset ya existente `src/assets/capitulo-obsidiana.png.asset.json` (URL del CDN) a un archivo temporal.
2. **Colocar en `public/`** como `public/favicon.png` para que se sirva en `/favicon.png`.
3. **Actualizar `src/routes/__root.tsx`**: reemplazar el `{ rel: "icon", href: "/favicon.ico" }` por `{ rel: "icon", type: "image/png", href: "/favicon.png" }`. Mantener `<Outlet />` intacto.
4. **Eliminar `public/favicon.ico`** (el default de Lovable) para que no se sirva el ícono viejo a crawlers.

No se tocan otros archivos ni lógica.