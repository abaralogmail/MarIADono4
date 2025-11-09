# Observabilidad ligera del provider en runtime

Este documento describe un plan para observar en tiempo de ejecución las interacciones con el provider utilizado por el bot.

Objetivo
- Capturar eventos clave sin afectar la ejecución.
- Registrar duración, estado y mensajes de error en Logs/Provider_runtime_logs.json.
- Proveer una ruta de evolución hacia métricas más avanzadas.

Alcance
- Instrumentar interacciones del provider para envío de mensajes, recuperación de historial y logs de proveedor.
- Wrapping mínimo que no modifica la lógica de negocio.

Activación
- Activar mediante la variable de entorno PROVIDER_RUNTIME_OBSERVE=true.
- En entornos de producción puede habilitarse a nivel de despliegue.

Arquitectura conceptual
- Un wrapper simple: wrapProviderCall(provider, operationName, asyncFunction)
- Registro en Logs/Provider_runtime_logs.json
- Integración gradual para no interferir con el flujo actual

Prototipo inicial
- Archivo a crear: src/utils/providerRuntimeObserver.js
- Contenido conceptual (no modifica la lógica base)

Bloque de código de ejemplo (no ejecutable aquí)
```js
// Prototipo mínimo de wrapper
const { wrapProviderCall } = require('./providerRuntimeObserver');

// Ejemplo de uso hipotético
async function enviarMensajeEjemplo(provider, payload) {
  return wrapProviderCall(provider, 'sendText', async () => {
    // implementation real call
    return provider.sendText(payload);
  });
}
```

Ubicación de logs
- Logs/Provider_runtime_logs.json
- Archivo de salida: cada entrada con timestamp, operación, duración, provider y estado.

Puntos de integración (referencias clave)
- app.js: punto de creación del provider y flujos
- src/utils/getHistoryFromProvider.js
- src/utils/providerLog.js
- src/utils/chatHistoryAggregator.js
- src/bulk/bulkMessageManager.js
- src/utils/sendChunksWithDelay.js

Referencias para consulta
- [`Documentacion/Provider/providerFuncionesEnTiempoReal.md`](Documentacion/Provider/providerFuncionesEnTiempoReal.md:1)
- [`app.js`](./app.js:1)
- [`src/utils/getHistoryFromProvider.js`](./src/utils/getHistoryFromProvider.js:1)
- [`src/utils/providerLog.js`](./src/utils/providerLog.js:1)
- [`src/utils/chatHistoryAggregator.js`](./src/utils/chatHistoryAggregator.js:1)
- [`src/bulk/bulkMessageManager.js`](./src/bulk/bulkMessageManager.js:1)
- [`src/utils/sendChunksWithDelay.js`](./src/utils/sendChunksWithDelay.js:1)

Próximos pasos
- Implementar wrapper en al menos getHistoryFromProvider.js y una operación de envío de mensajes.
- Habilitar PROVIDER_RUNTIME_OBSERVE y validar logs en Logs/Provider_runtime_logs.json.
- Ampliar con métricas adicionales si es necesario.
