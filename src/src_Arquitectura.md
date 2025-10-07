 # Guía de Arquitectura y Componentes del Proyecto
 
 Este documento ofrece un panorama general de la estructura del proyecto, describiendo la función de cada directorio y archivo principal.
 
 ---
 
 ## 1. Punto de Entrada (`../app.js`)
 
 *   **`../app.js`**: Es el orquestador principal del sistema. Su responsabilidad es inicializar y ejecutar múltiples instancias de bots de WhatsApp, cada una configurada para operar en un puerto diferente.
 
 ---
 
 ## 2. Configuración (`config/`)
 
 Este directorio centraliza todos los parámetros y configuraciones del sistema.
 
 *   **`botConfigManager.js`**: Gestiona y carga las configuraciones específicas para cada bot (límites, horarios, prompts personalizados, etc.). Es el centro de control para personalizar el comportamiento de cada instancia.
 *   **`userConfig.json`**: Un archivo JSON de tamaño considerable que almacena configuraciones y datos específicos de los usuarios. Dada su importancia, es crucial para la personalización de la experiencia del usuario.
 
 
 ---
 
 ## 3. Base de Datos (`database/`)

Contiene toda la lógica de persistencia de datos. La documentación detallada se encuentra en `DATABASE_MAINTENANCE_GUIDE.md`.

*   **`SqliteManager.js`**: El "Orquestador" de la base de datos SQLite. Gestiona la conexión, carga los modelos de datos (tablas) y sincroniza el esquema. Es el punto central para la capa de datos. Los modelos gestionados incluyen:
    * **ConversationsLog**: Registra las conversaciones entre el bot y los usuarios.
    * **ConversationMetricas**: Almacena métricas relacionadas con cada conversación.
    * **MensajeEstados**: Define el estado de los mensajes enviados.
    * **CtxLogs**: Guarda el contexto de las conversaciones.
    * **ProviderLogs**: Mantiene registros de las interacciones con proveedores.
    * **Ofertas**: Gestiona información sobre ofertas disponibles.
    * **Pedidos**: Controla los pedidos realizados por los usuarios.
    * **Productos**: Almacena información sobre productos disponibles en el sistema.
    * **Usuarios**: Registra datos de los usuarios que interactúan con el sistema.
    * **Horarios, ReglasHorario, ExcepcionesHorario**: Implementan un sistema de horarios polimórfico para la disponibilidad de los bots.
