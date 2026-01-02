# Tarea 29 — Servicio de Campañas y Scheduler de Envíos (CampaignService)

Resumen
- Implementar el servicio central de campañas que permite creación, programación, envío por lotes y tracking de métricas de campañas multicanal (WhatsApp/SMS/Email).
- Fuente original: [`.taskmaster/tasks/tasks.json`](.taskmaster/tasks/tasks.json:114)

Dependencias técnicas
- Librerías sugeridas:
  - Simplicidad: node-cron v3.x
  - Escalabilidad/fiabilidad (si hay Redis): bullmq v5.x
- Integración con canales existentes vía channel_id.
- RBAC requerido: permisos `campaigns.create`, `campaigns.send`.

Responsabilidades principales (API del servicio)
- createCampaign(payload)
  - Valida permisos y payload.
  - Persiste campaña y mensajes en DB (campaigns, campaign_messages).
  - Estado inicial: draft | scheduled | active | completed | failed.
- scheduleCampaign(campaign_id, start_date)
  - Programa job que marcará la campaña como ready/active cuando se alcance start_date.
- sendBatch(campaign_id, batchSize = 1000)
  - Recupera destinatarios activos/segmentados.
  - Envía en lotes, registra cada envío en campaign_recipient_log.
  - Maneja reintentos, backoff y marca failures con failure_reason.
- updateMetrics(campaign_id, metricsDelta)
  - Actualiza campaign_analytics y métricas agregadas.
- cancelCampaign(campaign_id) / pauseCampaign / resumeCampaign

Scheduler / Ejecución
- Opciones:
  - Cron sencillo (node-cron) para checks periódicos (p. ej. cada minuto) y lanzar sendBatch para campañas programadas.
  - Sistema basado en jobs (bullmq) cuando se requiere escalabilidad y reintentos persistentes.
- Ejemplo (pseudocódigo):
  ```js
  cron.schedule('*/1 * * * *', async ()=>{
    const toSend = await Campaign.findAll({where:{status:'scheduled', start_date: { $lte: new Date() }}});
    for(const c of toSend){ await CampaignService.sendBatch(c.id); }
  });
  ```

Consideraciones de diseño
- Atomicidad: usar transacciones DB al crear campaña y messages para evitar estados inconsistentes.
- Idempotencia: sendBatch debe ser idempotente (marcar destinatarios procesados en campaign_recipient_log).
- Throttling / Rate limits: respetar límites por canal (ej: WhatsApp) y soporte para degradado.
- Persistencia de jobs y reintentos si se usa Redis + bullmq.
- Telemetría: logs estructurados (Winston) y métricas (Prometheus/StatsD) para latencia, errores y throughput.
- Escalado horizontal: procesadores de cola independientes; locks para evitar doble envío.

Integración con segmentos y motor de selección
- Filtrar destinatarios por customer_segments/segment_members.
- Soportar envío por segmentos o listas manuales.
- BatchSize configurable por campaña para evitar sobrecarga.

RBAC y seguridad
- Validar permisos `campaigns.create`, `campaigns.send`.
- Operaciones de lectura/supervisión: roles con permisos de auditoría.
- Sanitizar inputs (content/template) y validar plantillas aprobadas (templates).

Manejo de errores y reintentos
- Registrar failure_reason en campaign_recipient_log.
- Política de reintentos configurable (maxRetries, backoff).
- Marcar campañas como `failed` si el número de errores excede umbral.

Pruebas y QA
- Unit tests:
  - Mocks para transportes de canal (WhatsApp/SMS/email).
  - Validar createCampaign, scheduleCampaign y sendBatch lógicamente.
- Integration tests:
  - Simular scheduler con fake timers (sincronizar cron).
  - Test end-to-end con segmento pequeño y validar campaign_recipient_log y campaign_analytics.
- Tests de carga: validar throughput por batchSize y latencia.

Dependencias de tarea
- Debe ejecutarse después de las migraciones de campañas y métricas: tarea `28`.
- Requiere middleware de autenticación/RBAC: tarea `23`.

Notas operativas
- En entornos sin Redis preferir node-cron; migrar a bull/bullmq cuando se requiera fiabilidad/escala.
- Documentar límites por canal y plan de rollback (cancelCampaign).
- Ver [`.taskmaster/tasks/tasks.json`](.taskmaster/tasks/tasks.json:114) para descripción original en el backlog.