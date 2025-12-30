/**
 * src/database/models/MessageTemplates.js
 *
 * Define modelos Sequelize para:
 * - MessageTemplate
 * - TemplateButton
 * - TemplateVariable
 * - TemplateVersion
 * - TemplateUsageLog
 *
 * También exporta `runTemplateModelsTests(sequelize)` para pruebas básicas:
 *  - crear template con botones/variables/version
 *  - insertar usage_log con campaign_id NULL
 *
 * Uso:
 *   const { MessageTemplate, TemplateButton, ... , runTemplateModelsTests } = require('./models/MessageTemplates')(sequelize, DataTypes);
 *
 * Nota: este archivo sigue el patrón de exports por función para integrarse con SqliteManager.
 */
export const MessageTemplateModel = (sequelize, DataTypes) => {
  const MessageTemplate = sequelize.define(
    'MessageTemplate',
    {
      template_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      template_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
      },
      meta_template_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      header_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      header_text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      body_text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      footer_text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approval_status_meta: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'pending',
      },
      owner_usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      campaign_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_response_data: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'message_templates',
      timestamps: false,
      underscored: true,
    }
  );

  MessageTemplate.associate = (models) => {
    if (models.TemplateButton) {
      MessageTemplate.hasMany(models.TemplateButton, { foreignKey: 'template_id', as: 'buttons', onDelete: 'CASCADE', hooks: true });
    }
    if (models.TemplateVariable) {
      MessageTemplate.hasMany(models.TemplateVariable, { foreignKey: 'template_id', as: 'variables', onDelete: 'CASCADE', hooks: true });
    }
    if (models.TemplateVersion) {
      MessageTemplate.hasMany(models.TemplateVersion, { foreignKey: 'template_id', as: 'versions', onDelete: 'CASCADE', hooks: true });
    }
    if (models.TemplateUsageLog) {
      MessageTemplate.hasMany(models.TemplateUsageLog, { foreignKey: 'template_id', as: 'usage_logs', onDelete: 'CASCADE', hooks: true });
    }
  };

  return MessageTemplate;
};

