const { addKeyword } = require('@bot-whatsapp/bot');
const sendBulkMessages = require('../../mensajes/sendBulkMessages');
const { isAdmin } = require('../utils/isAdmin');
const { sendChunksWithDelay } = require('../utils/sendChunksWithDelay');
const flowPrincipal = require('./flowPrincipal');


const flowEnviarDeudas = addKeyword(['enviar deudas'])
    .addAction(async (ctx, { flowDynamic, provider, gotoFlow }) => {
        if (ctx.body.toLowerCase() !== 'enviar deudas') return gotoFlow(flowPrincipal);
        
        if (!isAdmin(ctx.from)) {
            const message = 'Lo siento, solo los administradores pueden enviar mensajes de deudas.';
            sendChunksWithDelay([message], 0, ctx, flowDynamic);
            return;
        }

        try {
            await sendBulkMessages('./mensajes/Listas/Lista-BotAdministracionSalta.xlsx', provider);
            
            const successMessage = 'Mensajes de deudas enviados con éxito';
            sendChunksWithDelay([successMessage], 0, ctx, flowDynamic);
        } catch (error) {
            console.error('Error al enviar mensajes de deudas:', error);
            const errorMessage = 'Hubo un error al enviar los mensajes de deudas';
            sendChunksWithDelay([errorMessage], 0, ctx, flowDynamic);
        }
    });

module.exports = flowEnviarDeudas;
