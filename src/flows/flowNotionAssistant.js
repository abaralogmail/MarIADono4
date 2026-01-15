import pkg from '@builderbot/bot';
const { addKeyword } = pkg;
import sendBulkMessages from '../utils/sendBulkMessages';
import { isAdmin, getAdmin } from '../utils/isAdmin';
import { sendChunksWithDelay } from '../utils/sendChunksWithDelay';
import AssistantModule from '../../mensajes/Assistant.js';
const { chatWithAssistant, getOrCreateThread } = AssistantModule;
import { run, executeNotionAssistant, chatWithAnythingllm } from '../../mensajes/logica.js';


const flowNotionAssistant = addKeyword(['notion', 'database'])
    .addAction(async (ctx, { flowDynamic }) => {
        if (ctx.body.toLowerCase() !== 'notion') {
            try {
                
                const response = await executeNotionAssistant(ctx);
                await flowDynamic(response);
            } catch (error) {
                console.error('Error executing Notion Assistant:', error);
                await flowDynamic('There was an error processing your request with Notion Assistant.');
            }
        }
    });

export default flowNotionAssistant;
