const XLSX = require("xlsx");
const {
  chatWithAssistant,
  getOrCreateThread,
  addContextAssistant,
} = require("./../mensajes/Assistant");
const { logMessage } = require("./../src/utils/sendChunksWithDelay");
const { isAdmin, getAdmin } = require("./../src/utils/isAdmin");
const { getUserConfig } = require("./../src/config/userConfig");
const fs = require("fs");
const path = require("path");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MessageData = require("../src/utils/MessageData");
const OllamaFunnelClassifier = require("./OllamaFunnelClassifier");
const {
  getDailyBulkMessageStats,
} = require("../src/utils/getBulkMessageStats");
const getMessageHistory = require("../src/utils/chatHistoryAggregator");
const N8nWebhookListener = require("../src/Logica/N8nWebhookListener");
const {
  getInstance: getBotConfigManager,
} = require("../src/config/botConfigManager");

//const DAILY_MESSAGE_LIMIT = 300;
let lastMessageDate = null;
const activeBulkMessages = new Map();

// Add at the top with other constants
//messagesSentToday por bot

const BOT_MESSAGE_LIMITS = {
  BotOfertasTucuman: 100,
  BotAdministracionSalta: 20,
  bot: 200,
  BotConsultasWeb: 100, // Add this line with an appropriate limit
  BotSaltaMostrador: 100,
  BotRamiro: 100, 
  BotRoly: 100,
  BotFranco: 100,
  BotMetan: 100,

};

// Initialize an object to track messages sent by each bot
const messagesSentTodayByBot = {};

// Update the checkBotLimit function to use the new structure
function checkBotLimit(botName, messagesSent) {
  //botconfigmanager = dailyMessageLimit

  const botLimit = BOT_MESSAGE_LIMITS[botName];
  return messagesSentTodayByBot[botName] < botLimit;
}

// Modify the checkDailyLimit function to use the bot-specific count
function checkDailyLimit(botName) {
  /*const today = new Date().toDateString();
    if (lastMessageDate !== today) {
        // Reset counts for all bots if the day has changed
        for (const bot in messagesSentTodayByBot) {
            messagesSentTodayByBot[bot] = 0;
        }
        lastMessageDate = today;
    }
    // Initialize count if not present
    if (!messagesSentTodayByBot[botName]) {
        messagesSentTodayByBot[botName] = 0;
    }*/
  return checkBotLimit(botName, messagesSentTodayByBot[botName]);
}

/**
 * Notifica al administrador cuando quedan pocos mensajes por enviar.
 * @param {number} mensajesRestantes - Mensajes que faltan por enviar.
 * @param {number} umbral - Umbral para notificar (por defecto 5).
 * @param {object} provider - Proveedor de mensajes.
 * @param {object} reporte - Objeto de reporte.
 */
async function notificarAdminSiCorresponde(mensajesRestantes, umbral, provider, reporte) {
  if (mensajesRestantes === umbral) {
    try {
      await sendReportToAdmins(provider, reporte);
      console.log(`Notificación enviada al administrador: quedan ${umbral} mensajes por enviar.`);
    } catch (error) {
      console.error("Error enviando notificación al administrador:", error);
    }
  }
}

function standardizePhoneNumber(phoneNumber) {
  if (phoneNumber === null || phoneNumber === undefined) {
    //console en español
    console.error("El número de teléfono es nulo o indefinido");
       
    return "";
  }

  // Convert to string if it's not already
  let phoneStr = String(phoneNumber);

  // Remove any non-numeric characters
  phoneStr = phoneStr.replace(/\D/g, "");

  // Remove country code prefix if present (e.g., +54, 54)
  /*if (phoneStr.startsWith("54") && phoneStr.length > 10) {    phoneStr = phoneStr.substring(2);  }*/

  // Ensure it's a valid phone number (at least 10 digits for Argentina)
  if (phoneStr.length < 10) {
    console.warn(
        //console en español
      `Número de teléfono potencialmente inválido: ${phoneStr} (original: ${phoneNumber})`
    );
  }

  return phoneStr;
}

