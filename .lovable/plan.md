## Credenciales de administrador

Las credenciales del admin creado en la migración anterior son:

- **Email:** `mauricio.shn@gmail.com`
- **Contraseña:** `08594499`

Se ingresa desde el botón **Registrarme / Iniciar sesión** en la web (mismo formulario de login). Una vez dentro, aparece el enlace **Admin** en el nav.

Si el login falla, lo más probable es que el usuario en `auth.users` no quedó creado correctamente vía SQL (Supabase a veces rechaza inserts directos con `crypt`). En ese caso, en la implementación:
1. Verifico si existe el usuario en `auth.users`.
2. Si no existe o la contraseña no funciona, lo recreo usando el admin API (`supabaseAdmin.auth.admin.createUser`) desde una migración/one-off, y me aseguro de insertar el `profile` y el `user_roles` con rol `admin`.
3. Confirmo login funcional.

## Reemplazo de logos

### 1. Logo Gran Logia de Honduras
- Subir `user-uploads://logo-granlogia-3.png` como asset nuevo (`src/assets/logo-granlogia.png.asset.json`), reemplazando el pointer actual.
- Aparece en: hero (SupportLogo) y footer (FooterLogo) de `src/routes/index.tsx`. Al reemplazar el pointer, se actualiza en ambos lados automáticamente.

### 2. Logo DeMolay (Orden)
- Subir `user-uploads://Logo_Orden_Demolay_01.png` como nuevo asset reemplazando `src/assets/demolay.jpeg.asset.json` (renombrado a `.png` pointer).
- Usado en hero (SupportLogo) y footer (FooterLogo).

### 3. Logo Capítulo Daga de Obsidiana
- El usuario adjuntó `user-uploads://logo-daga-1.png`. Reemplazar `src/assets/capitulo-obsidiana.jpeg.asset.json` con el nuevo pointer.
- Usado en: nav (header), hero principal (logo grande circular con ring de oro) y footer.
- Nota: el logo nuevo es rectangular tipo escudo/pergamino, no circular. Al usarlo con `rounded-full` se recortaría feo. Propongo:
  - En el hero: quitar `rounded-full` y `ring`, mostrar el escudo completo con `object-contain` sobre un halo dorado.
  - En el nav y footer: mantener contenedor pequeño pero con `object-contain` sin recorte circular.

## Fuera de alcance
- No modifico lógica de subasta, base de datos de items ni diseño general.

¿Confirmas que proceda?
