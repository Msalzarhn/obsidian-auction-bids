# Renumerar los lotes del 1 al 34

Hoy los lotes conservan el número original del Excel, por eso la numeración salta del lote 20 al 44 y termina en el 58. Se renumeran del 1 al 34 **manteniendo exactamente el orden actual** en que aparecen en la página.

## Qué cambia

- Cada tarjeta mostrará "Lote #1" … "Lote #34", en el mismo orden que hoy.
- El campo "N.º de lote" en `/admin` mostrará el nuevo número.
- Al crear o duplicar un lote nuevo, seguirá tomando el siguiente número disponible (35, 36, …).

## Qué NO cambia

- El orden de los artículos en la página.
- Las pujas realizadas (se conservan todas; no se toca la tabla de pujas).
- Títulos, descripciones, precios ni fotos.

## Detalle técnico

Una sola actualización de datos sobre `auction_items`: asignar `sort_order = 1..34` según el orden actual (`ROW_NUMBER() OVER (ORDER BY sort_order)`). No hay cambios de esquema ni de código; el frontend ya muestra `sort_order` como número de lote.
