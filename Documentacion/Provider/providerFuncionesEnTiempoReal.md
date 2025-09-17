### 📦 Objeto `vendor`

Este objeto agrupa múltiples funciones útiles relacionadas con la gestión de sesiones, chats, mensajes, privacidad, perfiles y catálogos de WhatsApp.

---

### 🔍 Funciones y su propósito

#### 🔹 `addChatLabel(jid, labelId)`

* **Uso**: Asocia una etiqueta a un chat.
* **Parámetros**:

  * `jid`: ID del chat.
  * `labelId`: ID de la etiqueta.
* **Internamente**: llama a `chatModify(...)`.

---

#### 🔹 `addMessageLabel(jid, messageId, labelId)`

* **Uso**: Asocia una etiqueta a un mensaje específico.
* **Parámetros**:

  * `jid`: ID del chat.
  * `messageId`: ID del mensaje.
  * `labelId`: ID de la etiqueta.

---

#### 🔹 `appPatch(patchCreate)`

* **Uso**: Aplica un "patch" o modificación a la aplicación (como ajustes de chat, etiquetas, etc.).
* **Parámetro**:

  * `patchCreate`: estructura con la modificación deseada.

---

#### 🔹 `assertSessions(jids, force)`

* **Uso**: Asegura que existen sesiones activas para ciertos JIDs (usuarios o grupos).
* **Parámetros**:

  * `jids`: array de JIDs.
  * `force`: booleano opcional, fuerza la creación si no existe.

---

#### 🔹 `chatModify(mod, jid)`

* **Uso**: Aplica una modificación a un chat.
* **Parámetros**:

  * `mod`: objeto con modificaciones (por ejemplo: silenciar, marcar como leído, aplicar etiquetas).
  * `jid`: ID del chat.

---

#### 🔹 `cleanDirtyBits(type, fromTimestamp)`

* **Uso**: Limpia banderas de cambios ("dirty bits") desde una fecha.
* **Parámetros**:

  * `type`: tipo de entidad (chat, mensaje, etc.).
  * `fromTimestamp`: desde cuándo limpiar.

---

#### 🔹 `end(error)`

* **Uso**: Finaliza una conexión o proceso, registrando el error si existe.
* **Parámetro**:

  * `error`: objeto de error.

---

#### 🔹 `ev`

* **Uso**: Sistema de eventos (emisión, procesamiento).
* **Estructura**:

  * `emit`, `process`, `isBuffering`, `flush`: partes del sistema de eventos.

---

#### 🔹 `fetchBlocklist()`

* **Uso**: Recupera la lista de usuarios bloqueados.

---

#### 🔹 `fetchPrivacySettings(force = false)`

* **Uso**: Obtiene la configuración de privacidad.
* **Parámetro**:

  * `force`: si `true`, fuerza una nueva consulta.

---

#### 🔹 `fetchStatus(jid)`

* **Uso**: Recupera el estado (como "en línea", "última vez", etc.) de un usuario.
* **Parámetro**:

  * `jid`: ID del usuario.

---

#### 🔹 `generateMessageTag()`

* **Uso**: Genera un identificador único para mensajes.
* **Devuelve**: algo como `'1234@s.whatsapp.net' + timestamp`.

---

#### 🔹 `getBusinessProfile(jid)`

* **Uso**: Recupera el perfil de empresa de un usuario.
* **Parámetro**:

  * `jid`: ID del usuario.

---

#### 🔹 `getCatalog({ jid, limit, cursor })`

* **Uso**: Obtiene el catálogo de productos de una cuenta de empresa.
* **Parámetros**:

  * `jid`: ID del negocio.
  * `limit`: número máximo de ítems.
  * `cursor`: para paginación.

---

#### 🔹 `getCollections(jid, limit = 51)`

* **Uso**: Recupera colecciones de productos de una empresa.

---

#### 🔹 `getOrderDetails(orderId, tokenBase64)`

* **Uso**: Consulta detalles de una orden de compra.
* **Parámetros**:

  * `orderId`: ID de la orden.
  * `tokenBase64`: token de autorización.

---

#### 🔹 `getPrivacyTokens(jids)`

* **Uso**: Recupera "tokens" de privacidad (usados para verificar permisos).
* **Parámetro**:

  * `jids`: lista de IDs de usuarios.

