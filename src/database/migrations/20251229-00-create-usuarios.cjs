'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Si ya existe una tabla llamada 'usuarios' (case-insensitive), no hacemos nada.
    const all = await queryInterface.showAllTables();
    const found = all.find(t => String(t).toLowerCase() === 'usuarios');
    if (found) {
      return;
    }

    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    const all = await queryInterface.showAllTables();
    const found = all.find(t => String(t).toLowerCase() === 'usuarios');
    if (!found) return;
    await queryInterface.dropTable(found);
  }
};