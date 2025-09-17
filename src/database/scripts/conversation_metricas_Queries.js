class Conversation_Metricas_Queries {
  constructor(dbManager) {
    this.db = dbManager;
  }

  async guardarMetricas(datosMetricas) {
    const sql = `
      INSERT INTO conversation_metricas 
      (messageid, respuesta, metricas_cliente, interes_cliente, 
       estado_habilitacion_notificacion, etapa_embudo, consulta_reformulada, 
       confianza_reformulada, asistente_informacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const params = [
      datosMetricas.messageId,
      datosMetricas.respuesta,
      datosMetricas.metricasCliente,
      datosMetricas.interesCliente,
      datosMetricas.estadoHabilitacionNotificacion,
      datosMetricas.etapaEmbudo,
      datosMetricas.consultaReformulada,
      datosMetricas.confianzaReformulada,
      datosMetricas.asistenteInformacion
    ];

    return this.db.query(sql, params);
  }

  async obtenerMetricasPorMessageId(messageId) {
    const sql = `SELECT * FROM conversation_metricas WHERE messageid = $1`;
    return this.db.query(sql, [messageId]);
  }
}

module.exports = Conversation_Metricas_Queries;