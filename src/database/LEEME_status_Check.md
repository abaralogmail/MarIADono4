Flujo detallado de verificación de estado desde flowTest.js hasta la respuesta

Este documento describe, paso a paso, cómo se verifica el estado de los mensajes desde flowTest.js pasando por MessageStatusChecker.js y DatabaseQueries.js, y cómo finalmente se devuelve una respuesta en flowTest.js.

1) Visión general del flujo
- El usuario interactúa con un flujo definido en flowTest.js. Se pueden activar:
  - t1: crea un horario automático para el bot
  - t2: crea un horario de envíos masivos (bulk)
  - status: solicita la verificación de estados de los mensajes enviados
- Cuando se solicita status, flowTest.js crea una instancia de HorarioManagerService para gestionar horarios y, para la verificación, crea una instancia de MessageStatusChecker con el provider actual.
- MessageStatusChecker obtiene el estado de los mensajes enviados desde la base de datos (a través de DatabaseQueries.js) para una ventana temporal (semana).
- Además, MessageStatusChecker puede consultar el estado de mensajes específicos desde el store del provider (provider.store.messages).
- Los resultados se formatean y se devuelven a través de flowDynamic para mostrarlos al usuario.

2) Archivos involucrados y su función

2.1 flowTest.js (src/flows/flowTest.js)
- Función principal: define dos configuraciones de horarios (auto y bulk) y un flujo de palabras clave.
- Gestión de palabras clave: t1, t2 y status.
- Acciones clave:
  - t1: selecciona la configuración de horario automático y llama a horarioService.crearHorarioBot para crear el horario; notifica el resultado al usuario.
  - t2: selecciona la configuración de horario bulk y llama a horarioService.crearHorarioBot para crearlo; notifica el resultado al usuario.
  - status: invoca handleMessageStatusCheck(provider, flowDynamic).
- handleMessageStatusCheck:
  - Crea una instancia de MessageStatusChecker con el provider.
  - Llama a mensajesBulkEnviadosEstaSemana() para obtener mensajes enviados en la última semana desde la BD.
  - Devuelve/expone los estados obtenidos a través de flowDynamic.
- Salida: flowDynamic recibe un string con los estados o un mensaje de error.

2.2 MessageStatusChecker.js (src/bulk/MessageStatusChecker.js)
- Clase MessageStatusChecker:
  - constructor(provider): guarda el proveedor para acceder al store de mensajes y otros recursos.
  - checkMessageStatus({ messageid, remoteJid }): intenta localizar un mensaje específico en provider.store.messages y devolver su estado si existe. Si no encuentra el mensaje, devuelve null. Si ocurre un error, registra el error y devuelve null.
  - getAllMessageStatusesHoy(): intenta obtener los mensajes bulk enviados hoy desde la BD (a través de DatabaseQueries.mensajesBulkEnviadosHoy) y, para cada mensaje, obtiene su estado consultando checkMessageStatus y construye un arreglo con campos: id, status, timestamp, from, to, body. Luego filtra para conservar solo estados no nulos.
  - mensajesBulkEnviadosEstaSemana(): obtiene los mensajes bulk enviados durante la última semana desde la BD (DatabaseQueries.mensajesBulkEnviadosEstaSemana) y los devuelve tal cual.
  - getPendingMessages(): devuelve mensajes pendientes o ya enviados desde el store del provider si existieran.
- Salida/uso:
  - getAllMessageStatusesHoy y/o mensajesBulkEnviadosEstaSemana devuelven listas de objetos con estado de los mensajes obtenidos de la BD.
  - checkMessageStatus permite cruzar estado de un mensaje específico si se tiene su messageid y remoteJid.
- Export: la clase se exporta como módulo.

2.3 DatabaseQueries.js (src/database/DatabaseQueries.js)
- Clase DatabaseQueries con métodos estáticos para interactuar con SQLite a través de SqliteManager.
- mensajesBulkEnviadosHoy():
  - Consulta la BD para obtener registros relevantes de conversaciones de hoy para un bot específico (consulta basada en un ID fijo y en el nombre del bot).
  - Utiliza SqliteManager.getInstance() y devuelve los resultados de la consulta.
  - Nota: el código contiene un providerBotName hardcodeado ('BotAugustoTucuman').
