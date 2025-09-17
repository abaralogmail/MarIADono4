Arquitectura del Proyecto MarIADono3
El proyecto MarIADono3 es un sistema multi-bot de WhatsApp con arquitectura modular y escalable. Aquí tienes el análisis detallado:

Estructura General del Sistema
Punto de Entrada: app.js - Orquesta múltiples bots de WhatsApp ejecutándose en puertos diferentes (6001-6009)

Framework Core: Utiliza @bot-whatsapp/bot con BaileysProvider para la integración nativa con WhatsApp

Arquitectura Multi-Bot
El sistema ejecuta 7 bots simultáneamente:

Bot Principal (Puerto QR Portal)
BotCursosSalta (Puerto 6001)
BotOfertasTucuman (Puerto 6002)
BotAdministracionSalta (Puerto 6003)
BotConsultasWeb (Puerto 6004)
BotAugustoTucuman (Puerto 6009)
BotRamiro (Puerto 6007)
BotJujuy (Puerto 6008)
Organización del Directorio src/
🔄 flows/ - Flujos de Conversación
flowPrincipal.js - Controlador principal de mensajes entrantes
flowAsistente.js - Configuración del asistente virtual
flowVoice.js - Procesamiento de mensajes de voz
flowMedia.js - Manejo de archivos multimedia
flowEnviarMensaje.js - Envío de mensajes
flowOperador.js - Controles de operador
⚙️ services/ - Servicios del Sistema
initServices.js - Inicialización de servicios (PostgreSQL, SQLite, n8n, servidor web)
webServerService.js - Servidor Express con dashboard
HorarioManagerService.js - Gestión de horarios laborales
🗄️ database/ - Capa de Datos
SqliteManager.js - Cache local y almacenamiento rápido
DatabaseQueries.js - Abstracción de consultas
schemas/ - Definiciones de esquemas de base de datos
🛠️ utils/ - Utilidades del Sistema
MessageData.js - Abstracción de datos de mensajes
messageProcessor.js - Procesamiento central de mensajes
sendChunksWithDelay.js - Control de rate limiting
voiceMediaManager.js - Gestión de multimedia
backupManager.js - Sistema de respaldos automáticos
⚙️ config/ - Configuración
botConfigManager.js - Configuraciones específicas por bot
userConfig.js - Preferencias de usuarios
RestriccionHorario.js - Restricciones temporales
🧠 Logica/ - Lógica de Negocio e IA
n8nClassifier.js - Clasificación con n8n
AnythingLLM - Integración con modelos LLM
Flujo de Datos Principal
Recepción: Los mensajes llegan vía Baileys WebSocket
Enrutamiento: flowPrincipal.js clasifica y direcciona mensajes
Procesamiento: messageProcessor.js aplica lógica de negocio
IA/Clasificación: Integración con OpenAI, Ollama, y n8n para respuestas inteligentes
Almacenamiento: Datos persistidos en SQLite
Respuesta: Envío controlado con rate limiting
Tecnologías Clave
WhatsApp: Baileys + @bot-whatsapp framework
IA: OpenAI GPT, Ollama (local), LangChain, n8n
Bases de Datos: SQLite (principal),  JSON (sesiones)
Web: Express + EJS para dashboard administrativo
Automatización: n8n para workflows, node-cron para tareas programadas
Características Principales
Multi-instancia: Soporte para múltiples bots especializados
IA Integrada: Clasificación de clientes, respuestas automáticas
Gestión de Medios: Transcripción de voz, análisis de imágenes
Sistema de Restricciones: Horarios laborales, usuarios bloqueados
Mensajería Masiva: Sistema de bulk messaging con control de rate
Dashboard Web: Interfaz administrativa con métricas y controles
La arquitectura sigue un patrón modular orientado a servicios que permite escalabilidad horizontal y mantenimiento independiente de cada componente.