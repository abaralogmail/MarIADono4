import pkg from '@builderbot/bot';
const { addKeyword } = pkg;
import { isUserBlocked, saveBlockedUsers, blockUser, unblockUser } from '../utils/userBlockManager.js';
import { updateUserConfig } from '../config/userConfig.js';
import { sendChunksWithDelay } from '../utils/sendChunksWithDelay.js';
import flowPrincipal from './flowPrincipal.js';

const flowDesactivar = addKeyword(['operadora', 'op', 'desactivar', 'pausa', 'pausar', 'baja', 'Baja', 'BAJA'])
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
        const validKeywords = ['operadora', 'op', 'desactivar', 'pausa', 'pausar', 'baja', 'Baja', 'BAJA'];
        if (!validKeywords.includes(ctx.body.toLowerCase())) return gotoFlow(flowPrincipal);

        const userId = ctx.from;
       // await blockUser(userId);
        //await saveBlockedUsers();
        updateUserConfig(userId, { notificationEnabled: false });
        const textResponse = 'El asistente virtual ha sido desactivado 🚫 y no recibirás más notificaciones. Para reactivarlo, escribe "asistente", "chat", "activar" o "reanudar" 🟢.';
        await flowDynamic(textResponse);
        //en español
        console.log(`Usuario ${userId} ha desactivado el asistente virtual.`);
        
        messageCount = 0;
        return gotoFlow(flowPrincipal);
    })

const flowActivar = addKeyword(['chat', 'asistente', 'activar', 'reanudar'])
.addAction(async (ctx, { flowDynamic, gotoFlow }) => {
    const validKeywords = ['chat', 'asistente', 'activar', 'reanudar'];
    if (!validKeywords.includes(ctx.body.toLowerCase())) return gotoFlow(flowPrincipal);

    const userId = ctx.from;
//  await unblockUser(userId);
  //  await saveBlockedUsers();
    updateUserConfig(userId, { notificationEnabled: true });

    textResponse = "El asistente virtual ha sido reactivado 🟢 y volverás a recibir notificaciones. La operadora está disponible de lunes a sábado de 8.30 a 12.30 hs. Si necesitas desactivarlo, escribe 'operadora', 'op', 'desactivar', 'pausa' o 'pausar' 🚫.";
     await flowDynamic(textResponse);

   // sendChunksWithDelay([ctx.body], 0, ctx, flowDynamic);
    messageCount = 0;
    return gotoFlow(flowPrincipal);
})



export default {flowDesactivar,flowActivar};
