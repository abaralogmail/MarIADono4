const ExcelReader = require("./excelReader");
const ExcelUpdater = require("./excelUpdater");
const MessageFormatter = require("./messageFormatter");
const MessageSender = require("./messageSender");
const ReportSender = require("./reportSender");
const MessageData = require("../../src/utils/MessageData");
const {
  getInstance: getBotConfigManager,
} = require("../../src/config/botConfigManager");
const { getUserConfig } = require("../../src/config/userConfig"); // Assuming userConfig exists
const {
  getDailyBulkMessageStats,
  updateDailyBulkMessageStats,
} = require("../../src/utils/getBulkMessageStats"); // Assuming stats tracking exists
const { logMessage } = require("../utils/messageLogger"); // Adjust the path as needed
const getMessageHistory = require("../utils/chatHistoryAggregator");
const N8nWebhookListener = require("../Logica/N8nWebhookListener");
//const { getOrCreateThread, addContextAssistant } = require('../Assistant'); // Assuming Assistant functions are needed
const HorarioManagerService = require("../services/HorarioManagerService");

const TIPO_HORARIO_AUTO = 1; // Asume que el ID 1 corresponde al tipo 'Auto'
const TIPO_HORARIO_BULK = 2; // Asume que el ID 2 corresponde al tipo 'bulk'
const horarioService = new HorarioManagerService();



// Map to track active bulk message processes per bot
const activeBulkMessages = new Map();
// Map to track messages sent today per bot
const messagesSentTodayByBot = {};

class BulkMessageManager {
  constructor(provider) {
    this.provider = provider;
    this.botName = provider.globalVendorArgs.name;
    this.configManager = getBotConfigManager();
    this.config = this.configManager.getBotConfig(this.botName);
    const horarioService = new HorarioManagerService();


    if (!this.config.excelFilePath) {
      console.error(
        `Bulk message Excel file path not configured for bot: ${this.botName}`
      );
      throw new Error(
        `Excel file path not configured for bot: ${this.botName}`
      );
    }

    this.excelReader = new ExcelReader(this.config.excelFilePath);
    this.messageFormatter = new MessageFormatter(this.botName);
    this.messageSender = new MessageSender(this.provider);
    this.reportSender = new ReportSender(this.provider);

    // Initialize messages sent today count for this bot
    const stats = getDailyBulkMessageStats(this.botName);
    messagesSentTodayByBot[this.botName] = stats.messageCount || 0;

    this.report = {
      attempted: [], // Numbers we attempted to send to
      sent: [], // Numbers successfully sent
      failed: [], // Numbers that failed to send
    };
  }

  isBulkMessageActive() {
    return activeBulkMessages.get(this.botName) || false;
  }

