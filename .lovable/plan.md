# Informe de la subasta en Excel (solo administrador)

Botón "Descargar informe Excel" en el panel `/admin` que genera un archivo con los resultados completos de la subasta.

## Contenido del archivo

**Hoja 1 — Ganadores**
Una fila por lote, con la puja más alta:
- N.º de lote, Título del artículo, Precio base (L.)
- Ganador: nombre, logia, correo, celular
- Monto ganador (L.), Fecha/hora de la puja
- Total de pujas recibidas por el lote
- Los lotes sin pujas aparecen marcados como "Sin pujas"

**Hoja 2 — Todas las pujas**
Historial completo (las 149+ pujas), ordenado por lote y monto descendente:
- N.º de lote, Título, Pujante, Logia, Correo, Celular, Monto (L.), Fecha/hora

**Hoja 3 — Resumen**
- Total recaudado (suma de pujas ganadoras), número de lotes vendidos, lotes sin pujas, total de pujantes únicos, fecha de generación del informe.

Formato: montos con formato de moneda `L. #,##0`, encabezados en negrita con fondo dorado, columnas con ancho ajustado y fila de encabezado congelada.

## Detalles técnicos

- Nueva server function `src/lib/auction-report.functions.ts` con `.middleware([requireSupabaseAuth])`: verifica que el usuario tenga rol `admin` mediante `context.supabase` (función `has_role`); si no, lanza error. Luego carga con el cliente admin (`client.server`) los lotes, todas las pujas y los perfiles (correo y celular) y devuelve el JSON ya estructurado.
- Los datos de contacto (correo/celular) viven en `profiles` y solo se exponen a través de esta función protegida por rol admin; nada nuevo se abre en el cliente.
- Generación del `.xlsx` en el navegador con la librería `xlsx` (SheetJS), disparando la descarga con nombre `subasta-daga-obsidiana-informe-AAAA-MM-DD.xlsx`.
- El botón se agrega en el encabezado de `src/routes/admin.tsx`, junto a "Nuevo", con estado de carga y aviso de error mediante `sonner`. La ruta `/admin` ya está restringida a administradores.
