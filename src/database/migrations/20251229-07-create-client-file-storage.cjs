'use strict';

/**
 * Migración: create client_file_storage
 * - Tabla para metadata de archivos subidos por cliente
 * - Compatible con SQLite y otros RDBMS soportados por Sequelize
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('client_file_storage', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      file_path: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      original_filename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      checksum_sha256: {
        type: Sequelize.STRING,
        allowNull: true
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      uploaded_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      accessed_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    await queryInterface.addIndex('client_file_storage', ['cliente_id'], { name: 'idx_client_file_cliente' });
    await queryInterface.addIndex('client_file_storage', ['checksum_sha256'], { name: 'idx_client_file_checksum' });
    await queryInterface.addIndex('client_file_storage', ['uploaded_by'], { name: 'idx_client_file_uploaded_by' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('client_file_storage');
  }
};