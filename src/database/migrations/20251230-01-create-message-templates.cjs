'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Tabla message_templates
    await queryInterface.createTable('message_templates', {
      template_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      template_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },
      meta_template_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      header_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      header_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      body_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      footer_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      approval_status_meta: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'pending',
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
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'campaigns',
          key: 'campaign_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true, // JSON stored as TEXT for SQLite
      },
      meta_response_data: {
        type: Sequelize.TEXT,
        allowNull: true, // JSON response (store as TEXT in SQLite; parse manually)
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

    // Índices para message_templates
    try {
      await queryInterface.addIndex('message_templates', ['approval_status_meta'], { name: 'idx_mt_approval_status' });
      await queryInterface.addIndex('message_templates', ['meta_template_name'], { name: 'idx_mt_meta_template_name' });
    } catch (err) { /* ignore */ }

    // Tabla template_buttons
    await queryInterface.createTable('template_buttons', {
      button_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      template_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'message_templates',
          key: 'template_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      text: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      payload: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      "order": {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    try {
      await queryInterface.addIndex('template_buttons', ['template_id'], { name: 'idx_tb_template_id' });
    } catch (err) {}

    // Tabla template_variables
    await queryInterface.createTable('template_variables', {
      variable_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      template_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'message_templates',
          key: 'template_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      default_value: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    try {
      await queryInterface.addIndex('template_variables', ['template_id'], { name: 'idx_tv_template_id' });
      await queryInterface.addIndex('template_variables', ['name'], { name: 'idx_tv_name' });
    } catch (err) {}

    // Tabla template_versions
    await queryInterface.createTable('template_versions', {
      version_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      template_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'message_templates',
          key: 'template_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      version_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true, // Could store JSON/text with header/body/footer snapshot
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    try {
      await queryInterface.addIndex('template_versions', ['template_id'], { name: 'idx_tv_template_id' });
      await queryInterface.addIndex('template_versions', ['template_id', 'version_number'], { name: 'uniq_tv_template_version' });
    } catch (err) {}

    // Tabla template_usage_log
    await queryInterface.createTable('template_usage_log', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      template_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'message_templates',
          key: 'template_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'campaigns',
          key: 'campaign_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'sent'
      },
      details: {
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
      await queryInterface.addIndex('template_usage_log', ['template_id'], { name: 'idx_tul_template_id' });
      await queryInterface.addIndex('template_usage_log', ['campaign_id'], { name: 'idx_tul_campaign_id' });
      await queryInterface.addIndex('template_usage_log', ['action'], { name: 'idx_tul_action' });
    } catch (err) {}

  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order respecting FKs
    try { await queryInterface.removeIndex('template_usage_log', 'idx_tul_action'); } catch(e) {}
    try { await queryInterface.removeIndex('template_usage_log', 'idx_tul_campaign_id'); } catch(e) {}
    try { await queryInterface.removeIndex('template_usage_log', 'idx_tul_template_id'); } catch(e) {}
    await queryInterface.dropTable('template_usage_log').catch(()=>{});

    try { await queryInterface.removeIndex('template_versions', 'uniq_tv_template_version'); } catch(e) {}
    try { await queryInterface.removeIndex('template_versions', 'idx_tv_template_id'); } catch(e) {}
    await queryInterface.dropTable('template_versions').catch(()=>{});

    try { await queryInterface.removeIndex('template_variables', 'idx_tv_name'); } catch(e) {}
    try { await queryInterface.removeIndex('template_variables', 'idx_tv_template_id'); } catch(e) {}
    await queryInterface.dropTable('template_variables').catch(()=>{});

    try { await queryInterface.removeIndex('template_buttons', 'idx_tb_template_id'); } catch(e) {}
    await queryInterface.dropTable('template_buttons').catch(()=>{});

    try { await queryInterface.removeIndex('message_templates', 'idx_mt_meta_template_name'); } catch(e) {}
    try { await queryInterface.removeIndex('message_templates', 'idx_mt_approval_status'); } catch(e) {}
    await queryInterface.dropTable('message_templates').catch(()=>{});
  }
};