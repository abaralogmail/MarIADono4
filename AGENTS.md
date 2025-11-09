# AGENTS.md - MarIADono3 WhatsApp Bot System

## Comandos
- **Iniciar bot**: `npm start` (ejecuta linting primero, luego inicia app.js)
- **Lint**: `npx eslint . --no-ignore` (se ejecuta automáticamente antes de iniciar)
- **Pre-copia**: `npm run pre-copy` (copia la librería desde el directorio padre)
- **Entrada principal**: `node app.js` (inicio directo sin linting)

---

## Arquitectura

- **Sistema de múltiples bots**: Varios bots de WhatsApp ejecutándose en diferentes puertos (6001-6015)

- **Sistema de múltiples bots**: Varios bots de WhatsApp ejecutándose en diferentes puertos (6001-6015)
- **Marco central**: @bot-whatsapp/bot con proveedor Baileys para la integración de WhatsApp
- **Base de datos**: sqlite para almacenamiento de mensajes
- **Integración de IA**: OpenAI, Ollama, LangChain para respuestas inteligentes, n8n
- **Integración de IA**: OpenAI, Ollama, LangChain para respuestas inteligentes, n8n
- **Procesamiento de mensajes**: Manejo de conversaciones basado en flujos vía src/flows/
- **Servicios**: SQLite, automatización n8n, mensajería masiva
- **Servicios**: SQLite, automatización n8n, mensajería masiva
- **Panel web**: Servidor Express con plantillas EJS en múltiples puertos

---

## Agente: Generador de Informes con Markdown e Insights

- Descripción: Un agente que genera informes en formato Markdown a partir de la base de datos SQLite del bot, e incluye insights y recomendaciones. El informe se guarda en src/database/Informes/outputs como markdown.
- Ruta del script principal: `src/database/Informes/markdownInsightAgent.js`.
- Cómo ejecutarlo: `node src/database/Informes/markdownInsightAgent.js` o invocarlo desde tu flujo de informes.
- Dependencias: Node.js, sqlite3 (debe estar disponible en el proyecto).
- Salida: archivo Markdown con secciones de Resumen Ejecutivo, Métricas Clave, Insights y Recomendaciones.

# Guía de Arquitectura y Componentes del Proyecto

Este documento ofrece una visión general de la estructura del proyecto y la función de cada directorio principal dentro de `src/`.

---

## 1. Punto de entrada (`../app.js`)

- **`../app.js`**: Orquesta el sistema: inicia y ejecuta múltiples instancias de WhatsApp bot, cada una en un puerto distinto.

---

## 2. Configuración (`src/config/`)

Centraliza todos los parámetros del sistema y la configuración.

- **`botConfigManager.js`**: Gestiona y carga configuraciones por bot (límites, horarios, prompts personalizados, etc.).
- **`userConfig.json`**: Gran JSON que almacena configuración y datos específicos del usuario—esencial para la personalización de la experiencia.

---

## 3. Base de Datos (`src/database/`)

Contiene toda la lógica de persistencia.  
*(Ver `DATABASE_MAINTENANCE_GUIDE.md` para detalles.)*

- **`SqliteManager.js`**: Orquestador de SQLite: maneja la conexión, modelos de tablas y sincronización de esquemas. Capa de datos central.
  - **Modelos gestionados**: ConversationsLog, ConversationMetricas, MensajeEstados, CtxLogs, ProviderLogs, Ofertas, Pedidos, Productos, Usuarios, Horarios, ReglasHorario, ExcepcionesHorario.
- **`DatabaseQueries.js`**: Capa de abstracción para consultas comunes de BD—facilita su uso desde otros módulos.
- **`models/`**: Directorio porTabla con archivos de modelos Sequelize.
- **`Data/MarIADono3DB.sqlite`**: Archivo DB SQLite que almacena todos los datos del proyecto.

---

## Informes (`src/database/Informes/`)

Este directorio contiene informes y análisis generados a partir de los datos de la base de datos `MarIADono3DB.sqlite`.

Contenido típico:

- Métricas de conversación (embudos, tiempos de respuesta, tasas de retención).
- Registros de actividad del bot y métricas operativas.
- Análisis de uso y rendimiento (por bot, por puerto, por periodo).

Generación de informes:

- Los informes pueden ser generados por scripts específicos o herramientas de análisis. Por ejemplo, use `src/scripts/generateDbReport.js` para generar reportes automatizados.
- Consulte `src/database/Informes/README.md` para detalles, formatos y ejemplos.
- Los informes se almacenan en este directorio y pueden ser consumidos por el panel web o herramientas externas para visualización y auditoría.

Notas:

- Mantenga los scripts idempotentes y documente el formato de salida (CSV/JSON/PDF) para facilitar su integración en procesos de automatización.
- Cuando agregue nuevos tipos de informe, actualice `src/database/Informes/README.md`.


## 4. Flujos de Conversación (`src/flows/`)

Define la lógica central de conversación del bot.

