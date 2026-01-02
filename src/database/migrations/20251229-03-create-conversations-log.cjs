'use strict';

/**
 * Migration: crear tabla conversations_log si no existe
 * Nombre pensado para ejecutarse antes de 20251229-05-*
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Si ya existe una tabla llamada 'conversations_log' (case-insensitive), no hacer nada
    const all = await queryInterface.showAllTables();
    const found = all.find(t => String(t).toLowerCase() === 'conversations_log');
    if (found) return;

    await queryInterface.createTable('conversations_log', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      time: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // columna "from" usada en muchos scripts; la definimos como clave entre comillas en SQL
      'from': {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pushName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      messageId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      etapaEmbudo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      interesCliente: {
        type: Sequelize.STRING,
        allowNull: true
      },
      botName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      channel_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      platform_origin: {
        type: Sequelize.STRING,
        allowNull: true
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

    // Índices recomendados
    try {
      await queryInterface.addIndex('conversations_log', ['messageId'], { name: 'idx_conversations_messageid' });
    } catch (e) { /* ignore */ }

    try {
      await queryInterface.addIndex('conversations_log', ['from'], { name: 'idx_conversations_from' });
    } catch (e) { /* ignore */ }

    try {
      await queryInterface.addIndex('conversations_log', ['date'], { name: 'idx_conversations_date' });
    } catch (e) { /* ignore */ }

    try {
      await queryInterface.addIndex('conversations_log', ['botName'], { name: 'idx_conversations_botname' });
    } catch (e) { /* ignore */ }
  },

  async down(queryInterface, Sequelize) {
    const all = await queryInterface.showAllTables();
    const found = all.find(t => String(t).toLowerCase() === 'conversations_log');
    if (!found) return;

    try {
      await queryInterface.removeIndex('conversations_log', 'idx_conversations_botname');
    } catch (e) { /* ignore */ }
    try {
      await queryInterface.removeIndex('conversations_log', 'idx_conversations_date');
    } catch (e) { /* ignore */ }
    try {
      await queryInterface.removeIndex('conversations_log', 'idx_conversations_from');
    } catch (e) { /* ignore */ }
    try {
      await queryInterface.removeIndex('conversations_log', 'idx_conversations_messageid');
    } catch (e) { /* ignore */ }

    await queryInterface.dropTable(found);
  }
};