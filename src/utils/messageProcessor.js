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
const SqliteManager = require("../database/SqliteManager");
const DatabaseQueries = require("../database/DatabaseQueries");

const TIPO_HORARIO_AUTO = 1; // Asume que el ID 1 corresponde al tipo 'Auto'
const TIPO_HORARIO_BULK = 2; // Asume que el ID 2 corresponde al tipo 'bulk'



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

     messageData.etapaEmbudo = webHookRespuesta.etapaEmbudo || "";
    messageData.interesCliente = webHookRespuesta.interesCliente || "";

    console.log(
      `[INFO]: ${messageData.botName} - ${messageData.from} - ` +
        `${messageData.interesCliente} - ${messageData.etapaEmbudo}`
    );

    // Actualiza el log de conversación
    /*updateConversationLog(messageData.messageId, {
      etapaEmbudo: messageData.etapaEmbudo,
      interesCliente: messageData.interesCliente,
    });*/

    // NUEVO: Guardar métricas del webhook en la base de datos
    try {
      const metricasData = {
        messageId: messageData.messageId,
        respuesta: webHookRespuesta.Respuesta ?? null,
        metricasCliente:
          webHookRespuesta.Metricas_Cliente ??
          null,
        interesCliente: webHookRespuesta.interesCliente ?? null,

        estadoHabilitacionNotificacion:
          webHookRespuesta.estado_habilitacion_Notificacion == null
            ? null
            : Boolean(Number(webHookRespuesta.estado_habilitacion_Notificacion)),

        etapaEmbudo: webHookRespuesta.etapaEmbudo ?? null,
        consultaReformulada: webHookRespuesta.Consulta_reformulada ?? null,
        confianzaReformulada: webHookRespuesta.Confianza_Reformulada ?? null,
        asistenteInformacion:
          webHookRespuesta.Asistente_Informacion ??
          null,
      };

      await DatabaseQueries.guardarMetricasConversacion(metricasData);
      console.log(
        `[INFO]: Métricas guardadas en conversation_metricas para messageId=${messageData.messageId}`
      );
    } catch (metricasError) {
      console.error(
        "[ERROR]: No se pudieron guardar las métricas:",
        metricasError
      );
    }

    // Update user settings based on 'Dar_de_baja_Notificaciones'
    // ... existing code ...

    // Chequea horario restringido
    // ... existing code ...

    if (!isAutoTime) {
      // ... existing code ...
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