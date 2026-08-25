# Mantener visibles las pujas para todos los usuarios registrados

## Objetivo
Conservar el funcionamiento anterior: cualquier usuario registrado podrá ver en tiempo real el nombre, la logia y el monto de cada puja.

## Estado verificado
- La regla actual de la base de datos permite que todos los usuarios autenticados consulten todas las pujas.
- La tarjeta de cada lote ya muestra el nombre, la logia y el monto de la puja principal y del historial reciente.
- La actualización en tiempo real continúa suscrita a nuevas pujas.

## Implementación
1. No modificar el diseño, los artículos, las cuentas, las pujas existentes ni ninguna otra función.
2. Verificar el flujo con una sesión registrada para confirmar que nombre, logia y monto aparecen correctamente y se mantienen en tiempo real.
3. Solo si la verificación detecta una discrepancia, restaurar exclusivamente la regla de lectura global para usuarios registrados, sin abrir las pujas a visitantes sin cuenta.
4. Registrar esta visibilidad como una decisión intencional del producto para que futuras revisiones de seguridad no intenten ocultarla nuevamente.

## Resultado esperado
Los visitantes sin iniciar sesión no acceden a los datos de postores; todos los usuarios registrados ven nombre, logia y monto de las pujas, tal como funcionaba anteriormente.
