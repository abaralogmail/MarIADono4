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

// Descomposición en helpers con nombres en español

function construirRemoteJid(desde) {
  return `${desde}@c.us`;
}

async function actualizarPresenciaComponiendo(proveedor, remoteJid) {
  try {
    await proveedor.vendor.sendPresenceUpdate("composing", remoteJid);
  } catch (presenceError) {
    console.log("[INFO]: No se pudo actualizar la presencia a composing:", presenceError.message);
  }
}

async function enviarWebhookN8n(messageData) {
  const webhook = new N8nWebhookListener("http://localhost:5678/webhook/Webhook");
  return await webhook.sendWebhook(messageData);
}

function asignarEmbudoInteres(messageData, webHookRespuesta) {
  messageData.etapaEmbudo = webHookRespuesta?.etapaEmbudo || "";
  messageData.interesCliente = webHookRespuesta?.interesCliente ?? "";
}

async function guardarMetricasDesdeWebhook(messageData, webHookRespuesta) {
  const metricasData = {
    messageId: messageData.messageId,
    respuesta: webHookRespuesta?.Respuesta ?? null,
    metricasCliente: webHookRespuesta?.Metricas_Cliente ?? null,
    interesCliente: webHookRespuesta?.interesCliente ?? null,
    estadoHabilitacionNotificacion:
      webHookRespuesta?.estado_habilitacion_Notificacion == null
        ? null
        : Boolean(Number(webHookRespuesta.estado_habilitacion_Notificacion)),
    etapaEmbudo: webHookRespuesta?.etapaEmbudo ?? null,
    consultaReformulada: webHookRespuesta?.Consulta_reformulada ?? null,
    confianzaReformulada: webHookRespuesta?.Confianza_Reformulada ?? null,
    asistenteInformacion: webHookRespuesta?.Asistente_Informacion ?? null,
  };

  await DatabaseQueries.guardarMetricasConversacion(metricasData);
  console.log(
    `[INFO]: Métricas guardadas en conversation_metricas para messageId=${messageData.messageId}`
  );
}

async function processMessage(messageData, provider) {
  try {
    const remoteJid = construirRemoteJid(messageData.from);

    const horarioService = new HorarioManagerService();
    const isAutoTime = await horarioService.verificarHorarioBot(
      TIPO_HORARIO_AUTO,
      messageData.botName,
      new Date()
    );
    console.log("isAutoTime: ", isAutoTime);

    if (!isAutoTime) {
      try {
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

    const webHookRespuesta = await enviarWebhookN8n(messageData);

    // Si la respuesta está vacía, no hacemos nada
    if (
      !webHookRespuesta?.Respuesta ||
      webHookRespuesta.Respuesta === "SinRespuesta" ||
      webHookRespuesta.Respuesta === ""
    ) {
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

    asignarEmbudoInteres(messageData, webHookRespuesta);

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
      await guardarMetricasDesdeWebhook(messageData, webHookRespuesta);
      console.log(
        `[INFO]: Métricas guardadas en conversation_metricas para messageId=${messageData.messageId}`
      );
    } catch (metricasError) {
      console.error("[ERROR]: No se pudieron guardar las métricas:", metricasError);
    }

    // Update user settings based on 'Dar_de_baja_Notificaciones'
    // ... existing code ...

    // Chequea horario restringido
    // ... existing code ...

      if(!isAutoTime){
      // Agregar emoji de robot al inicio de la respuesta
      const respuestaConEmoji = `💬: ${webHookRespuesta.Respuesta}`;

      //cambiar aqui

      if(provider.globalVendorArgs.name=="BotAugustoTucuman")
        {      
          sendChunksWithDelay(respuestaConEmoji, 0, messageData, provider);
        }
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