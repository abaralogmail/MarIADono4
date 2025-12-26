import pkg from '@builderbot/bot';
const { addKeyword, EVENTS } = pkg;
//import { classifyCustomer } from '../../mensajes/services/customerClassification';
import { logMessage } from '../utils/messageLogger.js';
import { isWithinRestrictedHours } from '../utils/timeRestrictions.js';
import { handleUserMessageCount } from '../utils/messageCounter.js';
import { processMessage } from '../utils/messageProcessor.js';
import { isUserBlocked } from '../utils/userBlockManager.js';
import MessageData from '../utils/MessageData.js';
import { getBotFilePath } from '../utils/botFileMapping.js';
import n8nClassifier from '../Logica/n8nClassifier.js';
import loadChatHistory from '../utils/getHistoryFromProvider.js';
import aggregateChatHistory from '../utils/chatHistoryAggregator.js';
import { logCtx } from '../utils/ctxLog.js';
import { logProvider, saveLastProvider, logMessageProvider } from '../utils/providerLog.js';
import { getInstance as getBotConfigManager } from '../config/botConfigManager.js';
const classifierN8n = new n8nClassifier();
const botConfigManager = getBotConfigManager(); // Get instance
import { isMediaMessage, isVoiceMessage, hasMediaOrVoice, getMediaInfo } from '../utils/mediaChecker.js';
import { voiceMediaManager } from '../utils/voiceMediaManager.js';
import BulkMessageManager from '../bulk/bulkMessageManager.js';
import HorarioManagerService from '../services/HorarioManagerService.js';

const TIPO_HORARIO_AUTO = 1; // Asume que el ID 1 corresponde al tipo 'Auto'
const TIPO_HORARIO_BULK = 2; // Asume que el ID 2 corresponde al tipo 'bulk'



const flowPrincipal = addKeyword(EVENTS.WELCOME).addAction(
  async (ctx, { flowDynamic, provider }) => {
    const userId = ctx.from;
    const botName = provider.globalVendorArgs.name; // Get bot name
    const botConfig = botConfigManager.getBotConfig(botName); // Get bot config
    const messageData = await MessageData.fromCtx(ctx);
    const horarioService = new HorarioManagerService();
    messageData.botName = botName;

    // Check media type and add to messageData
    const mediaInfo = getMediaInfo(ctx);
    messageData.mediaInfo = mediaInfo;

    // Log media information
    if (mediaInfo.hasAnyMedia) {
      //console.log(`Message from ${userId} contains media:`, {mediaType: mediaInfo.mediaType, isVoice: mediaInfo.isVoice,isAudio: mediaInfo.isAudio,hasMedia: mediaInfo.hasMedia});

      // Process voice or media message
      try {
        const processingResult = await voiceMediaManager.processMessage(
          ctx,
          flowDynamic
        );

        //console.log('Voice/Media processing result:', {success: processingResult.success,messageType: processingResult.messageType,transcriptionSent: processingResult.transcriptionSent,descriptionSent: processingResult.descriptionSent});

        // Use the body property directly from the processing result
        if (processingResult.success && processingResult.body) {
          messageData.body = processingResult.body;

          // Store media information in messageData for further processing
          if (processingResult.filePath) {
            messageData._mediaFilePath = processingResult.filePath;
          }
          if (processingResult.buffer) {
            messageData._mediaBuffer = processingResult.buffer;
          }
          if (processingResult.messageType) {
            messageData._mediaType = processingResult.messageType;
          }
        }
      } catch (error) {
        console.error("Error processing voice/media:", error);
        messageData.processingError = error.message;
      }
    }

    await logMessage(messageData);
    logCtx(ctx);
    saveLastProvider(provider);

    // Aggregate chat history for context
    messageData.chatHistory = await aggregateChatHistory(provider, messageData);

    // Check if bulk messages are enabled and within restricted hours for bulk
    // Note: The original code had a specific check for certain bot names.
    // This is replaced by the config-driven check.
    const isBulkTime = await horarioService.verificarHorarioBot(TIPO_HORARIO_BULK, botName , new Date());
    console.log("isBulkTime: ", isBulkTime);


    //if (!isWithinRestrictedHours(botName, "bulk")) {
      if (isBulkTime) {
      // Get the file path using the new function
      const filePath = getBotFilePath(botName);
      if (filePath) {
        // Use Promise.resolve().then() to avoid blocking the main flow
        // This starts the bulk sending process in the background
        Promise.resolve()
          .then(() => {
          //sendBulkMessages(botName, provider); // Pass botName and provider
          const bulkManager = new BulkMessageManager(provider);
          bulkManager.startSending(); // Iniciar envío
            
            
          })
          .catch(console.error);
      } else {
        console.warn(
          `Bulk message file path not configured for bot: ${botName}. Cannot send bulk messages.`
        );
      }
    }

    // Handle user message count and check for blocking
    await handleUserMessageCount(userId, flowDynamic);

    // Check if user is blocked
    if (!(await isUserBlocked(userId))) {
     
      // Usamos el nuevo servicio de horarios para las respuestas automáticas
      
      const isAutoTime = await horarioService.verificarHorarioBot(TIPO_HORARIO_AUTO, botName , new Date());
      console.log("isAutoTime: ", isAutoTime);

      if(!isAutoTime){
      

      // Process the incoming message using the message processor
      
      //Cambiar aqui
      await processMessage(messageData, provider);
      

      console.log("Processing message for user:", userId);
      
      } else {
        /*console.log(
      
          `Auto-respuestas deshabilitadas o fuera del horario laboral para ${botName}. Saltando el procesamiento del mensaje para el usuario ${userId}.`
        );*/
        // Optionally, send a message indicating the bot is offline or busy
        // await flowDynamic('Actualmente no estoy disponible para responder. Por favor, inténtalo más tarde.');
      }
    } else {
      console.log(`User ${userId} is blocked. Skipping message processing.`);
    }
  }
);

export default flowPrincipal;
