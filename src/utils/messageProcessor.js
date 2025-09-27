const fs = require("fs");
const path = require("path");
const { logicaMensajes } = require("../../mensajes/logica");
const { sendChunksWithDelay } = require("../utils/sendChunksWithDelay");
const MessageData = require("../utils/MessageData");
const N8nWebhookListener = require("../Logica/N8nWebhookListener");
const { isWithinRestrictedHours } = require("../utils/timeRestrictions");
const botConfig = require("../config/botConfigManager"); // Import botConfig
const { isAdmin, getAdmin } = require("./../utils/isAdmin");
const HorarioManagerService = require("../services/HorarioManagerService");

const TIPO_HORARIO_AUTO = 1; // Asume que el ID 1 corresponde al tipo 'Auto'
const TIPO_HORARIO_BULK = 2; // Asume que el ID 2 corresponde al tipo 'bulk'


/**
 * Actualiza el conversation_log.json buscando por messageId y
 * añadiendo o modificando las propiedades etapaEmbudo e interesCliente
 */
function updateConversationLog(messageId, { etapaEmbudo, interesCliente }) {
  const logPath = path.join(__dirname, "../../Logs/conversations_log.json");
  try {
    const raw = fs.readFileSync(logPath, "utf-8");
    const conversations = JSON.parse(raw);
    if (!Array.isArray(conversations)) {
      console.warn("conversation_log.json no contiene un array en raíz");
      return;
    }

    const idx = conversations.findIndex((c) => c.messageId === messageId);
    if (idx === -1) {
      console.warn(
        `No se encontró mensaje con ID ${messageId} en conversations_log.json`
      );
      return;
    }

    conversations[idx].etapaEmbudo = etapaEmbudo;
    conversations[idx].interesCliente = interesCliente;

    fs.writeFileSync(logPath, JSON.stringify(conversations, null, 2), "utf-8");
    //console.log(      `[INFO] conversation_log.json actualizado para messageId=${messageId}`    );
  } catch (err) {
    console.error("[ERROR] al actualizar conversation_log.json:", err);
  }
}

async function processMessage(messageData, provider) {
  try {
    //await provider.sendPresenceUpdate('composing', messageData.from); // Actualiza la presencia al inicio
    //remotejid

    //await provider.sendPresenceUpdate(messageData.ctx.key.remoteJid, 'available'); // Cambia a "available" después de enviar el mensaje
    const horarioService = new HorarioManagerService();

    const remoteJid = `${messageData.from}@c.us`;
      const isAutoTime = await horarioService.verificarHorarioBot(TIPO_HORARIO_AUTO, messageData.botName , new Date());
      console.log("isAutoTime: ", isAutoTime);
  
      //if (!isWithinRestrictedHours(messageData.botName, "auto")) {
      if(!isAutoTime){
   
      try {
        // Set status to "composing" before processing the message
        await provider.vendor.sendPresenceUpdate("composing", remoteJid);
      } catch (presenceError) {
        console.log(
          "[INFO]: Could not update presence status to composing:",
          presenceError.message
        );
      }
    }

    messageData.role = "Outgoing";
    messageData.pushName = "Assistant";

    // Inicializa listener n8n
    const n8nWebhook = new N8nWebhookListener(
      "http://localhost:5678/webhook/Webhook"
      
    );
    const webHookRespuesta = await n8nWebhook.sendWebhook(messageData);

    // Si la respuesta está vacía, no hacemos nada
    if (!webHookRespuesta?.Respuesta || 
    webHookRespuesta.Respuesta === "SinRespuesta" || 
    webHookRespuesta.Respuesta === "") {
    
      // After sending the message, set status back to available
      try {
        await provider.vendor.sendPresenceUpdate("available", remoteJid);
      } catch (presenceError) {
        console.log(
          "[INFO]: Could not update presence status to available:",
          presenceError.message
        );
      }

      return;
    }

    // Asigna métricas
    messageData.etapaEmbudo =
      webHookRespuesta.etapaEmbudo || "";
    messageData.interesCliente =
      webHookRespuesta.interesCliente || "";

    console.log(
      `[INFO]: ${messageData.botName} - ${messageData.from} - ` +
        `${messageData.interesCliente} - ${messageData.etapaEmbudo}`
    );

    // Actualiza el log de conversación para que quede guardada esta info
    updateConversationLog(messageData.messageId, {
      etapaEmbudo: messageData.etapaEmbudo,
      interesCliente: messageData.interesCliente,
    });

    // Update user settings based on 'Dar_de_baja_Notificaciones'
    
    if (webHookRespuesta.estado_habilitacion_Notificacion === 0) {
      try {
        const userConfig = require("../config/userConfig"); // Import the user config module
        userConfig.updateUserConfig(messageData.from, {notificationEnabled: false,});
        //enviar mensaje a administrador, con botName y from
        const mensaje = `El usuario ${messageData.from} ha dado de baja las notificaciones del bot ${messageData.botName}.`;
        const adminNumber = getAdmin();
       //explica el if: 
        if (adminNumber) {
          
          const messageInfo = await provider.vendor.sendMessage(`${adminNumber}@c.us`, {
            text: mensaje,
          });
        }
      } catch (error) {
        console.log("[ERROR]: Error updating user config:", error);
      }
    }

    // Chequea horario restringido
    //const varIsWithinRestrictedHours = isWithinRestrictedHours(messageData.botName,"auto");
    const now = new Date();
    const varIsWithinRestrictedHours = now.getHours() < 8 ? false : true;

    // Si no está en horario restringido, envía la respuesta
    
    if(!isAutoTime){
      // Agregar emoji de robot al inicio de la respuesta
      const respuestaConEmoji = `💬: ${webHookRespuesta.Respuesta}`;

      //cambiar aqui
      //sendChunksWithDelay(respuestaConEmoji, 0, messageData, provider);

      // After sending the message, set status back to available
      try {
        await provider.vendor.sendPresenceUpdate("available", remoteJid);
      } catch (presenceError) {
        console.log(
          "[INFO]: Could not update presence status to available:",
          presenceError.message
        );
      }
    } else {
      console.log(
        `[INFO]: ${messageData.botName} está fuera del horario restringido ` +
          `para responder mensajes automáticos. Se omite el mensaje.`
      );
    }
  } catch (err) {
    console.log("[ERROR]:", err);
  }
}

module.exports = { processMessage };