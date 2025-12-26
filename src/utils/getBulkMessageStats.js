import fs from 'fs';
import path from 'path';

/**
 * Devuelve la cantidad de mensajes masivos enviados en las últimas 24 horas para un bot.
 * Primero intenta leer un archivo de estadísticas persistente (Logs/bulk_message_stats.json).
 * Si no existe o no contiene datos para el día actual, realiza un fallback sobre
 * Logs/conversations_log.json buscando filas con role === 'BulkMessage'.
 */
export function getDailyBulkMessageStats(botName) {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const statsPath = path.resolve(__dirname, '../../Logs/bulk_message_stats.json');

  try {
    if (fs.existsSync(statsPath)) {
      const statsData = JSON.parse(fs.readFileSync(statsPath, 'utf8') || '{}');
      const today = now.toISOString().split('T')[0];
      if (statsData[today] && typeof statsData[today][botName] === 'number') {
        return {
          botName,
          messageCount: statsData[today][botName],
        };
      }
    }
  } catch (err) {
    // Si falla la lectura del archivo de stats, hacemos fallback al log de conversaciones
  }

  const filePath = path.resolve(__dirname, '../../Logs/conversations_log.json');
  if (!fs.existsSync(filePath)) {
    return { botName, messageCount: 0 };
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');

  let messageCount = 0;

  // Itera sobre las filas desde la última hasta la primera
  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    // Manejar posibles formatos de fecha/hora faltantes
    if (!row || !row.date || !row.time) continue;

    const rowDate = new Date(`${row.date}T${row.time}`);

    if (
      rowDate >= last24Hours &&
      row.role === 'BulkMessage' &&
      row.botName === botName
    ) {
      messageCount++;
    }
  }

  return {
    botName,
    messageCount,
  };
}

/**
 * Incrementa (o establece) el contador de mensajes masivos para el día actual.
 * Guarda las estadísticas en Logs/bulk_message_stats.json con estructura:
 * {
 *   "2025-12-24": { "BotName": 5, "OtroBot": 2 },
 *   "2025-12-23": { ... }
 * }
 *
 * Devuelve el nuevo conteo para el bot en el día actual.
 */
export function updateDailyBulkMessageStats(botName, increment = 1) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const statsPath = path.resolve(__dirname, '../../Logs/bulk_message_stats.json');

  let stats = {};
  try {
    if (fs.existsSync(statsPath)) {
      stats = JSON.parse(fs.readFileSync(statsPath, 'utf8') || '{}');
    } else {
      // Asegurar que la carpeta exista
      const dir = path.dirname(statsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    stats = {};
  }

  stats[today] = stats[today] || {};
  stats[today][botName] = (stats[today][botName] || 0) + Number(increment);

  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');

  return stats[today][botName];
}

export default { getDailyBulkMessageStats, updateDailyBulkMessageStats };
