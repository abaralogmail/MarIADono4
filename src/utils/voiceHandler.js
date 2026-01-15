import { handlerAI } from "../../mensajes/whisper.js";
import { checkTranscriptionEnabled } from '../config/userConfig.js';

/**
 * Handle voice message transcription
 * @param {Object} ctx - Message context
 * @param {Function} flowDynamic - Flow dynamic function
 * @returns {Object} - Transcription result
 */
const handleVoiceTranscription = async (ctx, flowDynamic) => {
    try {
        // Check if user has transcription enabled
        const hasTranscriptionEnabled = await checkTranscriptionEnabled(ctx.from);
        
        // Transcribe the voice message
        const transcriptionText = await handlerAI(ctx);
        console.log("Transcripción: ", transcriptionText);
        
        // Send transcription to user if enabled
        if (hasTranscriptionEnabled) {
            await flowDynamic([{ 
                body: `🎯 Transcripción de tu nota de voz:\n\n${transcriptionText}` 
            }]);
        }
        
        return {
            success: true,
            transcription: transcriptionText,
            transcriptionSent: hasTranscriptionEnabled
        };
        
    } catch (error) {
        console.error('Error handling voice transcription:', error);
        return {
            success: false,
            error: error.message,
            transcription: null,
            transcriptionSent: false
        };
    }
};

export { handleVoiceTranscription };
