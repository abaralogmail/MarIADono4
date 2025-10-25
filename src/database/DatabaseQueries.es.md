# DatabaseQueries (Documento gemelo en español)
Sync-ID: DatabaseQueries@1

Este documento describe la funcionalidad del módulo `src/database/DatabaseQueries.js`. Debe mantenerse sincronizado con el código. Si se modifica cualquiera de los dos (documento o código), el otro también debe actualizarse.

- Archivo de código: `src/database/DatabaseQueries.js`
- Documento gemelo (este archivo): `src/database/DatabaseQueries.es.md`

## Resumen
`DatabaseQueries` centraliza consultas y operaciones frecuentes sobre la base de datos SQLite, utilizando `SqliteManager` como capa de acceso y `sequelize` para ejecutar queries y mapear modelos.

### Dependencias
- `./SqliteManager`: administra la conexión a SQLite y expone utilidades como `getInstance()` y `saveMetricas()`.
- `sequelize` (`QueryTypes`): define el tipo de consulta para queries crudos.

## API

### 1) mensajesBulkEnviadosHoy()
Obtiene un subconjunto acotado de registros de `conversations_log` para un bot específico. Actualmente filtra por `id` fijos y `botname`.

- Firma:
  ```js
  static async mensajesBulkEnviadosHoy()
  ```
- Lógica:
  - Define `providerBotName = 'BotAugustoTucuman'`.
  - Ejecuta un SELECT sobre `conversations_log` con `id IN (6366, 6378, 17189)` y `botname = providerBotName`.
  - Limita el resultado a 3 filas.
- Retorno:
  - `Promise<Array<object>>` con las filas seleccionadas (tipo `QueryTypes.SELECT`).
- Notas:
  - La variable `today` no se está usando en el query actual.
  - La cláusula `replacements` está comentada; actualmente el `providerBotName` está inyectado por literal en la cadena SQL (recomendable parametrizar).
  - Considerar mover los IDs y el `providerBotName` a configuración.

### 2) guardarMetricasConversacion(datos)
Guarda métricas de conversación en el modelo `ConversationMetricas` mediante `sqliteDb.saveMetricas`.

- Firma:
  ```js
  static async guardarMetricasConversacion(datos)
  ```
- Parámetro:
  - `datos: object` con los siguientes campos esperados (alias aceptados entre paréntesis):
    - `messageId`
    - `respuesta`
    - `metricasCliente` (`metricas_cliente`)
    - `interesCliente`
    - `estadoHabilitacionNotificacion` (`estado_habilitacion_Notificacion`):
      - Si viene como string/number, se normaliza a booleano: `Boolean(Number(...))`. Si es `null`, se preserva `null`.
    - `etapaEmbudo`
    - `consultaReformulada`
    - `confianzaReformulada`
    - `asistenteInformacion` (`asistente_informacion`)
- Retorno:
  - `Promise<object>` con el resultado de `sqliteDb.saveMetricas(payload)`.
- Errores:
  - Lanza excepción si `SqliteManager` no está disponible o la inserción falla.

## Manejo de errores
Ambos métodos usan `try/catch` y registran errores en consola con prefijos claros:
- mensajesBulkEnviadosHoy: "❌ Error querying mensajesBulkEnviadosHoy..."
- guardarMetricasConversacion: "❌ Error guardando métricas de conversación..."

## Consideraciones de implementación
- Parametrización: Para evitar inyección y facilitar mantenimiento, parametrizar `providerBotName` e IDs mediante `replacements` o moverlos a configuración en `botConfigManager` o `userConfig.json`.
- Reutilización: `guardarMetricasConversacion` actúa como adaptador que mapea alias de campos a nombres consistentes para el modelo `ConversationMetricas`.

## Mantenimiento y sincronización
- Este documento es el gemelo del archivo JS. Mantener el mismo `Sync-ID` en ambos.
- Si se agrega, renombra o cambia la firma de un método en `DatabaseQueries.js`, reflejarlo aquí inmediatamente.
- Si se modifica la lógica (por ejemplo, el SQL), actualizar la sección correspondiente en este documento.

```js
// Ubicación del gemelo en código:
src/database/DatabaseQueries.js
```