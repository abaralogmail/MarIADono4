// src/database/DatabaseQueries.js
//const PostgreSQLManager = require("./PostgreSQLManager");
const SqliteManager = require("./SqliteManager");

class DatabaseQueries {
  
  static async mensajesBulkEnviadosHoy() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format

    const sql = `
      SELECT *
      FROM conversations_log
      WHERE $1 = $1
      LIMIT 2
    `;

    try {
      // Try PostgreSQL first
      // Fallback to SQLite
      const sqliteDb = await SqliteManager.getInstance();
      const result = await sqliteDb.query(sql.replace(/\$\d+/g, '?'), [today]);
      if (result.length > 0) {
        return result;
      }

      return 0;
    } catch (error) {
      console.error("❌ Error querying mensajesBulkEnviadosHoy from both databases:", error);
      throw error;
    }
  }
  
  
  // Additional query methods can be added here as needed
}

module.exports = DatabaseQueries;agreg