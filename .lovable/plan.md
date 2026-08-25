# Plan: Mantener visibilidad pública de pujas y conservar datos existentes

## Estado actual confirmado

- La tabla `bids` tiene la política `authenticated read bids` con acceso `true`, lo que permite a **todos los usuarios registrados** leer todas las pujas.
- El componente `AuctionItem.tsx` muestra públicamente `bidder_name`, `bidder_logia` y `amount` en la tarjeta de cada lote.
- Existen **123 pujas** en la base de datos en este momento.
- La función `has_role` ya reside en el esquema `private`, lo cual no afecta la visibilidad de las pujas; solo evita que usuarios consulten roles ajenos.

## Decisión del usuario

El usuario confirma que **no desea** la corrección de seguridad que restringiría el nombre y la logia del postor. La transparencia total de las pujas (nombre, logia, monto) es un requisito funcional intencional de la subasta en vivo.

## Acciones del plan

1. **No modificar** la política `SELECT` de la tabla `bids` ni el código que renderiza `bidder_name` / `bidder_logia`.
2. **No eliminar, mover ni resetear** ningún dato de la tabla `bids` ni de `auction_items`.
3. **Actualizar el `@security-memory`** para documentar que la lectura pública de `bidder_name` y `bidder_logia` en `bids` es un requisito de producto intencional, no una vulnerabilidad.
4. **Verificar** que el conteo de pujas se mantiene al finalizar cualquier operación futura.

## Qué NO se hará

- No se cambiarán políticas RLS sobre `bids`.
- No se filtrará ni ocultará información de postores en la interfaz.
- No se borrarán ni migrarán pujas existentes.
