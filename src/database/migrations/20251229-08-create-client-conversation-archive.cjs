'use strict';

/**
 * Migración: create client_conversation_archive
 * - Tabla para registros de archivos de archivado de conversaciones por cliente
 * - Compatible con SQLite y otros RDBMS soportados por Sequelize
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('client_conversation_archive', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      archive_path: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      archive_filename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      archive_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'json' // json / pdf / html / txt
      },
      message_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      checksum_sha256: {
        type: Sequelize.STRING,
        allowNull: true
      },
      generated_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      generated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('client_conversation_archive', ['cliente_id'], { name: 'idx_archive_cliente' });
    await queryInterface.addIndex('client_conversation_archive', ['archive_type'], { name: 'idx_archive_type' });
    await queryInterface.addIndex('client_conversation_archive', ['checksum_sha256'], { name: 'idx_archive_checksum' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('client_conversation_archive');
  }
};