---

#### 🔹 `groupAcceptInvite(code)`

* **Uso**: Acepta una invitación a un grupo.
* **Parámetro**:

  * `code`: código de invitación.

---

#### 🔹 `groupAcceptInviteV4(...args)`

* **Uso**: Acepta invitación a grupo con una versión nueva del sistema (posiblemente más segura).
* **Parámetro**:

  * `...args`: múltiples argumentos, no visibles en su totalidad.

---

### 🛠 Cómo podrías usarlas en código:

```js
await vendor.addChatLabel('12345@s.whatsapp.net', 'label_001');
const status = await vendor.fetchStatus('12345@s.whatsapp.net');
console.log(status);

const catalog = await vendor.getCatalog({ jid: 'empresa@s.whatsapp.net', limit: 10 });
```

### 👥 Funciones para gestión de grupos (`group*`)

#### 🔹 `groupCreate(subject, participants)`

* **Uso**: Crea un grupo nuevo.
* **Parámetros**:

  * `subject`: nombre del grupo.
  * `participants`: lista de JIDs a agregar.

---

#### 🔹 `groupFetchAllParticipating()`

* **Uso**: Obtiene todos los grupos en los que el usuario participa.

---

#### 🔹 `groupGetInviteInfo(code)`

* **Uso**: Obtiene información de una invitación a grupo mediante el código de invitación.

---

#### 🔹 `groupInviteCode(jid)`

* **Uso**: Obtiene el código de invitación de un grupo.

---

#### 🔹 `groupLeave(id)`

* **Uso**: Sale de un grupo.
* **Parámetro**:

  * `id`: JID del grupo.

---

#### 🔹 `groupMetadata(jid)`

* **Uso**: Recupera metadatos del grupo (nombre, admins, participantes, etc.).

---

#### 🔹 `groupParticipantsUpdate(jid, participants, action)`

* **Uso**: Añade o elimina participantes.
* **Parámetros**:

  * `jid`: ID del grupo.
  * `participants`: array de JIDs.
  * `action`: `'add'` o `'remove'`.

---

#### 🔹 `groupRequestParticipantsList(jid)`

* **Uso**: Solicita la lista completa de participantes de un grupo grande.

---

#### 🔹 `groupRequestParticipantsUpdate(jid, participants, action)`

* **Uso**: Similar a `groupParticipantsUpdate`, pero para grupos grandes o con otro enfoque interno.

---

#### 🔹 `groupRevokeInvite(jid)`

* **Uso**: Revoca el código de invitación de un grupo (genera uno nuevo).

---

#### 🔹 `groupSettingUpdate(jid, setting)`

* **Uso**: Cambia configuraciones del grupo.
* **Ejemplo de `setting`**: `'locked'`, `'announcement'`.

---

#### 🔹 `groupToggleEphemeral(jid, ephemeralExpiration)`

* **Uso**: Activa o desactiva mensajes temporales.
* **Parámetro**:

  * `ephemeralExpiration`: tiempo en segundos o `null` para desactivar.

---

#### 🔹 `groupUpdateDescription(jid, description)`

* **Uso**: Cambia la descripción del grupo.

---

#### 🔹 `groupUpdateSubject(jid, subject)`

* **Uso**: Cambia el nombre del grupo.

---

### 🧹 Manejo de sesión y errores

#### 🔹 `logout(msg)`

* **Uso**: Cierra la sesión actual.
* **Parámetro**:

  * `msg`: mensaje de log opcional.

---

#### 🔹 `onUnexpectedError(err, msg)`

* **Uso**: Captura errores inesperados.
* **Internamente**: llama a `logger.error(...)`.

---

### 📡 Funciones de presencia y estado

#### 🔹 `onWhatsApp(...jids)`

* **Uso**: Verifica si los JIDs proporcionados están en WhatsApp.

---

#### 🔹 `presenceSubscribe(toJid, tcToken)`

* **Uso**: Se suscribe al estado de presencia (en línea/ausente) de un contacto.

---

### 🔒 Sincronización y productos

#### 🔹 `processingMutex`

* **Uso**: Objeto de control de concurrencia (`mutex`) para evitar condiciones de carrera.

---

### 🛒 Funciones para productos

