# Plan de implementación para Webhook_workflow.md

Objetivo general
- Definir y documentar de forma estructurada el flujo Webhook_workflow utilizado para orquestar la clasificación y generación de respuestas con IA.
- Alinear la documentación con la arquitectura existente (nodos de flujo, sub-workflows, asistentes IA, y etapas del embudo).
- Establecer criterios de entrada/salida, prompts, y formatos estructurados para facilitar futuras implementaciones en LangChain/n8n y asegurar consistencia.

Alcance
- Este plan cubre: descripción del flujo, nodos, entradas/salidas, requisitos, prompts propuestos, y plan de implementación en src/Logica_Workflow/Webhook_workflow.md.
- No modifica código ejecutable directamente. Se sirve como guía para implementación en Agent mode cuando se permita escribir a archivos.

Estructura de alto nivel propuesta del archivo Webhook_workflow.md
- Título y propósito
- Resumen objetivo
- Flujo de alto nivel (diagrama textual)
- Nodos principales y funciones
  - Entrada
  - Consulta Sugerida LLM
  - Switch (evaluación de confianza)
  - Agente Clasificador
  - Question/Clarificación
  - Asistentes IA (Cursos, Productos, Sucursal, Procedimientos, Notificaciones, Saludos)
  - Sub-workflows (Call_Sub_Workflow_Sucursal, Call_Sub_Workflow_Cursos, Call_Sub_Workflow_Productos, Notificaciones_SubWorkflow)
  - AI Agent Respuesta Final
  - Etapa Embudo LLM
  - Structured Output Parser / Output Parsers
  - Respond
  - Otros nodos de apoyo (Think, Calculator, Sticky Notes)
- Flujo de datos y variables clave
  - Conversación
  - Consulta reformulada
  - InteresCliente
  - Respuesta Final
  - Etapa Embudo
  - Notificaciones (estado_habilitacion_Notificacion)
  - Asistente_Informacion
- Detalles de implementación (prompts, entradas/salidas, mappings)
  - Prompts propuestos para:
    - Consulta Sugerida LLM
    - Agente Clasificador
    - Question/Clarificación
    - Asistentes IA (ejemplos de prompts de Cursos/Productos/Sucursales/Procedimientos/Notificaciones/Saludos)
  - Salidas estructuradas esperadas
  - Formato de datos entre nodos
- Rutas y nombres de nodos (consistencia con código existente)
- Sub-workflows y sus interacciones
- Embudo LLM y estado de notificaciones
- Parser estructurado de salida
- Respuesta final y salida al usuario
- Consideraciones de seguridad, credenciales y cumplimiento
- Plan de implementación en fases
- Pruebas y validación
- Mantenimiento y extensibilidad
- Anexos: ejemplos de prompts, plantillas de outputs, notas de diseño

Nodos y funciones detalladas (texto descriptivo para acordar implementación)
- Entrada
  - Función: disparar flujo al recibir un mensaje; acceder a body.data._chatHistory y metadatos.
- Consulta Sugerida LLM
  - Función: generar una reformulación de la consulta para facilitar clasificación.
  - Salida esperada: consultaReformulada.
- Switch
  - Función: evaluar confianza de la reformulación; dirigir a rutas de alto/medio/bajo o a clarificación.
  - Salidas: alta, media, baja; rutas de aclaración si procede.
- Agente Clasificador
  - Función: clasificar la consulta en categorías predefinidas (cursos, productos, sucursales, pagos, notificaciones, saludos, etc.).
  - Salidas: ruta hacia el asistente IA correspondiente.
- Question/Clarificación (Pregunta_Aclaratoria)
  - Función: generar preguntas útiles cuando intención es ambigua.
- Asistentes IA
  - Cursos MariaDono Assistant
  - Productos MariaDono Assistant
  - Sucursal MariaDono Assistant
  - Procedimientos MariaDono Assistant
  - Notificaciones (Asistente_Notificacion)
  - Saludos
  - Cada asistente utiliza prompts definidos para responder con contexto/documentos.
- Sub-workflows
  - Call_Sub_Workflow_Sucursal
  - Call_Sub_Workflow_Cursos
  - Call_Sub_Workflow_Productos
  - Notificaciones_SubWorkflow
  - Productos Workflow
  - Permiten ejecutar flujos secundarios para respuestas especializadas.
- AI Agent Respuesta Final
  - Orquesta la consolidación de salidas de asistentes y estados del embudo.
- Etapa Embudo LLM
  - Evalúa la etapa de embudo (1-5) y genera contexto adicional para la respuesta.
- Structured Output Parser / Output Parsers
  - Parsers para asegurar salidas consistentes (consulta reformulada, confianza, interés, etc.).