  async startSending() {
    if (!this.config.bulkMessagesEnabled) {
      console.log(`Bulk messages are disabled for ${this.botName} in config.`);
      return;
    }

    if (this.isBulkMessageActive()) {
      console.log(`Bulk messages already running for ${this.botName}.`);
      return;
    }

    console.log(
      `Starting bulk message sending process for ${this.botName} from ${this.config.excelFilePath}`
    );
    activeBulkMessages.set(this.botName, true);

    try {
      if (!this.excelReader.loadWorkbook()) {
        console.error("Failed to load Excel workbook. Stopping bulk send.");
        return;
      }

      const excelUpdater = new ExcelUpdater(
        this.excelReader.getWorkbook(),
        this.excelReader.getSheet(),
        this.config.excelFilePath
      );

      for (const {
        rowNum,
        data: rowData,
      } of this.excelReader.getRowIterator()) {
        // Basic validation for required data
        if (!rowData || !rowData.telefono || !rowData.mensaje) {
          
          console.log(typeof rowData.telefono, rowData.telefono);
          
          continue;
        }

        // Check if already sent today
        const today = new Date().toISOString().split("T")[0];
        if (rowData.enviar === today) {
          //console.log(`Skipping ${rowData.telefono}: Already sent today.`);
          continue;
        }

        // Check if marked to send ('true')
        if (rowData.enviar !== "true") {
          //  console.log(`Skipping ${rowData.telefono}: Not marked as "true" to send.`);
          continue;
        }

        const userConfig = getUserConfig(rowData.telefono); // Assuming userConfig has notificationEnabled
        if (!userConfig.notificationEnabled) {
          //español
          console.log(
            `Omitiendo ${rowData.telefono}: Notificaciones de usuario deshabilitadas.`
          );

          continue;
        }

        // Check daily limit for this bot
        if (
          messagesSentTodayByBot[this.botName] >= this.config.dailyMessageLimit
        ) {
          //español
          console.log(
            `Límite diario de ${this.config.dailyMessageLimit} mensajes alcanzado para ${this.botName}. Deteniendo por hoy.`
          );

          break; // Stop the loop
        }

        // Check time and day restrictions
        //isBulktime
        const isBulkTime = await horarioService.verificarHorarioBot(TIPO_HORARIO_BULK, this.botName , new Date());
        console.log("isBulkTime: ", isBulkTime);


    //if (!isWithinRestrictedHours(botName, "bulk")) {
      if (!isBulkTime) {
     //   if (!this.configManager.isWithinWorkingHours(this.botName, "bulk")) {
          //español
          console.log(
            `Fuera de horario laboral configurado para ${this.botName}. Deteniendo por ahora.`
          );

          // Potentially calculate wait time and schedule a resume? For now, just stop.
          break;
        }

        this.report.attempted.push(rowData.telefono);
        //español
        console.log(`Enviando mensaje a ${rowData.telefono}`);

        try {
          const messageData = this.createMessageContext(rowData);
          const formattedMessage = await this.processMessageRow(messageData);
          messageData.body = formattedMessage;

            // Envía el mensaje usando el sender
          const { success, messageId } = await this.messageSender.enviarMensaje(messageData);

//messageid not null

           if (success && messageId != null) {
            messageData.messageId = messageId; // Set the messageId in messageData
            this.report.sent.push(rowData.telefono);
            excelUpdater.updateSentStatus(rowNum);
            messagesSentTodayByBot[this.botName]++;
            console.log(
              `Mensaje enviado a ${rowData.telefono}. Total enviados hoy para ${
                this.botName
              }: ${messagesSentTodayByBot[this.botName]}`
            );
            await logMessage(messageData);
          } else {
            this.report.failed.push(rowData.telefono);
            console.error(`Fallo al enviar mensaje a ${rowData.telefono}`);
          }
        } catch (error) {
          console.error(
            `Error al procesar el mensaje de ${rowData.telefono}:`,
            error
          );
          this.report.failed.push(rowData.telefono);
        } finally {
          // Handle delays between messages regardless of success or error
          await this.messageSender.handleDelay(rowNum);
        }
      } // End of loop
    } catch (error) {
      //español
      console.error(
        `Error durante el proceso de mensajes masivos para ${this.botName}:`,
        error
      );
    } finally {
      activeBulkMessages.set(this.botName, false);
      //español
      console.log(
        `Proceso de mensajes masivos para ${this.botName} completado.`
      );

      // Send report to admins
      // await this.reportSender.sendReportToAdmins(this.report);
    }
  }

    async processMessageRow(messageData) {
  try {
    // Fetch chat history
    messageData.chatHistory = await getMessageHistory(this.provider, messageData);

    const n8nWebhook = new N8nWebhookListener(
      "http://localhost:5678/webhook/formattedN8nSendBulkMessages"
    );

    const webHookRespuesta = await n8nWebhook.sendWebhook(messageData);

    // Decide which URL to use based on response
    if (webHookRespuesta[0].MediaUrl) {
      messageData.mediaUrl = webHookRespuesta[0].MediaUrl;
    }

    if (webHookRespuesta[0].MediaPath) {
      messageData.mediaPath = webHookRespuesta[0].MediaPath;
    }

    // Set formatted message and trim text
    const formattedMessage = webHookRespuesta[0].Respuesta || messageData.body;
    return formattedMessage.trim();

  } catch (error) {
    console.error(`Error processing message for ${messageData.from}:`, error);
    throw error;
  }
}

  createMessageContext(rowData) {
    const messageData = new MessageData();
    messageData.from = rowData.telefono;
    messageData.body = rowData.mensaje;
    messageData.role = "BulkMessage"; // Indicate this is a bulk message
    messageData.pushName = rowData.nombre || "Assistant"; // Use name from Excel if available
    messageData.botName = this.botName;

    // Set the current date and time
    const now = new Date();
    // Adjust for timezone if necessary, e.g., UTC-3
    // now.setHours(now.getHours() - 3);
    messageData.date = now.toISOString().split("T")[0];
    messageData.time = now.toISOString().split("T")[1].split(".")[0];

    // Set media properties if available
    if (rowData.imageFile) {
      messageData.mediaType = "image";
      messageData.mediaPath = rowData.imageFile; // Use mediaPath for local files
    } else if (rowData.imageUrl) {
      messageData.mediaType = "image";
      messageData.mediaUrl = rowData.imageUrl; // Use mediaUrl for URLs
    } else if (rowData.audioUrl) {
      messageData.mediaType = "audio";
      messageData.mediaUrl = rowData.audioUrl; // Use mediaUrl for URLs
    } else if (rowData.videoFile) {
      messageData.mediaType = "video";
      messageData.mediaPath = rowData.videoFile;
    } else if (rowData.videoUrl) {
      messageData.mediaType = "video";
      messageData.mediaUrl = rowData.videoUrl;
    }

    // Add other relevant data from rowData if needed
    // messageData.customField1 = rowData.customField1;

    return messageData;
  }
}

module.exports = BulkMessageManager;
