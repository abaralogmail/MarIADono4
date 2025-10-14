// src/database/DatabaseQueries.js
const SqliteManager = require("./SqliteManager");
const { QueryTypes } = require("sequelize");

class DatabaseQueries {
  static async mensajesBulkEnviadosHoy() {
    const sql = 'SELECT * FROM conversations_log WHERE id = 6366 or id = 6378 OR id = 17189 LIMIT 3';


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

module.exports = DatabaseQueries;