*   **`DatabaseQueries.js`**: Proporciona una capa de abstracción para realizar consultas comunes a la base de datos, simplificando la interacción desde otras partes del código.
*   **`models/`**: Directorio que contiene los "Planos" de la base de datos. Cada archivo define una tabla (modelo) usando Sequelize.
*   **`Data/MarIADono3DB.sqlite`**: El archivo físico de la base de datos SQLite, la "Caja Fuerte" que contiene todos los datos.
 
 ---
 
 ## 4. Flujos de Conversación (`flows/`)
 
 Aquí se define la lógica conversacional del bot.
 
 *   **`flowPrincipal.js`**: El enrutador principal de mensajes. Clasifica los mensajes entrantes y los deriva al flujo correspondiente.
 *   **`flowMedia.js`**: Gestiona los mensajes que contienen archivos multimedia (imágenes, videos).
 *   **`flowVoice.js`**: Procesa específicamente los mensajes de voz, probablemente integrándose con servicios de transcripción.
 *   **`flowOperador.js`**: Maneja la lógica para transferir una conversación a un operador humano.
 
 ---
 
 ## 5. Lógica de Negocio e IA (`Logica/`)
 
 Contiene la inteligencia del bot y las integraciones con servicios de IA.
 
 *   **`n8nClassifier.js`**: Se integra con n8n para clasificar la intención del usuario y determinar el siguiente paso.
 
 
 ---
 
 ## 6. Automatización (`n8n/workflows/`)
 
 Almacena los flujos de trabajo de n8n en formato JSON. Estos archivos definen procesos automatizados complejos que son invocados por el bot.
 
 *   **`Webhook_workflow (X).json`**: Son los flujos de trabajo principales que reciben las peticiones del bot. Contienen la lógica de clasificación, consulta a asistentes de OpenAI y la orquestación de respuestsas. Son el "cerebro" de las operaciones de IA.
 *   **`Formateo_de_Documentos.json`**: Un workflow especializado en transformar y formatear texto, utilizando agentes de IA para adaptar estilo, tono y formato.
 *   **`Workflow_formattedN8nSendBulkMessages.json`**: Procesa y personaliza los mensajes masivos antes de ser enviados, adaptándolos al historial de conversación del cliente.
 
 ---
 
 ## 7. Servicios (`services/`)
 
 Módulos que corren en segundo plano y proveen funcionalidades clave.
 
 *   **`initServices.js`**: Script de inicialización que arranca todos los servicios necesarios, como la base de datos y el servidor web.
 *   **`HorarioManagerService.js`**: Gestiona la lógica de los horarios de trabajo, excepciones y disponibilidad de los bots.
 *   **`webServerService.js`**: Inicia un servidor web (probablemente Express.js) para exponer APIs o un dashboard.
 
 ---
 
 ## 8. Mensajería Masiva (`bulk/`)
 
 Contiene toda la lógica para el envío de mensajes a gran escala.
 
 *   **`bulkMessageManager.js`**: El gestor principal que orquesta el proceso de envío masivo.
 *   **`excelReader.js`**: Lee los destinatarios y mensajes desde un archivo Excel.
 *   **`messageSender.js`**: Se encarga del envío efectivo de los mensajes, aplicando retardos para evitar bloqueos.
 
 ---
 
 ## 9. Utilidades (`utils/`)
 
 Conjunto de herramientas y funciones de ayuda utilizadas en todo el proyecto.
 
 *   **`MessageData.js`**: Una clase o módulo para abstraer y estandarizar la estructura de los datos de un mensaje.
 *   **`messageProcessor.js`**: Actúa como el orquestador principal para mensajes genéricos. Delega la lógica de negocio y la generación de respuestas a un webhook de n8n. Se encarga de procesar la respuesta de n8n, registrar métricas clave (etapa del embudo, interés del cliente) y gestionar el envío final del mensaje al usuario, respetando los horarios de operación.
 *   **`voiceMediaManager.js`**: Funciones específicas para la gestión de archivos de voz y multimedia.
 *   **`chatHistoryAggregator.js`**: Agrega y formatea el historial de chat de un usuario para pasarlo como contexto a los modelos de IA.
 
 ---
 
 ## 10. Scripts (`scripts/`)
 
 Herramientas para tareas de mantenimiento y desarrollo.
 
 *   **`createBotExcelConfig.js`**: Script para generar un archivo `BotConfig.xlsx` que sirve como plantilla para la configuración de los bots.
 *   **`generateDbReport.js`**: Utilidad para generar reportes sobre el estado o contenido de la base de datos.

---

## 11. Interfaz Web (`views/`, `routes/` y `public/`)

Esta sección cubre los componentes que construyen la interfaz de usuario web para la administración y monitoreo del sistema.

*   **`views/`**: Contiene las plantillas HTML (renderizadas con EJS) que forman las páginas del panel de administración.
    *   **`schedule-manager.html`**: La vista principal para la gestión de horarios de los bots.
    *   **`dashboard.html`**: El panel de control general del sistema.

*   **`routes/`**: Define los endpoints de la API REST que la interfaz web consume para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar).
    *   **`scheduleRoutes.js`**: Maneja las peticiones relacionadas con los horarios, como obtener, guardar o eliminar un horario.

*   **`public/`**: Almacena los archivos estáticos que se sirven al cliente.
    *   **`js/schedule-manager.js`**: El script del lado del cliente que contiene la lógica para interactuar con la página de gestión de horarios, realizando llamadas a la API para cargar y guardar la información.