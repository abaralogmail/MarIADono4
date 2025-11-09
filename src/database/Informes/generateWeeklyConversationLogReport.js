const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const SqliteManager = require("../SqliteManager");
const { Sequelize } = require("sequelize");

/**
 * Genera un informe semanal del conversations_log.
 *
 * Uso:
 *   node src/database/Informes/generateWeeklyConversationLogReport.js [groupByBotName]
 *
 * Parámetros:
 *   groupByBotName (opcional): "true" | "false" (default: true)
 *
 * Salida:
 *   - CSV y JSON en este directorio (src/database/Informes/)
 *     con nombre: weekly_conversations_log_[YYYYMMDD_HHmm]_byWeekRole[_byBot].(csv|json)
 */
async function generateWeeklyConversationLogReport(groupByBotNameArg) {
  const groupByBotName = groupByBotNameArg === undefined
    ? true
    : String(groupByBotNameArg).toLowerCase() === "true";

  let sqliteManager;
  try {
    sqliteManager = await SqliteManager.getInstance();
    const ConversationsLog = sqliteManager.models.ConversationsLog;

    const attributes = [
      [Sequelize.fn("strftime", "%Y-%W", Sequelize.col("date")), "weekYear"],
      "role",
      [Sequelize.fn("COUNT", Sequelize.col("id")), "messageCount"],
    ];
    const group = ["weekYear", "role"];
    const order = [["weekYear", "ASC"], ["role", "ASC"]];

    if (groupByBotName) {
      attributes.unshift("botName");
      group.unshift("botName");
      order.unshift(["botName", "ASC"]);
    }

    const rows = await ConversationsLog.findAll({
      attributes,
      group,
      order,
      raw: true,
    });

    // Preparar salida
    const timestamp = new Date()
      .toISOString()
      .slice(0, 16)
      .replace(":", "")
      .replace("T", "_")
      .replace(/-/g, "");

    const baseName = `weekly_conversations_log_${timestamp}_byWeekRole${groupByBotName ? "_byBot" : ""}`;
    const outDir = __dirname; // Informes dir
    const jsonPath = path.join(outDir, `${baseName}.json`);
    const csvPath = path.join(outDir, `${baseName}.csv`);

    // Guardar JSON
    fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2), "utf8");

    // Guardar CSV
    const fields = groupByBotName
      ? ["botName", "weekYear", "role", "messageCount"]
      : ["weekYear", "role", "messageCount"];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);
    fs.writeFileSync(csvPath, csv, "utf8");

    console.log("\n— Informe semanal de conversations_log —");
    console.log(`Filas: ${rows.length}`);
    console.log(`JSON: ${jsonPath}`);
    console.log(`CSV : ${csvPath}`);
    console.log("-------------------------------------\n");
  } catch (error) {
    console.error("Error al generar informe semanal de conversations_log:", error);
    process.exitCode = 1;
  } finally {
    if (sqliteManager) {
      await sqliteManager.cleanup();
    }
  }
}

generateWeeklyConversationLogReport(process.argv[2]);