function isBulkMessageActive(botName) {
  return activeBulkMessages.get(botName) || false;
}

// Add this function to format messages
async function formatWhatsAppMessage(message) {
  const classifier = new OllamaFunnelClassifier({
    model: "llama3.2:latest",
  });
  const promptTemplate = `
      Formatea el siguiente mensaje para WhatsApp:
      - Ofrece el producto de manera atractiva y concisa
      - Agrega emojis relevantes
      - Usa negritas (*texto*) para palabras clave
      - Agrega saltos de línea para mejor legibilidad
      - Mantén un tono amigable y profesional
      
      Mensaje original:
      {text}
      
      Mensaje formateado:
    `;

  const formattedMessage = await classifier.processCustomPrompt(
    promptTemplate,
    message
  );
  return formattedMessage.text.trim();
}

function countMessagesSentToday(sheet) {
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  const today = new Date().toISOString().split("T")[0];
  let count = 0;

  for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
    const enviarCell = XLSX.utils.encode_cell({ r: rowNum, c: 2 });
    const cellValue = sheet[enviarCell] ? sheet[enviarCell].v : undefined;

    if (cellValue === today) {
      count++;
    }
  }

  return count;
}

// Check if current time is within allowed sending hours
function isWithinSendingHours() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Don't send on Sundays or Saturdays after 12:00 PM
  if (day === 0 || (day === 6 && hour >= 20)) {
    const waitTime = calculateWaitTime(day, hour, minute);
    return { canSend: false, waitTime };
  }

  // Don't send between 7:00 PM and 9:00 AM
  if (hour >= 20 || hour < 8) {
    const waitTime = calculateWaitTime(hour, minute);
    return { canSend: false, waitTime };
  }

  return { canSend: true, waitTime: 0 };
}

// Calculate wait time until next sending window
function calculateWaitTime(day, hour, minute) {
  let waitTime = 0;

  if (day === 0 || (day === 6 && hour >= 12)) {
    // If it's Sunday or Saturday after noon
    const daysUntilMonday = day === 0 ? 1 : 2;
    waitTime = (daysUntilMonday * 24 * 60 + (9 - hour) * 60 - minute) * 60000;
  } else if (hour >= 19 || hour < 9) {
    // If it's outside of 9 AM to 7 PM
    if (hour >= 19) {
      waitTime = ((24 - hour + 9) * 60 - minute) * 60000;
    } else {
      waitTime = ((9 - hour) * 60 - minute) * 60000;
    }
  }

  return waitTime;
}

// Update the sendMessage function to increment bot-specific count
async function sendMessage(
  provider,
  ctx,
  message,
  imageUrl,
  audioUrl,
  imageFile
) {
  let messageId = null
  if (message) {
    const messageInfo = await provider.sendText(`${ctx.from}@c.us`, message);
    //en español
    messageId = messageInfo.key.id;  

    
    console.log(`Mensaje de texto enviado a ${ctx.from}@c.us: ${message}`);
    //console.log(`Text message sent to ${ctx.from}@c.us: ${message}`);
  }

  if (imageFile) {
    // Check if the file exists
    if (fs.existsSync(imageFile)) {
      const messageInfo = await provider.sendImage(`${ctx.from}@s.whatsapp.net`, imageFile, "");
      messageId = messageInfo.key.id;  
      console.log(
        `Image file sent to ${ctx.from}@s.whatsapp.net: ${imageFile}`
      );
    } else {
      console.error(`Image file not found: ${imageFile}`);
    }
  } else if (imageUrl) {
    const messageInfo = await provider.sendImage(`${ctx.from}@s.whatsapp.net`, imageUrl, "");
    messageId = messageInfo.key.id;  
    // en español
    console.log(`Imagen enviada a ${ctx.from}@s.whatsapp.net: ${imageUrl}`);
    //console.log(`Image sent to ${ctx.from}@s.whatsapp.net: ${imageUrl}`);
  }

  if (audioUrl) {
    const messageInfo = await provider.sendAudio(`${ctx.from}@s.whatsapp.net`, audioUrl);
    messageId = messageInfo.key.id;  
    console.log(`Audio sent to ${ctx.from}@s.whatsapp.net: ${audioUrl}`);
  }

  // Increment message count for the specific bot
  if (provider.globalVendorArgs.name) {
    messagesSentTodayByBot[provider.globalVendorArgs.name]++;
    console.log(
      `Message sent to ${
        provider.globalVendorArgs.name
      }. Total messages sent today: ${
        messagesSentTodayByBot[provider.globalVendorArgs.name]
      }`
    );
  }
  return messageId; // Return the messageId
}

