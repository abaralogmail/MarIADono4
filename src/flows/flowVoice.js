import { handlerAI } from '../../mensajes/whisper.js';
import pkg from '@builderbot/bot';
const { addKeyword, EVENTS } = pkg;
import flowPrincipal from './flowPrincipal.js';
import { sendChunksWithDelay } from '../utils/sendChunksWithDelay.js';
import { getUserConfig, checkTranscriptionEnabled } from '../config/userConfig.js';


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


export default flowVoice;
