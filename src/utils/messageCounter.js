let userMessageCounts = {};

async function handleUserMessageCount(userId, flowDynamic) {
    userMessageCounts[userId] = (userMessageCounts[userId] || 0) + 1;

    if (userMessageCounts[userId] % 6 === 0) {
       // await flowDynamic("Recuerda que puedes desactivar el asistente escribiendo 'operadora', 'op', 'desactivar', 'pausa' o 'pausar' 🚫. La operadora está disponible de lunes a sábado de 8.30 a 12.30 hs. Para reactivarlo, escribe 'asistente', 'chat', 'activar' o 'reanudar' 🟢.");
    }
}

module.exports = { handleUserMessageCount };
