const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

class BotConfigManager {
  constructor() {
    this.configPath = path.join(
      __dirname,
      "../../mensajes/Listas/BotConfig.xlsx"
    );
    this.configs = {};
    this.loadConfigs();
  }

  loadConfigs() {
    try {
      if (!fs.existsSync(this.configPath)) {
        console.error(
          `Archivo de configuración no encontrado: ${this.configPath}`
        );
        this.createDefaultConfig();
        return;
      }

      const workbook = XLSX.readFile(this.configPath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const configData = XLSX.utils.sheet_to_json(sheet);

      // Reiniciar configuraciones
      this.configs = {};

      // Procesar cada fila en la hoja de configuración
      configData.forEach((row) => {
        const botName = row.botName;
        if (!botName) return;

        // Parsear días laborales de cadena separada por comas a un array
        const workingDays = row.workingDays
          ? row.workingDays.split(",").map((day) => parseInt(day.trim()))
          : [1, 2, 3, 4, 5]; // Por defecto: Lunes a Viernes

        // Parsear feriados de cadena separada por comas a un array de objetos Date
        // In the loadConfigs method, modify the holidays parsing code
        const holidays = row.holidays
          ? typeof row.holidays === "string"
            ? row.holidays.split(",").map((date) => date.trim())
            : Array.isArray(row.holidays)
            ? row.holidays
            : []
          : [];

        this.configs[botName] = {
          description: row.description || "",
          bulkMessagesEnabled:
            row.bulkMessagesEnabled === "true" ||
            row.bulkMessagesEnabled === true,
          autoResponseEnabled:
            row.autoResponseEnabled === "true" ||
            row.autoResponseEnabled === true,
          dailyMessageLimit: parseInt(row.dailyMessageLimit) || 100,
          workingDays,
          holidays,
          // Nuevos horarios según el día

          bulkMessageStartTime: row.bulkMessageStartTime || "09:00",
          bulkMessageEndTime: row.bulkMessageEndTime || "19:00",
          bulkMessageStartTimeSaturday:
            row.bulkMessageStartTimeSaturday || "10:00",
          bulkMessageEndTimeSaturday: row.bulkMessageEndTimeSaturday || "14:00",
          bulkMessageStartTimeSunday: row.bulkMessageStartTimeSunday || "10:00",
          bulkMessageEndTimeSunday: row.bulkMessageEndTimeSunday || "10:01",
          bulkMessagesEnabledSaturday: (row.bulkMessagesEnabledSaturday = true),
          bulkMessagesEnabledSunday:
            row.bulkMessagesEnabledSunday === "false" ||
            row.bulkMessagesEnabledSunday === false,
          autoResponseEndTime: row.autoResponseEndTime || "00:00",
          autoResponseStartTime: row.autoResponseStartTime || "23:59",
          autoResponseStartTimeSaturday:
            row.autoResponseStartTimeSaturday || "13:00",
          autoResponseEndTimeSaturday:
            row.autoResponseEndTimeSaturday || "23:59",
          autoResponseStartTimeSunday:
            row.autoResponseStartTimeSunday || "00:01",
          autoResponseEndTimeSunday: row.autoResponseEndTimeSunday || "23:59",
          autoResponseEnabledSaturday: true,
          autoResponseEnabledSunday: true,
          excelFilePath: row.excelFilePath || "",
          webhookUrl: row.webhookUrl || "",
          logLevel: row.logLevel || "info",
          customPrompt: row.customPrompt || "",
        };
      });

      console.log(
        `Configuraciones cargadas para ${Object.keys(this.configs).length} bots`
      );
    } catch (error) {
      console.error("Error al cargar las configuraciones de los bots:", error);
    }
  }

  createDefaultConfig() {
    try {
      // Crear directorio si no existe
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Configuración por defecto para los bots existentes
      const defaultConfigs = [
        {
          botName: "bot",
          description: "Cursos Salta Bot",
          bulkMessagesEnabled: "true",
          autoResponseEnabled: "true",
          dailyMessageLimit: "200",
          workingDays: "1,2,3,4,5",
          bulkMessageStartTime: "09:00",
          bulkMessageEndTime: "19:00",
          autoResponseStartTime: "00:00",
          autoResponseEndTime: "23:59",
          holidays: "",
          excelFilePath: "./mensajes/Listas/Lista-bot-CursosSalta.xlsx",
          webhookUrl: "",
          logLevel: "info",
          customPrompt: "",
        },
        /*  {
                      botName: 'BotOfertasTucuman',
                      description: 'Ofertas Tucuman Bot',
                      bulkMessagesEnabled: 'true',
                      autoResponseEnabled: 'true',
                      dailyMessageLimit: '100',
                      workingDays: '1,2,3,4,5',
                      bulkMessageStartTime: '09:00',
                      bulkMessageEndTime: '19:00',
                      autoResponseStartTime: '00:00',
                      autoResponseEndTime: '23:59',
                      holidays: '',
                      excelFilePath: './mensajes/Listas/Lista-BotOfertasTucuman.xlsx',
                      webhookUrl: '',
                      logLevel: 'info',
                      customPrompt: ''
                  },*/
        {
          botName: "BotAdministracionSalta",
          description: "Administracion Salta Bot",
          bulkMessagesEnabled: "true",
          autoResponseEnabled: "true",
          dailyMessageLimit: "20",
          workingDays: "1,2,3,4,5",
          bulkMessageStartTime: "09:00",
          bulkMessageEndTime: "19:00",
          autoResponseStartTime: "00:00",
          autoResponseEndTime: "23:59",
          holidays: "",
          excelFilePath: "./mensajes/Listas/Lista-BotAdministracionSalta.xlsx",
          webhookUrl: "",
          logLevel: "info",
          customPrompt: "",
        },
        {
          botName: "BotConsultasWeb",
          description: "Consultas Web Bot",
          bulkMessagesEnabled: "true",
          autoResponseEnabled: "true",
          dailyMessageLimit: "100",
          workingDays: "1,2,3,4,5",
          bulkMessageStartTime: "09:00",
          bulkMessageEndTime: "19:00",
          autoResponseStartTime: "00:00",
          autoResponseEndTime: "23:59",
          holidays: "",
          excelFilePath: "./mensajes/Listas/Lista-BotConsultasWeb.xlsx",
          webhookUrl: "",
          logLevel: "info",
          customPrompt: "",
        },
      ];

      // Crear libro y hoja de trabajo
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(defaultConfigs);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Configuraciones");

      // Escribir en archivo
      XLSX.writeFile(workbook, this.configPath);
      console.log(
        `Archivo de configuración por defecto creado en ${this.configPath}`
      );

      // Cargar las configuraciones recién creadas
      this.loadConfigs();
    } catch (error) {
      console.error(
        "Error al crear el archivo de configuración por defecto:",
        error
      );
    }
  }

  getBotConfig(botName) {
    if (!this.configs[botName]) {
      console.warn(
        `Configuración no encontrada para el bot: ${botName}. Usando valores por defecto.`
      );
      return {
        // ... existing default values ...
        bulkMessageStartTimeWeekdays: "09:00",
        bulkMessageEndTimeWeekdays: "19:00",
        bulkMessageStartTimeSaturday: "10:00",
        bulkMessageEndTimeSaturday: "14:00",
        bulkMessageStartTimeSunday: "10:00",
        bulkMessageEndTimeSunday: "10:01",
        bulkMessagesEnabledSaturday: true,
        bulkMessagesEnabledSunday: false,
        autoResponseStartTimeWeekdays: "00:01",
        autoResponseEndTimeWeekdays: "23:59",
        autoResponseStartTimeSaturday: "10:00",
        autoResponseEndTimeSaturday: "14:00",
        autoResponseStartTimeSunday: "00:00",
        autoResponseEndTimeSunday: "23:59",
        autoResponseEnabledSaturday: true,
        autoResponseEnabledSunday: true,
        // ... other default values ...
      };
    }
    return this.configs[botName];
  }

  updateBotConfig(botName, newConfig) {
    try {
      // Cargar libro actual
      const workbook = XLSX.readFile(this.configPath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const configData = XLSX.utils.sheet_to_json(sheet);

      // Encontrar la configuración del bot
      const botIndex = configData.findIndex((row) => row.botName === botName);

      // Preparar la configuración actualizada
      const updatedConfig = {
        botName,
        description: newConfig.description || "",
        bulkMessagesEnabled: newConfig.bulkMessagesEnabled.toString(),
        autoResponseEnabled: newConfig.autoResponseEnabled.toString(),
        dailyMessageLimit: newConfig.dailyMessageLimit.toString(),
        workingDays: newConfig.workingDays.join(","),
        bulkMessageStartTime: newConfig.bulkMessageStartTime,
        bulkMessageEndTime: newConfig.bulkMessageEndTime,
        autoResponseStartTime: newConfig.autoResponseStartTime,
        autoResponseEndTime: newConfig.autoResponseEndTime,
        holidays: newConfig.holidays.join(","),
        excelFilePath: newConfig.excelFilePath,
        webhookUrl: newConfig.webhookUrl,
        logLevel: newConfig.logLevel,
        customPrompt: newConfig.customPrompt,
      };

      // Actualizar o agregar la configuración
      if (botIndex >= 0) {
        configData[botIndex] = updatedConfig;
      } else {
        configData.push(updatedConfig);
      }

      // Escribir de nuevo en Excel
      const newSheet = XLSX.utils.json_to_sheet(configData);
      workbook.Sheets[workbook.SheetNames[0]] = newSheet;
      XLSX.writeFile(workbook, this.configPath);

      // Actualizar configuración en memoria
      this.configs[botName] = newConfig;

      console.log(`Configuración actualizada para el bot: ${botName}`);
      return true;
    } catch (error) {
      console.error(
        `Error al actualizar la configuración para el bot ${botName}:`,
        error
      );
      return false;
    }
  }

  toMinutes(time) {
    let str;
    // Check if time is a number and convert it to proper "HH:MM"
    if (typeof time === "number") {
      // Assuming the number represents a fraction of a day
      const totalMinutes = Math.round(time * 1440); // 1440 minutes in a day
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      str = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    } else {
      // Asegurarnos de convertir cualquier cosa a string
      str = String(time);
    }

    const parts = str.split(":").map(Number);
    if (parts.length !== 2 || !parts.every((part) => !isNaN(part))) {
      console.warn(`toMinutes recibió un formato inesperado ("${time}")`);
      return 0; // Retornar 0 para formatos inesperados
    }
    const [h, m] = parts;
    return h * 60 + m;
  }

  isWithinWorkingHours(botName, type = "auto") {
    const config = this.getBotConfig(botName);

    // Check if config and workingDays are valid
    if (!config || !Array.isArray(config.workingDays)) {
      console.warn(`Configuración no válida para el bot: ${botName}.`);
      return false;
    }

    const now = new Date();
    const diaActual = now.getDay(); // 0: Domingo, 1: Lunes, ... , 6: Sábado

    // 1) Días laborales y feriados
    if (!config.workingDays.includes(diaActual)) return false; // Solo se verifica si el día es laborable
    const hoy = now.toISOString().split("T")[0];
    if (config.holidays.includes(hoy)) return false; // Verificación de feriados

    // 2) Selección de horario según el día
    let startTime, endTime, enabled;
    if (type === "bulk") {
      if (diaActual >= 1 && diaActual <= 5) {
        // Lunes a Viernes
        startTime = config.bulkMessageStartTime;
        endTime = config.bulkMessageEndTime;
        enabled = config.bulkMessagesEnabled;
      } else if (diaActual === 6) {
        // Sábado
        startTime = config.bulkMessageStartTimeSaturday;
        endTime = config.bulkMessageEndTimeSaturday;
        enabled = config.bulkMessagesEnabled;
      } else {
        // Domingo
        startTime = config.bulkMessageStartTimeSunday;
        endTime = config.bulkMessageEndTimeSunday;
        enabled = false;
      }
    } else {
      // Lógica similar para auto respuesta
      if (diaActual >= 1 && diaActual <= 5) {
        // Lunes a Viernes
        startTime = config.autoResponseStartTime;
        endTime = config.autoResponseEndTime;
        enabled = config.autoResponseEnabled;
      } else if (diaActual === 6) {
        // Sábado
        startTime = config.autoResponseStartTimeSaturday;
        endTime = config.autoResponseEndTimeSaturday;
        enabled = config.autoResponseEnabled;
      } else {
        // Domingo
        startTime = config.autoResponseStartTimeSunday;
        endTime = config.autoResponseEndTimeSunday;
        enabled = config.autoResponseEnabled;
      }
    }
    if (!enabled) return false;

    // 3) Cálculo en minutos
    const currentMin = this.toMinutes(`${now.getHours()}:${now.getMinutes()}`);
    const startMin = this.toMinutes(startTime);
    const endMin = this.toMinutes(endTime);

    // 4) Lógica de intervalo cruzando medianoche
    if (startMin <= endMin) {
      return currentMin >= startMin && currentMin <= endMin;
    } else {
      return currentMin >= startMin || currentMin <= endMin;
    }
  }

  getExcelFilePath(botName) {
    const config = this.getBotConfig(botName);
    return config.excelFilePath;
  }

  getDailyMessageLimit(botName) {
    const config = this.getBotConfig(botName);
    return config.dailyMessageLimit;
  }

  isBulkMessagesEnabled(botName) {
    const config = this.getBotConfig(botName);
    return config.bulkMessagesEnabled;
  }

  isAutoResponseEnabled(botName) {
    const config = this.getBotConfig(botName);
    return config.autoResponseEnabled;
  }

  getCustomPrompt(botName) {
    const config = this.getBotConfig(botName);
    return config.customPrompt;
  }
}

// Instancia singleton
let instance = null;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new BotConfigManager();
    }
    return instance;
  },
};
