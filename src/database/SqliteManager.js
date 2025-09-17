const { Sequelize, DataTypes, Op } = require("sequelize");
const path = require("path");

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
    // Conversations Log Model
    this.models.ConversationsLog = this.sequelize.define(
      "ConversationsLog",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        time: {
          type: DataTypes.TIME,
          allowNull: true,
        },
        from: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        role: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        pushName: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: "pushname",
        },
        body: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        messageId: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: "messageid",
        },
        etapaEmbudo: {
          type: DataTypes.STRING(10),
          allowNull: true,
          field: "etapaembudo",
        },
        interesCliente: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: "interescliente",
        },
        botName: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: "botname",
        },
      },
      {
        tableName: "conversations_log",
        timestamps: false,
      }
    );

    // Conversation Metricas Model
    this.models.ConversationMetricas = this.sequelize.define(
      "ConversationMetricas",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        messageId: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: "messageid",
        },
        respuesta: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        metricasCliente: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "metricas_cliente",
        },
        interesCliente: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "interes_cliente",
        },
        estadoHabilitacionNotificacion: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          field: "estado_habilitacion_notificacion",
        },
        etapaEmbudo: {
          type: DataTypes.STRING(10),
          allowNull: true,
          field: "etapa_embudo",
        },
        consultaReformulada: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "consulta_reformulada",
        },
        confianzaReformulada: {
          type: DataTypes.STRING(10),
          allowNull: true,
          field: "confianza_reformulada",
        },
        asistenteInformacion: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "asistente_informacion",
        },
      },
      {
        tableName: "conversation_metricas",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
      }
    );

    // Mensaje Estados Model
    this.models.MensajeEstados = this.sequelize.define(
      "MensajeEstados",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        messageId: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: "messageid",
        },
        estado: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        timestamp: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: true,
        },
      },
      {
        tableName: "mensaje_estados",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
      }
    );

    // Context Logs Model
    this.models.CtxLogs = this.sequelize.define(
      "CtxLogs",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        phoneNumber: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: "phone_number",
        },
        contextData: {
          type: DataTypes.JSON,
          allowNull: true,
          field: "context_data",
        },
        timestamp: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        tableName: "ctx_logs",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
      }
    );

    // Provider Logs Model
    this.models.ProviderLogs = this.sequelize.define(
      "ProviderLogs",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        phoneNumber: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: "phone_number",
        },
        providerName: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: "provider_name",
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        data: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        timestamp: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        tableName: "provider_logs",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
      }
    );

    // Business Models
    this.models.Ofertas = this.sequelize.define(
      "Ofertas",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        codigo: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        descripcion: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        precio: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        fechaOferta: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: "fecha_oferta",
        },
      },
      {
        tableName: "ofertas",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
      }
    );

    this.models.Pedidos = this.sequelize.define(
      "Pedidos",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        numeroPedido: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: "numero_pedido",
        },
        clienteId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "cliente_id",
        },
        fechaPedido: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: "fecha_pedido",
        },
        total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        estado: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
      },
      {
        tableName: "pedidos",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
      }
    );

    this.models.Productos = this.sequelize.define(
      "Productos",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        codigo: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        nombre: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        descripcion: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        precio: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        stock: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        categoria: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
      },
      {
        tableName: "productos",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
      }
    );

    this.models.Usuarios = this.sequelize.define(
      "Usuarios",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        phoneNumber: {
          type: DataTypes.STRING(50),
          allowNull: true,
          unique: true,
          field: "phone_number",
        },
        nombre: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        fechaRegistro: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: "fecha_registro",
        },
        activo: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        tableName: "usuarios",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
      }
    );

    // Schedule Models (Sistema polimórfico de horarios)
    this.models.Horarios = this.sequelize.define(
      "Horarios",
      {
        horarioId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: "horario_id",
        },
        nombre: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        descripcion: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        botName: {
          // Cambiado de entidadId a botName
          type: DataTypes.STRING(50),
          allowNull: false,
          field: "bot_name",
        },
        tipoHorario_id: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: "tipo_horario_id",
        },
        zonaHoraria: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: "America/Argentina/Buenos_Aires",
          field: "zona_horaria",
        },
        activo: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        tableName: "horarios",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    this.models.ReglasHorario = this.sequelize.define(
      "ReglasHorario",
      {
        reglaId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: "regla_id",
        },
        horarioId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "horario_id",
        },
        diaSemana: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "dia_semana",
          validate: {
            min: 0,
            max: 6,
          },
        },
        horaInicio: {
          type: DataTypes.TIME,
          allowNull: false,
          field: "hora_inicio",
        },
        horaFin: {
          type: DataTypes.TIME,
          allowNull: false,
          field: "hora_fin",
        },
        activo: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        tableName: "reglas_horario",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    this.models.ExcepcionesHorario = this.sequelize.define(
      "ExcepcionesHorario",
      {
        excepcionId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: "excepcion_id",
        },
        horarioId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "horario_id",
        },
        fechaExcepcion: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: "fecha_excepcion",
        },
        estado: {
          type: DataTypes.ENUM("cerrado", "horario_personalizado"),
          allowNull: false,
          defaultValue: "cerrado",
        },
        horaInicio: {
          type: DataTypes.TIME,
          allowNull: true,
          field: "hora_inicio",
        },
        horaFin: {
          type: DataTypes.TIME,
          allowNull: true,
          field: "hora_fin",
        },
        descripcion: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        tableName: "excepciones_horario",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    // Define associations
    this.defineAssociations();
  }

  defineAssociations() {
    // Disable associations for now to avoid foreign key issues in SQLite
    // These can be enabled later with proper configuration

    // ConversationMetricas belongs to ConversationsLog
    // this.models.ConversationMetricas.belongsTo(this.models.ConversationsLog, {
    //   foreignKey: 'messageId',
    //   targetKey: 'messageId',
    //   as: 'conversation'
    // });

    // MensajeEstados belongs to ConversationsLog
    // this.models.MensajeEstados.belongsTo(this.models.ConversationsLog, {
    //   foreignKey: 'messageId',
    //   targetKey: 'messageId',
    //   as: 'conversation'
    // });

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
  } else {
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
}

module.exports = SqliteManager;
