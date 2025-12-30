import { Sequelize, DataTypes, Op } from "sequelize";
import path from "path";
import fs from "fs";

 // Import models
 import ConversationsLogModel from "./models/ConversationsLog.js";
 import ConversationMetricasModel from "./models/ConversationMetricas.js";
 import MensajeEstadosModel from "./models/MensajeEstados.js";
 import CtxLogsModel from "./models/CtxLogs.js";
 import ProviderLogsModel from "./models/ProviderLogs.js";
 import OfertasModel from "./models/Ofertas.js";
 import PedidosModel from "./models/Pedidos.js";
 import ProductosModel from "./models/Productos.js";
 import UsuariosModel from "./models/Usuarios.js";
 import HorariosModel from "./models/Horarios.js";
 import ReglasHorarioModel from "./models/ReglasHorario.js";
 import ExcepcionesHorarioModel from "./models/ExcepcionesHorario.js";
 import N8nMetricModel from "./models/N8nMetric.js";
 import ClientFileModel from "./models/ClientFile.js";
 
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
    this.sequelize = null;
    this.models = {};
    this.isInitialized = false;

    // SQLite database path: prefer env, otherwise resolve within src/database/(data|Data)
    if (process.env.SQLITE_DB_PATH) {
      this.databasePath = process.env.SQLITE_DB_PATH;
    } else {
      const candidates = [
        path.join(process.cwd(), "src", "database", "data", "MarIADono3DB.sqlite"),
        path.join(process.cwd(), "src", "database", "Data", "MarIADono3DB.sqlite"),
        path.join(process.cwd(), "Data", "MarIADono3DB.sqlite"),
      ];
      this.databasePath = candidates.find((p) => {
        try {
          return fs.existsSync(p);
        } catch (_) {
          return false;
        }
      }) || candidates[0];
    }
  }

  async initialize() {
    try {
      console.log("🔄 Initializing SQLite connection with Sequelize...");

      // Create Sequelize instance for SQLite
      this.sequelize = new Sequelize({
        dialect: "sqlite",
        storage: this.databasePath,
        logging: process.env.NODE_ENV === "development" ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        dialectOptions: {
          // Enable foreign key support in SQLite
          foreignKeys: true,
        },
      });

      // Test connection
      await this.testConnection();

      // Define models
      await this.defineModels();

      // Sync all defined models to the DB.
      console.log("🔄 Syncing models with the database...");
      // Using a non-destructive sync. This will only create tables that do not exist.
      // For schema changes, it is recommended to use migrations.
      const syncOptions = {};
      await this.sequelize.sync(syncOptions);
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

  async defineModels() {
    this.models.ConversationsLog = ConversationsLogModel(this.sequelize, DataTypes);
    this.models.ConversationMetricas = ConversationMetricasModel(this.sequelize, DataTypes);
    this.models.N8nMetric = N8nMetricModel(this.sequelize, DataTypes);
    this.models.MensajeEstados = MensajeEstadosModel(this.sequelize, DataTypes);
    this.models.CtxLogs = CtxLogsModel(this.sequelize, DataTypes);
    this.models.ProviderLogs = ProviderLogsModel(this.sequelize, DataTypes);
    this.models.Ofertas = OfertasModel(this.sequelize, DataTypes);
    this.models.Pedidos = PedidosModel(this.sequelize, DataTypes);
    this.models.Productos = ProductosModel(this.sequelize, DataTypes);
    this.models.Usuarios = UsuariosModel(this.sequelize, DataTypes);
    this.models.Horarios = HorariosModel(this.sequelize, DataTypes);
    this.models.ReglasHorario = ReglasHorarioModel(this.sequelize, DataTypes);
    this.models.ExcepcionesHorario = ExcepcionesHorarioModel(this.sequelize, DataTypes);
    this.models.ClientFile = ClientFileModel(this.sequelize, DataTypes);
 
    // Define associations
    this.defineAssociations();
  }

  defineAssociations() {
    // Disable associations for now to avoid foreign key issues in SQLite
    // These can be enabled later with proper configuration

    // Schedule associations
    this.models.Horarios.hasMany(this.models.ReglasHorario, {
      foreignKey: "horario_id",
      as: "reglas",
      onDelete: "CASCADE", // Eliminar reglas cuando se elimina el horario
      hooks: true, // Asegura que los hooks de Sequelize se disparen
    });

    this.models.Horarios.hasMany(this.models.ExcepcionesHorario, {
      foreignKey: "horario_id",
      as: "excepciones",
      onDelete: "CASCADE", // Eliminar excepciones cuando se elimina el horario
      hooks: true,
    });

    this.models.ReglasHorario.belongsTo(this.models.Horarios, {
      foreignKey: "horario_id",
      as: "horario", // No se necesita onDelete aquí
    });

    this.models.ExcepcionesHorario.belongsTo(this.models.Horarios, {
      foreignKey: "horario_id",
      as: "horario",
    });
  }

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

      console.log(
        "✅ Conversacion guardada correctamente en SQLite conversations_log"
      );
    } catch (error) {
      console.error(
        "❌ Error saving conversation in conversations_log:",
        error
      );
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.sequelize.authenticate();
      console.log("✅ SQLite connection test successful");
      return { now: new Date() };
    } catch (error) {
      console.error(
        "❌ SQLite connection test failed:",
        error.message || error
      );
      throw error;
    }
  }

  async query(sql, options = {}) {
    if (!this.isInitialized) {
      throw new Error("SQLite not initialized");
    }

    try {
      const [results, metadata] = await this.sequelize.query(sql, {
        type: Sequelize.QueryTypes.SELECT,
        ...options,
      });
      return results;
    } catch (error) {
      console.error("❌ Query error:", error);
      throw error;
    }
  }

  // Utility methods for common operations
  async findConversationsByPhone(phoneNumber) {
    return await this.models.ConversationsLog.findAll({
      where: { from: phoneNumber },
      order: [
        ["date", "DESC"],
        ["time", "DESC"],
      ],
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
 
  //
  // Client file storage methods (Task 25)
  //
  async saveClientFile(clienteId, { originalFilename = null, mimeType = null, buffer, subPath = 'documents', uploadedBy = null } = {}) {
    if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('buffer missing or not a Buffer');
    const id = Number(clienteId);
    if (!Number.isFinite(id) || id <= 0) throw new Error('invalid clienteId');

    // Ensure client dirs exist
    await storageManager.createClientStorageDirs(id);

    const clientBase = storageManager.getClientStoragePath(id);
    const destDir = path.join(clientBase, subPath || 'documents');

    // Safe filename
    const sanitizedOriginal = (originalFilename || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2,10)}_${sanitizedOriginal}`;
    const absPath = path.join(destDir, filename);

    // Save buffer to disk
    const { path: savedPath, size, checksum } = await storageManager.saveBufferToPath(absPath, buffer);

    // Persist metadata in DB via model
    const relativePath = path.relative(storageManager.getStorageRoot(), savedPath);
    const instance = await this.models.ClientFile.create({
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

    return instance;
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

    const limit = Number(filters.limit) || 100;
    const offset = Number(filters.offset) || 0;

    return await this.models.ClientFile.findAll({
      where,
      order: [['uploaded_at', 'DESC']],
      limit,
      offset,
    });
  }

  async archiveConversation(clienteId, { fromDate = null, toDate = null, format = 'json' } = {}) {
    const id = Number(clienteId);
    if (!Number.isFinite(id) || id <= 0) throw new Error('invalid clienteId');

    // Prepare date range
    const start = fromDate || '1970-01-01';
    const end = toDate || new Date().toISOString().slice(0,10);

    // Attempt to read conversations_log entries for date range
    let rows = [];
    try {
      const sql = 'SELECT * FROM conversations_log WHERE date BETWEEN ? AND ?';
      rows = await this.sequelize.query(sql, { replacements: [start, end], type: Sequelize.QueryTypes.SELECT });
    } catch (e) {
      // If table not present or error, rethrow
      throw e;
    }

    // Ensure dirs
    await storageManager.createClientStorageDirs(id);
    const archivesDir = path.join(storageManager.getClientStoragePath(id), 'archives');
    const filename = `conversations_${start}_to_${end}_${Date.now()}.${format === 'json' ? 'json' : 'txt'}`;
    const absPath = path.join(archivesDir, filename);
    const payloadBuffer = Buffer.from(format === 'json' ? JSON.stringify(rows, null, 2) : rows.map(r => JSON.stringify(r)).join('\n'), 'utf8');

    const { path: savedPath, size, checksum } = await storageManager.saveBufferToPath(absPath, payloadBuffer);

    // Try to insert record into client_conversation_archive (if table exists)
    try {
      await this.sequelize.query(
        'INSERT INTO client_conversation_archive (cliente_id, archive_path, checksum_sha256, file_size, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        { replacements: [id, path.relative(storageManager.getStorageRoot(), savedPath), checksum, size], type: Sequelize.QueryTypes.INSERT }
      );
    } catch (e) {
      // Table may not exist yet; ignore silently
    }

    return { path: savedPath, size, checksum, exportedCount: Array.isArray(rows) ? rows.length : 0 };
  }

  // Métodos para el sistema de horarios polimórfico
  async crearHorario(horarioData) {
    return await this.models.Horarios.create(horarioData);
  }

  async crearReglaHorario(reglaData) {
    return await this.models.ReglasHorario.create(reglaData);
  }

  async crearExcepcionHorario(excepcionData) {
    return await this.models.ExcepcionesHorario.create(excepcionData);
  }

  async obtenerHorarioCompleto(tipo_horario_id, botName) { // Cambiado de entidadId a botName
  const tipoHorarioIdStr = String(tipo_horario_id); // Asegurar que sea string
  return await this.models.Horarios.findOne({
    where: {
      tipo_horario_id: tipoHorarioIdStr, // Usar el valor como string
      botName: botName,
      activo: 1
    },
    include: [
      {
        model: this.models.ReglasHorario,
        as: 'reglas',
        where: { activo: 1 },
        required: false
      },
      {
        model: this.models.ExcepcionesHorario,
        as: 'excepciones',
        required: false
      }
    ]
  });
}

  async verificarDisponibilidad(tipo_horario_id, botName, fechaHora = new Date()) {
  console.debug(`[verificarDisponibilidad] 🕵️  Checking for: tipo_horario_id=${tipo_horario_id} botName="${botName}" at ${fechaHora}`);

  const horario = await this.obtenerHorarioCompleto(tipo_horario_id, botName);
  if (!horario) {
    console.debug(`[verificarDisponibilidad] ❌ No active schedule found for tipo_horario_id=${tipo_horario_id} botName="${botName}". Returning false.`);
    return false;
  }
  console.debug(`[verificarDisponibilidad] ✅ Found schedule: "${horario.nombre}" (ID: ${horario.horarioId})`);

  const fecha = new Date(fechaHora);
  const diaSemana = fecha.getDay();
  const hora = fecha.toTimeString().slice(0, 8);
  const fechaString = fecha.toISOString().slice(0, 10);
  console.debug(`[verificarDisponibilidad] 🕒 Current check time: Day=${diaSemana}, Time=${hora}, Date=${fechaString}`);

  // Verificar excepciones primero
  const excepcion = horario.excepciones?.find(e => 
    e.fechaExcepcion === fechaString
  );

 if (excepcion) {
    console.debug(`[verificarDisponibilidad] ❗ Exception found for today (ID: ${excepcion.excepcionId}):`, excepcion.toJSON());
    if (excepcion.estado === 'cerrado') {
      console.debug(`[verificarDisponibilidad] ❗ Exception (ID: ${excepcion.excepcionId}) state is 'cerrado'. Returning false.`);
      return false;
    }
    if (excepcion.estado === 'horario_personalizado') {
      const isAvailable = hora >= excepcion.horaInicio && hora <= excepcion.horaFin;      
      console.debug(`[verificarDisponibilidad] ❗ Custom schedule exception (ID: ${excepcion.excepcionId}) from ${excepcion.horaInicio} to ${excepcion.horaFin}. Current time ${hora} is ${isAvailable ? 'AVAILABLE' : 'NOT AVAILABLE'}. Returning ${isAvailable}.`);
      return isAvailable;
    }
  }

  // Verificar reglas normales
  const reglasDia = horario.reglas?.filter(r => r.diaSemana === diaSemana);
  if (!reglasDia || reglasDia.length === 0) {
    console.debug(`[verificarDisponibilidad]  नियम No rules found for day of week ${diaSemana} in schedule ID ${horario.horarioId}. Returning false.`);
    return false;
  }

  const reglaCoincidente = reglasDia.find(regla => hora >= regla.horaInicio && hora <= regla.horaFin);

  if (reglaCoincidente) {
    console.debug(`[verificarDisponibilidad]  नियम Rule match found (ID: ${reglaCoincidente.reglaId}) from ${reglaCoincidente.horaInicio} to ${reglaCoincidente.horaFin}. Current time ${hora} is AVAILABLE. Returning true.`);
    return true;
  }
  else {
    console.debug(`[verificarDisponibilidad]  नियम No matching rule for current time ${hora}. Day rules are: ${reglasDia.map(r => `(ID: ${r.reglaId}) ${r.horaInicio}-${r.horaFin}`).join(', ')}. Returning false.`);
    return false;
  }
}

  async cleanup() {
    if (this.sequelize) {
      await this.sequelize.close();
      this.sequelize = null;
    }
    this.models = {};
    this.isInitialized = false;
  }

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

      console.log(
        "✅ Conversacion guardada correctamente en SQLite conversations_log"
      );
    } catch (error) {
      console.error(
        "❌ Error saving conversation in conversations_log:",
        error
      );
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.sequelize.authenticate();
      console.log("✅ SQLite connection test successful");
      return { now: new Date() };
    } catch (error) {
      console.error(
        "❌ SQLite connection test failed:",
        error.message || error
      );
      throw error;
    }
  }

  async query(sql, options = {}) {
    if (!this.isInitialized) {
      throw new Error("SQLite not initialized");
    }

    try {
      const results = await this.sequelize.query(sql, {
        type: Sequelize.QueryTypes.SELECT,
        ...options,
      });
      return results;
    } catch (error) {
      console.error("❌ Query error:", error);
      throw error;
    }
  }

  // Utility methods for common operations
  async findConversationsByPhone(phoneNumber) {
    return await this.models.ConversationsLog.findAll({
      where: { from: phoneNumber },
      order: [
        ["date", "DESC"],
        ["time", "DESC"],
      ],
    });
  }

  async saveMetricas(metricasData) {
    return await this.models.ConversationMetricas.create(metricasData);
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

  // Métodos para el sistema de horarios polimórfico
  async crearHorario(horarioData) {
    return await this.models.Horarios.create(horarioData);
  }

  async crearReglaHorario(reglaData) {
    return await this.models.ReglasHorario.create(reglaData);
  }

  async crearExcepcionHorario(excepcionData) {
    return await this.models.ExcepcionesHorario.create(excepcionData);
  }

  async obtenerHorarioCompleto(tipo_horario_id, botName) { // Cambiado de entidadId a botName
  const tipoHorarioIdStr = String(tipo_horario_id); // Asegurar que sea string
  return await this.models.Horarios.findOne({
    where: {
      tipo_horario_id: tipoHorarioIdStr, // Usar el valor como string
      botName: botName,
      activo: 1
    },
    include: [
      {
        model: this.models.ReglasHorario,
        as: 'reglas',
        where: { activo: 1 },
        required: false
      },
      {
        model: this.models.ExcepcionesHorario,
        as: 'excepciones',
        required: false
      }
    ]
  });
}

  async verificarDisponibilidad(tipo_horario_id, botName, fechaHora = new Date()) {
  //console.debug(`[verificarDisponibilidad] 🕵️  Checking for: tipo_horario_id=${tipo_horario_id} botName="${botName}" at ${fechaHora}`);

  const horario = await this.obtenerHorarioCompleto(tipo_horario_id, botName);
  if (!horario) {
    //console.debug(`[verificarDisponibilidad] ❌ No active schedule found for tipo_horario_id=${tipo_horario_id} botName="${botName}". Returning false.`);
    return false;
  }
  //console.debug(`[verificarDisponibilidad] ✅ Found schedule: "${horario.nombre}" (ID: ${horario.horarioId})`);

  const fecha = new Date(fechaHora);
  const diaSemana = fecha.getDay();
  const hora = fecha.toTimeString().slice(0, 8);
  const fechaString = fecha.toISOString().slice(0, 10);
  //console.debug(`[verificarDisponibilidad] 🕒 Current check time: Day=${diaSemana}, Time=${hora}, Date=${fechaString}`);

  // Verificar excepciones primero
  const excepcion = horario.excepciones?.find(e => 
    e.fechaExcepcion === fechaString
  );

 if (excepcion) {
    console.debug(`[verificarDisponibilidad] ❗ Exception found for today (ID: ${excepcion.excepcionId}):`, excepcion.toJSON());
    if (excepcion.estado === 'cerrado') {
      console.debug(`[verificarDisponibilidad] ❗ Exception (ID: ${excepcion.excepcionId}) state is 'cerrado'. Returning false.`);
      return false;
    }
    if (excepcion.estado === 'horario_personalizado') {
      const isAvailable = hora >= excepcion.horaInicio && hora <= excepcion.horaFin;      
      console.debug(`[verificarDisponibilidad] ❗ Custom schedule exception (ID: ${excepcion.excepcionId}) from ${excepcion.horaInicio} to ${excepcion.horaFin}. Current time ${hora} is ${isAvailable ? 'AVAILABLE' : 'NOT AVAILABLE'}. Returning ${isAvailable}.`);
      return isAvailable;
    }
  }

  // Verificar reglas normales
  const reglasDia = horario.reglas?.filter(r => r.diaSemana === diaSemana);
  if (!reglasDia || reglasDia.length === 0) {
    //console.debug(`[verificarDisponibilidad]  नियम No rules found for day of week ${diaSemana} in schedule ID ${horario.horarioId}. Returning false.`);
    return false;
  }

  const reglaCoincidente = reglasDia.find(regla => hora >= regla.horaInicio && hora <= regla.horaFin);

  if (reglaCoincidente) {
    //console.debug(`[verificarDisponibilidad]  नियम Rule match found (ID: ${reglaCoincidente.reglaId}) from ${reglaCoincidente.horaInicio} to ${reglaCoincidente.horaFin}. Current time ${hora} is AVAILABLE. Returning true.`);
    return true;
  } else {
    //console.debug(`[verificarDisponibilidad]  नियम No matching rule for current time ${hora}. Day rules are: ${reglasDia.map(r => `(ID: ${r.reglaId}) ${r.horaInicio}-${r.horaFin}`).join(', ')}. Returning false.`);
    return false;
  }
}

  async cleanup() {
    if (this.sequelize) {
      await this.sequelize.close();
      this.sequelize = null;
    }
    this.models = {};
    this.isInitialized = false;
  }
}

export default SqliteManager;