- mensajesBulkEnviadosEstaSemana():
  - Consulta la BD para obtener registros de la última semana para un bot específico.
  - La consulta usa weekAgo y compara con datetime(date || ' ' || time).
  - Devuelve los resultados o lanza error.
- guardarMetricasConversacion(datos):
  - Mapea los datos recibidos a la forma esperada por el modelo de métricas (ConversationMetricas) y llama sqliteDb.saveMetricas(payload) para persistir.
  - Manejo de errores: registra y re-lanza.
- Export: la clase se exporta como módulo.

3) Cómo funciona el flujo de verificación de estado

- Inicio desde flowTest.js:
  - El flujo escucha las palabras clave ['t1', 't2', 'status'].
  - En la ruta 'status', flowTest.js llama a handleMessageStatusCheck(provider, flowDynamic).

- En handleMessageStatusCheck:
  - Se crea una instancia de MessageStatusChecker pasando el provider.
  - Se llama a mensajesBulkEnviadosEstaSemana() para obtener los mensajes enviados en la última semana desde la BD.
  - Se imprime en consola el conjunto de estados obtenidos y se envía al usuario a través de flowDynamic con un JSON stringify de los estados.
  - Si ocurre un error, se registra y se envía un mensaje de error al usuario.

- En MessageStatusChecker:
  - getAllMessageStatusesHoy():
    - Llama a DatabaseQueries.mensajesBulkEnviadosHoy() para obtener registros de hoy.
    - Recorre esos registros y, para cada uno, construye remoteJid y messageid.
    - Llama a checkMessageStatus({ messageid, remoteJid }) para obtener el estado actual desde el store del provider (local en memoria).
    - Crea objetos con estructura { id, status, timestamp, from, to, body }.
    - Filtra para eliminar entradas donde status sea null y devuelve la lista resultante.
  - mensajesBulkEnviadosEstaSemana():
    - Llama a DatabaseQueries.mensajesBulkEnviadosEstaSemana() para obtener los registros de la última semana.
    - Devuelve esa lista tal cual (con campos que trae la consulta).
  - checkMessageStatus({ messageid, remoteJid }):
    - Accede a this.provider.store.messages (estructura esperada del store del proveedor).
    - Busca en userMessages (messages[remoteJid].array) el mensaje cuyo key.id coincida con messageid.
    - Si encuentra el mensaje, devuelve un objeto { status: <valor> }.
    - Si no lo encuentra, devuelve null.
    - En caso de error, imprime el error y devuelve null.

- En DatabaseQueries.js:
  - mensajesBulkEnviadosHoy() usa una consulta SQL para extraer determinados registros de conversations_log con un filtro por botname y por IDs específicos, limitando la cantidad de resultados.
  - mensajesBulkEnviadosEstaSemana() usa una consulta con una condición de fechas para traer registros de la semana pasada hasta hoy para el mismo botname.
  - guardarMetricasConversacion(datos) transforma los campos de entrada a la estructura esperada por el modelo metrics y llama a saveMetricas para persistir.

4) Detalles técnicos y consideraciones

- Dependencias principales:
  - flowTest.js depende de HorarioManagerService y MessageStatusChecker (este último a su vez usa DatabaseQueries).
  - MessageStatusChecker.js accede a la BD a través de DatabaseQueries para leer mensajes bulk enviados.
  - DatabaseQueries.js depende de SqliteManager para conectarse a la base de datos SQLite.
- Datos esperados en la BD y en el store del provider:
  - BD: tabla conversations_log con campos como id, botname, date, time, messageid, from, to, body, status, etc. Las consultas seleccionan por botname y por rangos de fecha.
  - Store del provider: provider.store.messages con una estructura que permita acceder a messages[remoteJid].array y a cada mensaje con un field key.id para comparar con messageid, y un field status para obtener el estado.
