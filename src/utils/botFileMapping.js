const { getInstance } = require('../config/botConfigManager');

// This function dynamically gets the file path from the config
function getBotFilePath(botName) {
  const configManager = getInstance();
  return configManager.getExcelFilePath(botName);
}

// Keep the original mapping for backward compatibility
const botFileMapping = {
  'bot': './mensajes/Listas/Lista-bot-CursosSalta.xlsx',
  'BotOfertasTucuman': './mensajes/Listas/Lista-BotOfertasTucuman.xlsx',
  'BotAdministracionSalta': './mensajes/Listas/Lista-BotAdministracionSalta.xlsx',
  'BotConsultasWeb': './mensajes/Listas/Lista-BotConsultasWeb.xlsx',
};

module.exports = {
  botFileMapping,
  getBotFilePath
};
