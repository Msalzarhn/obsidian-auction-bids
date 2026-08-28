# Agregar los lotes 21–43 y 59–61, y corregir el Lote #8

Se agregan los artículos nuevos del ZIP en sus números de lote indicados, sin tocar los lotes existentes ni la numeración actual, y se corrige el texto del Lote #8. Las pujas y los usuarios registrados no se tocan.

## Qué se agrega

26 lotes nuevos, con sus fotos y sus textos oficiales del Excel `Control_Subasta_260826.xlsx`:

- **Lotes 21 al 43** (23 artículos): parche Iron On, pisacorbatas dorado y plateado, pin DeMolay, cadenas Shriner y Escuadra/Compás, dos sets de 4 pines, gorra beige, libreta Shriner, vaso térmico Interlogia 2025, taza COMACA LVII, pines (Gran Logia, Fraternidad No. 10, Igualdad No. 1, guara Shriners, 100 Aniversario, The Future is DeMolay), llavero DeMolay, set dorado de mancuernas/pin/pisacorbatas, dos lápices conmemorativos y el Código de Moral Patriótica (6 unidades).
- **Lote 59**: Una Hora de Música en Vivo con Saxofón – Luis Bustillo.
- **Lote 60**: Gorra Clásica Vintage con Emblema Masónico (Beige/Caqui).
- **Lote 61**: Escultura Dorada "La Fuerza del Trabajo" — viene en el ZIP y en el Excel aunque mencionaste hasta el 60; se incluye. Si no lo quieres publicar todavía, dilo y lo dejo fuera.

Todos con precio inicial de L. 100 (según el Excel) y con su galería de fotos (1 o 2 por lote, en el orden 01, 02).

## Qué se corrige

Lote #8 pasa a:

- **Título**: Bolso estilo Maletín Ejecutivo Porta Laptop Masónico Serie Freestyle
- **Descripción**: el texto nuevo que enviaste (patrón geométrico tipo panal en carbón texturizado y sello central con Escuadra, Compás y letra «G»).

## Qué NO cambia

- La numeración actual de todos los lotes (se mantienen los huecos: 56 y del 44 al 58 tal como están).
- Los lotes 1–20 y 44–58 (títulos, fotos, precios, descripciones), salvo el #8.
- Las pujas realizadas y los usuarios registrados: no se borra ni se modifica ninguna fila de pujas ni de perfiles.

## Detalle técnico

- Extraer las fotos del ZIP y subirlas al CDN de assets del proyecto; se descartan archivos que no sean fotos del artículo.
- Insertar 26 filas nuevas en `auction_items` con `sort_order` = número de lote (21–43, 59, 60, 61), título/descripción/precio del Excel, e `image_url` = primera foto.
- Insertar las fotos en `auction_item_images` con `sort_order` 0,1,… por lote.
- Un `UPDATE` puntual sobre la fila del lote 8 (título y descripción).
- Todo vía operaciones de datos (INSERT/UPDATE); no hay cambios de esquema ni de código frontend — la galería y el orden por `sort_order` ya funcionan.
