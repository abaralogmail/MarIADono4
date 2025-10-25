# Plan de implementación recomendado (alto nivel)

Este plan describe las fases para alinear contratos de entrada/salida, integrar Genkit llmstxt en el flujo y habilitar características de IA y rendimiento.

## Fase 1 — Alinear contratos y estructuras de datos
- Alinear contratos de entrada/salida y estructuras de datos con Webhook_workflow (referencia a src/Logica_Workflow/Webhook_workflow_plan.md).
- Mapear a los nodos existentes en src/flows y src/Logica_Workflow.

## Fase 2 — Integración Genkit llmstxt
- Integrar Genkit llmstxt en el flujo de Webhook para la generación de la Consulta Sugerida LLM y la orquestación con Agente Clasificador y Asistentes IA, usando prompts skeleton.

## Fase 3 — Chat streaming y flujo de salida
- Habilitar chat streaming (chat.sendStream) y construir un flujo de salida con formato estructurado (consultaReformulada, confianza, categoria, etc.).

## Fase 4 — Sesiones multi-hilo
- Implementar sesiones multi-hilo (session.chat para diferentes hilos de conversación) para aislar contextos de usuario o tema.

## Fase 5 — Context caching
- Activar context caching (metadata.cache.ttlSeconds) para mejorar rendimiento en interacciones repetitivas.

## Fase 6 — Telemetry y observabilidad
- Configurar telemetry en modo desarrollo con intervals cortos (metricExportIntervalMillis, metricExportTimeoutMillis) para observabilidad rápida durante pruebas.

## Notas de implementación y referencias
- Referencias y notas de implementación se deben mantener en el plan de implementación actual: src/Logica_Workflow/Webhook_workflow_plan.md y para información de la biblioteca, /llmstxt/genkit_dev-llms-full.txt.
- Notas de referencia: Documentación relevante encontrada durante la consulta: Genkit llmstxt (llmstxt/genkit_dev-llms-full.txt). Ver referencia interna: /llmstxt/genkit_dev-llms-full.txt.
- Referencias útiles:
  - Plan de implementación: src/Logica_Workflow/Webhook_workflow_plan.md
  - Biblioteca Genkit llmstxt: /llmstxt/genkit_dev-llms-full.txt