export const TemplateButtonModel = (sequelize, DataTypes) => {
  const TemplateButton = sequelize.define(
    'TemplateButton',
    {
      button_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      template_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      text: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      payload: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'template_buttons',
      timestamps: false,
      underscored: true,
    }
  );

  TemplateButton.associate = (models) => {
    if (models.MessageTemplate) {
      TemplateButton.belongsTo(models.MessageTemplate, { foreignKey: 'template_id', as: 'template', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  };

  return TemplateButton;
};

export const TemplateVariableModel = (sequelize, DataTypes) => {
  const TemplateVariable = sequelize.define(
    'TemplateVariable',
    {
      variable_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      template_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      default_value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'template_variables',
      timestamps: false,
      underscored: true,
    }
  );

  TemplateVariable.associate = (models) => {
    if (models.MessageTemplate) {
      TemplateVariable.belongsTo(models.MessageTemplate, { foreignKey: 'template_id', as: 'template', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  };

  return TemplateVariable;
};

export const TemplateVersionModel = (sequelize, DataTypes) => {
  const TemplateVersion = sequelize.define(
    'TemplateVersion',
    {
      version_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      template_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      version_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'template_versions',
      timestamps: false,
      underscored: true,
    }
  );

  TemplateVersion.associate = (models) => {
    if (models.MessageTemplate) {
      TemplateVersion.belongsTo(models.MessageTemplate, { foreignKey: 'template_id', as: 'template', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  };

  return TemplateVersion;
};

export const TemplateUsageLogModel = (sequelize, DataTypes) => {
  const TemplateUsageLog = sequelize.define(
    'TemplateUsageLog',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      template_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      campaign_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'sent',
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'template_usage_log',
      timestamps: false,
      underscored: true,
    }
  );

  TemplateUsageLog.associate = (models) => {
    if (models.MessageTemplate) {
      TemplateUsageLog.belongsTo(models.MessageTemplate, { foreignKey: 'template_id', as: 'template', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  };

  return TemplateUsageLog;
};

/**
 * Helper para definir e integrar los modelos en una instancia Sequelize existente.
 * Devuelve un objeto con las referencias a los modelos.
 */
export const defineTemplateModels = (sequelize, DataTypes) => {
  const MessageTemplate = MessageTemplateModel(sequelize, DataTypes);
  const TemplateButton = TemplateButtonModel(sequelize, DataTypes);
  const TemplateVariable = TemplateVariableModel(sequelize, DataTypes);
  const TemplateVersion = TemplateVersionModel(sequelize, DataTypes);
  const TemplateUsageLog = TemplateUsageLogModel(sequelize, DataTypes);

  const models = {
    MessageTemplate,
    TemplateButton,
    TemplateVariable,
    TemplateVersion,
    TemplateUsageLog,
  };

  // Asociaciones
  Object.values(models).forEach((m) => {
    if (m.associate) {
      m.associate(models);
    }
  });

  return models;
};

/**
 * runTemplateModelsTests(sequelize)
 * - Sincroniza tablas creadas por los modelos (no fuerza drop)
 * - Crea un template con botones, variables y una versión
 * - Inserta un registro en template_usage_log con campaign_id = NULL para validar FK opcional
 * - Retorna un resumen con resultados y errores si los hubiera
 */
export const runTemplateModelsTests = async (sequelize) => {
  const { DataTypes } = require('sequelize');
  const models = defineTemplateModels(sequelize, DataTypes);

  try {
    // Sync (no force) para no destruir datos existentes
    await sequelize.sync({ alter: true });

    // Crear un template
    const tmpl = await models.MessageTemplate.create({
      template_name: `test_template_${Date.now()}`,
      meta_template_name: 'meta_test',
      header_type: 'text',
      header_text: 'Cabecera prueba',
      body_text: 'Cuerpo con variable {{name}}',
      footer_text: 'Footer',
      approval_status_meta: 'approved',
      metadata: JSON.stringify({ sample: true }),
      meta_response_data: JSON.stringify({ raw: 'ok' }),
    });

    // Crear botones
    const b1 = await models.TemplateButton.create({
      template_id: tmpl.template_id,
      type: 'quick_reply',
      text: 'Sí',
      payload: JSON.stringify({ action: 'yes' }),
      order: 1,
    });

    const b2 = await models.TemplateButton.create({
      template_id: tmpl.template_id,
      type: 'quick_reply',
      text: 'No',
      payload: JSON.stringify({ action: 'no' }),
      order: 2,
    });

    // Crear variables
    const v1 = await models.TemplateVariable.create({
      template_id: tmpl.template_id,
      name: 'name',
      default_value: 'Cliente',
      required: true,
    });

    // Crear version
    const ver = await models.TemplateVersion.create({
      template_id: tmpl.template_id,
      version_number: 1,
      content: JSON.stringify({ header: tmpl.header_text, body: tmpl.body_text, footer: tmpl.footer_text }),
      created_by: null,
      is_active: true,
    });

    // Insertar usage log con campaign_id = NULL (debe ser válido)
    const usage = await models.TemplateUsageLog.create({
      template_id: tmpl.template_id,
      campaign_id: null,
      usuario_id: null,
      action: 'sent',
      details: 'Prueba de usage log con campaign_id null',
    });

    return {
      ok: true,
      summary: {
        templateId: tmpl.template_id,
        buttons: [b1.button_id, b2.button_id],
        variables: [v1.variable_id],
        versionId: ver.version_id,
        usageId: usage.id,
      },
    };
  } catch (err) {
    return { ok: false, error: (err && err.message) || String(err) };
  }
};

export default {
  MessageTemplateModel,
  TemplateButtonModel,
  TemplateVariableModel,
  TemplateVersionModel,
  TemplateUsageLogModel,
  defineTemplateModels,
  runTemplateModelsTests,
};