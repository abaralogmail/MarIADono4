import SqliteManager from './SqliteManager.js';
import { QueryTypes } from 'sequelize';

class DatabaseQueries {
  static async mensajesBulkEnviadosHoy() {
    const today = new Date();
    const providerBotName= 'BotAugustoTucuman'

    const sql = 'SELECT * FROM conversations_log WHERE (id = 6366 OR id = 6378 OR id = 17189) AND botname= :providerBotName LIMIT 3';

    try {
      const sqliteDb = await SqliteManager.getInstance();
      const result = await sqliteDb.query(sql, {
        //replacements: [today],
        type: QueryTypes.SELECT,
      });
      return result;
    } catch (error) {
      console.error(
        "❌ Error querying mensajesBulkEnviadosHoy from the database:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene todos los registros de conversaciones masivas enviadas durante la última semana
   */
  static async mensajesBulkEnviadosEstaSemana() {
    const sqliteDb = await SqliteManager.getInstance();
    // Fecha hace 7 días
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const providerBotName = 'BotAugustoTucuman';
    const sql = `
      SELECT *
      FROM conversations_log
      WHERE botname = :providerBotName
        AND datetime(date || ' ' || time) >= datetime(:weekAgo)
    `;
    try {
      const result = await sqliteDb.query(sql, {
        replacements: { providerBotName, weekAgo: weekAgo.toISOString() },
        type: QueryTypes.SELECT,
      });
      return result;
    } catch (error) {
      console.error(
        "❌ Error querying mensajesBulkEnviadosEstaSemana from the database:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene mensajes bulk enviados durante este mes
   */
  static async mensajesBulkEnviadosEsteMes() {
    const sqliteDb = await SqliteManager.getInstance();
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = ahora.getMonth();
    const start = new Date(year, month, 1, 0, 0, 0);
    const end = new Date(year, month + 1, 1, 0, 0, 0);
    const providerBotName = 'BotAugustoTucuman';
    const sql = `
      SELECT *
      FROM conversations_log
      WHERE botname = :providerBotName
        AND datetime(date || ' ' || time) >= datetime(:start)
        AND datetime(date || ' ' || time) < datetime(:end)
    `;
    try {
      const result = await sqliteDb.query(sql, {
        replacements: { providerBotName, start: start.toISOString(), end: end.toISOString() },
        type: QueryTypes.SELECT,
      });
      return result;
    } catch (error) {
      console.error("❌ Error querying mensajesBulkEnviadosEsteMes from the database:", error);
      throw error;
    }
  }

  // Nuevo: guarda métricas de conversación usando Sequelize (ConversationMetricas)
  static async guardarMetricasConversacion(datos) {
    try {
      const sqliteDb = await SqliteManager.getInstance();
      // Mapeo directo al modelo ConversationMetricas
      const payload = {
        messageId: datos.messageId ?? null,
        respuesta: datos.respuesta ?? null,
        metricasCliente:
          datos.metricasCliente ?? datos.metricas_cliente ?? null,
        interesCliente: datos.interesCliente ?? null,
        estadoHabilitacionNotificacion:
          datos.estadoHabilitacionNotificacion ??
          (datos.estado_habilitacion_Notificacion == null
            ? null
            : Boolean(Number(datos.estado_habilitacion_Notificacion))),
        etapaEmbudo: datos.etapaEmbudo ?? null,
        consultaReformulada: datos.consultaReformulada ?? null,
        confianzaReformulada: datos.confianzaReformulada ?? null,
        asistenteInformacion:
          datos.asistenteInformacion ?? datos.asistente_informacion ?? null,
      };

      return await sqliteDb.saveMetricas(payload);
    } catch (error) {
      console.error("❌ Error guardando métricas de conversación:", error);
      throw error;
    }
  }
}
export default DatabaseQueries;
