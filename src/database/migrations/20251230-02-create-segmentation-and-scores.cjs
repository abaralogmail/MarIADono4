'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Tabla segmentation_rules
    await queryInterface.createTable('segmentation_rules', {
      rule_id: {
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
      type: {
        type: Sequelize.STRING(50), // demographic, behavioral, engagement, transactional, custom
        allowNull: false,
        defaultValue: 'custom',
      },
      criteria_json: {
        type: Sequelize.TEXT, // store JSON as TEXT for SQLite
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      owner_usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    try {
      await queryInterface.addIndex('segmentation_rules', ['is_active'], { name: 'idx_sr_is_active' });
      await queryInterface.addIndex('segmentation_rules', ['type'], { name: 'idx_sr_type' });
    } catch (err) {}

    // Tabla customer_segments
    await queryInterface.createTable('customer_segments', {
      segment_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      segment_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      owner_usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_dynamic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      members_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      metadata: {
        type: Sequelize.TEXT,
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

    try {
      await queryInterface.addIndex('customer_segments', ['is_dynamic'], { name: 'idx_cs_is_dynamic' });
    } catch (err) {}

    // Tabla segment_members (miembros de segmento)
    await queryInterface.createTable('segment_members', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      segment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customer_segments',
          key: 'segment_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cliente_id: {
        type: Sequelize.INTEGER, // cliente_id / usuario externo id consistent with project
        allowNull: false,
      },
      membership_score: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
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

    // Constraint unique (segment_id, cliente_id)
    try {
      await queryInterface.addIndex('segment_members', ['segment_id', 'cliente_id'], { name: 'uniq_sm_segment_cliente', unique: true });
      await queryInterface.addIndex('segment_members', ['cliente_id'], { name: 'idx_sm_cliente_id' });
      await queryInterface.addIndex('segment_members', ['segment_id'], { name: 'idx_sm_segment_id' });
    } catch (err) {}

    // Tabla segment_performance (métricas por segmento / periodo)
    await queryInterface.createTable('segment_performance', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      segment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customer_segments',
          key: 'segment_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      period_start: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      period_end: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      members_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      engagement_score: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      conversion_rate: {
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
      await queryInterface.addIndex('segment_performance', ['segment_id'], { name: 'idx_sp_segment_id' });
      await queryInterface.addIndex('segment_performance', ['period_start', 'period_end'], { name: 'idx_sp_period' });
    } catch (err) {}

    // Tabla customer_scores
    await queryInterface.createTable('customer_scores', {
      score_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      segment_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customer_segments',
          key: 'segment_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      engagement: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      loyalty: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      churn_risk: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      lifetime_value: {
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
      await queryInterface.addIndex('customer_scores', ['cliente_id'], { name: 'idx_cs_cliente_id' });
      await queryInterface.addIndex('customer_scores', ['segment_id'], { name: 'idx_cs_segment_id' });
    } catch (err) {}
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order to respect FKs
    try { await queryInterface.removeIndex('customer_scores', 'idx_cs_segment_id'); } catch(e) {}
    try { await queryInterface.removeIndex('customer_scores', 'idx_cs_cliente_id'); } catch(e) {}
    await queryInterface.dropTable('customer_scores').catch(()=>{});

    try { await queryInterface.removeIndex('segment_performance', 'idx_sp_period'); } catch(e) {}
    try { await queryInterface.removeIndex('segment_performance', 'idx_sp_segment_id'); } catch(e) {}
    await queryInterface.dropTable('segment_performance').catch(()=>{});

    try { await queryInterface.removeIndex('segment_members', 'idx_sm_segment_id'); } catch(e) {}
    try { await queryInterface.removeIndex('segment_members', 'idx_sm_cliente_id'); } catch(e) {}
    try { await queryInterface.removeIndex('segment_members', 'uniq_sm_segment_cliente'); } catch(e) {}
    await queryInterface.dropTable('segment_members').catch(()=>{});

    try { await queryInterface.removeIndex('customer_segments', 'idx_cs_is_dynamic'); } catch(e) {}
    await queryInterface.dropTable('customer_segments').catch(()=>{});

    try { await queryInterface.removeIndex('segmentation_rules', 'idx_sr_type'); } catch(e) {}
    try { await queryInterface.removeIndex('segmentation_rules', 'idx_sr_is_active'); } catch(e) {}
    await queryInterface.dropTable('segmentation_rules').catch(()=>{});
  }
};