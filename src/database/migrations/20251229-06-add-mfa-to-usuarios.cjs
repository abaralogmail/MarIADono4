'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Añade columnas para MFA en la tabla Usuarios:
     * - mfa_enabled: boolean (default false)
     * - mfa_secret: string (nullable) — placeholder para almacenamiento seguro del secret (recomendar encriptación/otro store)
     */
    await queryInterface.addColumn('Usuarios', 'mfa_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Usuarios', 'mfa_secret', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface /* Sequelize */) {
    await queryInterface.removeColumn('Usuarios', 'mfa_secret');
    await queryInterface.removeColumn('Usuarios', 'mfa_enabled');
  }
};