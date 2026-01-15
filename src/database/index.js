import SqliteManager from './SqliteManager.js';
import db from './models/index.js';
import sequelize from './sequelize.js';

/**
 * Main entry point for the database module.
 * Provides access to the manager, the models, and the connection instance.
 */
export { SqliteManager, db, sequelize };
export default SqliteManager;