// Update Excel file after sending a message
function updateExcelFile(workbook, sheet, rowNum, excelFilePath) {
  const now = new Date();
  const formattedDate = now.toISOString().split("T")[0];
  const enviarCell = XLSX.utils.encode_cell({ r: rowNum, c: 2 });
  sheet[enviarCell] = { t: "s", v: formattedDate };
  XLSX.writeFile(workbook, excelFilePath);
}

/**
 * Safely reads a cell’s `.v` value or returns a default.
 */
function getCellValue(sheet, row, col, defaultVal = "") {
  const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = sheet[cellRef];
  return cell ? cell.v : defaultVal;
}

function extractRowData(sheet, rowNum) {
  return {
    telefono: getCellValue(sheet, rowNum, 0, ""), // column A
    mensaje: getCellValue(sheet, rowNum, 4, ""), // column E
    enviar: getCellValue(sheet, rowNum, 2, ""), // column C
    imageUrl: getCellValue(sheet, rowNum, 12, null), // column M
    audioUrl: getCellValue(sheet, rowNum, 13, null), // column N
    imageFile: getCellValue(sheet, rowNum, 14, null), // column O
  };
}

function createMessageContext(rowData, botName) {
  const messageData = new MessageData();
  messageData.from = rowData.telefono;
  messageData.body = rowData.mensaje;
  messageData.role = "BulkMessage";
  messageData.pushName = rowData.nombre || "Assistant";
  messageData.botName = botName;

  // Set the current date and time
  const now = new Date();
  now.setHours(now.getHours() - 3);
  messageData.date = now.toISOString().split("T")[0];
  messageData.time = now.toISOString().split("T")[1].split(".")[0];

  // Set media properties if available
  if (rowData.imageFile) {
    messageData.mediaType = "image";
    messageData.mediaPath = rowData.imageFile;
  } else if (rowData.imageUrl) {
    messageData.mediaType = "image";
    messageData.mediaUrl = rowData.imageUrl;
  } else if (rowData.audioUrl) {
    messageData.mediaType = "audio";
    messageData.mediaUrl = rowData.audioUrl;
  }

  return messageData;
}

async function sendReportToAdmins(provider, reporte) {
  const adminNumbers = getAdmin();
  const reportMessage = `Reporte de envío:\nPor enviar: ${reporte.porEnviar.join(
    ", "
  )}\nEnviados: ${reporte.enviados.join(", ")}`;

  for (const adminNumber of adminNumbers) {
    await provider.sendText(`${adminNumber}@c.us`, reportMessage);
  }
}

async function initializeBulkSending(excelFilePath, provider) {
  const botName = provider.globalVendorArgs.name;

  if (activeBulkMessages.get(botName)) {
    console.log(`Bulk messages already running for ${botName}`);
    return false;
  }

console.log(`Iniciando el proceso de envío masivo desde ${excelFilePath}`);
//console.log(`Starting bulk message sending process from ${excelFilePath}`);
  activeBulkMessages.set(botName, true);
  return true;
}

async function loadWorkbookData(excelFilePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`Excel file not found: ${excelFilePath}`);
    }

    const workbook = XLSX.readFile(excelFilePath);

    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error(
        `Invalid Excel file or no sheets found in: ${excelFilePath}`
      );
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet || !sheet["!ref"]) {
      throw new Error(`Sheet is empty or invalid in: ${excelFilePath}`);
    }

    const range = XLSX.utils.decode_range(sheet["!ref"]);
    const messagesSentToday = countMessagesSentToday(sheet);

    return { workbook, sheet, range };
  } catch (error) {
    console.error(`Error loading workbook data from ${excelFilePath}:`, error);
    throw error;
  }
}

