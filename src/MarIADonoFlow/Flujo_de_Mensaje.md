### Descripción del Flujo de Mensaje

1. **Inicio en `flowPrincipal.js`:**
   - La función `flowPrincipal` es la acción que se ejecuta al recibir el evento de bienvenida (`EVENTS.WELCOME`).
   - Se inicia el contexto de `ctx` y se obtiene el `userId` del remitente (`ctx.from`) y el nombre del bot (`provider.globalVendorArgs.name`).

2. **Configuraciones Iniciales:**
   - Se obtiene la configuración específica del bot utilizando `botConfigManager.getBotConfig(botName)`.
   - Un objeto de `MessageData` se inicializa a partir del contexto (`const messageData = await MessageData.fromCtx(ctx)`), permitiendo registrar información relevante del mensaje.

3. **Manejo de Multimedia:**
   - Se verifica si hay información sobre los medios adjuntos (`const mediaInfo = getMediaInfo(ctx)`).
   - Si hay medios, se procesan utilizando `voiceMediaManager.processMessage(ctx, flowDynamic)`, actualizando el `messageData` con información como el cuerpo, la ruta del archivo y otros detalles relevantes.

4. **Registro y Agregación:**
   - Se registra el `messageData` utilizando `logMessage(messageData)` para el seguimiento de mensajes y se guarda el proveedor actual (`saveLastProvider(provider)`).
   - Se agrega el historial de conversación relevante mediante `aggregateChatHistory(provider, messageData)`.

5. **Verificación de Horarios y Mensajes en Lote:**
   - Se consulta si es un momento permitido para enviar mensajes masivos con `horarioService.verificarHorarioBot(TIPO_HORARIO_BULK, botName, new Date())`.
   - Si está permitido, se inicia el envío de mensajes masivos a través de `BulkMessageManager`.

6. **Conteo de Mensajes y Bloqueo de Usuario:**
   - Se maneja el conteo de mensajes del usuario a través de `handleUserMessageCount(userId, flowDynamic)`.
   - Se verifica si el usuario está bloqueado mediante `isUserBlocked(userId)`.

7. **Comprobación de Horario para Respuestas Automáticas:**
   - Si el usuario no está bloqueado, se verifica si es hora de enviar respuestas automáticas usando `horarioService.verificarHorarioBot(TIPO_HORARIO_AUTO, botName, new Date())`.
   - Si no es un horario permitido para respuestas automáticas, se llama a `processMessage(messageData, provider)` para procesar la respuesta al mensaje del usuario.

---

### Proceso en `messageProcessor.js`:

8. **Función `processMessage`:**
   - Al llegar a esta función, se inicializan variables generales y se busca el `remoteJid` del mensaje.
   - Se verifica nuevamente si es un horario permitido para respuestas automáticas. Si no lo es, se procede a procesar el mensaje.

9. **Actualización de Presencia:**
   - Se establece el estado de presencia del bot a "composing" (escribiendo) antes de procesar el mensaje utilizando `provider.vendor.sendPresenceUpdate("composing", remoteJid)`.

10. **Llamada a N8n:**
    - Se inicializa un listener para el webhook de n8n y se envía el `messageData` a través de `n8nWebhook.sendWebhook(messageData)`.
    - Si la respuesta es vacía o indica que no hay respuesta, se restablece el estado de presencia a "available" (disponible) y se termina aquí el proceso de volver al flujo actual.

11. **Métricas y Registro:**
    - Si hay una respuesta de n8n, se asignan métricas del mensaje (`interesCliente`, `etapaEmbudo`) y se actualiza el registro de conversación llamando a `updateConversationLog(messageData.messageId, { etapaEmbudo, interesCliente })`.

12. **Configuración del Usuario:**
    - Si la respuesta indica que el usuario quiere dar de baja las notificaciones, se actualiza la configuración del usuario e informa al administrador.

13. **Verificación de Horarios para Envío de Respuestas:**
    - Si está permitido, se genera la respuesta, se agrega un emoji y se envía utilizando `sendChunksWithDelay(respuestaConEmoji, 0, messageData, provider)`.
    - Finalmente, se restablece la presencia del bot a "available".

### Resumen

El flujo desde `flowPrincipal.js` hasta `messageProcessor.js` implica la recolección de datos del contexto del mensaje, el manejo de contenido multimedia, la verificación de horarios para respuestas, la actualización de estado de presencia, y el uso de un webhook para obtener respuestas dinámicas. A lo largo de este proceso, se registran datos relevantes y se gestionan configuraciones de usuario, asegurándose de que el bot actúe de acuerdo a las reglas establecidas por el contexto y la configuración del bot.