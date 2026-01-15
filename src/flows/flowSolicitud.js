import pkg from '@builderbot/bot';
const { addKeyword, utils } = pkg;
import { logMessage } from '../utils/messageLogger.js';
import MessageData from '../utils/MessageData.js';

/**
 * Flow para manejar solicitudes externas
 * Este flujo es disparado por un evento 'SOLICITUD_EVENT'
 */
const flowSolicitud = addKeyword(utils.setEvent('SOLICITUD_EVENT'))
    .addAction(async (ctx, { flowDynamic, provider }) => {
        console.log(`[flowSolicitud] Procesando solicitud para: ${ctx.from}`);
        
        try {
            // Preparar los datos del mensaje para el log
            // ctx.message vendrá de la carga útil del bot.dispatch
            const body = ctx.message || 'Mensaje de solicitud externa';
            
            const messageData = new MessageData({
                from: ctx.from,
                body: body,
                role: 'external_request',
                pushName: 'External App',
                botName: provider.globalVendorArgs?.name || 'MarIADono',
                messageId: `ext_${Date.now()}`
            });

            // Guardar en la base de datos y archivos de log
            await logMessage(messageData);

            // Enviar el mensaje real a través de Meta
            await flowDynamic(body);

            console.log(`[flowSolicitud] Mensaje enviado y registrado para ${ctx.from}`);
        } catch (error) {
            console.error(`[flowSolicitud] Error procesando solicitud:`, error);
        }
    });

export default flowSolicitud;