- Notas sobre configuración rígida:
  - El nombre del bot en las consultas de la BD está hardcodeado como 'BotAugustoTucuman' en DatabaseQueries.js. Si se usan múltiples bots, conviene hacer que este valor sea dinámico (p. ej., leerlo desde el provider o desde una config) para evitar inconsistencias.
- Manejo de errores:
  - flowTest.js captura errores al generar horarios y al verificar estados, notificando al usuario con mensajes de error.
  - MessageStatusChecker.checkMessageStatus devuelve null si no encuentra el mensaje o si ocurre un error; getAllMessageStatusesHoy devuelve [] si hay error o si no hay estados válidos.
- Rendimiento:
  - getAllMessageStatusesHoy realiza una iteración sobre los mensajes obtenidos de la BD y consulta el store por cada uno. Si el conjunto es grande, podría haber impacto en rendimiento; considerar paginación o límites.
- Extensiones y mantenimiento:
  - Se pueden ampliar los métodos de DatabaseQueries para incluir más filtros (por ejemplo, por botname dinámico, por rango de fechas configurable).
  - Se puede hacer que checkMessageStatus derive el status de diferentes estructuras de mensajes si cambia la forma del store del provider.
  - Añadir tests unitarios para cada método, usando mocks para provider.store y para SqliteManager.

5) Ejemplos de respuestas y comportamiento esperado

- Caso t1 (crear horario automático):
  - flowDynamic: "Creating automatic schedule for *BotName*, please wait..."
  - Si se crea correctamente: flowDynamic: "✅ Schedule created successfully."
  - Si falla: flowDynamic: "❌ An error occurred: <mensaje de error>"

- Caso t2 (crear horario bulk):
  - Similar al caso anterior, pero usando la configuración bulk.

- Caso status (ver estados de mensajes):
  - flowDynamic recibe un JSON string con la lista de estados de los mensajes obtenidos, por ejemplo:
    - [{ id: 123, status: { status: 3 }, timestamp: "2025-...T... ", from: "...", to: "...", body: "..." }, ...]
  - Si ocurre un error, flowDynamic: "❌ An error occurred while checking message statuses: <mensaje>"

6) Recomendaciones para pruebas rápidas

- Crear mocks de:
  - provider con store.messages simulada: estructura con remoteJid y mensajes con key.id y status.
  - DB mock para SqliteManager y las consultas para devolver listas simuladas para mensajesBulkEnviadosHoy/EstaSemana.
  - flowDynamic como función que captura el texto enviado para verificar el resultado.
- Pruebas unitarias por función:
  - Test de checkMessageStatus: devolver un status esperado para un messageid existente; devolver null para messageid inexistente.
  - Test de getAllMessageStatusesHoy: con BD simulada, espera que retorne solo entradas con status no nulo.
  - Test de mensajesBulkEnviadosEstaSemana: verifica que devuelve la lista de mensajes según la simulación de BD.
  - Test de flowTest: simular entradas t1, t2 y status y verificar que las llamadas a flowDynamic y a crear horarios se ejecutan como se espera (usar mocks para HorarioManagerService y MessageStatusChecker).

7) Resumen de flujo de datos

- Entrada del usuario: llega un mensaje con una palabra clave (t1, t2, status).
- flowTest.js:
  - Si t1/t2: genera un horario mediante HorarioManagerService y responde con el resultado.
  - Si status: crea MessageStatusChecker(provider) y llama a mensajesBulkEnviadosEstaSemana() para obtener datos de la BD; imprime en consola y devuelve al usuario a través de flowDynamic.
- Proceso de obtención de estado:
  - A través de DatabaseQueries.js, se ejecutan consultas SQL contra la base de datos para obtener mensajes bulk enviados.
  - A través de MessageStatusChecker.js, para cada registro obtenido, se consulta el estado real en el store del provider mediante checkMessageStatus.
  - Se construye una lista de estados que se envía al usuario.
- Salida al usuario:
  - Un listado de estados de los mensajes enviados (o un mensaje de error si corresponde).

