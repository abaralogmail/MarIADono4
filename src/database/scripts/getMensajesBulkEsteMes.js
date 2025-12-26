import DatabaseQueries from '../DatabaseQueries.js';

async function getMensajesBulkEsteMes() {
  try {
    const mensajesEsteMes = await DatabaseQueries.mensajesBulkEnviadosEsteMes();
    // Normalize structure for downstream usage
    const results = mensajesEsteMes.map((m) => ({
      id: m.id,
      messageId: m.messageid ?? null,
      status: m.status ?? null,
      timestamp: (m.date && m.time) ? `${m.date}T${m.time}` : null,
      from: m.from,
      to: m.to,
      body: m.body ?? null
    }));
    return results;
  } catch (error) {
    console.error("❌ Error obteniendo mensajes_bulkEsteMes:", error);
    throw error;
  }
}

export default { getMensajesBulkEsteMes };