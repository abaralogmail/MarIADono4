import pkg from '@builderbot/bot';
const { createBot, createProvider, createFlow, addKeyword, EVENTS } = pkg;
import { getUserConfig, updateUserConfig } from '../config/userConfig';
import { sendChunksWithDelay } from '../utils/sendChunksWithDelay';


const flowAsistente = addKeyword(['testNotificaciones'])
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
        const userId = ctx.from;
        const userConfig = getUserConfig(userId);
        const command = ctx.body.toLowerCase().trim();
        console.log("command:", command);
        switch (command) {
            case 'config':
            case 'configuracion':

            const configStatus = `🔧 *Configuración actual*
            - Asistente: ${userConfig.isBlocked ? '🔴 Desactivado' : '🟢 Activado'}
            - Transcripción: ${userConfig.transcriptionEnabled ? '✅ Activada' : '❌ Desactivada'}
            - Notificaciones: ${userConfig.notificationEnabled ? '🔔 Activadas' : '🔕 Desactivadas'}
            - Idioma: ${userConfig.language}
            
            *Comandos disponibles*
            • transcripcion on/off
            • notificaciones on/off
            • idioma es/en
            • asistente on/off`;
                return sendChunksWithDelay([configStatus], 0, ctx, flowDynamic);

            case 'transcripcion-on':
                updateUserConfig(userId, { transcriptionEnabled: true });
                return sendChunksWithDelay(['✅ Transcripción activada'], 0, ctx, flowDynamic);

            case 'transcripcion-off':
                updateUserConfig(userId, { transcriptionEnabled: false });
                return sendChunksWithDelay(['❌ Transcripción desactivada'], 0, ctx, flowDynamic);

            case 'notificaciones-on':
                updateUserConfig(userId, { notificationEnabled: true });
                return sendChunksWithDelay(['🔔 Notificaciones activadas'], 0, ctx, flowDynamic);

            case 'notificaciones-off':
                updateUserConfig(userId, { notificationEnabled: false });
                return sendChunksWithDelay(['🔕 Notificaciones desactivadas'], 0, ctx, flowDynamic);

            case 'chat':
            case 'asistente':
            case 'activar':
            case 'reanudar':
                updateUserConfig(userId, { isBlocked: false });
                return sendChunksWithDelay(['🟢 Asistente virtual activado'], 0, ctx, flowDynamic);
        }
    });

export default flowAsistente;
