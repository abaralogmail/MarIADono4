import pkg from '@builderbot/bot';
const { addKeyword } = pkg;
import sendBulkMessages from '../../mensajes/sendBulkMessages.js';
import { isAdmin } from '../utils/isAdmin.js';
import { sendChunksWithDelay } from '../utils/sendChunksWithDelay.js';
import flowPrincipal from './flowPrincipal.js';


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

export default flowEnviarDeudas;