- Respond
  - Salida final hacia el usuario.
- Otros nodos de apoyo
  - Think, Calculator, Sticky Notes, etc. (según necesidad operativa)

Flujo de datos y variables clave (descritas para implementación)
- Conversación: historial del usuario desde body.data._chatHistory.
- Consulta reformulada: salida de Consulta Sugerida LLM, utilizada por Switch.
- InteresCliente: indicador de áreas de interés (cursos, productos, sucursales, etc.).
- RespuestaFinal: resultado de AI Agent Respuesta Final.
- EtapaEmbudo: valor 1-5 generado por LLM Embudo.
- estado_habilitacion_Notificacion: booleano para activar/desactivar notificaciones.
- Asistente_Informacion: concatenación de salidas de asistentes.

Prompts propuestos (alto nivel; placeholders para implementación)
- Consulta Sugerida LLM
  - Objetivo: reformular la consulta para facilitar clasificación y enrutamiento.
  - Elementos: historial de conversación, consulta original, contexto temporal/localización.
- Agente Clasificador
  - Objetivo: clasificar en categorías (cursos, productos, sucursales, procedimientos, notificaciones, saludos, etc.).
  - Salidas: ruta hacia asistente IA.
- Question/Clarificación
  - Objetivo: generar preguntas aclaratorias útiles ante ambigüedad.
- Asistentes IA (ejemplos de prompts por asistente)
  - Cursos MariaDono Assistant: prompt de búsqueda y resumen a partir de documentos de cursos.
  - Productos MariaDono Assistant: prompt orientado a productos y disponibilidad.
  - Sucursal MariaDono Assistant: prompt con ubicación y horarios de sucursales.
  - Procedimientos MariaDono Assistant: prompt con guías y procedimientos relevantes.
  - Notificaciones: prompt para información de estado de notificaciones.
  - Saludos: prompt de apertura contextual.
- Sub-workflows y Flow de salida
  - Prompts para integración con sub-flujos y mapeos de inputs/outputs.

Estructura de salida y formato de datos
- Salida estructurada JSON con campos:
  - consultaReformulada: string
  - confianza: number (0-1)
  - categoria: string
  - rutaAsistente: string
  - informacionAsistente: object (con campos relevantes por asistente)
  - respuestaFinal: string
  - interesCliente: string[]
  - etapaEmbudo: integer (1-5)
  - notificacionEstado: boolean
  - rawOutputs: array (registro de salidas de sub-workflows y asistentes)
- Parser estructurado para garantizar formatos uniformes entre nodos.

Plan de implementación por fases
- Fase 1: Definición y diseño
  - Aprobar la estructura del documento Webhook_workflow.md.
  - Definir interfaces de entrada/salida para cada nodo.
  - Generar plantillas de prompts (consultas, clasificación, clarificación, asistentes).
- Fase 2: Documentación detallada
  - Redactar secciones de nodos, flujos, y datos en el archivo.
  - Incluir ejemplos de Salida estructurada y flujos de enrutamiento.
- Fase 3: Preparación de prompts y parsers
  - Especificar prompts completos para cada asistente IA.
  - Definir formato de salida y parsers en detalle.
- Fase 4: Integración técnica (commit de guía para implementación)
  - Alinear con código existente en src/Logica_Workflow y src/flows.
  - Preparar referencias a sub-workflows y nombres de nodos para implementación.
- Fase 5: Pruebas y validación
  - Escribir casos de prueba con entradas de ejemplo y salidas esperadas.
  - Validar que la estructura JSON coincide con el parser.
- Fase 6: Validación de seguridad y cumplimiento
  - Revisión de manejo de credenciales y datos sensibles.
- Fase 7: Mantenimiento y extensión
  - Proceso para añadir nuevos asistentes y sub-workflows.

Pruebas y validación sugeridas
- Prueba de flujo ejemplar con una consulta de curso.
- Prueba de flujo ejemplar con consulta de producto.
- Prueba de flujo ambigua para activar Pregunta_Aclaratoria.
- Prueba de cambio de etapa_embudo (1-5) y su impacto en Respuesta Final.
- Prueba de notificaciones activadas/desactivadas.

Notas de seguridad y cumplimiento
- Centralizar gestión de credenciales de OpenAI y otros servicios de IA.
- Asegurar que los prompts no filtren datos sensibles.
- Controles de acceso para cambios en la documentación y herramientas de workflow.

Anexos y ejemplos prácticos
- Plantillas de prompts (pseudo-prompts con marcadores de entrada).
- Ejemplos de salidas estructuradas para casos comunes.
- Esquemas de inputs/outputs entre nodos para referencia de implementación.