# Plan de Migración: bot-whatsapp → BuilderBot (JavaScript) - Primera Ola

Objetivo
- Validar la viabilidad de migrar un conjunto mínimo de componentes hacia BuilderBot con una PoC funcional en JavaScript.
- Establecer un marco de referencia para migraciones subsecuentes.

Alcance
In-scope:
- Core runtime: app.js, app_Switch.js, app_Flows.js
- Flujos: flowPrincipal.js, flowVoice.js, flowMedia.js
- Proveedor y adaptadores de base de datos (MemoryDB para PoC)
- Pruebas de humo y linting

Fuera de alcance:
- Integraciones complejas fuera del PoC
- Migraciones de esquema de BD persistente

Supuestos
- Entorno Node.js correcto y rutas de BuilderBot disponibles
- Estructura de proyecto similar a la base actual
- Se mantendrá el estilo de código JS con CommonJS

Mapeo de archivos y equivalencias
- bot-whatsapp a builderbot (JS)
  - app.js -> src/app_BuilderBot.js (placeholder para PoC)
  - app_Switch.js -> src/app_Switch_BuilderBot.js
  - app_Flows.js -> src/app_Flows_BuilderBot.js
  - flowPrincipal.js -> src/flows/flowPrincipal_BB.js
  - flowVoice.js -> src/flows/flowVoice_BB.js
  - flowMedia.js -> src/flows/flowMedia_BB.js
  - proveedor y DB -> MemoryDB y BaileysProvider equivalente

Criterios de éxito
- PoC funcional: ejecutable con node src/builderbot_poc.js
- Flujo de "hello" registrado y respuesta básica
- No errores críticos de linting ni runtime

Plan de ejecución (Fases)
1) Preparación
- Configurar entorno y dependencias
- Crear documentación de apoyo

2) Portar núcleo
- Portar app.js, app_Switch.js, app_Flows.js a versiones BuilderBot
- Adaptar import/initialización

3) Portar flows
- flowPrincipal, flowVoice, flowMedia
- Ajustes de imports y rutas

4) Pruebas y linting
- Ejecutar ESLint
- Ejecutar pruebas básicas / smoke tests

5) Documentación y entrega
- Actualizar Migracion_BuikderBot.md con cambios
- Preparar resumen para el equipo

Entregables
- Documento Plan_Migracion.md completado
- Archivos de PoC portados y listos
- Registro de resultados de humo

Aprobación
- Este plan está sujeto a revisión y aprobación del equipo. 