#### 🔹 `productCreate(create)`

* **Uso**: Crea productos (probablemente parte del catálogo de WhatsApp Business).

---

#### 🔹 `productDelete(productIds)`

* **Uso**: Elimina productos por sus IDs.



#### 🔹 `productUpdate(productId, update)`

* **Uso**: Actualiza la información de un producto.

---

### 👤 Perfil

#### 🔹 `profilePictureUrl(jid, type = 'preview', timeoutMs)`

* **Uso**: Obtiene la URL de la foto de perfil de un contacto.
* **Parámetros**:

  * `jid`: JID del contacto.
  * `type`: `'preview'` o `'image'`.
  * `timeoutMs`: tiempo máximo de espera.

---

### 🧠 Operaciones internas y consultas

#### 🔹 `query(node, timeoutMs)`

* **Uso**: Realiza una consulta personalizada a los servidores de WhatsApp.

---

### 📖 Lectura y medios

#### 🔹 `readMessages(keys)`

* **Uso**: Marca mensajes como leídos.
* **Parámetro**:

  * `keys`: identificadores de mensajes.

#### 🔹 `refreshMediaConn(forceGet = false)`

* **Uso**: Actualiza la conexión multimedia (por ejemplo, para descargar o subir imágenes/audio).

---

### 🔐 Registro y emparejamiento

#### 🔹 `register(code)`

* **Uso**: Registra un cliente con un código recibido.

#### 🔹 `requestPairingCode(phoneNumber)`

* **Uso**: Solicita un código para emparejamiento de dispositivo.

#### 🔹 `requestRegistrationCode(registrationOptions)`

* **Uso**: Solicita un código de registro al servidor.

---

### 📞 Llamadas

#### 🔹 `rejectCall(callId, callFrom)`

* **Uso**: Rechaza una llamada entrante.

---

### 📨 Mensajería

#### 🔹 `relayMessage(jid, message, {...})`

* **Uso**: Reenvía un mensaje con información extendida.
* **Parámetros**: incluye `messageId`, `participant`, `useUserDevicesCache`, etc.

#### 🔹 `removeChatLabel(jid, labelId)`

#### 🔹 `removeMessageLabel(jid, messageId, labelId)`

* **Uso**: Elimina etiquetas de chats o mensajes.

---

#### 🔹 `removeProfilePicture(jid)`

* **Uso**: Elimina la foto de perfil.

---

### 🔄 Sincronización y estado

#### 🔹 `resyncAppState(...args)`

* **Uso**: Re-sincroniza el estado de la app (tokens, chats, etc.).

---

### ✉️ Envío de mensajes

#### 🔹 `sendMessage(jid, content, options)`

* **Uso**: Envía un mensaje a un contacto o grupo.

#### 🔹 `sendMessageAck({ tag, attrs })`

* **Uso**: Envía un acuse de recibo de mensaje (acknowledgment).

#### 🔹 `sendNode(frame)`

* **Uso**: Envía una estructura XML/JSON personalizada (usado internamente).

#### 🔹 `sendPresenceUpdate(type, toJid)`

* **Uso**: Actualiza el estado de presencia (ej. "escribiendo", "en línea").

#### 🔹 `sendRawMessage(data)`

* **Uso**: Envía un mensaje en bruto (raw frame), sin procesamiento extra.



* Confirmaciones de mensajes.
* Privacidad.
* Configuración de perfil.
* Envío de mensajes.
* Manejo de claves criptográficas.

---

### ✅ Confirmaciones de mensajes

#### 🔹 `sendReceipt(jid, participant, messageIds, type)`

* **Uso**: Envía una confirmación (por ejemplo, de lectura) de un mensaje a un contacto o grupo.

#### 🔹 `sendReceipts(keys, type)`

* **Uso**: Similar al anterior pero permite enviar múltiples confirmaciones a la vez.

#### 🔹 `sendRetryRequest(node, forceIncludeKeys = false)`

* **Uso**: Solicita el reenvío de un mensaje si no se recibió correctamente.

---

### 🔒 Seguridad y cifrado

#### 🔹 `signalRepository`

* **Uso**: Objeto que gestiona el cifrado y descifrado de mensajes grupales y personales. Incluye:

  * `decryptGroupMessage`
  * `decryptMessage`
  * `encryptMessage`
  * `processSenderKeyDistributionMessage`