- **`flowPrincipal.js`**: Enrutador principal de mensajes entrantes, envía a los flujos relevantes.
- **`flowMedia.js`**: Maneja mensajes con medios (imágenes, videos).
- **`flowVoice.js`**: Procesa mensajes de voz, probablemente con transcripción.
- **`flowOperador.js`**: Lógica para transferir la conversación a un operador humano.

---

## 5. Lógica de Negocio e IA (`src/Logica_Workflow/`)

Inteligencia del bot e integraciones de servicios de IA.

- —

---

## 6. Automatización (`src/n8n/workflows/`)

Flujos de trabajo de n8n en JSON, que automatizan procesos invocados por el bot.

- **`Webhook_workflow (X).json`**: Flujos de trabajo principales para solicitudes del bot (clasificación de intenciones, llamadas a OpenAI, orquestación de respuestas—el "cerebro" de IA).
- **`Formateo_de_Documentos.json`**: Flujo de trabajo especializado para transformación y formateo de texto usando IA.
- **`Workflow_formattedN8nSendBulkMessages.json`**: Preprocesa y personaliza mensajes masivos antes de enviarlos.

---

## 7. Servicios (`src/services/`)

Módulos de fondo que proporcionan funciones clave.

- **`initServices.js`**: Inicia los servicios requeridos (BD, servidor web).
- **`HorarioManagerService.js`**: Administra horarios de trabajo del bot, excepciones y disponibilidad.
- **`webServerService.js`**: Inicia el servidor web (Express) que expone APIs y panel de control.

---

## 8. Mensajería Masiva (`src/bulk/`)

Lógica de mensajería masiva.

- **`bulkMessageManager.js`**: Orquesta el proceso de envío masivo.
- **`excelReader.js`**: Lee datos de mensajes/destinatarios desde archivos Excel.
- **`messageSender.js`**: Maneja el envío real de mensajes, con demoras para evitar bloqueos.

---

## 9. Utilidades (`src/utils/`)

Utilidades y herramientas para todo el proyecto.

- **`MessageData.js`**: Clase/módulo para estandarizar la estructura de datos de mensajes.
- **`messageProcessor.js`**: Orquestador principal para mensajes genéricos. Delegar lógica y generación de respuestas al webhook de n8n. Procesa la respuesta de n8n, registra métricas de embudo e interés del cliente, maneja la entrega de mensajes (respetando el horario).
- **`voiceMediaManager.js`**: Utilidades de gestión de voz/medios.
- **`chatHistoryAggregator.js`**: Acumula/formatea el historial de chat de un usuario para el contexto del modelo de IA.

---

## 10. Scripts (`src/scripts/`)

Herramientas de mantenimiento y desarrollo.

- **`createBotExcelConfig.js`**: Genera la plantilla BotConfig.xlsx para la configuración del bot.
- **`generateDbReport.js`**: Utilidad para generar informes del contenido/estado de la base de datos.

---

## 11. Interfaz Web (`src/views/`, `src/routes/`, `src/public/`)

Componentes de UI web para administración y monitoreo.

- **`views/`**: Plantillas HTML renderizadas con EJS para el panel de administración.
  - **`schedule-manager.html`**: Vista principal para la gestión de horarios del bot.
  - **`dashboard.html`**: Panel del sistema/dashboard.
- **`routes/`**: Define puntos finales REST para la interfaz web (CRUD).
  - **`scheduleRoutes.js`**: Endpoints relacionados con la creación, recuperación y eliminación de horarios.
- **`public/`**: Archivos estáticos servidos a los clientes.
  - **`js/schedule-manager.js`**: Lógica del cliente para la interfaz de gestión de horarios, haciendo llamadas a la API para cargar/guardar datos.

---

Módulo de Informes
Ubicación: Informes
Archivos:
generateMonthlyBotMessageReport.js: script para generar informes mensuales de mensajes del bot. Conecta a la base de datos SQLite y genera un informe.
leeme.md: documentación del módulo de Informes (cómo usar, parámetros, salidas).
23-Octubre-2025/: carpeta con muestras de informes para esa fecha.
Descripción: Este módulo genera informes mensuales de actividad del bot, útiles para monitoreo y auditoría. Puede integrarse con flujos n8n o dashboards.
Cómo ejecutar: node src/database/Informes/generateMonthlyBotMessageReport.js
Salidas: archivos de informe generados en un directorio de salida dentro de Informes.
Dependencias: Node.js; acceso a la base de datos sqlite (MarIADono3DB.sqlite) o ruta equivalente; si se requieren paquetes externos, deben estar en package.json.

---

## Estilo de código

- **Módulos ES**: Usar la sintaxis require() (CommonJS)
- **Async/await**: Preferido sobre promesas para operaciones asíncronas
- **Nombres**: camelCase para variables/funciones, PascalCase para clases
- **Imports**: Desestructurar desde módulos: `const { createBot, createProvider } = require('@bot-whatsapp/bot')`
- **Manejo de errores**: Usar bloques try/catch, registrar errores en consola
- **Estructura de archivos**: Enfoque modular con archivos separados para flujos, servicios, utilidades
- **Nombres de variables**: nombres de variables, funciones, clases, etc. deben ser en español.
- **ESLint**: Usa el plugin bot-whatsapp con la configuración recomendada

---
