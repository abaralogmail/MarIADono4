# Refactor `flowPrincipal` – Plan de Responsabilidades y Servicios (v2)

Fecha: 2025-12-23

## Objetivo
Migrar el archivo `src/flows/flowPrincipal.js` al nuevo _builder_ de `@builderbot/bot` v2 usando el patrón:

```js
export const flowPrincipal = ({ scheduler, classifier, bulkMgr, blockMgr }) =>
  addKeyword({ code: EVENTS.WELCOME })
    .addAction(/* … */);
```

Para lograrlo separamos la lógica actual en servicios reutilizables mediante **inyección de dependencias (DI)**.

---

## Responsabilidades Detectadas
| Nº | Descripción | Ubicación actual | Servicio destino |
| --- | ----------- | ---------------- | ---------------- |
| 1  | Verificar si el mensaje llega dentro de horario laboral / auto | `HorarioManagerService.verificarHorarioBot` (instanciado _inline_) | `scheduler` (nuevo `HorarioManagerService`) |
| 2  | Verificar horario para envíos masivos y disparar _bulk_ | Lógica `isBulkTime` + `BulkMessageManager` | `bulkMgr` |
| 3  | Clasificar intención con n8n | `n8nClassifier.classifyCustomer` | `classifier` |
| 4  | Contar mensajes por usuario & bloquear si excede | `handleUserMessageCount`, `isUserBlocked` | `blockMgr` |
| 5  | Procesar media/voz y generar transcripciones / descripciones | `voiceMediaManager.processMessage` | `mediaMgr` (fuera de alcance v2, se evalúa después) |
| 6  | Procesar mensaje principal (`processMessage`)  | Flujo principal | Mantenerse dentro de flujo (llamado tras clasificación) |
| 7  | Logging (ctx, provider, message) | `log*` helpers | Se mantiene, no afecta DI |

> Nota: El _mediaMgr_ se deja para un refactor posterior; actualmente se invoca antes del ruteo.

---

## Servicios Propuestos
1. **`HorarioManagerService` (`scheduler`)**
   - `isWithinSchedule(date)` – horario "auto"
   - `isBulkSchedule(date)` – horario "bulk"
2. **`BulkMessageManager` (`bulkMgr`)**
   - `startSending()`
3. **`ClassifierN8n` (`classifier`)**
   - `classify(ctx)` → `intent`
4. **`UserBlockManager` (`blockMgr`)**
   - `isUserBlocked(ctx)`
   - `incrementCount(ctx)`

Cada servicio exportará **clases** o **factory functions** según necesidad.

---

## Pasos de Implementación
1. Crear esqueletos de servicios (subtarea 2.2).
2. Reescribir `flowPrincipal.js` usando DI (subtarea 2.3).
3. Migrar la lógica a servicios (subtarea 2.4).
4. Actualizar documentación y CI (subtarea 2.5).

---

## Impacto en Código Existente
- Eliminaremos las importaciones directas a utilidades dentro del flujo.
- `app_*.js` deberá importar el nuevo flujo como función y pasar dependencias.
- Tests deberán _mockear_ servicios inyectados.

---

## Riesgos
- Cambios de firma pueden romper otros flujos si comparten utilidades estáticas.
- Cobertura de test insuficiente podría ocultar regresiones.

---

_Autor: GitHub Copilot (o3)_