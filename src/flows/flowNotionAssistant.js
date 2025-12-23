const { addKeyword } = require('@builderbot/bot');
const sendBulkMessages = require('../utils/sendBulkMessages');
const { isAdmin, getAdmin } = require('../utils/isAdmin');
const { sendChunksWithDelay } = require('../utils/sendChunksWithDelay');
const { chatWithAssistant, getOrCreateThread } = require('../../mensajes/Assistant');
const { run, executeNotionAssistant, chatWithAnythingllm } = require('../../mensajes/logica');


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

module.exports = flowNotionAssistant;
