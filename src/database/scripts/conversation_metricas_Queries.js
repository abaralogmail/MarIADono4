class Conversation_Metricas_Queries {
  constructor(dbManager) {
    this.db = dbManager;
  }

  async guardarMetricas(datosMetricas) {
    // Si el dbManager expone saveMetricas (como SqliteManager con Sequelize), usarlo
    if (typeof this.db.saveMetricas === "function") {
      const payload = {
        messageId: datosMetricas.messageId ?? null,
        respuesta: datosMetricas.respuesta ?? null,
        metricasCliente: datosMetricas.metricasCliente ?? null,
        interesCliente: datosMetricas.interesCliente ?? null,
        estadoHabilitacionNotificacion:
          datosMetricas.estadoHabilitacionNotificacion ?? null,
        etapaEmbudo: datosMetricas.etapaEmbudo ?? null,
        consultaReformulada: datosMetricas.consultaReformulada ?? null,
        confianzaReformulada: datosMetricas.confianzaReformulada ?? null,
        asistenteInformacion: datosMetricas.asistenteInformacion ?? null,
      };
      return this.db.saveMetricas(payload);
    }

    // Fallback: SQL crudo (placeholders estilo SQLite)
    const sql = `
      INSERT INTO conversation_metricas 
      (messageid, respuesta, metricas_cliente, interes_cliente, 
       estado_habilitacion_notificacion, etapa_embudo, consulta_reformulada, 
       confianza_reformulada, asistente_informacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      datosMetricas.messageId ?? null,
      datosMetricas.respuesta ?? null,
      datosMetricas.metricasCliente ?? null,
      datosMetricas.interesCliente ?? null,
      datosMetricas.estadoHabilitacionNotificacion ?? null,
      datosMetricas.etapaEmbudo ?? null,
      datosMetricas.consultaReformulada ?? null,
      datosMetricas.confianzaReformulada ?? null,
      datosMetricas.asistenteInformacion ?? null,
    ];

    // Nota: según la implementación de db.query se puede necesitar pasar { replacements }
    return this.db.query(sql, { replacements: params });
  }

  async obtenerMetricasPorMessageId(messageId) {
    const sql = `SELECT * FROM conversation_metricas WHERE messageid = ?`;
    return this.db.query(sql, { replacements: [messageId] });
  }
}

module.exports = Conversation_Metricas_Queries;