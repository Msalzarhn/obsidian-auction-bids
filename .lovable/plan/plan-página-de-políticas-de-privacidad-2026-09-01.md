# Plan: Página de Políticas de Privacidad

## Objetivo
Crear una página de políticas de privacidad accesible desde el sitio, con el estilo masónico existente, e incluir una cláusula específica sobre envíos internacionales para hermanos fuera de Honduras.

## Contenido requerido
- Página estática con las políticas de privacidad del sitio de subastas.
- Sección destacada que establezca:
  - Los artículos ganados por hermanos fuera del país tendrán costos de envío por cuenta del acreedor/ganador.
  - El QHS (Querer al Hermano Según) se encargará de gestionar el envío, pero no de cubrir los costos.
- Enlace visible en el footer del sitio.

## Cambios técnicos

1. **Nueva ruta**: `src/routes/privacidad.tsx`
   - Usar `createFileRoute("/privacidad")` siguiendo el patrón de TanStack Router del proyecto.
   - Implementar `head()` con metadatos propios: título, descripción, Open Graph, Twitter Card, canonical y JSON-LD tipo `WebPage`.
   - Aplicar estilos del sitio: fondo obsidiana, tipografías Cinzel/Cormorant Garamond, bordes dorados, animaciones `Reveal` para las secciones.
   - Estructurar el contenido en secciones claras:
     - Identidad del responsable
     - Datos recopilados y finalidad (registro de usuarios, pujas en vivo)
     - Protección y conservación de datos
     - Derechos de los usuarios
     - Envíos internacionales (cláusula destacada en tarjeta con borde dorado)
     - Contacto

2. **Footer en `src/routes/index.tsx`**
   - Añadir un enlace "Políticas de privacidad" junto al copyright, usando `<Link to="/privacidad">`.
   - Mantener el diseño actual del footer con los 4 logos.

3. **Verificación**
   - Confirmar que la ruta se genera correctamente en `routeTree.gen.ts`.
   - Revisar que el enlace del footer funcione y la página cargue sin errores.
   - Validar que el build no arroje errores de tipo ni de sintaxis.

## Alcance fuera de este plan
- No se modifica la base de datos.
- No se alteran las reglas de pujas, autenticación ni administración.
- No se cambia el contenido existente de los lotes ni las pujas registradas.
