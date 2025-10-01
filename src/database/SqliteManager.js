const { Sequelize, DataTypes, Op } = require("sequelize");
const path = require("path");

// Import models
const ConversationsLogModel = require("./models/ConversationsLog");
const ConversationMetricasModel = require("./models/ConversationMetricas");
const MensajeEstadosModel = require("./models/MensajeEstados");
const CtxLogsModel = require("./models/CtxLogs");
const ProviderLogsModel = require("./models/ProviderLogs");
const OfertasModel = require("./models/Ofertas");
const PedidosModel = require("./models/Pedidos");
const ProductosModel = require("./models/Productos");
const UsuariosModel = require("./models/Usuarios");
const HorariosModel = require("./models/Horarios");
const ReglasHorarioModel = require("./models/ReglasHorario");
const ExcepcionesHorarioModel = require("./models/ExcepcionesHorario");

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

    // SQLite database path
    this.databasePath =
      process.env.SQLITE_DB_PATH ||
      path.join(process.cwd(), "../database/Data/MarIADono3DB.sqlite");
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

module.exports = SqliteManager;
