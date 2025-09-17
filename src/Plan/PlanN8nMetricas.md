Plan de Implementación: Base de Datos para Métricas de n8n
1. Objetivo
El objetivo de este plan es diseñar e implementar una solución de base de datos para almacenar las métricas generadas por el webhook de n8n. Actualmente, parte de esta información se gestiona en archivos JSON (conversations_log.json), lo cual limita la capacidad de análisis y consulta.

Esta implementación centralizará las métricas en la base de datos SQLite existente, permitiendo un análisis más robusto y escalable del rendimiento del bot y del comportamiento del usuario.

2. Análisis de Características y Métricas
Dado que gemini.md no especifica una estructura para las métricas, se ha analizado el flujo de trabajo Webhook_workflow (4).json. Las métricas clave a almacenar por cada ejecución del webhook son:

userId: Identificador del usuario (from) para vincular la métrica con quien interactúa.
botName: Nombre del bot que gestionó la interacción.
interesCliente: La categoría principal de la consulta (ej: "cursos", "productos", "sucursal").
etapaEmbudo: La etapa del embudo de ventas en la que se clasifica al cliente (ej: 1 a 5).
estadoHabilitacionNotificacion: La intención del usuario respecto a las notificaciones (0: desactivar, 1: neutro, 2: activar).
consultaReformulada: La versión de la consulta del usuario, mejorada por la IA para mayor claridad.
confianzaReformulada: El nivel de confianza de la IA en la reformulación (ej: "alta", "media", "baja").
asistenteInformacion: La respuesta en crudo generada por el asistente de OpenAI especializado (cursos, productos, etc.).
respuestaFinal: La respuesta final, formateada y adaptada, que se envía al usuario.
messageId: El ID del mensaje original del usuario para poder vincularlo con el log de conversaciones.
3. Plan de Implementación
Paso 3.1: Definir un Nuevo Modelo de Base de Datos
Se creará una nueva tabla en la base de datos para almacenar las métricas. Siguiendo la arquitectura actual, esto implica crear un nuevo archivo de modelo Sequelize.

Acción: Crear el archivo src/database/models/N8nMetric.js.
Contenido: Este archivo definirá la tabla n8n_metrics con las columnas correspondientes a las métricas listadas en el punto 2. Se incluirán campos como metricId (PK), userId, botName, interesCliente, etapaEmbudo, etc., junto con timestamps (createdAt, updatedAt).
Paso 3.2: Integrar el Nuevo Modelo en el Gestor de Base de Datos
El nuevo modelo debe ser reconocido por el sistema para que la tabla pueda ser creada y utilizada.

Acción: Modificar el archivo src/database/SqliteManager.js.
Cambios:
Importar el nuevo modelo N8nMetricModel.
Añadir this.N8nMetric = N8nMetricModel(this.sequelize); dentro del método initialize() para que Sequelize gestione la tabla.
Añadir una nueva función saveN8nMetric(metricData) que se encargará de crear un nuevo registro en la tabla n8n_metrics.
Paso 3.3: Modificar messageProcessor.js para Guardar las Métricas
El punto ideal para registrar las métricas es dentro de messageProcessor.js, justo después de recibir una respuesta válida del webhook de n8n.

Acción: Modificar la función processMessage en src/utils/messageProcessor.js.
Lógica a Implementar:
Después de la línea const webHookRespuesta = await n8nWebhook.sendWebhook(messageData);, y una vez validado que webHookRespuesta no es nulo.
Obtener una instancia del gestor de la base de datos (SqliteManager.getInstance()).
Crear un objeto metricData que contenga todos los campos extraídos de webHookRespuesta (interesCliente, etapaEmbudo, etc.), además del userId y botName que ya están en messageData.
Llamar a la nueva función dbManager.saveN8nMetric(metricData) para persistir los datos. Esta llamada puede ser asíncrona y no necesita ser bloqueante para no retrasar la respuesta al usuario.
Importante: Esta lógica reemplazará la llamada actual a updateConversationLog(), ya que la información se guardará de forma más estructurada en la nueva tabla. La función updateConversationLog y su lógica asociada para modificar el archivo conversations_log.json podrán ser eliminadas para simplificar el código.
Paso 3.4: Actualizar la Documentación
Para mantener la coherencia del proyecto, es crucial documentar este nuevo componente.

Acción: Actualizar el archivo src/gemini.md.
Cambios:
En la sección "Base de Datos (database/)", añadir una descripción para el nuevo modelo models/N8nMetric.js, explicando su propósito de almacenar las métricas del webhook.
4. Consideraciones Adicionales
Rendimiento: La inserción en la base de datos se realizará de forma asíncrona para no impactar el tiempo de respuesta del bot.
Manejo de Errores: Se debe implementar un bloque try/catch alrededor de la llamada a la base de datos para registrar cualquier error de escritura sin interrumpir el flujo principal de la conversación.
Migración de Datos (Opcional): Si se desea, se podría crear un script en src/scripts/ para migrar los datos históricos del archivo conversations_log.json a la nueva tabla n8n_metrics.