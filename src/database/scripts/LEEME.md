# Scripts de Base de Datos

Este directorio contiene scripts relacionados con la gestión, mantenimiento y reporte de la base de datos del proyecto.

## Contenido del Directorio:

*   **`AGENTS_Archivos_gemelos.md`**: Documentación relacionada con la gestión de "archivos gemelos" o agentes, posiblemente describiendo cómo se relacionan o se mantienen sincronizados.

*   **`conversation_metricas_Queries.js`**: Contiene funciones JavaScript para interactuar con la tabla `conversation_metricas`, permitiendo guardar y recuperar métricas de conversación por `messageId`. Utiliza un `dbManager` o SQL crudo.

*   **`conversation_metricas.sql`**: Define el esquema SQL para la tabla `conversation_metricas`. Incluye columnas para el ID del mensaje, respuesta, métricas del cliente, interés del cliente, estado de notificación, etapa del embudo, consulta reformulada, confianza de la reformulación, información del asistente y un campo `consulta_reformulada_embedding` para búsquedas de similitud vectorial.

*   **`conversations_log_Queries.js`**: Proporciona funciones JavaScript para interactuar con la tabla `conversations_log`, específicamente para guardar nuevas entradas de conversación y recuperar conversaciones por fecha o número de teléfono del usuario.

*   **`conversations_log-DuckDB.sql`**: Contiene comandos SQL específicos para DuckDB, mostrando cómo crear, insertar y consultar la tabla `conversations_log`, a menudo cargando datos desde archivos JSON o CSV. Incluye ejemplos de filtrado y ordenación.

*   **`generateMonthlyBotMessageReport.js`**: Un script JavaScript que genera un informe mensual de los mensajes del bot, agrupados por nombre del bot, mes y rol, utilizando Sequelize para interactuar con la base de datos.

*   **`generateWeeklyBotMessageReport.js`**: Un script JavaScript que genera un informe del total de mensajes en la base de datos. Anteriormente contenía lógica para informes semanales, pero actualmente solo cuenta todos los mensajes.

*   **`generateWeeklyBotMessageReport.md`**: Documentación o plantilla para informes semanales de mensajes del bot.

*   **`generateWeeklyBotMessageReportV2.js`**: Una versión actualizada del script JavaScript para generar informes semanales de mensajes del bot, con una opción para agrupar por nombre del bot, semana y rol. Utiliza Sequelize para la interacción con la base de datos.

*   **`seed.js`**: Un script JavaScript encargado de iniciar el proceso de "sembrado" (seeding) de la base de datos, específicamente llamando a `seedHorarios` desde `horariosSeeder.js`.

*   **`seedConversationsLog.js`**: Un script JavaScript que "siembra" la tabla `conversations_log` con datos de conversación de ejemplo para fines de prueba y desarrollo.

*   **`sequelize.js`**: Configura y exporta una instancia de Sequelize para conectarse a una base de datos PostgreSQL, utilizando variables de entorno para los detalles de conexión.

*   **`temp_check_data.js`**: Un script JavaScript temporal utilizado para verificar los mensajes del bot dentro de la semana actual, demostrando cómo consultar el modelo `ConversationsLog` usando Sequelize.

*   **`usuarios_Queries.js`**: Contiene funciones JavaScript para realizar operaciones CRUD (Crear, Leer, Actualizar) en una tabla `usuarios`, incluyendo la creación de nuevos usuarios, la recuperación de usuarios por número de teléfono y la actualización de los detalles del usuario.
