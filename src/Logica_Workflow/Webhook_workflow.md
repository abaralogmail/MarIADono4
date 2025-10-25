# workflow: Descripción en español

Este documento es una explicación estructurada en español del flujo definido que orquesta la clasificación y generación de respuestas para consultas de cursos, productos, sucursales y notificaciones.

## Resumen del objetivo
Gestionar consultas entrantes y devolver respuestas contextualizadas basadas en IA, clasificación de intención y ruta hacia sub-workflows o asistentes específicos (cursos, productos, sucursales, notificaciones). Se busca:
- Reformular la consulta original.
- Clasificar la intención y categoría de la consulta.
- Invocar asistentes/IA específicos para generar la respuesta final.
- Orquestar indicadores de embudo y métricas del cliente.

## Flujo general de alto nivel
1. Entrada
   - Recibe un mensaje entrante con historial de conversación y metadatos.
2. Consulta Sugerida LLM
   - Genera una reformulación de la consulta para facilitar la clasificación y la resolución.
3. Switch (evaluación de confianza)
   - Dirige el flujo según el nivel de confianza o tipo de respuesta.
4. Clasificación de agentes
   - Agente Clasificador determina la categoría principal: cursos, productos, sucursales, procedimientos, notificaciones, saludos, etc.
5. Ruteo hacia asistentes/usuarios IA
   - Dependiendo de la clasificación, se invocan:
     - Cursos MariaDono Assistant
     - Productos MariaDono Assistant
     - Sucursal MariaDono Assistant
     - Procedimientos MariaDono Assistant
     - Asistente_Notificacion
     - Saludos
   - También se pueden activar sub-workflows (Call_Sub_Workflow_X) para obtener respuestas especializadas.
6. Embudo y estado de notificaciones
   - Se evalúa la etapa del embudo (etapaEmbudo LLM) y el estado de habilitación de notificaciones.
7. Preparación de la respuesta final
   - Se consolidan respuestas y metadatos (respuesta final, métricas, interés del cliente, estado de notificación, etc.).
8. Respuesta de salida
   - Se envía el texto final de respuesta.

---

## Nodos principales y su función

- Entrada
  - Tipo: entrada
  - Función: dispara el flujo cuando llega un mensaje.
  - Campos clave: body.data._chatHistory, consulta reformulada, etc. Fuente de historial y contexto.
- Consulta Sugerida LLM
  - Tipo: chainLlm
  - Función: obtener una reformulación de la consulta para facilitar el enrutamiento.
  - Salida esperada: Consulta reformulada.
- Switch
  - Tipo: switch
  - Función: clasificar la confianza de la reformulación y preparar rutas.
  - Salidas posibles: alta, media, baja; también direcciona a pasos de clarificación si procede.
- Agente Clasificador
  - Tipo: textClassifier
  - Función: clasificar la consulta en categorías predefinidas (cursos, productos, sucursales, pagos, notificaciones, etc.).
  - Salidas: determine la ruta hacia el asistente apropiado.
- Question/Clarificación (Pregunta_Aclaratoria)
  - Tipo: chainLlm
  - Función: cuando la intención es ambigua, generar preguntas de aclaración útiles.
- Asistentes IA (Ejemplos)
  - Cursos MariaDono Assistant
  - Productos MariaDono Assistant
  - Sucursal MariaDono Assistant
  - Procedimientos MariaDono Assistant
  - Notificaciones (Asistente_Notificacion)
  - Saludos
  - Cada asistente utiliza un modelo de LangChain/OpenAI con prompts definidos para responder con información basada en documentos y contexto.
- Sub-workflows
  - Call_Sub_Workflow_Sucursal
  - Call_Sub_Workflow_Cursos
  - Call_Sub_Workflow_Productos
  - Notificaciones_SubWorkflow
  - Productos Workflow (ejecuta un flujo de productos)
  - Estos nodos permiten invocar flujos secundarios para respuestas especializadas y reutilizables.
- AI Agent Respuesta Final
  - Nodo central de orquestación de la respuesta final.
  - Recibe la salida de los distintos asistentes y embudo de estado.
- Etapa Embudo LLM
  - Evalúa la etapa del embudo de ventas (1-5) y genera información contextual para la respuesta.
- Structured Output Parser / Output Parsers
  - Parsea resultados estructurados para asegurar consistencia en la salida (consulta reformulada, confianza, interés, etc.).
- Respond
  - Nodo de salida
  - Devuelve la respuesta final al cliente.
- Otros nodos de apoyo
  - Think, Calculator, Sticky Notes, etc.

---

## Flujo de datos y variables clave

- Conversación (conversación)
  - Fuente: Conversación histórica del usuario: dynamic from body data._chatHistory.
- Consulta reformulada
  - Fuente: salida de Consulta Sugerida LLM (Switch la direcciona).
- InteresCliente
  - Valor agregado por el flujo: determina qué áreas interesan al cliente (cursos, productos, sucursales, etc.).
- Respuesta y Respuesta Final
  - Respuesta final generada por el AI Agent Respuesta Final, basada en la etapaEmbudo y en la información de los asistentes.
- Etapa Embudo
  - Valor numérico de 1 a 5 que se determina con etapes embudo LLM.
- Notificaciones (estado_habilitacion_Notificacion)
  - Determina si se debe activar/desactivar notificaciones para el cliente.
- Asistente_Informacion
  - Cadena consolidada de salidas de asistentes (información de cursos, productos, procedimientos, sucursales, etc.).

---

## Flujo paso a paso (cronología)

- Paso 1: recibe un mensaje y registra el historial de conversación.
- Paso 2: Se invoca Consulta Sugerida LLM para obtener una reformulación.
- Paso 3: Switch evalúa la confianza de la reformulación y dirige a la ruta adecuada.
- Paso 4: Agente Clasificador decide la categoría principal de la consulta.
- Paso 5: Se invoca el asistente IA correspondiente (Cursos, Productos, Sucursal, Procedimientos) o se usa Notificaciones/Salud dos herramientas de clarificación.
- Paso 6: Se ejecuta Etapa Embudo LLM para capturar la fase de ventas y el interés del cliente.
- Paso 7: Se consolidan los resultados en Respuesta Final y se actualizan métricas (metricasCliente, interesCliente, etc.).
- Paso 8: Se envía la respuesta de salida.

---

## Detalles de configuración y credenciales

- OpenAI: se utiliza una cuenta OpenAI para la mayoría de los nodos LangChain (OpenAI Chat Model*, etc.).
- Sub-workflows y herramientas LangChain: cada subflujo tiene su propio workflowId y mapping de inputs.
- Variables de contexto utilizadas en prompts:
  - Conversación: historial del usuario.
  - Consulta reformulada: salida del Switch.
  - Contexto temporal y localización: se integran en prompts para respuestas más precisas (embudo, provincia, fechas).

---

## Consideraciones de mantenimiento y extensibilidad

- Añadir nuevos asistentes: para nuevos temas, replica el patrón existente creando un nuevo assistant (langchain openAi) y un Sub-Workflow si corresponde.
- Clarificación de consultas ambiguas: utiliza Pregunta_Aclaratoria para obtener información precisa antes de clasificar.
- Consistencia de salidas: utilizar los parsers estructurados para asegurar formatos uniformes de salida (Structured Output Parser, Output Parser Structured).
- Seguridad y credenciales: asegurar que las credenciales de OpenAI estén guardadas de forma segura y referenciadas correctamente en cada nodo.

---  