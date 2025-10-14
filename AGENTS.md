# AGENTS.md - MarIADono3 WhatsApp Bot System

## Commands
- **Start bot**: `npm start` (runs linting first, then starts app.js)
- **Lint**: `npx eslint . --no-ignore` (runs automatically before start)
- **Pre-copy**: `npm run pre-copy` (copies lib from parent directory)
- **Main entry**: `node app.js` (direct start without linting)

---

## Architecture

- **Multi-bot system**: Multiple WhatsApp bots running on different ports (6001-6015)
- **Core framework**: @bot-whatsapp/bot with Baileys provider for WhatsApp integration
- **Database**: sqlite for message storage
- **AI Integration**: OpenAI, Ollama, LangChain for intelligent responses, n8n
- **Message processing**: Flow-based conversation handling via src/flows/
- **Services**: SQLite, n8n automation, bulk messaging
- **Web dashboard**: Express server with EJS templates on multiple ports

---

# Guía de Arquitectura y Componentes del Proyecto

Este documento ofrece un panorama general de la estructura del proyecto y la función de cada directorio principal dentro de `src/`.

---

## 1. Entry Point (`../app.js`)

- **`../app.js`**: Orchestrates the system: initializes and runs multiple WhatsApp bot instances, each on a different port.

---

## 2. Configuración (`src/config/`)

Centralizes all system parameters and configuration.

- **`botConfigManager.js`**: Manages and loads per-bot configurations (limits, hours, custom prompts, etc.).
- **`userConfig.json`**: Large JSON storing user-specific config and data—essential for user experience customization.

---

## 3. Base de Datos (`src/database/`)

Contains all persistence logic.  
*(See `DATABASE_MAINTENANCE_GUIDE.md` for details.)*

- **`SqliteManager.js`**: SQLite orchestrator: handles connection, table models, and schema sync. Central data layer.
  - **Models managed**: ConversationsLog, ConversationMetricas, MensajeEstados, CtxLogs, ProviderLogs, Ofertas, Pedidos, Productos, Usuarios, Horarios, ReglasHorario, ExcepcionesHorario.
- **`DatabaseQueries.js`**: Abstraction layer for common DB queries—simplifies usage from other modules.
- **`models/`**: Directory per-table Sequelize model files.
- **`Data/MarIADono3DB.sqlite`**: SQLite DB file storing all project data.

---

## 4. Flujos de Conversación (`src/flows/`)

Defines the bot's core conversational logic.

- **`flowPrincipal.js`**: Main inbound message router, dispatches to relevant flow.
- **`flowMedia.js`**: Handles messages with media (images, videos).
- **`flowVoice.js`**: Processes voice messages, likely with transcription.
- **`flowOperador.js`**: Logic for transferring conversation to a human operator.

---

## 5. Lógica de Negocio e IA (`src/Logica/`)

Bot intelligence and AI service integrations.

- 

---

## 6. Automatización (`src/n8n/workflows/`)

n8n workflows in JSON, automating processes invoked by the bot.

- **`Webhook_workflow (X).json`**: Main workflows for bot requests (intent classification, OpenAI calls, response orchestration—the AI "brain").
- **`Formateo_de_Documentos.json`**: Specialized workflow for text transformation and formatting using AI.
- **`Workflow_formattedN8nSendBulkMessages.json`**: Pre-processes and personalizes bulk messages before sending.

---

## 7. Servicios (`src/services/`)

Background modules providing key functionalities.

- **`initServices.js`**: Launches required services (DB, web server).
- **`HorarioManagerService.js`**: Manages bot work hours, exceptions, and availability.
- **`webServerService.js`**: Starts the web (Express) server exposing APIs and dashboard.

---

## 8. Mensajería Masiva (`src/bulk/`)

Bulk messaging logic.

- **`bulkMessageManager.js`**: Orchestrates the mass-sending process.
- **`excelReader.js`**: Reads message/recipient data from Excel files.
- **`messageSender.js`**: Handles actual message dispatch, with delays to avoid blocks.

---

## 9. Utilidades (`src/utils/`)

Helpers and tools for the whole project.

- **`MessageData.js`**: Class/module to standardize message data structure.
- **`messageProcessor.js`**: Main orchestrator for generic messages. Delegates logic and response generation to n8n webhook. Processes n8n response, logs funnel metrics and customer interest, handles message delivery (respecting schedule).
- **`voiceMediaManager.js`**: Voice/media file management utilities.
- **`chatHistoryAggregator.js`**: Aggregates/formats a user's chat history for AI model context.

---

## 10. Scripts (`src/scripts/`)

Maintenance and development tools.

- **`createBotExcelConfig.js`**: Generates `BotConfig.xlsx` template for bot config.
- **`generateDbReport.js`**: Utility to generate DB content/state reports.

---

## 11. Interfaz Web (`src/views/`, `src/routes/`, `src/public/`)

Web UI components for admin and monitoring.

- **`views/`**: EJS-rendered HTML templates for the admin panel.
  - **`schedule-manager.html`**: Main view for bot schedule management.
  - **`dashboard.html`**: Main system dashboard.
- **`routes/`**: Defines REST API endpoints for web UI (CRUD operations).
  - **`scheduleRoutes.js`**: Endpoints related to schedule creation, retrieval, and deletion.
- **`public/`**: Static files served to clients.
  - **`schedule-manager.js`**: Client-side logic for the schedule manager UI, making API calls to load/save data.

---

## Code Style

- **ES modules**: Use require() syntax (CommonJS)
- **Async/await**: Preferred over promises for async operations
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Imports**: Destructure from modules: `const { createBot, createProvider } = require('@bot-whatsapp/bot')`
- **Error handling**: Use try/catch blocks, log errors to console
- **File structure**: Modular approach with separate files for flows, services, utils
- **Comments**: Minimal commenting, code should be self-explanatory
- **ESLint**: Uses bot-whatsapp plugin with recommended config

---
