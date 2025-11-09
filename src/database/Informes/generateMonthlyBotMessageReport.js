const fs = require("fs");
const path = require("path");
const SqliteManager = require("../SqliteManager");
const { Op } = require("sequelize");

/**
 * Obtiene el inicio del mes actual.
 */
const getStartOfMonth = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth;
};

/**
 * Calcula el número de semana del año para una fecha dada.
 * ISO week (lunes=primer día).
 */
function getIsoWeek(date) {
  date = new Date(date.getTime());
  // Thursday in current week decides the year.
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(
    ((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6)%7) / 7
  );
}

/**
 * Se asegura de que un directorio existe.
 */
function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const generateMonthlyBotMessageReport = async () => {
  let sqliteManager;
  try {
    sqliteManager = await SqliteManager.getInstance();

    // Ruta SQLite
    const defaultDbPath = "src/database/Data/MarIADono3DB.sqlite";
    const dbPath =
      sqliteManager?.sequelize?.options?.storage ||
      sqliteManager?.sequelize?.options?.storagePath ||
      defaultDbPath;

    const ConversationsLog = sqliteManager.models.ConversationsLog;
    const startOfMonth = getStartOfMonth();
    const endOfMonth = new Date();

    // Reporte agrupado por role
    const messagesByRole = await ConversationsLog.findAll({
      attributes: [
        "role",
        [sqliteManager.sequelize.fn("COUNT", sqliteManager.sequelize.col("id")), "messageCount"],
      ],
      where: {
        date: {
          [Op.gte]: startOfMonth.toISOString().split('T')[0],
          [Op.lte]: endOfMonth.toISOString().split('T')[0],
        },
      },
      group: ["role"],
      order: [[sqliteManager.sequelize.col("messageCount"), "DESC"]],
    });

    // Construcción del reporte en texto
    let report = `--- Monthly Bot Message Report ---\n`;
    report += `Database path: ${dbPath}\n`;
    report += `Fecha: ${endOfMonth.toISOString().split('T')[0]}\n`;
    report += `Período: ${startOfMonth.toISOString().split('T')[0]} a ${endOfMonth.toISOString().split('T')[0]}\n\n`;

    if (messagesByRole.length > 0) {
      messagesByRole.forEach((row) => {
        report += `Role: ${row.role || 'N/A'}, Messages Sent: ${row.dataValues.messageCount}\n`;
      });
    } else {
      report += "No messages sent for any role this month.\n";
    }
    report += `-----------------------------------\n`;

    // ---- Guardar archivo en carpeta de la semana actual

    const year = endOfMonth.getFullYear();
    const week = String(getIsoWeek(endOfMonth)).padStart(2, "0");
    const dirName = `${year}-semana-${week}`;
    const outDir = path.resolve(__dirname, dirName);
    ensureDirSync(outDir);

    const reportFileName = `monthly_bot_report_${endOfMonth.toISOString().split('T')[0]}.txt`;
    const reportFilePath = path.join(outDir, reportFileName);

    fs.writeFileSync(reportFilePath, report, "utf8");
    console.log(`\nReporte mensual escrito en: ${reportFilePath}`);

  } catch (error) {
    console.error("Error generating monthly bot message report:", error);
  } finally {
    if (sqliteManager) {
      await sqliteManager.cleanup();
    }
  }
};

generateMonthlyBotMessageReport();
