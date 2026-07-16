## Objetivo
Añadir música de fondo con "La Flauta Mágica" de Mozart (Obertura, dominio público) y un botón de mute/unmute visible e intuitivo.

## Fuente del audio
Usar una grabación en dominio público de Musopen / Archive.org de la Obertura de Die Zauberflöte (MP3). Se subirá al CDN vía `lovable-assets` para servirla desde el propio dominio (evita CORS y enlaces rotos).

- Descargar MP3 a `/tmp`, subir con `lovable-assets create --filename magic-flute-overture.mp3`.
- Guardar el puntero en `src/assets/magic-flute-overture.mp3.asset.json`.

## Nuevo componente `src/components/BackgroundMusic.tsx`
- `<audio loop preload="auto">` con `src` desde el asset.
- Botón flotante fijo (posición `fixed bottom-6 right-6 z-50`), circular, con estilo dorado acorde al tema (borde `border-gold`, `bg-obsidian/80 backdrop-blur`, `shadow-gold`), tamaño ~48px.
- Iconos `Volume2` / `VolumeX` de `lucide-react`.
- Comportamiento:
  - Estado inicial: **muted** (los navegadores bloquean autoplay con sonido). El `<audio>` arranca en `autoPlay muted`.
  - Al hacer click: alterna `muted`; si es el primer unmute y el audio no está reproduciendo, llama `play()`.
  - Guardar preferencia en `localStorage` (`bg-music-muted`) para recordar entre visitas; leer dentro de `useEffect` para evitar hydration mismatch.
  - Volumen suave por defecto (`0.35`).
  - Respeta `prefers-reduced-motion` sólo para animación del botón (no del audio).
  - Tooltip / `aria-label`: "Silenciar música" / "Activar música".
- Animación sutil: pulso dorado ligero cuando está sonando (opacidad del ring), estático cuando muted.

## Integración
- Montar `<BackgroundMusic />` una sola vez en `src/routes/__root.tsx` dentro de `RootComponent`, junto al `<Toaster />`, para que persista entre rutas.

## Ubicación estratégica
Esquina inferior derecha (patrón universal para controles multimedia; el ojo lo encuentra sin invadir el contenido). Siempre visible por encima del contenido, sin tapar el sticky nav superior.

## Archivos
- crear `src/assets/magic-flute-overture.mp3.asset.json`
- crear `src/components/BackgroundMusic.tsx`
- editar `src/routes/__root.tsx` (montar el componente)

Sin cambios en lógica de auth, pujas o datos.