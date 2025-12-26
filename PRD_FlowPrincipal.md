# Documento de Requisitos del Producto (PRD)

**Módulo:** `flowPrincipal`

**Proyecto:** MarIADonoMeta (Bots BuilderBot + Provider Meta)

**Fecha:** 23-12-2025

---

## 1. Propósito

Garantizar que `flowPrincipal` gestione correctamente la conversación de cada bot WhatsApp, cumpliendo los requisitos funcionales y no funcionales establecidos, con una batería de pruebas automatizadas y un plan de migración para plena compatibilidad con `@builderbot/bot` v2.

---

## 2. Alcance

1. Automatizar el ruteo de mensajes entrantes, clasificación por IA y control de horarios.
2. Gestionar mensajes multimedia, voz y envíos masivos (bulk).
3. Registrar métricas, logs de contexto y estado de provider.
4. Proteger contra spam y usuarios bloqueados.
5. Exponer pruebas (unitarias + integración + end-to-end) que garanticen la calidad.
6. Migrar el flujo para soportar la API de `@builderbot/bot` v2 sin romper compatibilidad hacia atrás.

---

## 3. Requisitos Funcionales

| ID | Descripción | Criterio de aceptación |
|----|-------------|------------------------|
| RF-01 | Procesar evento `EVENTS.WELCOME` y otras entradas estándar. | El bot responde siempre que `ctx.event` sea `EVENTS.WELCOME`.
| RF-02 | Clasificar la intención del usuario vía `n8nClassifier`. | Se invoca `classifierN8n.classify()` y se enruta la respuesta.<br>✓ Metric `classifier_response_ms` < 1000 ms.
| RF-03 | Verificar horarios (`HorarioManagerService`) para respuestas automáticas. | Si fuera de horario `TIPO_HORARIO_AUTO`, no responde; si dentro, procesa.
| RF-04 | Detectar y gestionar mensajes multimedia/voz. | Media es descargada, transcrita y agregada a `messageData`.
| RF-05 | Ejecutar envíos masivos si dentro de horario `TIPO_HORARIO_BULK`. | `BulkMessageManager.startSending()` arranca en background.
| RF-06 | Contabilizar mensajes por usuario (`handleUserMessageCount`). | Superar límite definido en config bloquea al usuario.
| RF-07 | Registrar todos los eventos: `logMessage`, `logCtx`, `logProvider`. | Registros almacenados en SQLite y archivos‐log.
| RF-08 | Respetar lista de bloqueados (`isUserBlocked`). | Usuarios bloqueados reciben silencio.
| RF-09 | Exponer endpoints REST (`/v1/messages`, `/v1/register`, etc.) vía Provider Meta. | Respuestas HTTP 2xx.
| RF-10 | Soportar futuras versiones de `@builderbot/bot` (v2). | Flujos funcionan con la nueva firma `addKeyword({ code: 'WELCOME' })`.

---

## 4. Requisitos No-Funcionales

| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF-01 | Rendimiento | Tiempo medio de respuesta < 1500 ms (p95) por mensaje.
| RNF-02 | Escalabilidad | Soportar al menos 5 bots simultáneos en la misma instancia.
| RNF-03 | Observabilidad | Logs estructurados JSON + métricas Prometheus.
| RNF-04 | Seguridad | Tokens Meta almacenados en `.env`; sanitizar entradas del usuario.
| RNF-05 | Calidad de Código | Lint sin errores (`npm run lint`), cobertura > 80 %.
| RNF-06 | Portabilidad | Ejecutable en Docker (`Dockerfile` existente) y en Windows dev.

---

## 5. Plan de Pruebas

### 5.1 Unidades (Jest)

| Área | Archivo de pruebas | Escenarios clave |
|------|--------------------|------------------|
| Horarios | `tests/horarioManager.test.js` | ✓ Dentro / fuera de horario.<br>✓ TZ edge cases. |
| Media | `tests/mediaChecker.test.js` | ✓ Detecta image, audio, voice.<br>✓ `getMediaInfo()` payloads. |
| Bloqueo | `tests/userBlockManager.test.js` | ✓ Bloqueo tras exceder límite.<br>✓ Desbloqueo manual. |
| Clasificador | `tests/n8nClassifier.test.js` | ✓ Etiqueta correcta. |

### 5.2 Integración

* `tests/flowPrincipal.integration.js`
  * Simular `ctx` con distintos tipos de mensaje y verificar llamadas a dependencias con *mocks*.

### 5.3 End-to-End (Supertest + In-Memory Provider)

* `tests/webhook.e2e.test.js`
  * Lanzar app en puerto aleatorio.
  * Enviar POST a `/v1/messages` → validar 200 y respuesta builderbot.

### 5.4 Cobertura

```
NODE_ENV=test jest --coverage
```

---

## 6. Migración a BuilderBot v2

1. **Revisión API:**
   * `addKeyword(EVENTS.WELCOME)` → `addKeyword({ code: EVENTS.WELCOME })`.
   * Uso de `provider.sendText()` permanece.
2. **Refactor modular:** Extraer lógica de utilidades a servicios independientes para *DI*.
3. **Actualización de dependencias:**
   * `@builderbot/bot@^2.0.0`
   * `@builderbot/provider-meta@^2.0.0`
4. **Adaptación de pruebas:** Mockear nuevos métodos (`stateManager`, etc.).
5. **Pipeline CI:** Añadir job *migration-v2* que corre pruebas con v2 en paralelo.

---

## 7. Criterios de Aceptación

1. Todas las pruebas automáticas pasan en CI (Node 18 LTS & Node 21).
2. Cobertura global ≥ 80 % líneas / 70 % ramas.
3. Se genera imagen Docker y responde a un mensaje de prueba vía curl.
4. Se demuestran logs y métricas en consola.
5. PR revisado y aprobado por al menos 2 desarrolladores.

---

## 8. Entregables

| # | Elemento | Ubicación |
|---|----------|-----------|
| 1 | Código `flowPrincipal.js` refactorizado | `src/flows/` |
| 2 | Conjunto de pruebas Jest | `tests/` |
| 3 | Informe de cobertura | `coverage/` (CI) |
| 4 | Imagen Docker | GitHub Container Registry |
| 5 | Este PRD | `PRD_FlowPrincipal.md` |

---

## 9. Riesgos y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Cambios de API BuilderBot v2 inestables | Alto | Medio | Mantener `peerDependencies` exactas y fijar lockfile. |
| Demoras en transcripción de audio (>3 s) | Medio | Bajo | Cache resultados y usar worker pool. |
| WhatsApp Cloud API rate limits | Alto | Medio | Implementar back-off y colas. |

---

## 10. Cronograma Tentativo

| Fase | Duración | Responsable |
|------|----------|-------------|
| PRD & Aprobación | 2 d | PO + Arquitecto |
| Implementación | 5 d | Dev Team |
| Pruebas unitarias | 2 d | QA |
| Integración & E2E | 2 d | QA + Dev |
| Migración v2 | 3 d | Dev Team |
| Revisión / Deploy | 1 d | DevOps |

---

> **Nota:** Los tiempos son estimados. Ajustar según feedback de stakeholders.
