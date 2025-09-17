const { handlerAI } = require("../../mensajes/whisper.js")
const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const flowPrincipal = require('./flowPrincipal');
const { sendChunksWithDelay } = require('../utils/sendChunksWithDelay');
const { getUserConfig, checkTranscriptionEnabled } = require('../config/userConfig');


const flowVoice = addKeyword(EVENTS.VOICE_NOTE)
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
        // Check if user has transcription enabled
        /*  
         const hasTranscriptionEnabled = await checkTranscriptionEnabled(ctx.from);
           
           
               const text = await handlerAI(ctx)
               console.log("Transcripción: ", text)
           
               if (hasTranscriptionEnabled) {
               // Send transcription to user
               await flowDynamic([{ 
                   body: `🎯 Transcripción de tu nota de voz:\n\n${text}` 
               }]);
               
               // Update context with transcribed text
               ctx.body = text;
           }
           */
        // Continue to main flow
        return gotoFlow(flowPrincipal);
    });


module.exports = flowVoice;
