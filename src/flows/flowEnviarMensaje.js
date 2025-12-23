const { addKeyword } = require('@builderbot/bot');
const sendBulkMessages = require('../../mensajes/sendBulkMessages');
const { isAdmin } = require('../utils/isAdmin');
const { sendChunksWithDelay } = require('../utils/sendChunksWithDelay');
//const flowPrincipal = require('./flowPrincipal');
const { botFileMapping } = require('../utils/botFileMapping');


const flowEnviarMensaje = addKeyword(['enviar mensajes'])
    .addAction(async (ctx, { flowDynamic, provider, gotoFlow }) => {
     
     /*   if (ctx.body.toLowerCase() !== 'enviar mensajes') return gotoFlow(flowPrincipal);
        
        if (!isAdmin(ctx.from)) {
            const message = 'Lo siento, solo los administradores pueden usar esta función.';
            sendChunksWithDelay([message], 0, ctx, flowDynamic);
            return;
        }

        try {
            botName = provider.globalVendorArgs.name;
            const filePath = botFileMapping[botName];
            
            if (!filePath) {
                throw new Error(`No file mapping found for bot: ${botName}`);
            }

            await sendBulkMessages(filePath, provider);
            const successMessage = `Mensajes enviados con éxito`;
            sendChunksWithDelay([successMessage], 0, ctx, flowDynamic);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            const errorMessage = 'Hubo un error al enviar el mensaje';
            sendChunksWithDelay([errorMessage], 0, ctx, flowDynamic);
        }*/
    })

    module.exports = flowEnviarMensaje;

