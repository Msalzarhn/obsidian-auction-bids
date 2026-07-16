
## Objetivo
Añadir animaciones suaves y modernas estilo iOS/Apple al hacer scroll en el landing (`src/routes/index.tsx`): los elementos entran con fade + subtle translate/scale al aparecer en viewport, con easing tipo Apple (spring suave) y salen con reverso al salir.

## Enfoque
Usar **Framer Motion** (`motion/react`) — ya es idiomático para React 19 y ofrece:
- `whileInView` con `viewport={{ once: false, amount: 0.2 }}` para reaccionar en ambos sentidos (bajar/subir).
- Easing tipo Apple: `[0.22, 1, 0.36, 1]` (ease-out expo) o spring `{ stiffness: 120, damping: 20 }`.
- `staggerChildren` para revelar grids de lotes en cascada.

## Cambios

1. **Instalar** `motion` (paquete oficial actual de Framer Motion).

2. **Crear `src/components/Reveal.tsx`**
   - Wrapper reutilizable `<Reveal>` y `<RevealGroup>` (stagger).
   - Variantes: `hidden` (opacity 0, y: 24, scale: 0.98) → `visible` (opacity 1, y: 0, scale: 1).
   - Duración ~0.7s, easing `[0.22, 1, 0.36, 1]`.
   - Respeta `prefers-reduced-motion` (desactiva transform, deja opacity mínima).

3. **Editar `src/routes/index.tsx`**
   - Envolver bloques del HERO (logo, badge, título, párrafo, countdown, CTAs, stats) en `<Reveal>` con delays escalonados.
   - Envolver header de sección "Lotes" y cada `<ItemCard>` dentro de un `RevealGroup` (stagger 0.08s).
   - Envolver columnas de sección "Evento" (texto y tarjeta "Cómo participar") y los `<Step>`.
   - Envolver banner Igualdad y footer.
   - Mantener el sticky nav sin animación.

4. **Sin cambios** en lógica de auth, pujas, datos o estilos globales.

## Detalles técnicos
- `viewport={{ once: false, amount: 0.15, margin: "0px 0px -10% 0px" }}` para que reaparezcan al volver a scrollear.
- Para el hero (visible al cargar), usar `initial="hidden" animate="visible"` en vez de `whileInView` para evitar flicker.
- Sin librerías extra (no GSAP, no Lenis) — se mantiene ligero.
