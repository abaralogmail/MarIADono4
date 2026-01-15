'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Tabla principal de grupos
    await queryInterface.createTable('whatsapp_groups', {
      group_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      sync_status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'unknown'
      },
      metadata: {
        // SQLite: usar TEXT para JSON; otros dialectos pueden usar JSON
        type: Sequelize.TEXT,
        allowNull: true
      },
      last_sync_at: {
        type: Sequelize.DATE,
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

    // Índices para whatsapp_groups
    await queryInterface.addIndex('whatsapp_groups', ['is_active'], { name: 'idx_whatsapp_groups_is_active' });
    await queryInterface.addIndex('whatsapp_groups', ['sync_status'], { name: 'idx_whatsapp_groups_sync_status' });

    // Miembros del grupo
    await queryInterface.createTable('whatsapp_group_members', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      group_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      member_phone_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      member_role: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      left_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.TEXT,
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

    // Unique constraint: un miembro por grupo por número
    await queryInterface.addConstraint('whatsapp_group_members', {
      fields: ['group_id', 'member_phone_number'],
      type: 'unique',
      name: 'uk_whatsapp_group_member_groupid_phone'
    });

    // Índices para miembros
    await queryInterface.addIndex('whatsapp_group_members', ['group_id'], { name: 'idx_wgm_group_id' });
    await queryInterface.addIndex('whatsapp_group_members', ['member_phone_number'], { name: 'idx_wgm_member_phone' });

    // Mapping entre grupo y cliente (para asignar grupos a clientes en la plataforma)
    await queryInterface.createTable('whatsapp_group_cliente_mapping', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      group_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mapped_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Unique para evitar mapeos duplicados
    await queryInterface.addConstraint('whatsapp_group_cliente_mapping', {
      fields: ['cliente_id', 'group_id'],
      type: 'unique',
      name: 'uk_wg_cliente_group'
    });
    await queryInterface.addIndex('whatsapp_group_cliente_mapping', ['cliente_id'], { name: 'idx_wgcm_cliente_id' });

    // Log de mensajes de grupo
    await queryInterface.createTable('whatsapp_group_messages_log', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      group_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sender_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      message_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      media_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_bot_message: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Índices para el log de mensajes
    await queryInterface.addIndex('whatsapp_group_messages_log', ['group_id'], { name: 'idx_wgml_group_id' });
    await queryInterface.addIndex('whatsapp_group_messages_log', ['sender_number'], { name: 'idx_wgml_sender' });
    await queryInterface.addIndex('whatsapp_group_messages_log', ['message_type'], { name: 'idx_wgml_type' });
  },

  async down (queryInterface, Sequelize) {
    // Eliminar en orden inverso
    await queryInterface.removeIndex('whatsapp_group_messages_log', 'idx_wgml_type').catch(()=>{});
    await queryInterface.removeIndex('whatsapp_group_messages_log', 'idx_wgml_sender').catch(()=>{});
    await queryInterface.removeIndex('whatsapp_group_messages_log', 'idx_wgml_group_id').catch(()=>{});
    await queryInterface.dropTable('whatsapp_group_messages_log').catch(()=>{});

    await queryInterface.removeIndex('whatsapp_group_cliente_mapping', 'idx_wgcm_cliente_id').catch(()=>{});
    await queryInterface.removeConstraint('whatsapp_group_cliente_mapping', 'uk_wg_cliente_group').catch(()=>{});
    await queryInterface.dropTable('whatsapp_group_cliente_mapping').catch(()=>{});

    await queryInterface.removeIndex('whatsapp_group_members', 'idx_wgm_member_phone').catch(()=>{});
    await queryInterface.removeIndex('whatsapp_group_members', 'idx_wgm_group_id').catch(()=>{});
    await queryInterface.removeConstraint('whatsapp_group_members', 'uk_whatsapp_group_member_groupid_phone').catch(()=>{});
    await queryInterface.dropTable('whatsapp_group_members').catch(()=>{});

    await queryInterface.removeIndex('whatsapp_groups', 'idx_whatsapp_groups_sync_status').catch(()=>{});
    await queryInterface.removeIndex('whatsapp_groups', 'idx_whatsapp_groups_is_active').catch(()=>{});
    await queryInterface.dropTable('whatsapp_groups').catch(()=>{});
  }
};