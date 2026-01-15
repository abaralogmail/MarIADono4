'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Tabla campaigns
    await queryInterface.createTable('campaigns', {
      campaign_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'draft',
      },
      channel_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'message_channels',
          key: 'channel_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      owner_usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true, // JSON as TEXT for SQLite
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      }
    });

    // Índices para campaigns
    try {
      await queryInterface.addIndex('campaigns', ['status'], { name: 'idx_campaigns_status' });
      await queryInterface.addIndex('campaigns', ['start_date'], { name: 'idx_campaigns_start_date' });
      await queryInterface.addIndex('campaigns', ['end_date'], { name: 'idx_campaigns_end_date' });
      await queryInterface.addIndex('campaigns', ['channel_id'], { name: 'idx_campaigns_channel_id' });
    } catch (err) {
      // ignore index existence errors
    }

    // Tabla campaign_messages (mensajes pertenecientes a una campaña)
    await queryInterface.createTable('campaign_messages', {
      message_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'campaigns',
          key: 'campaign_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      channel_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'message_channels',
          key: 'channel_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      template_ref: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      send_order: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      }
    });

    try {
      await queryInterface.addIndex('campaign_messages', ['campaign_id'], { name: 'idx_cm_campaign_id' });
      await queryInterface.addIndex('campaign_messages', ['channel_id'], { name: 'idx_cm_channel_id' });
    } catch (err) {}

    // Tabla campaign_recipient_log (registro por destinatario)
    await queryInterface.createTable('campaign_recipient_log', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'campaigns',
          key: 'campaign_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      recipient_phone: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      recipient_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      message_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'pending',
      },
      status_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    try {
      await queryInterface.addIndex('campaign_recipient_log', ['campaign_id'], { name: 'idx_crl_campaign_id' });
      await queryInterface.addIndex('campaign_recipient_log', ['recipient_phone'], { name: 'idx_crl_recipient_phone' });
      await queryInterface.addIndex('campaign_recipient_log', ['status'], { name: 'idx_crl_status' });
    } catch (err) {}

    // Tabla campaign_analytics (agregados / métricas por campaña)
    await queryInterface.createTable('campaign_analytics', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'campaigns',
          key: 'campaign_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      recipients_total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      delivered: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      failed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      opens: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      clicks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      bounces: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      ctr: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      computed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    try {
      await queryInterface.addIndex('campaign_analytics', ['campaign_id'], { name: 'idx_ca_campaign_id' });
    } catch (err) {}

    // Tabla campaign_goals
    await queryInterface.createTable('campaign_goals', {
      goal_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'campaigns',
          key: 'campaign_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      goal_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      target_value: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      achieved_value: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'pending',
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    try {
      await queryInterface.addIndex('campaign_goals', ['campaign_id'], { name: 'idx_cg_campaign_id' });
      await queryInterface.addIndex('campaign_goals', ['goal_type'], { name: 'idx_cg_goal_type' });
    } catch (err) {}

    // Tabla customer_reports (reportes generados por cliente / campaña)
    await queryInterface.createTable('customer_reports', {
      report_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'campaigns',
          key: 'campaign_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      report_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      report_path: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      checksum_sha256: {
        type: Sequelize.STRING(128),
        allowNull: true,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    try {
      await queryInterface.addIndex('customer_reports', ['cliente_id'], { name: 'idx_cr_cliente_id' });
      await queryInterface.addIndex('customer_reports', ['campaign_id'], { name: 'idx_cr_campaign_id' });
    } catch (err) {}
  },

  async down(queryInterface, Sequelize) {
    // Eliminar en orden inverso para respetar FK
    try { await queryInterface.removeIndex('customer_reports', 'idx_cr_campaign_id'); } catch (e) {}
    try { await queryInterface.removeIndex('customer_reports', 'idx_cr_cliente_id'); } catch (e) {}
    await queryInterface.dropTable('customer_reports').catch(()=>{});

    try { await queryInterface.removeIndex('campaign_goals', 'idx_cg_goal_type'); } catch (e) {}
    try { await queryInterface.removeIndex('campaign_goals', 'idx_cg_campaign_id'); } catch (e) {}
    await queryInterface.dropTable('campaign_goals').catch(()=>{});

    try { await queryInterface.removeIndex('campaign_analytics', 'idx_ca_campaign_id'); } catch (e) {}
    await queryInterface.dropTable('campaign_analytics').catch(()=>{});

    try { await queryInterface.removeIndex('campaign_recipient_log', 'idx_crl_status'); } catch (e) {}
    try { await queryInterface.removeIndex('campaign_recipient_log', 'idx_crl_recipient_phone'); } catch (e) {}
    try { await queryInterface.removeIndex('campaign_recipient_log', 'idx_crl_campaign_id'); } catch (e) {}
    await queryInterface.dropTable('campaign_recipient_log').catch(()=>{});

    try { await queryInterface.removeIndex('campaign_messages', 'idx_cm_channel_id'); } catch (e) {}
    try { await queryInterface.removeIndex('campaign_messages', 'idx_cm_campaign_id'); } catch (e) {}
    await queryInterface.dropTable('campaign_messages').catch(()=>{});

    try { await queryInterface.removeIndex('campaigns', 'idx_campaigns_channel_id'); } catch (e) {}
    try { await queryInterface.removeIndex('campaigns', 'idx_campaigns_end_date'); } catch (e) {}
    try { await queryInterface.removeIndex('campaigns', 'idx_campaigns_start_date'); } catch (e) {}
    try { await queryInterface.removeIndex('campaigns', 'idx_campaigns_status'); } catch (e) {}
    await queryInterface.dropTable('campaigns').catch(()=>{});
  }
};