class Conversations_log_Queries {
  constructor(dbManager) {
    this.db = dbManager;
  }

  async guardarConversacion(datosMessage) {
    const sql = `
      INSERT INTO conversations_log 
      (date, time, "from", role, pushName, body, messageId, etapaEmbudo, interesCliente, botName) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const params = [
      new Date().toISOString().slice(0, 10),
      new Date().toTimeString().slice(0, 8),
      datosMessage.from || "",
      datosMessage.role || "",
      datosMessage.pushName || "",
      datosMessage.body || "",
      datosMessage.messageId || "",
      datosMessage.etapaEmbudo || "",
      datosMessage.interesCliente || "",
      datosMessage.botName || "",
    ];

    return this.db.query(sql, params);
  }

  async obtenerConversacionesPorFecha(fecha) {
    const sql = `SELECT * FROM conversations_log WHERE date = $1`;
    return this.db.query(sql, [fecha]);
  }

  async obtenerConversacionesPorUsuario(numeroTelefono) {
    const sql = `SELECT * FROM conversations_log WHERE "from" = $1 ORDER BY date DESC, time DESC`;
    return this.db.query(sql, [numeroTelefono]);
  }
}

export default Conversations_log_Queries;