async function processMessageRow(rowData, provider, messageData) {
  //si es el BotAdministracionSalta no formatear para whatsapp
  if (!(messageData.botName === "BotAdministracionSalta")) {
    const formattedMessage = rowData.mensaje;
    //await formatWhatsAppMessage(rowData.mensaje);
    messageData.chatHistory = getMessageHistory(provider, messageData);
    const n8nWebhook = new N8nWebhookListener(
      "http://localhost:5678/webhook/formattedN8nSendBulkMessages"
    );
    const webHookRespuesta = await n8nWebhook.sendWebhook(messageData);
    console.log(webHookRespuesta);
    rowData.mensaje = formattedMessage;
  }

  //await getOrCreateThread(messageData);
  //await addContextAssistant(messageData);
  await sendMessage(
    provider,
    messageData,
    rowData.mensaje,
    rowData.imageUrl,
    rowData.audioUrl,
    rowData.imageFile
  );
  logMessage(messageData);
}

async function handleMessageDelay(rowNum) {
  console.log("Waiting 10 seconds before next message...");
  await delay(10000);

  if ((rowNum + 1) % 10 === 0) {
    console.log("Taking an additional 5-minute break...");
    await delay(300000);
  }
}

async function sendBulkMessages(botName, provider) {
  // Get the botConfigManager instance
  const botConfigManager = getBotConfigManager();

  // Use the getExcelFilePath method instead of the undefined getBotFilePath
  const excelFilePath = botConfigManager.getExcelFilePath(botName);
  const dailyMessageLimit = botConfigManager.getDailyMessageLimit(botName);

  // Inicializa el conteo de mensajes enviados hoy para el bot específico
  const stats = getDailyBulkMessageStats(botName);
  messagesSentTodayByBot[botName] = stats.messageCount || 0;

  if (!(await initializeBulkSending(excelFilePath, provider))) {
    return;
  }

  try {
    const { workbook, sheet, range } = await loadWorkbookData(excelFilePath);
    const blockedUsers = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "mensajes", "blocked_users.json"),
        "utf8"
      )
    );
    let reporte = { porEnviar: [], enviados: [] };

    for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      const rowData = extractRowData(sheet, rowNum);
      rowData.telefono = standardizePhoneNumber(rowData.telefono);
      const userConfig = getUserConfig(rowData.telefono);

      if (rowData.enviar === "true" && userConfig.notificationEnabled) {
        if (!(messagesSentTodayByBot[botName] < dailyMessageLimit)) {
          console.log(
            `Daily limit of ${dailyMessageLimit} messages reached for ${botName}. Stopping for today.`
          );
          // await sendReportToAdmins(provider, reporte); // Send the report
          break;
        }

        const { canSend, waitTime } = isWithinSendingHours();
        if (!canSend) {
          console.log(
            `Outside of sending hours. Waiting for ${waitTime / 60000} minutes.`
          );
          await delay(waitTime);
          continue;
        }

        reporte.porEnviar.push(rowData.telefono);
        //en español    
        console.log(`Enviando mensaje a ${rowData.telefono}`);
        //console.log(`Attempting to send message to ${rowData.telefono}`);
 
         // Modularizado: notificar al admin si corresponde
        const mensajesRestantes = (range.e.r - rowNum);
        await notificarAdminSiCorresponde(mensajesRestantes, 2, provider, reporte);


        try {
          const messageData = createMessageContext(
            rowData,
            provider.globalVendorArgs.name
          );
          await processMessageRow(rowData, provider, messageData);

          reporte.enviados.push(rowData.telefono);
          updateExcelFile(workbook, sheet, rowNum, excelFilePath);
          await handleMessageDelay(rowNum);
        } catch (error) {
          console.error(`Error sending message to ${rowData.telefono}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error in bulk message process for ${botName}:`, error);
  } finally {
    activeBulkMessages.set(botName, false);
    console.log(`Bulk message process completed for ${botName}`);
  }
}

module.exports = sendBulkMessages;