---

### 🧱 Estado de bloqueo y desaparición

#### 🔹 `updateBlockStatus(jid, action)`

* **Uso**: Bloquea o desbloquea a un contacto.

#### 🔹 `updateDefaultDisappearingMode(duration)`

* **Uso**: Configura la duración predeterminada para mensajes temporales.

---

### 👁️‍🗨️ Configuración de privacidad

#### 🔹 `updateGroupsAddPrivacy(value)`

* **Uso**: Configura quién puede agregarte a grupos.

#### 🔹 `updateLastSeenPrivacy(value)`

* **Uso**: Configura quién puede ver tu "última vez en línea".

#### 🔹 `updateOnlinePrivacy(value)`

* **Uso**: Configura quién puede ver si estás en línea.

#### 🔹 `updateProfilePicturePrivacy(value)`

* **Uso**: Configura quién puede ver tu foto de perfil.

#### 🔹 `updateReadReceiptsPrivacy(value)`

* **Uso**: Configura si otros pueden ver si leíste sus mensajes.

#### 🔹 `updateStatusPrivacy(value)`

* **Uso**: Configura quién puede ver tus estados.

---

### 🖼️ Perfil

#### 🔹 `updateProfileName(name)`

* **Uso**: Cambia tu nombre de perfil.

#### 🔹 `updateProfilePicture(jid, content)`

* **Uso**: Cambia tu imagen de perfil.

#### 🔹 `updateProfileStatus(status)`

* **Uso**: Cambia tu mensaje de estado (ej. “Disponible”).

---

### 🗣️ Envío y modificación de mensajes

#### 🔹 `updateMediaMessage(message)`

* **Uso**: Actualiza contenido multimedia de un mensaje ya enviado.

#### 🔹 `userMessage(...args)`
    
* **Uso**: Posiblemente envía o procesa un mensaje desde el usuario. Se requiere más contexto para asegurar su uso.

---

### 🔑 Claves criptográficas

#### 🔹 `uploadPreKeys(count)`

* **Uso**: Sube claves pre-generadas para cifrado de extremo a extremo.

#### 🔹 `uploadPreKeysToServerIfRequired()`

* **Uso**: Sube las claves al servidor si aún no están disponibles.

Gracias por compartir la última sección del código. Aquí tienes un resumen de lo que muestra esta imagen, centrado en la gestión de eventos, mensajes y la conexión con el servidor de WhatsApp:

---

### 📥 Mensajes y eventos

#### 🔹 `upsertMessage = async (...args)`

* **Uso**: Inserta o actualiza un mensaje en el estado interno de la app.
* **Función típica**: Almacenar nuevos mensajes entrantes o modificar mensajes existentes.

---

### 👤 Usuario actual

#### 🔹 `user = { id: '5493812488449:54@s.whatsapp.net', name: 'MarIADono Augusto' }`

* **Uso**: Información del usuario autenticado en esta sesión.
* **Nota**: Este dato identifica al usuario conectado a la API.

---

### 🔌 Conexión y eventos

#### 🔹 `waitForConnectionUpdate = async (check, timeoutMs)`

* **Uso**: Espera hasta que ocurra un cambio de conexión que cumpla una condición dada.

#### 🔹 `waitForMessage = async (msgId, timeoutMs = defaultQueryTimeoutMs)`

* **Uso**: Espera la recepción de un mensaje específico (por `msgId`) durante cierto tiempo.

#### 🔹 `waitForSocketOpen = async ()`

* **Uso**: Espera a que el WebSocket esté completamente abierto antes de continuar.

---

### ☁️ Subida de archivos

#### 🔹 `waUploadToServer = async (stream, { mediaType, fileEncSha256B64, timeoutMs })`

* **Uso**: Sube un archivo (por ejemplo, imagen, video, audio) al servidor de WhatsApp.

---

### 🌐 WebSocket de conexión

#### 🔹 `ws = WebSocketClient { ... }`

* **Uso**: Instancia del cliente WebSocket para comunicación en tiempo real con WhatsApp.
* **Contiene**: Eventos registrados (`_events`), cantidad de listeners, URL de conexión, etc.



