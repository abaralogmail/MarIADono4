'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear tabla message_channels
    await queryInterface.createTable('message_channels', {
      channel_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Seeds iniciales para message_channels (intentar insert y silenciar duplicados)
    try {
      await queryInterface.bulkInsert('message_channels', [
        { name: 'whatsapp', provider: 'meta', is_active: true, metadata: JSON.stringify({version: 'graph'}) , created_at: new Date(), updated_at: new Date() },
        { name: 'telegram', provider: 'telegram', is_active: false, metadata: null, created_at: new Date(), updated_at: new Date() },
        { name: 'web', provider: 'internal', is_active: true, metadata: null, created_at: new Date(), updated_at: new Date() },
      ]);
    } catch (err) {
      // Ignorar errores de duplicado/validation si la fila ya existe (p. ej. re-ejecución)
      if (!/unique|UNIQUE|Validation error/i.test(err.message || '')) {
        throw err;
      }
    }

    // Alterar conversations_log para añadir channel_id FK (comprobar existencia)
    const convDesc = await queryInterface.describeTable('conversations_log').catch(() => null);
    if (convDesc && !convDesc.channel_id) {
      await queryInterface.addColumn('conversations_log', 'channel_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'message_channels',
          key: 'channel_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    // Índice para channel_id (ignorar si ya existe)
    try {
      await queryInterface.addIndex('conversations_log', ['channel_id'], { name: 'idx_conversations_channel_id' });
    } catch (err) {
      if (!/already exists|duplicate|UNIQUE/i.test(err.message || '')) {
        throw err;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remover índice y columna si existen
    try {
      await queryInterface.removeIndex('conversations_log', 'idx_conversations_channel_id');
    } catch (err) { /* ignore */ }

    const convDesc = await queryInterface.describeTable('conversations_log').catch(() => null);
    if (convDesc && convDesc.channel_id) {
      try {
        await queryInterface.removeColumn('conversations_log', 'channel_id');
      } catch (err) {
        console.warn('removeColumn channel_id failed:', err.message || err);
        throw err;
      }
    }

    await queryInterface.bulkDelete('message_channels', null, {});
    await queryInterface.dropTable('message_channels');
  },
};