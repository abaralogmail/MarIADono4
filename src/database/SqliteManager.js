import { Op, Sequelize } from "sequelize";
import sequelize from "./sequelize.js";
import dbModels from "./models/index.js";
import path from "path";

// Auxiliares
import storageManager from "../auxiliares/storageManager.js";

class SqliteManager {
  static instance = null;
  static initPromise = null;

  static async getInstance() {
    if (!SqliteManager.instance) {
      if (!SqliteManager.initPromise) {
        SqliteManager.initPromise = SqliteManager.createInstance();
      }
      SqliteManager.instance = await SqliteManager.initPromise;
    }
    return SqliteManager.instance;
  }

  static async createInstance() {
    const manager = new SqliteManager();
    await manager.initialize();
    return manager;
  }

  constructor() {
    this.sequelize = sequelize;
    this.models = dbModels;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log("🔄 Initializing SQLite database...");

      // Test connection
      await this.testConnection();

      // Sync all defined models to the DB.
      console.log("🔄 Syncing models with the database...");
      // Using a non-destructive sync.
      await this.sequelize.sync();
      console.log("✅ Models synced successfully.");

      this.isInitialized = true;
      console.log("✅ SQLite initialized successfully with Sequelize");
    } catch (error) {
      console.error("❌ Failed to initialize SQLite:", error.message || error);
      this.isInitialized = false;
      await this.cleanup();
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.sequelize.authenticate();
      console.log("✅ SQLite connection test successful");
      return { now: new Date() };
    } catch (error) {
      console.error("❌ SQLite connection test failed:", error.message || error);
      throw error;
    }
  }

  async query(sql, options = {}) {
    if (!this.isInitialized) {
      throw new Error("SQLite not initialized");
    }

    try {
      const results = await this.sequelize.query(sql, {
        type: options.type || Sequelize.QueryTypes.SELECT,
        ...options,
      });
      return results;
    } catch (error) {
      console.error("❌ Query error:", error);
      throw error;
    }
  }

  // Utility methods for common operations
  async saveConversation(messageData) {
    try {
      await this.models.ConversationsLog.create({
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toTimeString().slice(0, 8),
        from: messageData.from || "",
        role: messageData.role || "",
        pushName: messageData.pushName || "",
        body: messageData.body || "",
        messageId: messageData.messageId || "",
        etapaEmbudo: messageData.etapaEmbudo || "",
        interesCliente: messageData.interesCliente || "",
        botName: messageData.botName || "",
      });
      console.log("✅ Conversacion guardada correctamente en SQLite");
    } catch (error) {
      console.error("❌ Error saving conversation:", error);
      throw error;
    }
  }

  async findConversationsByPhone(phoneNumber) {
    return await this.models.ConversationsLog.findAll({
      where: { from: phoneNumber },
      order: [["date", "DESC"], ["time", "DESC"]],
    });
  }

  async saveMetricas(metricasData) {
    return await this.models.ConversationMetricas.create(metricasData);
  }

  async saveN8nMetric(metricData) {
    return await this.models.N8nMetric.create(metricData);
  }

  async saveEstadoMensaje(estadoData) {
    return await this.models.MensajeEstados.create(estadoData);
  }

  async saveContextLog(contextData) {
    return await this.models.CtxLogs.create(contextData);
  }

  async saveProviderLog(providerData) {
    return await this.models.ProviderLogs.create(providerData);
  }

  async saveClientFile(clienteId, { originalFilename = null, mimeType = null, buffer, subPath = 'documents', uploadedBy = null } = {}) {
    if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('buffer missing or not a Buffer');
    const id = Number(clienteId);
    if (!Number.isFinite(id) || id <= 0) throw new Error('invalid clienteId');

    await storageManager.createClientStorageDirs(id);
    const clientBase = storageManager.getClientStoragePath(id);
    const destDir = path.join(clientBase, subPath || 'documents');

    const sanitizedOriginal = (originalFilename || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2,10)}_${sanitizedOriginal}`;
    const absPath = path.join(destDir, filename);

    const { path: savedPath, size, checksum } = await storageManager.saveBufferToPath(absPath, buffer);

    const relativePath = path.relative(storageManager.getStorageRoot(), savedPath);
    return await this.models.ClientFile.create({
      cliente_id: id,
      file_path: relativePath,
      original_filename: originalFilename || filename,
      mime_type: mimeType || 'application/octet-stream',
      checksum_sha256: checksum,
      file_size: size,
      uploaded_by: uploadedBy || null,
      uploaded_at: new Date(),
      accessed_count: 0,
      is_deleted: false
    });
  }

  async getClientFiles(clienteId, filters = {}) {
    const id = Number(clienteId);
    if (!Number.isFinite(id) || id <= 0) throw new Error('invalid clienteId');

    const where = { cliente_id: id, is_deleted: false };
    if (filters.mime_type) where.mime_type = filters.mime_type;
    if (filters.after || filters.before) {
      where.uploaded_at = {};
      if (filters.after) where.uploaded_at[Op.gte] = filters.after;
      if (filters.before) where.uploaded_at[Op.lte] = filters.before;
    }

    return await this.models.ClientFile.findAll({
      where,
      order: [['uploaded_at', 'DESC']],
      limit: Number(filters.limit) || 100,
      offset: Number(filters.offset) || 0,
    });
  }

  async archiveConversation(clienteId, { fromDate = null, toDate = null, format = 'json' } = {}) {
    const id = Number(clienteId);
    if (!Number.isFinite(id) || id <= 0) throw new Error('invalid clienteId');

    const start = fromDate || '1970-01-01';
    const end = toDate || new Date().toISOString().slice(0,10);

    const sql = 'SELECT * FROM conversations_log WHERE date BETWEEN :start AND :end';
    const rows = await this.sequelize.query(sql, { 
      replacements: { start, end }, 
      type: Sequelize.QueryTypes.SELECT 
    });

    await storageManager.createClientStorageDirs(id);
    const archivesDir = path.join(storageManager.getClientStoragePath(id), 'archives');
    const filename = `conversations_${start}_to_${end}_${Date.now()}.${format === 'json' ? 'json' : 'txt'}`;
    const absPath = path.join(archivesDir, filename);
    const payloadBuffer = Buffer.from(format === 'json' ? JSON.stringify(rows, null, 2) : rows.map(r => JSON.stringify(r)).join('\n'), 'utf8');

    const { path: savedPath, size, checksum } = await storageManager.saveBufferToPath(absPath, payloadBuffer);

    try {
      await this.sequelize.query(
        'INSERT INTO client_conversation_archive (cliente_id, archive_path, checksum_sha256, file_size, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        { replacements: [id, path.relative(storageManager.getStorageRoot(), savedPath), checksum, size], type: Sequelize.QueryTypes.INSERT }
      );
    } catch (e) { /* ignore */ }

    return { path: savedPath, size, checksum, exportedCount: rows.length };
  }

  // Schedule methods
  async crearHorario(horarioData) { return await this.models.Horarios.create(horarioData); }
  async crearReglaHorario(reglaData) { return await this.models.ReglasHorario.create(reglaData); }
  async crearExcepcionHorario(excepcionData) { return await this.models.ExcepcionesHorario.create(excepcionData); }

  async obtenerHorarioCompleto(tipo_horario_id, botName) {
    return await this.models.Horarios.findOne({
      where: { tipo_horario_id: String(tipo_horario_id), botName, activo: 1 },
      include: [
        { model: this.models.ReglasHorario, as: 'reglas', where: { activo: 1 }, required: false },
        { model: this.models.ExcepcionesHorario, as: 'excepciones', required: false }
      ]
    });
  }

  async verificarDisponibilidad(tipo_horario_id, botName, fechaHora = new Date()) {
    const horario = await this.obtenerHorarioCompleto(tipo_horario_id, botName);
    if (!horario) return false;

    const fecha = new Date(fechaHora);
    const diaSemana = fecha.getDay();
    const hora = fecha.toTimeString().slice(0, 8);
    const fechaString = fecha.toISOString().slice(0, 10);

    const excepcion = horario.excepciones?.find(e => e.fechaExcepcion === fechaString);
    if (excepcion) {
      if (excepcion.estado === 'cerrado') return false;
      if (excepcion.estado === 'horario_personalizado') return hora >= excepcion.horaInicio && hora <= excepcion.horaFin;
    }

    const reglasDia = horario.reglas?.filter(r => r.diaSemana === diaSemana);
    if (!reglasDia || reglasDia.length === 0) return false;

    return reglasDia.some(regla => hora >= regla.horaInicio && hora <= regla.horaFin);
  }

  async cleanup() {
    if (this.sequelize) {
      await this.sequelize.close();
      this.sequelize = null;
    }
    this.isInitialized = false;
  }
}

export default SqliteManager;
